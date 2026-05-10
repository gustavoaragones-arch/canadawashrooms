/**
 * Separates operational language from generic praise for inference weighting.
 * Tune phrases as ingest volume grows — keep deterministic for QA reproducibility.
 */

const GENERIC_ONLY_PRAISE =
  /\b(great service|good service|awesome|amazing|nice people|friendly staff|highly recommend|good job|very happy|fast response|best ever|five stars|5 stars|thank you so much|wonderful experience|no complaints|would use again)\b/i

const OPERATIONAL_MARKERS =
  /\b(heated|heating|insulated|winter|winterized|weekly|serviced|service schedule|pump[- ]?out|flush|trailer|wedding|remote|camp|oilfield|lease road|crane|lift|septic|holding tank|dispatch|crew|jobsite|occupancy|freshwater|generator|staging)\b/i

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

export type ReviewSignalTier = 'operational' | 'mixed' | 'generic_noise'

export interface ReviewSignalClassification {
  tier: ReviewSignalTier
  /** 0–1 confidence that text should influence capability inference. */
  inferenceWeight: number
}

/**
 * Classify a single review body for downstream weighting.
 */
export function classifyReviewSignal(text: string): ReviewSignalClassification {
  const t = text.trim()
  if (t.length < 12) {
    return { tier: 'generic_noise', inferenceWeight: 0.12 }
  }

  const hasOp = OPERATIONAL_MARKERS.test(t)
  const hasGen = GENERIC_ONLY_PRAISE.test(t)

  if (hasOp && !hasGen) {
    return { tier: 'operational', inferenceWeight: clamp(0.55 + Math.min(t.length / 800, 0.35), 0.55, 0.95) }
  }

  if (hasOp && hasGen) {
    return { tier: 'mixed', inferenceWeight: clamp(0.38 + Math.min(t.length / 1000, 0.22), 0.35, 0.72) }
  }

  if (!hasOp && hasGen) {
    return { tier: 'generic_noise', inferenceWeight: 0.045 }
  }

  /** Neutral narrative — weak but not useless if length supports detail. */
  const lenBoost = Math.min(t.length / 1200, 0.12)
  return { tier: 'mixed', inferenceWeight: clamp(0.2 + lenBoost, 0.16, 0.38) }
}

/** Aggregate corpus-level diagnostic (QA / ingest audits). */
export function reviewCorpusSignalSummary(reviews: { text: string }[]): {
  operationalCount: number
  genericCount: number
  weightedMass: number
} {
  let operationalCount = 0
  let genericCount = 0
  let weightedMass = 0

  for (const r of reviews) {
    const { tier, inferenceWeight } = classifyReviewSignal(r.text)
    weightedMass += inferenceWeight
    if (tier === 'operational') operationalCount += 1
    if (tier === 'generic_noise') genericCount += 1
  }

  return { operationalCount, genericCount, weightedMass }
}
