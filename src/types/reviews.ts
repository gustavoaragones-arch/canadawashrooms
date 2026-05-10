/**
 * Normalized review shape for future Outscraper (or other) ingestion.
 * Keep stable — ETL jobs map into this contract.
 */
export type ReviewSource = 'google' | 'outscraper' | 'manual' | 'unknown'

export interface NormalizedReview {
  source: ReviewSource
  /** Plain text body (already stripped of HTML). */
  text: string
  /** 1–5 when known. */
  rating?: number
  /** ISO date string when known. */
  published_at?: string
  /** Stable id from source when available. */
  external_id?: string
}

export interface ProviderReviewCorpus {
  provider_id: string
  reviews: NormalizedReview[]
  /** Last successful ingest timestamp (ISO). */
  ingested_at?: string
}
