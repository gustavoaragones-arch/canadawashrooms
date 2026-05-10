# Cloudflare Pages — Canada Washrooms

Static SPA built with Vite. Production deploy expectations:

## Build

- Command: `npm run build`
- Output directory: `dist/`
- At the end of `vite build`, the `cwr-seo-files` plugin writes `dist/sitemap.xml` and `dist/robots.txt` from curated routes only (`allResolvedLandings()` + `EDITORIAL_STATIC_PATHS` in `src/seo/publishedRoutes.ts`).

## SPA routing

- [`public/_redirects`](public/_redirects) sends unknown paths to `/index.html` with `200` so client-side routes resolve.
- Hashed assets under `/assets/` are served as static files and are not rewritten.

## Headers & caching

- [`public/_headers`](public/_headers) sets security headers globally, long-cache for `/assets/*`, and short cache for `index.html` so HTML updates propagate after deploys.

## Environment

- Set `VITE_SITE_ORIGIN` in Pages **Environment variables** (e.g. `https://canadawashrooms.ca`) so canonical URLs, Open Graph URLs, sitemap/robots absolute URLs, and JSON-LD `@id`s match production. Preview deployments can override per-environment.

## Validation checklist

1. Open a landing URL directly (refresh) — expect 200, not blank.
2. Fetch `/sitemap.xml` and `/robots.txt` from the deployed host.
3. Confirm `/about`, `/methodology`, and a sample `/:segment/:city` route load after hard refresh.
