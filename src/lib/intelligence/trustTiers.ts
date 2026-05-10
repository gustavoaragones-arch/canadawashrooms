import type { Provider } from '../../types/provider'

function multiCityServicingSignal(provider: Provider): boolean {
  if (provider.operator_scale === 'multi_route') return true
  const sa = provider.service_area ?? ''
  return /[,;|/]|\s\band\s/i.test(sa)
}

/**
 * Human-readable credibility cues — factual, calm; avoid certification or guarantee language.
 * Ordered: most distinctive signals first; baseline listing role last (truncated in compact UI).
 */
export function deriveTrustTierLabels(provider: Provider): string[] {
  const tiers: string[] = []

  if ((provider.operational_tags ?? []).some((t) => t.startsWith('review_signal'))) {
    tiers.push('Review-backed operational signals')
  }

  if (provider.review_count >= 140 && provider.rating >= 4.42) {
    tiers.push('Established operator (public reviews)')
  }

  if (multiCityServicingSignal(provider)) {
    tiers.push('Multi-city servicing signal')
  }

  if (
    provider.remote_logistics &&
    (provider.oilfield_ready || provider.camp_support || provider.remote_support)
  ) {
    tiers.push('Remote operations posture')
  }

  if (
    provider.primary_segment === 'event' &&
    (provider.luxury_trailers || provider.luxury_units)
  ) {
    tiers.push('Event-oriented inventory signal')
  }

  if (provider.winter_service && (provider.winterized || provider.heated)) {
    tiers.push('Winter-capable inventory signal')
  }

  tiers.push('Alberta roster listing')

  return tiers
}
