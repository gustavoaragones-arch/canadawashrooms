import {
  duplicateReviewCandidatePairs,
  providersMissingPhone,
  providersMissingSegmentConfidenceLock,
  providersMissingWebsite,
  providersThinEnrichment,
  providersWithWeakMetadata,
  weakProviderRecords,
} from '../qa/providerDatasetQa'
import { collectPreDedupeDuplicateCandidates } from '../ingestion/dedupeDiagnostics'
import type { Provider } from '../../types/provider'
import type { ProviderIngestRecord } from '../ingestion/types'

export interface QaSummaryReport {
  generatedAt: string
  sourceCsv: string | null
  totalProviders: number
  duplicateCandidates: number
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
  const prePairs = collectPreDedupeDuplicateCandidates(preDedupeRecords)
  const postDupScan = duplicateReviewCandidatePairs(enriched)
  const weakMeta = providersWithWeakMetadata(enriched)

  return {
    generatedAt: input.generatedAt,
    sourceCsv: input.sourceCsv,
    totalProviders: enriched.length,
    duplicateCandidates: prePairs.length + postDupScan.length,
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

export function enrichedDuplicatePairs(enriched: Provider[]) {
  return duplicateReviewCandidatePairs(enriched)
}
