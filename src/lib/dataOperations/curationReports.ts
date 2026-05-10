import type { Provider } from '../../types/provider'
import {
  providersMissingSegmentConfidenceLock,
  providersMissingWebsite,
  providersThinEnrichment,
} from '../qa/providerDatasetQa'

export interface CurationRowRef {
  id: string
  company_name: string
  city: string
  primary_segment: string
  primary_segment_confidence: number
}

function ref(p: Provider): CurationRowRef {
  return {
    id: p.id,
    company_name: p.company_name,
    city: p.city,
    primary_segment: p.primary_segment,
    primary_segment_confidence: p.primary_segment_confidence,
  }
}

/** Segment confidence unlocked and below internal bar — manual QA queue. */
export function listLowConfidenceProviders(providers: Provider[]): CurationRowRef[] {
  return providersMissingSegmentConfidenceLock(providers).map(ref)
}

export function listProvidersWithoutWebsites(providers: Provider[]): CurationRowRef[] {
  return providersMissingWebsite(providers).map(ref)
}

/** Thin operational_tags / inferred_specialties / capabilities — enrichment inputs likely insufficient. */
export function listProvidersWithoutInferredCapabilities(providers: Provider[]): CurationRowRef[] {
  return providersThinEnrichment(providers).map(ref)
}

/**
 * Supported segment spread suggests ambiguous positioning relative to declared primary.
 * Heuristic only — not a quality score.
 */
export function listProvidersWithConflictingSegments(providers: Provider[]): CurationRowRef[] {
  return providers
    .filter(
      (p) =>
        p.supported_segments.length >= 3 &&
        p.primary_segment_confidence < 0.82 &&
        !p.manual_enrichment_overrides?.primary_segment,
    )
    .map(ref)
}

export interface CurationSweepReport {
  generatedAt: string
  lowConfidenceProviders: CurationRowRef[]
  withoutWebsites: CurationRowRef[]
  thinCapabilityInference: CurationRowRef[]
  conflictingSegmentHeuristic: CurationRowRef[]
}

export function buildCurationSweepReport(providers: Provider[], generatedAt: string): CurationSweepReport {
  return {
    generatedAt,
    lowConfidenceProviders: listLowConfidenceProviders(providers),
    withoutWebsites: listProvidersWithoutWebsites(providers),
    thinCapabilityInference: listProvidersWithoutInferredCapabilities(providers),
    conflictingSegmentHeuristic: listProvidersWithConflictingSegments(providers),
  }
}
