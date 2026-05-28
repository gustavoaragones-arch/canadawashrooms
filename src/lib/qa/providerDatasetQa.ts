import { internalCompletenessScore } from '../intelligence/providerCompleteness'
import type { Provider } from '../../types/provider'

export interface WeakProviderReport {
  id: string
  company_name: string
  reasons: string[]
}

/** Records missing public web presence — common for industrial operators but flagged for enrichment. */
export function providersMissingWebsite(providers: Provider[]): Provider[] {
  return providers.filter((p) => !p.website)
}

export function providersMissingPhone(providers: Provider[]): Provider[] {
  return providers.filter((p) => !p.phone || p.phone.replace(/\D/g, '').length < 10)
}

export function weakProviderRecords(providers: Provider[], completenessCutoff = 42): WeakProviderReport[] {
  const out: WeakProviderReport[] = []
  for (const p of providers) {
    const reasons: string[] = []
    const c = internalCompletenessScore(p)
    if (c < completenessCutoff) reasons.push(`low_internal_completeness_${c}`)
    if (p.review_count < 25) reasons.push('thin_review_volume')
    if (!p.google_categories?.length) reasons.push('missing_google_categories')
    if (!p.reviews_normalized?.length) reasons.push('no_ingested_review_bodies')
    if (p.primary_segment_confidence < 0.72) reasons.push('soft_segment_confidence')
    if (!p.trust_signals.includes('review_volume_signal') && p.review_count < 80) {
      reasons.push('low_trust_density')
    }
    if (reasons.length) out.push({ id: p.id, company_name: p.company_name, reasons })
  }
  return out
}

/** Analysts have not locked segment confidence — candidate for manual QA pass. */
export function providersMissingSegmentConfidenceLock(providers: Provider[]): Provider[] {
  return providers.filter(
    (p) =>
      p.manual_enrichment_overrides?.primary_segment_confidence == null &&
      p.primary_segment_confidence < 0.8,
  )
}

/** Sparse source metadata — candidates for ingest cleanup or manual research. */
export function providersWithWeakMetadata(providers: Provider[]): Provider[] {
  return providers.filter((p) => {
    const cats = p.google_categories?.length ?? 0
    const badges = p.badges?.length ?? 0
    const reviews = p.reviews_normalized?.length ?? 0
    return cats < 2 || badges < 2 || reviews < 3
  })
}

/** Post-enrichment rows with little structured intelligence — revisit inference inputs. */
export function providersThinEnrichment(providers: Provider[]): Provider[] {
  return providers.filter((p) => {
    const tags = p.operational_tags?.length ?? 0
    const specs = p.inferred_specialties?.length ?? 0
    const caps = p.capabilities?.length ?? 0
    return tags === 0 && specs === 0 && caps < 4
  })
}

/** Few or no trust_signals — weak ranking inputs until volume or manual QA lands. */
export function providersMissingTrustSignals(providers: Provider[]): Provider[] {
  return providers.filter((p) => (p.trust_signals?.length ?? 0) < 2)
}

