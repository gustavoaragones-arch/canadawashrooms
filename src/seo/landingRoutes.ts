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
  {
    segment: 'construction',
    segmentSlug: SEGMENT_SEO.construction.slug,
    cities: [
      { citySlug: 'calgary', city: 'Calgary' },
      { citySlug: 'edmonton', city: 'Edmonton' },
      { citySlug: 'fort-mcmurray', city: 'Fort McMurray' },
      { citySlug: 'red-deer', city: 'Red Deer' },
      { citySlug: 'canmore', city: 'Canmore' },
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
    ],
  },
  {
    segment: 'oilfield',
    segmentSlug: SEGMENT_SEO.oilfield.slug,
    cities: [
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
    ],
  },
] as const

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
