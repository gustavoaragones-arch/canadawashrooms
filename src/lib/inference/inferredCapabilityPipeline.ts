import type { InferenceOverrideShape } from '../../types/provider'
import type { NormalizedReview } from '../../types/reviews'
import { applyManualInferenceOverrides, inferFromBadges, inferFromGoogleCategories } from './capabilityInference'
import type { InferenceSignals } from './inferenceSignals'
import { mergeInferenceSignals } from './inferenceSignals'
import { inferSignalsFromReviewCorpus } from './reviewPipeline'

/**
 * Single entry for capability inference — add new sources here (modular extension).
 */
export function runInferredCapabilityPipeline(input: {
  badges: string[]
  google_categories: string[]
  reviews_normalized: NormalizedReview[]
  inference_overrides?: Partial<InferenceOverrideShape>
}): InferenceSignals {
  const fromReviews = inferSignalsFromReviewCorpus(input.reviews_normalized)
  const fromBadges = inferFromBadges(input.badges)
  const fromCategories = inferFromGoogleCategories(input.google_categories)

  const merged = mergeInferenceSignals([fromReviews, fromBadges, fromCategories])
  return applyManualInferenceOverrides(merged, input.inference_overrides)
}
