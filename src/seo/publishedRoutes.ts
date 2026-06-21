/**
 * Canonical crawlable route inventory — single source of truth for sitemap generation,
 * SEO audits, and published path validation.
 *
 * Keep in sync with `App.tsx` route definitions.
 */
import providersJson from '../data/providers.json'
import { LIVE_CITIES } from '../lib/locations/canadaLocations'
import type { Provider } from '../types/provider'
import { allResolvedLandings, listingPath } from './landingRoutes'

/** Production canonical origin (apex, no www). */
export const SITEMAP_ORIGIN = 'https://canadawashrooms.ca'

export const PROVINCE_PATHS = [
  '/alberta/',
  '/ontario/',
  '/british-columbia/',
] as const

export const CATEGORY_HUB_PATHS = [
  '/construction-jobsites/',
  '/events-weddings/',
  '/general-portable-washrooms/',
  '/remote-oilfield-operations/',
  '/waste-site-services/',
] as const

/** Editorial and directory pages (excludes province + category hubs — counted separately). */
export const EDITORIAL_CORE_PATHS = [
  '/',
  '/providers/',
  '/about/',
  '/methodology/',
  '/contact/',
  '/coverage/',
  '/privacy/',
  '/terms/',
  '/disclaimer/',
] as const

/** Full static editorial list including provinces and category hubs. */
export const EDITORIAL_STATIC_PATHS = [
  ...EDITORIAL_CORE_PATHS,
  ...PROVINCE_PATHS,
  ...CATEGORY_HUB_PATHS,
] as const

export function normalizePublishedPath(path: string): string {
  if (path === '/') return '/'
  return path.endsWith('/') ? path : `${path}/`
}

/** All live city page paths. */
export function liveCityPaths(): string[] {
  return LIVE_CITIES.map((c) => `/city/${c.slug}/`)
}

/** All segment × city landing paths from `landingRoutes.ts`. */
export function landingPaths(): string[] {
  return allResolvedLandings().map((r) => normalizePublishedPath(listingPath(r)))
}

/** All provider detail page paths. */
export function providerPaths(): string[] {
  return (providersJson as Provider[])
    .filter((p) => typeof p.id === 'string' && p.id.length > 0)
    .map((p) => `/provider/${p.id}/`)
}

export interface PublishedRouteInventory {
  editorial: string[]
  province: string[]
  category: string[]
  city: string[]
  landing: string[]
  provider: string[]
  all: string[]
}

/** Complete deduplicated sitemap path inventory. */
export function allPublishedPaths(): PublishedRouteInventory {
  const editorial = [...EDITORIAL_CORE_PATHS]
  const province = [...PROVINCE_PATHS]
  const category = [...CATEGORY_HUB_PATHS]
  const city = liveCityPaths()
  const landing = landingPaths()
  const provider = providerPaths()

  const all = [
    ...new Set([...editorial, ...province, ...category, ...city, ...landing, ...provider]),
  ].sort()

  return { editorial, province, category, city, landing, provider, all }
}
