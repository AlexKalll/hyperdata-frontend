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

## 2026-09-22 - Netcup production deployment baseline

- Promoted the tested frontend changes to the default `main` branch.
- Added deterministic pnpm 9 installation to the production Docker image.
- Added Docker build arguments for the public API and frontend URLs so client bundles use the production endpoints.

## 2026-09-23 - Production login session cookie

- Removed the custom NextAuth session-cookie override so the credentials route and `withAuth` middleware use the same production cookie name.
- Fixed valid logins being redirected back to `/login?callbackUrl=...` because middleware could not read the custom session cookie.

## 2026-09-23 - Task wizard measurement labels

- Added explicit units to task creation, task editing, payment editing, and task summary labels for days, minutes, seconds, characters, age in years, contributor/dataset counts, retries, batches, and wallet credits.
- Corrected character-field placeholders that incorrectly said `Enter seconds`.
- Kept contributor deadline inputs in user-facing days with the existing days-to-hours API conversion, and displayed reviewer deadlines in their backend day units.

## 2026-09-24 - E2E request-contract alignment

- Aligned reference-data create/update forms with strict endpoint DTOs, including
  relation-ID fields and edit prepopulation for dialects, regions, and zones.
- Kept task and instruction IDs in endpoint URLs and limited assignment and
  instruction request bodies to endpoint-supported properties.
- Awaited assignment and instruction mutations and removed duplicate component
  notifications so dialogs close only after successful requests.

## 2026-09-24 - Reviewer task visibility

- Always refetch the Reviewer task panel when it opens or regains focus.
- Separated Reviewer and Facilitator React Query cache keys and scoped detail
  query keys by task ID to prevent role/task results from sharing stale data.
- Display a retryable error state instead of showing the empty-task illustration
  when the Reviewer task request fails.

## 2026-09-24 - Facilitator submission view contract

- Aligned the facilitator contributor-submission query with the backend's
  supported pagination and contributor filter parameters, preventing strict
  validation 400 responses when opening a submission.

## 2026-09-25 - Instruction deletion

- The task instruction delete control now calls the authenticated endpoint,
  stays disabled while pending, and closes its view only after success.
- Added request-contract coverage for the delete URL and control wiring.

## 2026-09-25 - Task user names

- Rendered task-member full names from the nested user data in the SuperAdmin
  task users table.

## 2026-09-27 - Reference-data administration fixes

- Display sector descriptions in a compact, single-line truncated table cell.

## 2026-10-11 - Profile editing and navigation cleanup

- Send only supported profile fields, preserve optional values, and surface
  backend validation messages when profile updates fail.
- Added a concise, role-specific Help & Support guide for project managers,
  facilitators, and reviewers, and allowed those roles to open it without a
  dashboard redirect.
- Replaced the project-manager project picker dashboard with owned-project
  totals and a direct link to Projects; routed Settings to account settings.
- Added the account Settings link to Reviewer and Facilitator navigation.

## 2026-10-11 - Documentation and Docker setup

- Updated repository clone/folder instructions and the GitHub Issues URL.
- Replaced the README's broken link to a missing contribution guide with the repository pull-request page.
- Corrected Docker Compose build arguments for `NEXT_PUBLIC_*` values and changed the frontend health check to the root page.
- Required a deployment-specific `NEXTAUTH_SECRET` instead of a weak Compose default.
- Documented that public Next.js environment values are embedded at build time.

## 2026-10-11 - Invitation link generation

- Send only invitation body fields, keeping project/task IDs in the URL, and
  correctly generate facilitator invitation URLs.

## 2026-10-11 - Administrator-created accounts

- Remove the administrator password field and email system-generated temporary
  credentials; normalize names, optional middle name, and the birth-date payload.
- Route temporary-password sessions to a mandatory password-change screen and
  require a fresh sign-in after the new password is saved.
- Correct both account-creation forms, invitation phone/optional-field payloads,
  and invitation-specific registration reference-data loading.

## 2026-10-12 - Invitation registration compatibility

- Keep phone numbers optional for invitation registration and send normalized
  phone numbers only when provided.

## 2026-10-12 - Contributor website sign-in guidance

- Explain that contributor accounts use the Mahder mobile app and registered
  phone number when a contributor tries to sign in to the website.

## 2026-10-18 - Invitation expiry and link display

- Allow the expiry date to be left blank for no expiration and display expiration
  in the generated-link dialog and invitation table.
- Use the current browser origin when the public frontend URL is unset, avoiding
  invitation links starting with `undefined`.
- Omit the default zero invitation limit so unlimited invitations use the API's
  optional limit, and open the generated-link dialog only after creation succeeds.

## 2026-10-23 - Invitation limit guidance

- Clarify in the Max Invitations label that 0 means no limit.

## 2026-10-23 - Production frontend domain

- Set the VPS frontend build and authentication URLs to `https://portal.mahder.ai`
  for the next deployment.

## How to record future changes
- When making non-trivial modifications, add a short entry under a new dated section below
- Split commits by cohesive behavior or deployable concern, use Conventional Commit messages
- Do not include documentation-only files in implementation commits (exception: CHANGES.md may be committed separately)
- Before committing implementation changes, record a concise, dated summary in this file
