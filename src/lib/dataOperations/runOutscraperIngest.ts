import type { ManualOverridesFile } from './manualOverridesFile'
import { applyManualOverridesFile } from './manualOverridesFile'
import {
  buildQaSummaryReport,
  enrichedDuplicatePairs,
  weakMetadataDetail,
} from './qaSummary'
import { buildReviewSignalSummaryReport } from './reviewSignalReport'
import { enrichProvider } from '../enrichment/enrichProvider'
import {
  collectPreDedupeDuplicateCandidates,
  dedupeProviders,
  normalizeOutscraperRecord,
  parseOutscraperCsvWithDiagnostics,
} from '../ingestion'
import type { DuplicateReviewCandidate } from '../ingestion/dedupeDiagnostics'
import type { ProviderIngestRecord } from '../ingestion/types'
import type { Provider, ProviderRaw } from '../../types/provider'

export interface NormalizeDiagnostics {
  skippedRows: { rowIndex: number; reason: string }[]
}

export interface OutscraperIngestResult {
  generatedAt: string
  enriched: Provider[]
  dedupedRaw: ProviderIngestRecord[]
  preDedupeRecords: ProviderIngestRecord[]
  normalizeDiagnostics: NormalizeDiagnostics
  csvMalformedRowCount: number
  preDedupeDuplicates: DuplicateReviewCandidate[]
}

/**
 * Deterministic CSV → normalize → dedupe → manual layer → enrich.
 * Does not touch production `src/data/providers.json`.
 */
export function runOutscraperIngestPipeline(input: {
  csvText: string
  manualOverrides: ManualOverridesFile | null
}): OutscraperIngestResult {
  const generatedAt = new Date().toISOString()
  const { rows, diagnostics } = parseOutscraperCsvWithDiagnostics(input.csvText)

  if (rows.length === 0) {
    throw new Error(
      'Ingest aborted: CSV produced zero parseable body rows — check file encoding, delimiter, or header row.',
    )
  }

  const skippedRows: NormalizeDiagnostics['skippedRows'] = []
  const candidates: ProviderIngestRecord[] = []

  rows.forEach((row, rowIndex) => {
    const n = normalizeOutscraperRecord(row)
    if (!n) {
      skippedRows.push({ rowIndex: rowIndex + 2, reason: 'missing_required_name_or_unusable_row' })
      return
    }
    candidates.push(n)
  })

  if (candidates.length === 0 && rows.length > 0) {
    throw new Error(
      'Ingest aborted: zero normalized providers — fix CSV mapping or column headers before exporting snapshots.',
    )
  }

  const preDedupeRecords = [...candidates]
  const deduped = dedupeProviders(candidates)
  const withManual = applyManualOverridesFile(deduped as ProviderRaw[], input.manualOverrides)
  const enriched = withManual.map((r) => enrichProvider(r))

  return {
    generatedAt,
    enriched,
    dedupedRaw: deduped,
    preDedupeRecords,
    normalizeDiagnostics: { skippedRows },
    csvMalformedRowCount: diagnostics.malformedRows.length,
    preDedupeDuplicates: collectPreDedupeDuplicateCandidates(preDedupeRecords),
  }
}

export function buildDuplicateReviewExport(
  enriched: Provider[],
  preDedupe: DuplicateReviewCandidate[],
  generatedAt: string,
) {
  const postPairs = enrichedDuplicatePairs(enriched)
  const byId = new Map(enriched.map((p) => [p.id, p]))

  const postEnriched = postPairs.map((pair) => {
    const pa = byId.get(pair.a)
    const pb = byId.get(pair.b)
    return {
      providerIds: [pair.a, pair.b] as [string, string],
      providerNames: [pa?.company_name ?? pair.a, pb?.company_name ?? pair.b] as [string, string],
      matchingPhone: pair.reason === 'shared_normalized_phone' ? pa?.phone ?? pb?.phone ?? null : null,
      matchingWebsite:
        pair.reason === 'shared_normalized_website'
          ? pa?.website ?? pb?.website ?? null
          : null,
      similarityReason: pair.reason,
      confidenceLevel: 'high' as const,
      source: 'post_enrichment_pair_scan' as const,
    }
  })

  const preMerge = preDedupe.map((d) => ({
    ...d,
    source: 'pre_dedupe_cartesian_scan' as const,
  }))

  return {
    generatedAt,
    preMergeCandidates: preMerge,
    postEnrichmentPairs: postEnriched,
  }
}

export function buildIngestArtifacts(input: {
  ingest: OutscraperIngestResult
  sourceCsv: string | null
}) {
  const { ingest, sourceCsv } = input
  const qa = buildQaSummaryReport({
    generatedAt: ingest.generatedAt,
    sourceCsv,
    enriched: ingest.enriched,
    preDedupeRecords: ingest.preDedupeRecords,
    skippedNormalizationRows: ingest.normalizeDiagnostics.skippedRows.length,
    malformedCsvRows: ingest.csvMalformedRowCount,
  })

  const duplicateReview = buildDuplicateReviewExport(
    ingest.enriched,
    ingest.preDedupeDuplicates,
    ingest.generatedAt,
  )
  const weakMetadata = weakMetadataDetail(ingest.enriched)
  const reviewSignals = buildReviewSignalSummaryReport(ingest.enriched, ingest.generatedAt)

  return { qa, duplicateReview, weakMetadata, reviewSignals }
}
