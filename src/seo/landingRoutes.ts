import type { PrimarySegment } from '../types/provider'
import type { PriorityCity } from '../lib/segments'
import { SEGMENT_SEO } from './segmentSeo'

export interface ResolvedLanding {
  segment: PrimarySegment
  segmentSlug: string
  city: PriorityCity
  citySlug: string
}

interface LandingCityConfig {
  citySlug: string
  city: PriorityCity
}

interface LandingSegmentRouteGroup {
  segment: PrimarySegment
  segmentSlug: string
  cities: LandingCityConfig[]
}

/**
 * Curated high-intent routes only — expand by editing this config (no per-page route files).
 * Slugs are lowercase; URLs use trailing slash in canonicals.
 */
export const LANDING_ROUTE_GROUPS: readonly LandingSegmentRouteGroup[] = [
  // ── Alberta ──────────────────────────────────────────────────────────────
  {
    segment: 'construction',
    segmentSlug: SEGMENT_SEO.construction.slug,
    cities: [
      { citySlug: 'calgary', city: 'Calgary' },
      { citySlug: 'edmonton', city: 'Edmonton' },
      { citySlug: 'fort-mcmurray', city: 'Fort McMurray' },
      { citySlug: 'red-deer', city: 'Red Deer' },
      { citySlug: 'canmore', city: 'Canmore' },
      // Ontario
      { citySlug: 'toronto', city: 'Toronto' },
      { citySlug: 'mississauga', city: 'Mississauga' },
      { citySlug: 'brampton', city: 'Brampton' },
      { citySlug: 'hamilton', city: 'Hamilton' },
      { citySlug: 'vaughan', city: 'Vaughan' },
      { citySlug: 'markham', city: 'Markham' },
    ],
  },
  {
    segment: 'event',
    segmentSlug: SEGMENT_SEO.event.slug,
    cities: [
      { citySlug: 'calgary', city: 'Calgary' },
      { citySlug: 'edmonton', city: 'Edmonton' },
      { citySlug: 'canmore', city: 'Canmore' },
      { citySlug: 'red-deer', city: 'Red Deer' },
      // Ontario
      { citySlug: 'toronto', city: 'Toronto' },
      { citySlug: 'mississauga', city: 'Mississauga' },
      { citySlug: 'hamilton', city: 'Hamilton' },
      { citySlug: 'vaughan', city: 'Vaughan' },
      { citySlug: 'markham', city: 'Markham' },
    ],
  },
  {
    segment: 'oilfield',
    segmentSlug: SEGMENT_SEO.oilfield.slug,
    cities: [
      // Oilfield / remote is predominantly AB — Ontario included for completeness
      { citySlug: 'fort-mcmurray', city: 'Fort McMurray' },
      { citySlug: 'calgary', city: 'Calgary' },
      { citySlug: 'edmonton', city: 'Edmonton' },
      { citySlug: 'red-deer', city: 'Red Deer' },
    ],
  },
  {
    segment: 'general',
    segmentSlug: SEGMENT_SEO.general.slug,
    cities: [
      { citySlug: 'calgary', city: 'Calgary' },
      { citySlug: 'edmonton', city: 'Edmonton' },
      { citySlug: 'fort-mcmurray', city: 'Fort McMurray' },
      { citySlug: 'red-deer', city: 'Red Deer' },
      { citySlug: 'canmore', city: 'Canmore' },
      // Ontario
      { citySlug: 'toronto', city: 'Toronto' },
      { citySlug: 'mississauga', city: 'Mississauga' },
      { citySlug: 'brampton', city: 'Brampton' },
      { citySlug: 'hamilton', city: 'Hamilton' },
      { citySlug: 'vaughan', city: 'Vaughan' },
      { citySlug: 'markham', city: 'Markham' },
    ],
  },
  {
    segment: 'site_services',
    segmentSlug: SEGMENT_SEO.site_services.slug,
    cities: [
      { citySlug: 'calgary', city: 'Calgary' },
      { citySlug: 'edmonton', city: 'Edmonton' },
      { citySlug: 'fort-mcmurray', city: 'Fort McMurray' },
      { citySlug: 'red-deer', city: 'Red Deer' },
      { citySlug: 'canmore', city: 'Canmore' },
      // Ontario
      { citySlug: 'toronto', city: 'Toronto' },
      { citySlug: 'mississauga', city: 'Mississauga' },
      { citySlug: 'brampton', city: 'Brampton' },
      { citySlug: 'hamilton', city: 'Hamilton' },
    ],
  },
] as const

/** City slug for editorial / provider breadcrumbs when a priority city is known. */
export function priorityCitySlug(city: string): string | null {
  const normalized = city.trim().toLowerCase()
  for (const group of LANDING_ROUTE_GROUPS) {
    const hit = group.cities.find((c) => c.city.toLowerCase() === normalized)
    if (hit) return hit.citySlug
  }
  return null
}

export function segmentLandingPath(segment: PrimarySegment, city: string): string | null {
  const citySlug = priorityCitySlug(city)
  if (!citySlug) return null
  const group = LANDING_ROUTE_GROUPS.find((g) => g.segment === segment)
  if (!group) return null
  const servesCity = group.cities.some((c) => c.citySlug === citySlug)
  if (!servesCity) return null
  return `/${group.segmentSlug}/${citySlug}/`
}

export function resolveLandingRoute(
  segmentSlug: string | undefined,
  citySlug: string | undefined,
): ResolvedLanding | null {
  if (!segmentSlug || !citySlug) return null
  const seg = segmentSlug.toLowerCase()
  const city = citySlug.toLowerCase()

  for (const group of LANDING_ROUTE_GROUPS) {
    if (group.segmentSlug !== seg) continue
    const hit = group.cities.find((c) => c.citySlug === city)
    if (hit) {
      return {
        segment: group.segment,
        segmentSlug: group.segmentSlug,
        city: hit.city,
        citySlug: hit.citySlug,
      }
    }
  }
  return null
}

export function listingPath(resolved: ResolvedLanding): string {
  return `/${resolved.segmentSlug}/${resolved.citySlug}/`
}

export function allResolvedLandings(): ResolvedLanding[] {
  const out: ResolvedLanding[] = []
  for (const group of LANDING_ROUTE_GROUPS) {
    for (const c of group.cities) {
      out.push({
        segment: group.segment,
        segmentSlug: group.segmentSlug,
        city: c.city,
        citySlug: c.citySlug,
      })
    }
  }
  return out
}
