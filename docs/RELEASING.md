# Releasing and Versioning Guide

This guide explains how to update the application version across the family kindness monorepo.

## Versioning System Overview
The application version is dynamically read from the `package.json` files:
* **Backend:** Reads directly from `packages/backend/package.json` for runtime `/api/health` queries.
* **Frontend:** Reads from `packages/frontend/package.json` at build time to populate `import.meta.env.VITE_APP_VERSION` displayed on the dashboard.

To update the dashboard version, you must update the version in these files.

---

## Step-by-Step Release Workflow

Follow these 3 steps to complete a release cycle. Since you are using **Git Bash**, these commands are optimized for your terminal.

### Step 1: Pre-Flight Check
Ensure you have no uncommitted changes before starting a release.
```bash
git status
```

### Step 2: Bump Versions
Run **one** of the following commands depending on the type of release. This will safely bump the version across all workspace packages and the root package in one action.

**Patch Release** (e.g., `1.0.0` ➔ `1.0.1` for bug fixes):
```bash
npm version patch --workspaces --no-git-tag-version && npm version patch --no-git-tag-version
```

**Minor Release** (e.g., `1.0.0` ➔ `1.1.0` for new features):
```bash
npm version minor --workspaces --no-git-tag-version && npm version minor --no-git-tag-version
```

**Major Release** (e.g., `1.0.0` ➔ `2.0.0` for breaking changes):
```bash
npm version major --workspaces --no-git-tag-version && npm version major --no-git-tag-version
```

### Step 3: Stage, Commit, Tag, and Push
After bumping the version, you must commit the changes, create a git tag, and push it to trigger your deployment pipeline (like Render). 

To avoid typos, define the `NEW_VERSION` variable at the start of the command (replace `v1.0.2` with your actual new version), and then copy and paste the entire block:

```bash
NEW_VERSION="v1.0.2" && git add . && git commit -m "chore: release $NEW_VERSION" && git tag $NEW_VERSION && git push origin main --tags
```
