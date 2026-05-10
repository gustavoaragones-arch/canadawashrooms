/**
 * Observability vocabulary for future ingestion / retrieval monitoring — no collectors in MVP.
 * Use these shapes when wiring workers, logs, or dashboards later.
 */

/** Row-level enrichment failure (never exposed to end users). */
export interface EnrichmentFailureSignal {
  kind: 'enrichment_failed'
  provider_id?: string
  row_index: number
  message: string
}

/** Dataset QA — weak coverage or contradictory signals. */
export interface RetrievalQualitySignal {
  kind: 'retrieval_quality'
  segment: string
  city: string
  /** e.g. relaxed_filters, zero_results, single_operator_city */
  reason: string
}

/** Ingest pipeline batch summary — future cron / CI step. */
export interface IngestBatchSignal {
  kind: 'ingest_batch'
  source: string
  rows_in: number
  rows_out: number
  warnings: number
}

export type ObservabilitySignal =
  | EnrichmentFailureSignal
  | RetrievalQualitySignal
  | IngestBatchSignal
