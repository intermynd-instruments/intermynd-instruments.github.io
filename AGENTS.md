# Agent Guide

This repository contains one application: the public Intermynd Instruments static site. Eleventy
renders Nunjucks templates from `src/`, Tailwind builds the stylesheet, and GitHub Actions deploys
`_site/` to GitHub Pages.

## Environment and setup

- Use Node.js 20.19 or newer. CI and the development container use Node 22.
- No database, local service, login, or application secret is required for local development.
- Install the locked dependency graph with `npm ci`.
- Alternatively, reopen the repository in its development container; it runs `npm ci` automatically
  and forwards port 8080.

Do not read, print, or commit `.env`. `CLOUDFLARE_API_TOKEN` is only needed for the emergency
cache-purge path in `release.sh`, not for development or tests.

## Essential commands

| Purpose                       | Command                 |
| ----------------------------- | ----------------------- |
| Start the development server  | `npm run dev`           |
| Run fast local validation     | `npm run validate:fast` |
| Run full validation and build | `npm run validate`      |
| Run unit tests                | `npm test`              |
| Run coverage thresholds       | `npm run test:coverage` |
| Run static type checks        | `npm run typecheck`     |
| Run ESLint                    | `npm run lint`          |
| Check formatting              | `npm run format:check`  |
| Apply formatting              | `npm run format`        |
| Build the production site     | `npm run build`         |

Run `npm run validate` before handing work back. CI runs equivalent checks for pull requests, and
the pre-commit hook runs the fast validation set.

## Project structure

- `src/_data/`: site-wide data and manual version metadata.
- `src/_includes/layouts/`: shared page layouts.
- `src/_includes/partials/`: navigation, footer, analytics, and page scripts.
- `src/manuals/`: versioned DS-8 manuals.
- `src/css/intermynd.css`: Tailwind entry point and custom design system.
- `scripts/hash-css.js`: CLI wrapper for publishing content-hashed CSS.
- `scripts/hash-css-lib.js`: testable CSS publication logic.
- `tests/`: Vitest unit tests named `*.test.js`.
- `_site/`, `_tmp/`, `coverage/`, and `reports/`: generated and ignored.

Only files explicitly configured as Eleventy passthrough copies are published. Do not add large
media or wallpapers to that list unless the site references them.

## Code and test conventions

- Use ES modules and retain the existing double-quote, semicolon-terminated style.
- Use `camelCase` for variables and functions, `PascalCase` for types, and `UPPER_SNAKE_CASE` for
  module constants.
- Add JSDoc types when changing JavaScript APIs. The repository uses strict TypeScript `checkJs`
  analysis without transpiling the source.
- Keep functions below the ESLint complexity threshold and split JavaScript files before they exceed
  the configured line limit.
- Put unit tests in `tests/` with a `*.test.js` suffix. Cover successful paths, edge cases, and
  failures. Tests must not depend on network access or shared state.
- Do not weaken lint, type, or coverage thresholds to make a change pass.
- Never edit generated output in `_site/`, `_tmp/`, or `coverage/`.

## Interactive QA

There is no authentication gate and no external service must be running.

1. Run `npm ci`, then `npm run dev`.
2. Open <http://localhost:8080>.
3. Confirm the homepage renders and the browser console has no errors.
4. In the Polydeck card, click **White finish** and confirm its product image changes to
   `pd12-top-white.jpg`.
5. Open **Find out more**, then open **User manual** and confirm the manual version selector can
   navigate to an older manual.
6. Stop the development process when finished.

Do not submit the hardware-interest form during QA because it navigates to a real Google Form.

## Development workflow

- Treat existing uncommitted and untracked files as user work.
- Keep changes focused and update tests and documentation with behavior.
- Use `npm ci`, not an unlocked install, in reproducible environments.
- Pull requests should explain the change, list validation performed, and note any user-visible or
  deployment risk.
- Deployment occurs only from `main`. Do not invoke `release.sh` or purge the production cache
  unless the user explicitly requests a release.
