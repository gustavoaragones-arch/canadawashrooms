import type { ManualOverridesFile } from './manualOverridesFile'
import { applyManualOverridesFile } from './manualOverridesFile'
import {
  buildQaSummaryReport,
  weakMetadataDetail,
} from './qaSummary'
import { buildReviewSignalSummaryReport } from './reviewSignalReport'
import { enrichProvider } from '../enrichment/enrichProvider'
import {
  collectPreDedupeOrganizationalOverlaps,
  dedupeProviders,
  normalizeOutscraperRecord,
  parseOutscraperCsvWithDiagnostics,
} from '../ingestion'
import {
  collectEnrichedOrganizationalOverlaps,
  type OrganizationalOverlapReviewRecord,
} from '../ingestion/organizationalOverlap'
import { inferProvinceCodeFromFilename } from '../locations/canadaLocations'
import type { ProviderIngestRecord } from '../ingestion/types'
import type { Provider, ProvinceCode, ProviderRaw } from '../../types/provider'

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
  preDedupeOrganizationalOverlaps: OrganizationalOverlapReviewRecord[]
  /** Detected province code — AB if not determinable from filename. */
  inferredProvinceCode: ProvinceCode
}

/**
 * Deterministic CSV → normalize → relationship-aware dedupe → manual layer → enrich.
 * Does not touch production `src/data/providers.json`.
 * @param sourceFilename - originating CSV basename used for province inference.
 */
export function runOutscraperIngestPipeline(input: {
  csvText: string
  manualOverrides: ManualOverridesFile | null
  /** Optional CSV basename for province inference (e.g. "alberta-calgary.csv"). */
  sourceFilename?: string
}): OutscraperIngestResult {
  const generatedAt = new Date().toISOString()
  const { rows, diagnostics } = parseOutscraperCsvWithDiagnostics(input.csvText)
  const inferredProvinceCode: ProvinceCode =
    (input.sourceFilename ? inferProvinceCodeFromFilename(input.sourceFilename) : null) ?? 'AB'

  if (rows.length === 0) {
    throw new Error(
      'Ingest aborted: CSV produced zero parseable body rows — check file encoding, delimiter, or header row.',
    )
  }

  const skippedRows: NormalizeDiagnostics['skippedRows'] = []
  const candidates: ProviderIngestRecord[] = []

  rows.forEach((row, rowIndex) => {
    const n = normalizeOutscraperRecord(row, input.sourceFilename)
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
    preDedupeOrganizationalOverlaps: collectPreDedupeOrganizationalOverlaps(preDedupeRecords),
    inferredProvinceCode,
  }
}

export function buildOrganizationalOverlapReviewExport(
  enriched: Provider[],
  preDedupe: OrganizationalOverlapReviewRecord[],
  generatedAt: string,
) {
  const postEnrichmentOverlaps = collectEnrichedOrganizationalOverlaps(enriched)

  return {
    generatedAt,
    terminology:
      'Operational service nodes are city-scoped listings. Shared website, phone, or brand indicates organizational relationship or ambiguity — not automatic duplicate. Destructive merge requires listing identity match (see methodology).',
    relatedOperationalNodesPreDedupe: preDedupe,
    relatedOperationalNodesPostEnrichment: postEnrichmentOverlaps,
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

  const organizationalOverlapReview = buildOrganizationalOverlapReviewExport(
    ingest.enriched,
    ingest.preDedupeOrganizationalOverlaps,
    ingest.generatedAt,
  )
  const weakMetadata = weakMetadataDetail(ingest.enriched)
  const reviewSignals = buildReviewSignalSummaryReport(ingest.enriched, ingest.generatedAt)

  return { qa, organizationalOverlapReview, weakMetadata, reviewSignals }
}
