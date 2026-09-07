# Changes
This file documents modifications made to the upstream project in compliance with
Section 4(b) of the Apache License, Version 2.0.

## Upstream
- **Original project:** [leyu-frontend](https://github.com/dave-lab12/leyu-frontend)
- **License:** Apache License 2.0
- **Fork:** [iCog-Labs-Dev/hyperdata-frontend](https://github.com/iCog-Labs-Dev/hyperdata-frontend)

## Modifications (by category & date)

### Branding and rebranding
- Renamed project from "Hyperdata Frontend" to "Mahder Frontend"
- Updated all titles, meta tags, and LICENSE copyright from Leyu to Mahder
- Aligned Docker documentation and README with new branding

### License and attribution
- Updated LICENSE file copyright year and owner from Leyu organization to iCog Labs / alexkalll
- Retained upstream Apache 2.0 license

### CI / deployment pipeline
- Added GitHub Actions workflow for lint, build, and deployment
- Updated pnpm configurations and lock file management
- Updated Node.js versions in CI (20 → 23)
- Configured GitHub Secrets for Docker deployment
- Added GitHub Actions lint and build workflow
- Set up CI pipeline with Node.js version updates
- Added overrides for jws and js-yaml versions in pnpm-lock.yaml

- **PR #4**: Fixed date picker validation, hydration warning and null crash
  - Fixed DOS vulnerable next dependency version and removed unused overrides
  - Locked file after updating next.js and adding pnpm workspace config
  - Updated package.json and pnpm-lock.yaml for new dependencies
  - Updated GitHub Actions workflow configuration
  - Fixed hydration error from Dark Reader and null crash on project stats page

### ESLint and code quality
- Configured ESLint plugins for React Hooks and TypeScript support
- Changed `react-hooks/rules-of-hooks` rule from error to warn
- Enforced React hooks rule and normalized custom hook declarations
- Fixed hydration errors from Dark Reader and null crashes on project stats page
- Secured session cookies in production
- Made table cell renderers hook-safe
- Normalized custom hook declarations
- Updated Docker documentation and aligned with rebranding

### Structure and configuration
- Refactored project rename from Hyperdata Frontend to Mahder Frontend
- Updated related configurations (package names, paths, etc.)
- Added pnpm workspace configuration and updated tsconfig paths
- Removed unused settings.local.json file
- Locked file after updating next.js and adding pnpm workspace config
- Fixed DOS vulnerable next dependency version and removed unused overrides

## 2026-08-26 - Task creation payload fix

### Bug fixes
- Removed non-whitelisted `expected_number_of_total_contributors` field from task
  creation/update payloads (`NewTask` type, `createTaskForm.tsx`,
  `updateTaskForm.tsx`, `taskTable.tsx`).
- The backend's global validation pipe uses `forbidNonWhitelisted: true`, so this
  unknown property caused task creation by Project Managers to fail with
  `400 "property expected_number_of_total_contributors should not exist"`.
- The backend already exposes the equivalent field under its real name
  `max_expected_no_of_contributors`, which the forms already include.

## 2026-09-07 - Review and withdrawal request contracts

- Send only supported body fields for dataset approval and flagging, keeping the dataset ID in the URL.
- Serialize withdrawal amounts as JSON numbers instead of form strings.
- Redirect Reviewer and Facilitator logins to the existing lowercase dashboard routes.
- Resolve the authenticated role from a fresh session immediately after login instead of stale-session timers, and avoid refreshing the old login route during navigation; add regression coverage for all demo roles and missing sessions.
- Advance the reviewer UI and reset review selections only after successful approval, rejection, or flagging; preserve dialogs and selections on failed requests, with pending/success/failure regression coverage.
- Add Node regression tests without new dependencies for review payloads, approval authentication, withdrawal serialization, and role redirects (`node --test tests/request-contracts.test.cjs`). These are isolated tests, not live browser E2E coverage.
- Keep reviewer completion limits in backend day units during task creation and editing, retain contributor days-to-hours conversion, and avoid mutating creation form state on submission. Test failed retries and persisted-value edit round trips; no existing records are migrated.

## 2026-09-07 - Frontend CI validation

- Declare the Next.js ESLint plugin directly so Node-based lint resolves it with pnpm's isolated dependencies; reuse the already locked plugin version.
- Run the retained request-contract regression suite through `pnpm test` and in CI after the build.

## How to record future changes
- When making non-trivial modifications, add a short entry under a new dated section below
- Split commits by cohesive behavior or deployable concern, use Conventional Commit messages
- Do not include documentation-only files in implementation commits (exception: CHANGES.md may be committed separately)
- Before committing implementation changes, record a concise, dated summary in this file
