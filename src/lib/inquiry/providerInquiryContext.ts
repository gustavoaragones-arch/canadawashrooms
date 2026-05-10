import { buildProviderIntelligence } from '../intelligence/providerIntelligence'
import type { PrimarySegment, Provider } from '../../types/provider'

/**
 * Short trust lines shown when opening an inquiry from a specific provider card.
 */
export function providerInquiryFitLines(
  provider: Provider,
  matcherSegment: PrimarySegment,
): string[] {
  try {
    const lines: string[] = []

    for (const cue of (provider.operational_trust_cues ?? []).slice(0, 2)) {
      lines.push(cue)
    }

    const intel = buildProviderIntelligence(provider, { activeSegment: matcherSegment })
    for (const t of intel.compatibilityTraits.slice(0, 2)) {
      lines.push(t)
    }

    if (provider.winter_service && (provider.winterized || provider.heated)) {
      lines.push('Listing supports winter-type servicing asks — confirm packages on bid.')
    }

    if (provider.remote_logistics && matcherSegment === 'oilfield') {
      lines.push('Remote operations posture corroborated for industrial contexts.')
    }

    if (matcherSegment === 'event' && (provider.luxury_trailers || provider.wedding_friendly)) {
      lines.push('Event-oriented restroom positioning — align trailer footprint early.')
    }

    return [...new Set(lines)].slice(0, 4)
  } catch {
    return []
  }
}
