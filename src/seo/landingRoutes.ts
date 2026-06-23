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

const SK_CITIES: LandingCityConfig[] = [
  { citySlug: 'saskatoon', city: 'Saskatoon' },
  { citySlug: 'regina', city: 'Regina' },
  { citySlug: 'prince-albert', city: 'Prince Albert' },
  { citySlug: 'moose-jaw', city: 'Moose Jaw' },
  { citySlug: 'swift-current', city: 'Swift Current' },
]

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
      // Alberta
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
      // British Columbia
      { citySlug: 'surrey', city: 'Surrey' },
      { citySlug: 'vancouver', city: 'Vancouver' },
      { citySlug: 'abbotsford', city: 'Abbotsford' },
      { citySlug: 'kelowna', city: 'Kelowna' },
      { citySlug: 'nanaimo', city: 'Nanaimo' },
      // Saskatchewan
      ...SK_CITIES,
    ],
  },
  {
    segment: 'event',
    segmentSlug: SEGMENT_SEO.event.slug,
    cities: [
      // Alberta
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
      // British Columbia
      { citySlug: 'surrey', city: 'Surrey' },
      { citySlug: 'vancouver', city: 'Vancouver' },
      { citySlug: 'kelowna', city: 'Kelowna' },
      { citySlug: 'abbotsford', city: 'Abbotsford' },
      { citySlug: 'victoria', city: 'Victoria' },
      // Saskatchewan
      { citySlug: 'saskatoon', city: 'Saskatoon' },
      { citySlug: 'regina', city: 'Regina' },
    ],
  },
  {
    segment: 'oilfield',
    segmentSlug: SEGMENT_SEO.oilfield.slug,
    cities: [
      // Oilfield / remote predominantly AB
      { citySlug: 'fort-mcmurray', city: 'Fort McMurray' },
      { citySlug: 'calgary', city: 'Calgary' },
      { citySlug: 'edmonton', city: 'Edmonton' },
      { citySlug: 'red-deer', city: 'Red Deer' },
      // Saskatchewan — Regina only (oilfield density)
      { citySlug: 'regina', city: 'Regina' },
    ],
  },
  {
    segment: 'general',
    segmentSlug: SEGMENT_SEO.general.slug,
    cities: [
      // Alberta
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
      // British Columbia
      { citySlug: 'surrey', city: 'Surrey' },
      { citySlug: 'vancouver', city: 'Vancouver' },
      { citySlug: 'abbotsford', city: 'Abbotsford' },
      { citySlug: 'kelowna', city: 'Kelowna' },
      { citySlug: 'nanaimo', city: 'Nanaimo' },
      { citySlug: 'coquitlam', city: 'Coquitlam' },
      { citySlug: 'victoria', city: 'Victoria' },
      // Saskatchewan
      ...SK_CITIES,
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
