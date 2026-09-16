# Intermynd Instruments

The public-facing site for Intermynd Instruments: product pages for the
DS-8 Drumstream and the Polydeck, five versions of the DS-8 manual, and a
Google-Forms preorder flow.

Served from GitHub Pages behind Cloudflare at
[https://intermynd-instruments.com](https://intermynd-instruments.com).

## Architecture

Static site built at deploy time with [Eleventy](https://www.11ty.dev/) and
[Tailwind CSS](https://tailwindcss.com/). Eleventy renders HTML from Nunjucks
templates (shared chrome in `src/_includes/`), Tailwind compiles the
stylesheet from the utility classes used across templates, and a few build
transforms finish the job:

- `vita-buttons` replaces `<code>CROSS</code>`/`<code>SQUARE</code>`/... in
  manuals with the CSS-drawn PS Vita button icons that used to be injected by
  client-side JS — no script, no layout shift.
- `minify-html` minifies output with `conservativeCollapse` so inline
  whitespace-sensitive layouts keep working.
- The manual version `<select>` is rendered server-side from
  `src/_data/manuals.json`, replacing the old `manual-versions.js`.
- The Cloudflare Web Analytics beacon is injected into every page by
  `src/_includes/partials/beacon.njk` when `cloudflareBeaconToken` is set in
  `src/_data/site.json`.

The stylesheet is content-hashed to `/css/intermynd.<hash>.css` by
`scripts/hash-css.js`; the hash also lands in `src/_data/css.json` for
templates to reference. Fonts are self-hosted (JetBrains Mono via
`@fontsource-variable`, the Intermynd branding TTF family) — no Google Fonts,
no Tailwind Play CDN at runtime.

Only files listed as passthrough copies reach the published site (CNAME,
logos, fonts, the five root images, and four media files), so `.DS_Store`,
unused fonts, and the 23 MB of unreferenced brand wallpapers never get
published. See the commented wallpaper line in `eleventy.config.js`.

## Layout

```
src/
  _data/            site.json (site-wide config, beacon token), manuals.json (manual versions)
  _includes/
    layouts/        base.njk (page chrome), manual.njk (manual page layout)
    partials/       head, nav, footers, scripts, beacon, page-specific scripts
  manuals/          one .njk per manual version + latest.njk, permalinks preserve old URLs
  index.njk         homepage
  ds8.njk           DS-8 product page
  css/intermynd.css Tailwind directives + the design system (formerly intermynd.css)
```

## Local development

Requires Node.js 20+ (Node 22 is used in CI).

```sh
npm install
npm run dev      # Tailwind watch + Eleventy dev server on http://localhost:8080
npm run build    # full production build into _site/
```

`npm run build` cleans `_site/` and `_tmp/`, compiles + hashes the CSS, and
renders the site. The result is a fully static site; open
`_site/index.html` directly with a local server (e.g. `npx serve _site`).

## Adding a manual version

1. Add the version to `src/_data/manuals.json` (shown oldest-first; the
   selector renders the list).
2. Create `src/manuals/vX.Y.njk` with front matter (title, description, TOC,
   footer note, permalink `/ds8-manual-vX.Y.html`) and the manual body inside
   `{% raw %}...{% endraw %}` so Nunjucks leaves article markup alone.
3. Optionally point `src/manuals/latest.njk` at the new version.

`src/manuals/manuals.11tydata.js` supplies the shared nav/footer/CTA front
matter and the computed `displayVersion`.

## Releasing

Pushing to `main` triggers
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which:

1. installs dependencies and runs `npm run build`,
2. deploys `_site/` to GitHub Pages,
3. **purges the Cloudflare cache** afterward so visitors don't keep getting
   the previous build.

Two one-time setup steps (user-side, in the GitHub dashboard):

- **Pages source**: repo Settings → Pages → Build and deployment → Source →
  *GitHub Actions*. (Required once; before this workflow the site deployed
  from the branch.)
- **Cache purge token**: add `CLOUDFLARE_API_TOKEN` as a repository secret.
  Create a Custom API token at
  <https://dash.cloudflare.com/profile/api-tokens> with Zone → Cache Purge →
  Purge, scoped to intermynd-instruments.com. Zones the workflow already uses
  the purge endpoint directly with the zone ID in `deploy.yml`. Without the
  secret the deploy still succeeds; the purge step skips with a warning.

`./release.sh` handles the local side: it warns about uncommitted changes and
pushes to `origin/main`. It intentionally does **not** purge locally —
the cache purge is CI's job and only makes sense after the deploy completes.
For emergencies, `./release.sh --purge-now` reads `CLOUDFLARE_API_TOKEN` from
`./.env` (git-ignored) or the environment and purges immediately.

## Analytics

Cloudflare Web Analytics (RUM) runs through the beacon in
`src/_includes/partials/beacon.njk`, served from
`https://static.cloudflareinsights.com/beacon.min.js`. Metrics are viewable in
the Cloudflare dashboard under **Web Analytics**. Zone-level HTTP analytics are
separate and are queried through the Cloudflare GraphQL API.
