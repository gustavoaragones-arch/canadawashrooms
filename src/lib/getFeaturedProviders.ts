import type { Provider } from '../types/provider'

const FEATURE_KEYS: (keyof Provider)[] = [
  'heated',
  'winterized',
  'handwash_available',
  'ada_accessible',
  'luxury_units',
  'flushing_units',
  'flush_toilets',
  'crane_liftable',
  'weekly_service',
]

/**
 * Score a provider for featured placement.
 * Weighs completeness (website, phone, features) alongside social proof
 * (reviews, rating) so that well-documented operators surface first,
 * not just the oldest listings.
 */
function scoreProvider(p: Provider): number {
  let score = 0
  // Social proof (capped to avoid old high-volume operators always dominating)
  score += Math.min(p.review_count, 300) * 0.25
  score += p.rating * 15
  // Contact completeness
  if (p.website) score += 20
  if (p.phone) score += 10
  // Feature richness (curated signal quality)
  const featureCount = FEATURE_KEYS.filter((k) => p[k]).length
  score += featureCount * 8
  return score
}

/**
 * Return the top-scoring providers from the given array.
 * Optionally limit to a specific province for province-level previews.
 */
export function getFeaturedProviders(
  providers: Provider[],
  options: { limit?: number; provinceCode?: string } = {},
): Provider[] {
  const { limit = 8, provinceCode } = options
  const pool = provinceCode
    ? providers.filter((p) => p.province_code === provinceCode)
    : providers
  return [...pool]
    .map((p) => ({ p, score: scoreProvider(p) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p)
}
