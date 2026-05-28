import { internalCompletenessContribution } from './intelligence/providerCompleteness'
import { INTENT_CARDS, SEGMENT_FILTERS } from './segments'
import type { FilterCapability, PrimarySegment, Provider } from '../types/provider'

export function capabilityMet(
  provider: Provider,
  capability: FilterCapability,
): boolean {
  const v = provider[capability]
  return typeof v === 'boolean' ? v : false
}

/** Providers in city whose primary OR supported segment matches (secondary fits rank lower). */
export function providersInScope(
  providers: Provider[],
  segment: PrimarySegment,
  city: string,
): Provider[] {
  return providers.filter(
    (p) =>
      p.city.toLowerCase() === city.toLowerCase() &&
      (p.primary_segment === segment || p.supported_segments.includes(segment)),
  )
}

/**
 * All providers in the same city regardless of segment — used as a fallback
 * when the city has no segment-scoped providers.
 */
function allProvidersInCity(providers: Provider[], city: string): Provider[] {
  return providers.filter((p) => p.city.toLowerCase() === city.toLowerCase())
}

/**
 * Infer province code from a city name by checking providers that share that city.
 * Returns null when the city isn't present in the dataset at all.
 */
function inferProvinceFromCity(providers: Provider[], city: string): string | null {
  return (
    providers.find((p) => p.city.toLowerCase() === city.toLowerCase())?.province_code ?? null
  )
}

/**
 * Providers in the same province — used when a city name has no direct matches
 * (e.g. "Toronto" query hitting GTA providers listed under Brampton/Mississauga).
 * We use a known province lookup table for cities in the location model.
 */
function providersInProvince(
  providers: Provider[],
  provinceCode: string,
  segment: PrimarySegment,
): Provider[] {
  return providers.filter(
    (p) =>
      p.province_code === provinceCode &&
      (p.primary_segment === segment || p.supported_segments.includes(segment)),
  )
}

/** Province code from a city slug using a static lookup of the live cities. */
const CITY_TO_PROVINCE: Record<string, string> = {
  calgary: 'AB',
  edmonton: 'AB',
  'fort mcmurray': 'AB',
  'fort-mcmurray': 'AB',
  'red deer': 'AB',
  'red-deer': 'AB',
  canmore: 'AB',
  lethbridge: 'AB',
  'medicine hat': 'AB',
  toronto: 'ON',
  mississauga: 'ON',
  brampton: 'ON',
  hamilton: 'ON',
  ottawa: 'ON',
  london: 'ON',
  vaughan: 'ON',
  markham: 'ON',
  welland: 'ON',
  kitchener: 'ON',
  vancouver: 'BC',
  kelowna: 'BC',
  kamloops: 'BC',
  surrey: 'BC',
  abbotsford: 'BC',
  victoria: 'BC',
}

/** Dataset tally for landing/editorial copy — primary or corroborated segment signals. */
export function countSegmentCoverage(
  providers: Provider[],
  segment: PrimarySegment,
): number {
  return providers.filter(
    (p) => p.primary_segment === segment || p.supported_segments.includes(segment),
  ).length
}

export function countCapabilityMatches(
  provider: Provider,
  capabilities: FilterCapability[],
): number {
  return capabilities.filter((c) => capabilityMet(provider, c)).length
}

export function badgeOverlapCount(
  provider: Provider,
  segment: PrimarySegment,
): number {
  const intentBadges =
    INTENT_CARDS.find((c) => c.segment === segment)?.badges ?? []
  const normalized = provider.badges.map((b) => b.toLowerCase())

  return intentBadges.filter((ib) => {
    const i = ib.toLowerCase()
    return normalized.some((b) => b.includes(i) || i.includes(b))
  }).length
}

function segmentFitScore(p: Provider, segment: PrimarySegment): number {
  if (p.primary_segment === segment) return 120
  if (p.supported_segments.includes(segment)) return 82
  return 34
}

function trustDensityScore(p: Provider): number {
  let s = 0
  s += Math.min(p.trust_signals.length * 12, 52)
  s += Math.min(p.review_count, 420) * 0.045
  s += p.rating * 9
  if (p.website) s += 12
  return s
}

function inferredAlignmentScore(p: Provider, segment: PrimarySegment): number {
  let s = 0
  if (segment === 'oilfield' && p.remote_logistics) s += 44
  if (segment === 'event' && p.luxury_trailers) s += 44
  if (segment === 'construction' && p.capabilities.includes('weekly_service')) s += 28
  if (segment === 'construction' && p.construction_ready) s += 22
  if (segment === 'general' && p.ada_accessible) s += 20
  if (segment === 'site_services' && p.septic_service) s += 40
  if (segment === 'site_services' && (p.site_support || p.roll_off_disposal)) s += 32
  if (p.inferred_specialties.length) {
    s += Math.min(p.inferred_specialties.length * 7, 28)
  }
  return s
}

/**
 * Internal composite ranking — not shown as a numeric score in UI.
 * Landing flows pass a **city-scoped** pool (`providersInScope`), so ordering reflects
 * operational fit in that geography, not consolidation across a parent organization.
 */
export function internalRankScore(
  p: Provider,
  segment: PrimarySegment,
  activeList: FilterCapability[],
): number {
  let score = 0
  score += countCapabilityMatches(p, activeList) * 1000
  score += badgeOverlapCount(p, segment) * 118
  score += segmentFitScore(p, segment)
  score += inferredAlignmentScore(p, segment)
  score += trustDensityScore(p)
  score += p.primary_segment_confidence * 22
  score += internalCompletenessContribution(p)
  score += p.rating * 13
  score += Math.min(p.review_count, 520) * 0.048
  return score
}

function compareProviders(
  a: Provider,
  b: Provider,
  segment: PrimarySegment,
  activeList: FilterCapability[],
): number {
  return (
    internalRankScore(b, segment, activeList) -
    internalRankScore(a, segment, activeList)
  )
}

export function sortProvidersByRelevance(
  pool: Provider[],
  segment: PrimarySegment,
  activeList: FilterCapability[],
): Provider[] {
  return [...pool].sort((a, b) =>
    compareProviders(a, b, segment, activeList),
  )
}

export interface ResolvedMatches {
  /** True when user had filters but no operator matched every selected capability. */
  isRelaxed: boolean
  /**
   * True when the city had no segment-specific providers — results are all providers
   * in that city ranked by segment fit instead.
   */
  isCityFallback: boolean
  /** Sorted list for display (exact pool or full scope fallback). */
  providers: Provider[]
}

export function resolveMatches(
  providers: Provider[],
  segment: PrimarySegment,
  city: string,
  active: Set<FilterCapability>,
): ResolvedMatches {
  const scope = providersInScope(providers, segment, city)
  const activeList = [...active]

  // No segment-specific providers in this city — try city-all, then province
  if (scope.length === 0) {
    const cityPool = allProvidersInCity(providers, city)

    if (cityPool.length > 0) {
      // City has providers but none match the segment
      return {
        isRelaxed: true,
        isCityFallback: true,
        providers: sortProvidersByRelevance(cityPool, segment, activeList),
      }
    }

    // City has no providers at all — look up province and fall back to province-level results
    const provinceCode =
      CITY_TO_PROVINCE[city.toLowerCase()] ?? inferProvinceFromCity(providers, city)
    if (provinceCode) {
      const provincePool = providersInProvince(providers, provinceCode, segment)
      return {
        isRelaxed: true,
        isCityFallback: true,
        providers: sortProvidersByRelevance(provincePool, segment, activeList),
      }
    }

    return { isRelaxed: true, isCityFallback: true, providers: [] }
  }

  if (activeList.length === 0) {
    return {
      isRelaxed: false,
      isCityFallback: false,
      providers: sortProvidersByRelevance(scope, segment, activeList),
    }
  }

  const exact = scope.filter((p) =>
    activeList.every((c) => capabilityMet(p, c)),
  )

  if (exact.length > 0) {
    return {
      isRelaxed: false,
      isCityFallback: false,
      providers: sortProvidersByRelevance(exact, segment, activeList),
    }
  }

  return {
    isRelaxed: true,
    isCityFallback: false,
    providers: sortProvidersByRelevance(scope, segment, activeList),
  }
}

export function filterLabelsActive(
  segment: PrimarySegment,
  active: Set<FilterCapability>,
): string[] {
  const defs = SEGMENT_FILTERS[segment]
  return [...active]
    .map((cap) => defs.find((d) => d.capability === cap)?.label)
    .filter((l): l is string => Boolean(l))
}
