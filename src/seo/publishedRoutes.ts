/**
 * Crawlable static paths — keep in sync with `App.tsx` and `scripts/generate-seo-files.ts`.
 * Editorial pages only; landing URLs come from `allResolvedLandings()`.
 */
export const EDITORIAL_STATIC_PATHS = [
  '/',
  '/about/',
  '/methodology/',
  '/contact/',
  '/alberta-coverage/',
] as const
