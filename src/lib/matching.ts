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
      p.city === city &&
      (p.primary_segment === segment || p.supported_segments.includes(segment)),
  )
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

  if (activeList.length === 0) {
    return {
      isRelaxed: false,
      providers: sortProvidersByRelevance(scope, segment, activeList),
    }
  }

  const exact = scope.filter((p) =>
    activeList.every((c) => capabilityMet(p, c)),
  )

  if (exact.length > 0) {
    return {
      isRelaxed: false,
      providers: sortProvidersByRelevance(exact, segment, activeList),
    }
  }

  return {
    isRelaxed: true,
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
