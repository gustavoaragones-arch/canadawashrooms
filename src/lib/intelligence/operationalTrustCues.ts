import type { PrimarySegment, Provider } from '../../types/provider'

/** Known manual tags appended via `trust_signals_append` — mapped to operational copy only (no invented claims). */
const CURATED_TAG_COPY: Record<string, string> = {
  curated_industrial_remote_operator:
    'Industrial-remote positioning flagged in manual QA — verify dispatch and heating packages on bid.',
}

export type ProviderSansTrustCues = Omit<Provider, 'operational_trust_cues'>

/**
 * Short, review/category/manual-derived cues for cards + detail panels.
 * Deterministic — same inputs produce the same strings for QA reproducibility.
 */
export function deriveOperationalTrustCues(input: ProviderSansTrustCues): string[] {
  const cues: string[] = []

  for (const sig of input.trust_signals) {
    const copy = CURATED_TAG_COPY[sig]
    if (copy) cues.push(copy)
  }

  if (input.trust_signals.includes('review_volume_signal')) {
    cues.push('Review volume supports repeat-use validation — still confirm servicing scope directly.')
  }

  if (input.trust_signals.includes('rating_consistency_signal')) {
    cues.push('Rating pattern is steady enough to treat reviews as a meaningful signal.')
  }

  if (input.trust_signals.includes('listed_web_presence')) {
    cues.push('Listed web presence — faster verification of inventory and route assumptions.')
  }

  if (input.trust_signals.includes('phone_forward_operations')) {
    cues.push('Phone-forward operator — expect to confirm inventory and cadence by voice.')
  }

  if (
    input.primary_segment === 'construction' &&
    input.weekly_service &&
    input.construction_ready
  ) {
    cues.push('Structured listing posture aligns with serviced jobsite rotations.')
  }

  if (
    input.review_count >= 140 &&
    input.weekly_service &&
    input.primary_segment === 'construction'
  ) {
    cues.push('Servicing language appears often enough to probe long-cycle jobsite fit.')
  }

  if (input.winter_service && (input.winterized || input.heated)) {
    cues.push('Winter-capable equipment posture corroborated by listing or weighted reviews.')
  }

  if (
    input.primary_segment === 'event' &&
    (input.luxury_trailers || input.luxury_units)
  ) {
    cues.push('Event-oriented restroom trailer positioning — confirm footprint and pump windows.')
  }

  if (
    input.remote_logistics &&
    (input.oilfield_ready || input.camp_support || input.remote_support)
  ) {
    cues.push('Remote logistics signals present — validate lease-road access and SLAs.')
  }

  if (input.manual_enrichment_overrides?.primary_segment != null) {
    cues.push('Primary segment locked by analyst override — inference disagreements suppressed.')
  }

  const deduped = [...new Set(cues)]
  return deduped.slice(0, 5)
}

export function segmentDensityNote(totalInProvince: number, segment: PrimarySegment): string {
  const labels: Record<PrimarySegment, string> = {
    construction: 'construction-postured operators',
    event: 'event / trailer-postured operators',
    oilfield: 'industrial-remote-postured operators',
    general: 'general portable rental operators',
    site_services: 'waste & site-service operators',
  }
  return `We currently model ${totalInProvince} ${labels[segment]} with corroborated signals in the live dataset — totals climb as province CSVs are merged and QA'd.`
}
