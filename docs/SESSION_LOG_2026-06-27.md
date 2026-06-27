# Session Log — 2026-06-27: Audit, Testing, and CI Setup

This is a plain-language record of a work session where we took this app from "no safety nets" to "automatically checked on every push." If you're new to this — welcome, this doc explains the *why* behind each step, not just the *what*.

---

## 1. The Code Audit

**What we did:** Asked for a full review of the codebase — security, performance, code quality, correctness, and whether the documentation matched the actual code.

**What's an "audit"?** A structured read-through of the code looking for problems, without changing anything yet. Think of it like a home inspection before you start renovating — you want a list of issues *before* you start fixing things, not discover them one at a time.

**What we found** (full details in `AUDIT_REPORT.md` at the repo root):
- The login page (a 4-digit PIN) had no limit on how many times someone could guess — a bot could try all 10,000 combinations in seconds. This is called **brute-forcing**.
- The "log a kindness act" feature was open to anyone, with no limit on how many requests could be sent — could be spammed.
- When something went wrong on the server, the error message sent back to the user's browser included internal details that should have stayed private.
- A few small inefficiencies (database queries doing more work than needed, some duplicated code).
- The written documentation (`docs/ProductArchitecture.md`, `docs/ERD.md`) didn't quite match what the code actually did in a couple of places.

The good news: no major security holes (no SQL injection, no XSS), and the dependency check (`npm audit`) came back clean.

---

## 2. Fixing What the Audit Found

We went through the audit findings one at a time and fixed them:

- **Rate limiting** — added a library called `express-rate-limit` that says "this IP address can only try to log in 10 times every 15 minutes" and "only 20 kindness-log submissions per minute." This directly closes the brute-force problem.
- **Hid internal error details** — the server still *logs* the full error for developers to see, it just stops *sending* those details to the user's browser.
- **Rejected the default PIN** — if someone deploys this app and forgets to change the example PIN (`1234`), the server now refuses to start up logins until it's changed.
- **Small performance tweaks** — database queries that only needed to *read* data were told not to bother creating full tracked objects (`.lean()` in Mongoose), and a piece of code that calculated the same thing twice was simplified to calculate it once.
- **Reduced duplicate code** — three different places in the frontend had nearly identical "fetch data, handle errors" code; we pulled that into one reusable helper function (`apiFetch`).
- **Documentation fixes** — corrected the two places where the docs didn't match the code.

**Then we double-checked our own fixes** (a second audit, this time of the changes we'd just made) — re-ran all the checks, and actually started the server and tried to break the login 11 times in a row to *prove* the rate limit worked, not just assume it.

---

## 3. Adding Automated Tests

**What's a "test" in this context?** A small piece of code that runs another piece of code and checks the output is what you expect. Instead of manually clicking through the app every time you change something to make sure it still works, a test does that check for you, instantly, forever.

**What's "Vitest"?** The tool we used to write and run tests for this project. ("Vi" because it's built by the same team as Vite, the tool that builds the frontend.)

**What we tested:**
- The point-calculation logic (e.g., "Kind Words" = 10 points, "Other" category lets you pick a custom amount) — these are pure business rules, easy and valuable to test.
- The data-validation rules (e.g., "you can't log an act of kindness for yourself," "a PIN must be exactly 4 digits") — these protect the app from bad data.
- The login system's behavior — wrong PIN gets rejected, right PIN gets a cookie, missing login token gets blocked, etc.

**A subtlety worth knowing:** we set things up so test files don't accidentally get bundled into the "real" production code when the app is built — they're excluded from the build, but Vitest still finds and runs them separately.

**Then we double-checked the tests themselves.** This is the important part for someone new to testing: *a test that always passes isn't actually testing anything.* To prove our tests were real, we did something called **mutation testing** — we deliberately broke the actual code (e.g., flipped a `===` to `!==` in the login check) and confirmed the test failed. Then we undid the break and confirmed the test passed again. This is the only way to be *sure* a test isn't just there for show.

One test genuinely failed this check the first time — it was comparing a calculated value against itself instead of against a fixed expected number, so it would have silently passed even if the underlying business rule (the point values) had been wrong. We fixed it to check against the actual documented values (10, 15, 20 points) instead.

---

## 4. Setting Up Continuous Integration (CI)

**What's "CI"?** Short for Continuous Integration. It means: every time code is pushed to the shared repository, a robot automatically runs all your checks (does it build? do the tests pass? is the code formatted correctly?) — without anyone having to remember to do it by hand. If something's broken, you find out within a minute, not whenever someone happens to notice.

**Why does this matter if I already run these checks myself?** Because CI runs on a *clean, fresh copy* of the code every time, the same way, regardless of whose computer pushed it or what state their local files were in. We actually proved this mattered: one of our checks (`format:check`, which makes sure the code style is consistent) passed locally but would have failed on a truly fresh download of the project, because of some old, pre-existing formatting issues nobody had cleaned up. CI catches that kind of thing; "works on my machine" doesn't.

**What we built:** a file at `.github/workflows/ci.yml` that tells GitHub: "every time someone pushes to the `main` branch, run these 5 checks in order, on a fresh Linux computer in the cloud."

**The order of the checks mattered more than expected — two real bugs were found by testing this carefully instead of guessing:**
1. We first guessed that running the *fastest* checks first would save time, and put the formatting check first, then tests, then the build. We assumed tests don't need the project to be "built" first.
2. **That assumption was wrong**, and we proved it by actually breaking it: one part of the code imports a shared package by name (not by file path), and that import only works *after* the shared package has been built once. Running tests before the build failed with a confusing error. We fixed the order so the build always happens before the tests.
3. We also timed every single check and discovered our assumption about which check was "fastest" was backwards — the code-quality checker (`lint`) was actually the *slowest* step, not the fastest, because it does a deep type-check under the hood. We reordered based on the actual measured times, not on assumptions.

**We also tested the pipeline itself the same way we tested the code** — deliberately introduced a formatting mistake, a type error, and an unused variable, one at a time, and confirmed each one made the *correct* CI step fail. Then undid each mistake and confirmed everything passed again.

---

## 5. "Do I need to update CI every time I add a feature?"

Short answer: **no.** The CI workflow file doesn't mention specific features or files — it just runs the same 5 generic commands every time (format check, build, test, build the frontend, lint). Adding a new feature doesn't require touching that file unless you're changing the *shape* of the project itself (like adding a whole new package, or a brand-new tool like end-to-end browser testing).

Whether to *write a new test* for a new feature is a separate, personal judgment call — CI won't force you to, but it's worth doing for anything where "if this silently broke, I'd really want to know immediately" (business logic, validation rules) versus things that are hard to test usefully without more setup (visual/UI changes).

---

## 6. A Small Bug We Found Right After Setting Up CI

After all this, running `npm run test` by itself (outside of the full CI sequence) failed with a confusing error about a missing package. This was the *same* root cause as the CI step-ordering bug above: running tests requires the shared package to be built first, and nothing was reminding us to do that when running tests on their own, day-to-day.

**The fix:** added a `"pretest"` script to `package.json`. In `npm`, any script named `pretest` automatically runs *before* a script named `test` — so now `npm run test` quietly builds the shared package first, every time, without you having to remember. We had to do this for `test`, `test:watch`, and `test:coverage` separately, since each needs its own matching `pre`-prefixed script — `npm` doesn't share one "before" hook across multiple script names.

---

## 7. Putting It All on `main` and Watching CI Run for Real

Finally, we merged the `feature` branch (where all this work happened) into `main` and pushed it to GitHub. Two important clarifications from that step, since they trip up a lot of people new to Git:

- **Merging locally does nothing by itself.** `git merge` only changes files on your own computer. GitHub — and the CI robot — has no idea anything happened until you `git push`.
- **The push is the trigger.** The moment GitHub receives the push to `main`, it notices the workflow file says "run on every push to main" and starts the CI run automatically.

The first real run succeeded — all 5 checks passed in 42 seconds. A couple of harmless first-run quirks showed up in the log (a deprecation warning about GitHub's internal tooling, unrelated to our app's code; and a "cache not found" message, since it was the very first run and had nothing to reuse yet) — both expected and not something to worry about.

---

## Quick Reference: Useful Commands From This Session

| Command | What it does |
|---|---|
| `npm run lint` | Checks code style/quality rules |
| `npm run format:check` | Checks code formatting (no changes) |
| `npm run format` | Actually fixes formatting issues |
| `npm run typecheck` / `npm run build` | Compiles and type-checks the backend + shared code (these are currently the same command) |
| `npm run build:frontend` | Builds the frontend app |
| `npm run test` | Runs all automated tests once |
| `npm run test:watch` | Runs tests and keeps watching for changes |
| `npm run test:coverage` | Runs tests and reports how much of the code they actually exercise |

## Where to Look Things Up Later

- `AUDIT_REPORT.md` (repo root) — the full original audit findings, with notes on what's been fixed.
- `.github/workflows/ci.yml` — the actual CI pipeline definition.
- `packages/shared/src/__tests__/` and `packages/backend/src/middleware/__tests__/` — the test files themselves, good examples to copy from when writing new tests.
- The GitHub repo's **Actions** tab — see every CI run, past and present, and click into any of them to see the full logs.
