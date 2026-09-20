---
name: verify-site
description:
  Validate the Intermynd Instruments static site before handing changes back or opening a pull
  request.
---

# Verify the site

Use this skill after changing templates, styles, build scripts, manual data, or repository
automation.

1. Read `AGENTS.md` and check `git status --short`. Preserve existing user work.
2. Run `npm ci` only when dependencies need synchronization.
3. Run `npm run validate`. Fix formatting, lint, type, test, coverage, or build failures rather than
   weakening checks.
4. For user-facing changes, run `npm run dev` and follow the Interactive QA steps in `AGENTS.md`. Do
   not submit the real Google hardware-interest form.
5. Review `git diff --check` and `git status --short`.
6. Report the commands run, their results, and any validation that could not be completed.

Generated directories (`_site/`, `_tmp/`, `coverage/`, and `reports/`) are ignored. Never edit or
commit them directly.
