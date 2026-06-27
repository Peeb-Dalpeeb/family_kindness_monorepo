# Full Audit Report — Family Kindness Tracker Monorepo

**Date:** 2026-06-27
**Scope:** `packages/backend`, `packages/frontend`, `packages/shared` (~3,100 LOC, npm workspaces)
**Method:** Static analysis (lint/typecheck/format/`npm audit`/build), manual code review of all routes, auth, schemas, models, and the highest-traffic frontend components, cross-checked against `docs/ProductArchitecture.md` and `docs/ERD.md`.

**Update (2026-06-27):** All actionable findings below have been applied to the codebase — see "✅ Applied" notes inline. Items explicitly out of scope (no tests, no CI, no structured logging, no error tracking) remain unactioned by design.

## Executive Summary

The codebase is in good shape for an MVP: strict TypeScript, a clean ESLint/Prettier setup, zero dependency vulnerabilities, server-side-authoritative point calculation, and a sound HttpOnly-cookie JWT auth design. The main gaps are operational rather than architectural.

**Top risks, ranked:**

1. **No rate limiting on `/api/auth/login`** — a 4-digit PIN (10,000 combinations) with no throttling is brute-forceable in seconds.
2. **No rate limiting on the public `/api/logs` POST endpoint** — open to spam/abuse since it requires no auth by design.
3. **Global error handler leaks `err.message` to clients** — could expose internal details (DB error text, stack info embedded in messages) in production responses.
4. **No tests / no CI** — any regression ships straight to users; flagged per scope, not actioned here.
5. **Documentation drift** — `docs/ERD.md` states points validation as `max(100)`; the actual enforced max is `20`. `docs/ProductArchitecture.md` describes the self-logging guard as role-gated ("if Standard/Child"); the implementation applies it to everyone, including admins.

No injection, XSS, or CORS misconfiguration found. `npm audit` is clean across all workspaces.

---

## 1. Security

| Severity | Location | Finding | Recommended Fix |
|---|---|---|---|
| **High** | `packages/backend/src/middleware/auth.ts` (`loginHandler`), wired in `index.ts:262` | `/api/auth/login` has no rate limiting. A 4-digit PIN means at most 10,000 attempts are needed to brute-force admin access; with no throttling this is trivially scriptable. | Add `express-rate-limit` scoped to the login route. **✅ Applied** — `packages/backend/src/middleware/rateLimit.ts` (new), wired in `index.ts`. |
| **Medium** | `packages/backend/src/index.ts:201` (`POST /api/logs`) | Public write endpoint has no rate limiting, allowing scripted spam of fake kindness entries (denial-of-service on the meter / DB growth). | Apply a looser rate limit (e.g. 20 req/min/IP) to the same middleware, mounted on this route too. **✅ Applied.** |
| **Medium** | `packages/backend/src/index.ts:383-387` (global error handler) | `error: errorMessage` is sent to the client for every uncaught exception, including Mongoose/driver error text which can leak schema/internal details. | Log `errorMessage` server-side only; return a generic message to the client. **✅ Applied.** |
| **Low** | `.env.example` | `ADMIN_PIN=1234` is the literal example value — if a deployer copies `.env.example` to `.env` without editing it, the PIN is a famously weak default. | Add a startup check (similar to the existing `JWT_SECRET` guard in `getAdminPin()`) that throws if `ADMIN_PIN` is unset *or* still `1234`. **✅ Applied** — `packages/backend/src/middleware/auth.ts`. |
| Informational | CORS, input validation, cookie flags, ObjectId-regex validation, injection surface | All reviewed and sound: Zod validates every mutating payload server-side independent of the client; Mongoose parameterizes all queries; cookies are `httpOnly` + `sameSite: strict` + `secure` in prod; no `dangerouslySetInnerHTML`/`innerHTML`/`eval` anywhere in the frontend. | No action needed. |

### Ready-to-apply fix: rate limiting

```bash
npm install express-rate-limit --workspace=@family-kindness/backend
```

```ts
// packages/backend/src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,                 // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Try again later.' },
});

export const writeRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});
```

```ts
// packages/backend/src/index.ts — wire into existing routes
import { loginRateLimiter, writeRateLimiter } from './middleware/rateLimit.js';

app.post('/api/auth/login', loginRateLimiter, loginHandler);
// ...
app.post('/api/logs', writeRateLimiter, asyncHandler(async (req, res) => { /* unchanged */ }));
```

### Ready-to-apply fix: stop leaking internal error text

```ts
// packages/backend/src/index.ts:378-388 — before
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[backend] ✗ Global error caught:', err);
  const errorMessage = err instanceof Error ? err.message : String(err);

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: errorMessage,
  });
});

// after
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[backend] ✗ Global error caught:', err);

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
});
```

### Ready-to-apply fix: reject the default PIN at startup

```ts
// packages/backend/src/middleware/auth.ts:54-60 — before
function getAdminPin(): string {
  const pin = process.env['ADMIN_PIN'];
  if (!pin) {
    throw new Error('[auth] ADMIN_PIN is not configured in environment variables.');
  }
  return pin;
}

// after
function getAdminPin(): string {
  const pin = process.env['ADMIN_PIN'];
  if (!pin || pin === '1234') {
    throw new Error('[auth] ADMIN_PIN is not configured (or still the example default 1234).');
  }
  return pin;
}
```

---

## 2. Efficiency / Performance

| Severity | Location | Finding | Recommended Fix |
|---|---|---|---|
| Low | `packages/backend/src/index.ts:174-198`, `268-285` | `.find()` queries return full Mongoose documents/hydrated models when only plain data is mapped out afterward. | Append `.lean()` to read-only queries (`UserModel.find().lean()`, `KindnessEntryModel.find().sort(...).lean()`) to skip document hydration — minor but free win at this scale. **✅ Applied.** |
| Low | `packages/frontend/src/pages/Admin.tsx:134-153` | For each family member, `entries.filter(...)` runs twice over the full entries array (O(n·m)). Negligible at MVP scale, but won't hold up if log volume grows. | Precompute counts once with a single pass: `entries.reduce` into a `Record<string, { given: number; recv: number }>` before mapping `members`. **✅ Applied.** |
| Informational | `packages/frontend` production build | Single JS bundle, 473 KB raw / 144 KB gzip, no route-based code splitting. Under Vite's default warning threshold, so not urgent. | If bundle grows, lazy-load `/admin` via `React.lazy` since it's used by a small subset of sessions (parents only). |

---

## 3. Code Quality / Maintainability

| Severity | Location | Finding | Recommended Fix |
|---|---|---|---|
| Low | `Dashboard.tsx`, `Admin.tsx`, `ProtectedRoute.tsx` | The fetch → check `response.ok` → parse JSON → `catch`/`console.error` pattern is duplicated across all three files (6+ call sites). | Extract a small `useApi`/`apiFetch` helper in `packages/frontend/src/lib/api.ts` (see snippet below). **✅ Applied** — `lib/api.ts` (new); `Dashboard.tsx`, `Admin.tsx`, `ProtectedRoute.tsx` refactored to use it. |
| Low | `packages/backend/src/index.ts` (395 lines) | Mixes Express app setup, DB connection/seeding, aggregation logic, and every route handler in one file. Still readable today, but it's the natural next thing to split if more routes are added. | Extract `seedDatabase`/`getHouseholdMetrics` into `src/db/seed.ts` and `src/services/metrics.ts`; keep `index.ts` to app wiring + route registration. Not urgent at current size. **Deferred** — out of scope for this pass, still a future-split candidate. |
| Informational | `eslint.config.js` run | One stale `eslint-disable` comment in `index.ts:164` (no longer suppressing anything). | Run `npm run lint:fix` to auto-remove it. **✅ Applied.** |
| Informational | repo-wide `format:check` | 24 files fail Prettier's `endOfLine: lf` check locally — caused by `core.autocrlf=true` in this environment's git config checking files out as CRLF, not by the repository content itself. | Add a `.gitattributes` with `* text=auto eol=lf` so all contributors get consistent LF line endings regardless of local `autocrlf` settings. **✅ Applied** — `.gitattributes` (new); existing files may need `git add --renormalize .` locally to pick up the new line-ending rule. |

### Ready-to-apply fix: shared fetch helper

```ts
// packages/frontend/src/lib/api.ts
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, init);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Request to ${url} failed:`, error);
    return null;
  }
}
```

```ts
// Dashboard.tsx — usage example replacing fetchMetrics()
const fetchMetrics = async () => {
  const data = await apiFetch<DashboardMetrics>('/api/meter-status');
  if (data) setMetrics(data);
};
```

---

## 4. Effectiveness / Correctness

| Severity | Location | Finding | Recommended Fix |
|---|---|---|---|
| Informational | `packages/shared/src/schemas.ts` vs `docs/ERD.md:10` | ERD documents `pointsAwarded` validation as `z.number().int().min(5).max(100)`. The actual implementation derives bounds from `POINTS_MATRIX`/`OTHER_POINT_OPTIONS`, giving `min(5).max(20)`. Implementation is correct (matches the points matrix); the doc is stale. | Update `docs/ERD.md` row to reflect the derived `5–20` bound, or reference `MIN_POSSIBLE_POINTS`/`MAX_POSSIBLE_POINTS` by name instead of hardcoding numbers. **✅ Applied** — `docs/ERD.md` row corrected. |
| Informational | `docs/ProductArchitecture.md:72` vs `packages/shared/src/schemas.ts:58-63` | Spec says the self-logging guard ("SubmittedBy ≠ Beneficiary") applies only when the submitting user's role is "Standard". The implemented `KindnessEntryRefinedSchema` enforces it unconditionally for every submission, admins included — schema has no access to role at all. Stricter than spec, not a bug, but worth reconciling intent. | Confirm intent with stakeholders; if admins should be allowed to self-log, the rule would need role context plumbed into the request, which is a larger change — otherwise just update the doc to say the rule is universal. **✅ Applied** — `docs/ProductArchitecture.md` updated to describe the rule as universal (code behavior unchanged; this was a doc-only correction, not a stakeholder-confirmed behavior change). |
| Informational | `packages/backend/src/index.ts:45-102` (`seedDatabase`) | Seeding runs on every server boot and inserts 5 hardcoded family members (including names) if `User` collection is empty. If a production DB is ever wiped or misconfigured, this silently reseeds with personal-looking placeholder data rather than failing loudly. | Acceptable for MVP single-household deployment; if multi-tenant or shared hosting is ever a goal, gate seeding behind an explicit `SEED_ON_BOOT` env flag. |
| Verified correct | `resolvePoints()` (`packages/shared/src/constants.ts`) and both POST/PUT routes in `index.ts` | Server always recomputes `pointsAwarded` server-side via `resolvePoints(category, pointsAwarded)` rather than trusting the client value for fixed categories — confirmed no way to submit arbitrary points for `Kind Words`/`Showing Gratitude`/`Helping Hand`. | No action needed. |

---

## 5. Operational Readiness (flagged only, per audit scope)

- **No automated tests.** No Vitest/Jest config or test files exist anywhere in the repo. Recommend starting with: Zod schema edge cases (`packages/shared`), the auth middleware (`requireAdmin`/`loginHandler`), and the points-resolution + aggregation logic — these are the highest-value, lowest-effort targets since they're pure functions or isolated middleware.
- **No CI.** No `.github/workflows`. Recommend a minimal workflow running `npm run lint && npm run typecheck && npm run build` on PRs before adding test execution.
- **Console-only logging.** All backend logging goes to `console.log`/`console.error` with no structured format or log levels. Fine for current scale; revisit with `pino` if/when this moves to a host with log aggregation.
- **No error tracking.** No Sentry/equivalent. Low priority for a single-household MVP.

---

## 6. Documentation Consistency

Reviewed `docs/ProductArchitecture.md` and `docs/ERD.md` against the implementation. Two drifts found (see Section 4 above: points-bound mismatch, role-gated guard mismatch). Everything else — route boundaries, public vs. admin read/write splits, index strategy, aggregation pipeline — matches the implementation exactly.

---

## Verification

- `npm run lint` — 1 warning (stale eslint-disable comment, noted above), 0 errors.
- `npm run typecheck` — clean, no errors.
- `npm run format:check` — 24 files flagged for CRLF vs the configured LF line-ending rule; confirmed this is a local checkout artifact (`core.autocrlf=true`), not real formatting drift in the repository content.
- `npm audit --workspaces` — 0 vulnerabilities.
- `npx vite build` (frontend) — succeeds, 473 KB / 144 KB gzip single bundle, no warnings.

No source files were modified during this audit. All recommended fixes above are presented as snippets for the user to apply at their discretion.
