import type { ProviderIntelligence } from '../../types/intelligence'
import type { PrimarySegment, Provider } from '../../types/provider'
import { deriveTrustTierLabels } from './trustTiers'

export const EMPTY_PROVIDER_INTELLIGENCE: ProviderIntelligence = {
  compatibilityTraits: [],
  inferredStrengths: [],
  operationalFitNotes: [],
  trustTierLabels: [],
  subtleUiCues: [],
}

export function buildProviderIntelligence(
  provider: Provider,
  context: { activeSegment: PrimarySegment },
): ProviderIntelligence {
  try {
  const trustTierLabels = deriveTrustTierLabels(provider)

  const compatibilityTraits: string[] = []
  if (provider.supported_segments.length > 1) {
    compatibilityTraits.push(
      `Operational footprint spans ${provider.supported_segments.length} project contexts`,
    )
  }
  if (provider.primary_segment === context.activeSegment) {
    compatibilityTraits.push('Primary classification aligns with current matcher context')
  } else if (provider.supported_segments.includes(context.activeSegment)) {
    compatibilityTraits.push(
      'Secondary segment fit — corroborated by capabilities; validate award against their primary workload',
    )
  }

  const inferredStrengths: string[] = [...provider.inferred_specialties]
  if (provider.remote_logistics) {
    inferredStrengths.push('Remote logistics posture inferred from listing + reviews')
  }
  if (provider.winter_service) {
    inferredStrengths.push('Cold-climate servicing signals present')
  }

  const operationalFitNotes: string[] = []
  if (context.activeSegment === 'oilfield') {
    operationalFitNotes.push(
      'Confirm heating packages, tank sizing, and dispatch windows against camp occupancy curves.',
    )
  }
  if (context.activeSegment === 'event') {
    operationalFitNotes.push(
      'Validate trailer footprint, power assumptions, and pump scheduling against peak guest flows.',
    )
  }
  if (context.activeSegment === 'construction') {
    operationalFitNotes.push(
      'Align pump cadence with crew rotations — Alberta mud and freeze cycles change effective capacity.',
    )
  }
  if (context.activeSegment === 'general') {
    operationalFitNotes.push(
      'Short-term drops depend on route density — specify access constraints up front.',
    )
  }
  if (context.activeSegment === 'site_services') {
    operationalFitNotes.push(
      'Confirm which trades are in scope — septic, roll-off, disposal hauls, and washrooms may schedule separately.',
    )
  }

  const legacySubtle: string[] = []
  if (context.activeSegment === 'oilfield' && provider.winter_service) {
    legacySubtle.push('Winter-ready servicing signals present for industrial contexts')
  }
  if (context.activeSegment === 'event' && provider.luxury_trailers) {
    legacySubtle.push('Trailer-grade restroom posture suitable for planner-led events')
  }
  if (provider.remote_logistics && context.activeSegment === 'oilfield') {
    legacySubtle.push('Remote camp logistics language corroborated')
  }
  if (
    legacySubtle.length < 2 &&
    provider.winter_service &&
    context.activeSegment === 'construction'
  ) {
    legacySubtle.push('Cold-season jobsite servicing posture')
  }

  const mergedSubtle = [...(provider.operational_trust_cues ?? []), ...legacySubtle]
  const subtleUiCues = [...new Set(mergedSubtle)].slice(0, 3)

  return {
    compatibilityTraits,
    inferredStrengths,
    operationalFitNotes,
    trustTierLabels,
    subtleUiCues,
  }
  } catch {
    return EMPTY_PROVIDER_INTELLIGENCE
  }
}
