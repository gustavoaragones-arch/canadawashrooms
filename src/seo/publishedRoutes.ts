/**
 * Crawlable static paths — keep in sync with `App.tsx` and `scripts/generate-seo-files.ts`.
 * Editorial pages only; landing URLs come from `allResolvedLandings()`.
 * City pages (/city/:citySlug) are generated dynamically from LIVE_CITIES.
 */
export const EDITORIAL_STATIC_PATHS = [
  '/',
  '/providers/',
  '/construction-jobsites/',
  '/events-weddings/',
  '/general-portable-washrooms/',
  '/remote-oilfield-operations/',
  '/waste-site-services/',
  '/about/',
  '/methodology/',
  '/contact/',
  '/coverage/',
  '/alberta/',
  '/ontario/',
  '/british-columbia/',
  '/privacy/',
  '/terms/',
  '/disclaimer/',
] as const

import { LIVE_CITIES } from '../lib/locations/canadaLocations'

/** All live city page paths for sitemap generation. */
export function liveCityPaths(): string[] {
  return LIVE_CITIES.map((c) => `/city/${c.slug}/`)
}
