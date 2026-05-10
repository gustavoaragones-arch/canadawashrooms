import type { NormalizedReview } from '../../types/reviews'
import { classifyReviewSignal } from '../inference/reviewSignalQuality'
import { extractKeywordTokens } from '../inference/reviewPipeline'
import type { Provider } from '../../types/provider'

const WINTER = /\b(heated|heating|insulated|winter|winterized|freeze|freezing|sub[- ]?zero|cold\s*weather|frost)\b/i
const LUX_EVENT = /\b(wedding|weddings|luxury|trailer|vip|guest\s*comfort|upscale|black\s*tie)\b/i
const REMOTE_OIL = /\b(oilfield|oil\s*sands|lease\s*road|remote\s*camp|work\s*camp|man\s*camp|industrial\s*camp|rig|pipeline|fly[\s-]?in)\b/i

export interface ReviewSignalSummaryReport {
  generatedAt: string
  totalReviewBodies: number
  topOperationalKeywords: { keyword: string; count: number }[]
  winterizationSignals: number
  luxuryEventSignals: number
  remoteOilfieldSignals: number
  weakGenericReviews: number
}

function collectReviews(providers: Provider[]): NormalizedReview[] {
  const out: NormalizedReview[] = []
  for (const p of providers) {
    const rev = p.reviews_normalized
    if (!rev?.length) continue
    out.push(...rev)
  }
  return out
}

export function buildReviewSignalSummaryReport(
  providers: Provider[],
  generatedAt: string,
): ReviewSignalSummaryReport {
  const reviews = collectReviews(providers)
  const freq = new Map<string, number>()
  let winterizationSignals = 0
  let luxuryEventSignals = 0
  let remoteOilfieldSignals = 0
  let weakGenericReviews = 0

  for (const r of reviews) {
    const text = r.text
    const { tier } = classifyReviewSignal(text)
    if (tier === 'generic_noise') weakGenericReviews += 1

    if (WINTER.test(text)) winterizationSignals += 1
    if (LUX_EVENT.test(text)) luxuryEventSignals += 1
    if (REMOTE_OIL.test(text)) remoteOilfieldSignals += 1

    if (tier === 'operational' || tier === 'mixed') {
      for (const tok of extractKeywordTokens(text)) {
        freq.set(tok, (freq.get(tok) ?? 0) + 1)
      }
    }
  }

  const topOperationalKeywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 80)
    .map(([keyword, count]) => ({ keyword, count }))

  return {
    generatedAt,
    totalReviewBodies: reviews.length,
    topOperationalKeywords,
    winterizationSignals,
    luxuryEventSignals,
    remoteOilfieldSignals,
    weakGenericReviews,
  }
}
