import {
  providersMissingPhone,
  providersMissingSegmentConfidenceLock,
  providersMissingWebsite,
  providersThinEnrichment,
  providersWithWeakMetadata,
  weakProviderRecords,
} from '../qa/providerDatasetQa'
import {
  collectEnrichedOrganizationalOverlaps,
  collectPreDedupeOrganizationalOverlaps,
  type OrganizationalOverlapReviewRecord,
} from '../ingestion/organizationalOverlap'
import type { Provider } from '../../types/provider'
import type { ProviderIngestRecord } from '../ingestion/types'

function bucketOverlapCounts(records: OrganizationalOverlapReviewRecord[]): {
  trueDuplicateRisk: number
  organizationalOverlap: number
  operationalAmbiguity: number
} {
  let trueDuplicateRisk = 0
  let organizationalOverlap = 0
  let operationalAmbiguity = 0
  for (const r of records) {
    if (r.overlap_category === 'true_duplicate_risk') trueDuplicateRisk++
    else if (r.overlap_category === 'organizational_overlap') organizationalOverlap++
    else operationalAmbiguity++
  }
  return { trueDuplicateRisk, organizationalOverlap, operationalAmbiguity }
}

export interface QaSummaryReport {
  generatedAt: string
  sourceCsv: string | null
  totalProviders: number
  /** Total overlap pairs surfaced for human review (pre-dedupe scan + post-enrichment scan). */
  organizationalOverlapReviewTotal: number
  /** Subset eligible for destructive merge verification only (listing identity match). */
  trueDuplicateRiskOverlaps: number
  organizationalOverlapSignals: number
  operationalAmbiguityOverlaps: number
  weakMetadataProviders: number
  missingWebsites: number
  lowConfidenceSegments: number
  missingPhones: number
  thinEnrichmentProviders: number
  skippedNormalizationRows: number
  malformedCsvRows: number
  normalizedRowCountPreDedupe: number
}

export function buildQaSummaryReport(input: {
  generatedAt: string
  sourceCsv: string | null
  enriched: Provider[]
  preDedupeRecords: ProviderIngestRecord[]
  skippedNormalizationRows: number
  malformedCsvRows: number
}): QaSummaryReport {
  const { enriched, preDedupeRecords } = input
  const preOverlaps = collectPreDedupeOrganizationalOverlaps(preDedupeRecords)
  const postOverlaps = collectEnrichedOrganizationalOverlaps(enriched)
  const combined = [...preOverlaps, ...postOverlaps]
  const buckets = bucketOverlapCounts(combined)

  const weakMeta = providersWithWeakMetadata(enriched)

  return {
    generatedAt: input.generatedAt,
    sourceCsv: input.sourceCsv,
    totalProviders: enriched.length,
    organizationalOverlapReviewTotal: combined.length,
    trueDuplicateRiskOverlaps: buckets.trueDuplicateRisk,
    organizationalOverlapSignals: buckets.organizationalOverlap,
    operationalAmbiguityOverlaps: buckets.operationalAmbiguity,
    weakMetadataProviders: weakMeta.length,
    missingWebsites: providersMissingWebsite(enriched).length,
    lowConfidenceSegments: providersMissingSegmentConfidenceLock(enriched).length,
    missingPhones: providersMissingPhone(enriched).length,
    thinEnrichmentProviders: providersThinEnrichment(enriched).length,
    skippedNormalizationRows: input.skippedNormalizationRows,
    malformedCsvRows: input.malformedCsvRows,
    normalizedRowCountPreDedupe: preDedupeRecords.length,
  }
}

export function weakMetadataDetail(enriched: Provider[]) {
  return weakProviderRecords(enriched)
}
