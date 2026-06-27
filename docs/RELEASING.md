# Releasing and Versioning Guide

This guide explains how to update the application version across the family kindness monorepo.

## Versioning System Overview
The application version is dynamically read from the `package.json` files:
* **Backend:** Reads directly from `packages/backend/package.json` for runtime `/api/health` queries.
* **Frontend:** Reads from `packages/frontend/package.json` at build time to populate `import.meta.env.VITE_APP_VERSION` displayed on the dashboard.

To update the dashboard version, you must update the version in these files.

## Release Commands

To ensure a clean git history and avoid npm errors due to modified workspace files, chain both commands on a single line using `&&` with the `--no-git-tag-version` flag, then manually commit and tag.

### 1. Patch Release (e.g., `1.0.0` ➔ `1.0.1`)
For bug fixes and minor tweaks:
```bash
npm version patch --workspaces --no-git-tag-version && npm version patch --no-git-tag-version
```

### 2. Minor Release (e.g., `1.0.0` ➔ `1.1.0`)
For new backwards-compatible features:
```bash
npm version minor --workspaces --no-git-tag-version && npm version minor --no-git-tag-version
```

### 3. Major Release (e.g., `1.0.0` ➔ `2.0.0`)
For breaking changes or major releases:
```bash
npm version major --workspaces --no-git-tag-version && npm version major --no-git-tag-version
```

---

## Step-by-Step Release Workflow

Follow these steps to complete a release:

1. **Verify your working tree is clean:**
   Ensure you have no uncommitted changes before bumping versions.
   ```bash
   git status
   ```

2. **Run the version bump command:**
   *(e.g., for a patch bump)*
   ```bash
   npm version patch --workspaces --no-git-tag-version && npm version patch --no-git-tag-version
   ```

3. **Stage and commit all package.json updates:**
   This creates exactly **one** clean commit for the release.
   ```bash
   git add .
   # Replace 1.0.1 with the actual version bumped
   git commit -m "chore: release v1.0.1"
   ```

4. **Tag the commit:**
   Create a single global git tag pointing to this commit.
   ```bash
   git tag v1.0.1
   ```

5. **Push the commits and tag to remote:**
   This updates the main branch and pushes the tag to trigger any deployment workflows.
   ```bash
   git push origin main --tags
   ```

