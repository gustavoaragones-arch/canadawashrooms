import { PROVIDERS } from './providersDataset'
import type { PrimarySegment, Provider } from '../types/provider'

export function getProviderBySlug(slug: string | undefined): Provider | null {
  if (!slug) return null
  const normalized = slug.trim().toLowerCase()
  return PROVIDERS.find((p) => p.id.toLowerCase() === normalized) ?? null
}

function relatedScore(
  candidate: Provider,
  anchor: Provider,
  preferSegment: PrimarySegment,
): number {
  let score = 0
  if (candidate.city === anchor.city) score += 48
  if (candidate.primary_segment === preferSegment) score += 36
  else if (candidate.supported_segments.includes(preferSegment)) score += 22
  if (candidate.primary_segment === anchor.primary_segment) score += 18
  score += Math.min(candidate.review_count, 400) * 0.04
  score += candidate.rating * 6
  return score
}

/** Nearby / same-segment operators for curation comparison on provider pages. */
export function relatedProviders(
  anchor: Provider,
  options?: { limit?: number; preferSegment?: PrimarySegment },
): Provider[] {
  const limit = options?.limit ?? 5
  const preferSegment = options?.preferSegment ?? anchor.primary_segment

  return PROVIDERS.filter((p) => p.id !== anchor.id)
    .map((p) => ({ p, score: relatedScore(p, anchor, preferSegment) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ p }) => p)
}
