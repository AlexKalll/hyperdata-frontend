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

## How to record future changes
- When making non-trivial modifications, add a short entry under a new dated section below
- Split commits by cohesive behavior or deployable concern, use Conventional Commit messages
- Do not include documentation-only files in implementation commits (exception: CHANGES.md may be committed separately)
- Before committing implementation changes, record a concise, dated summary in this file
