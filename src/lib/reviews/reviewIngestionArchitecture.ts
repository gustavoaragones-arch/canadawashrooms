/**
 * Review ingestion architecture (no external APIs yet).
 *
 * Future Outscraper (or similar) flow:
 * 1. Fetch raw review payloads per place_id / listing.
 * 2. Map rows → `NormalizedReview` via `normalizeReviewRecord`.
 * 3. Persist `ProviderReviewCorpus` per operator (versioned snapshots).
 * 4. Run `extractKeywordTokens` + `inferSignalsFromReviewCorpus` on append.
 * 5. Fan-out: merge into `runInferredCapabilityPipeline` → enrich ranking + search docs.
 *
 * Swap implementations behind these exports without changing matcher UI.
 */
export type { NormalizedReview, ProviderReviewCorpus, ReviewSource } from '../../types/reviews'

export {
  classifyReviewSignal,
  reviewCorpusSignalSummary,
} from '../inference/reviewSignalQuality'
export {
  extractKeywordTokens,
  inferSignalsFromReviewCorpus,
  normalizeReviewRecord,
  reviewsTextBlob,
} from '../inference/reviewPipeline'

export { runInferredCapabilityPipeline } from '../inference/inferredCapabilityPipeline'
