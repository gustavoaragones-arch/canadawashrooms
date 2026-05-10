import type { Provider } from '../../types/provider'

/**
 * Internal completeness 0–100 — never shown as a user-facing score.
 * Feeds ranking / trust / future lead routing only.
 */
export function internalCompletenessScore(provider: Provider): number {
  let s = 0

  if (provider.phone && provider.phone.replace(/\D/g, '').length >= 10) s += 15
  if (provider.website) s += 16

  s += Math.min(provider.review_count / 25, 22)

  if (provider.rating >= 4.2 && provider.review_count >= 30) s += 8

  if ((provider.reviews_normalized?.length ?? 0) >= 2) s += 10
  else if ((provider.reviews_normalized?.length ?? 0) === 1) s += 5

  if (provider.google_categories && provider.google_categories.length > 0) s += 7

  if (provider.capabilities.length >= 8) s += 12
  else if (provider.capabilities.length >= 5) s += 8

  if (provider.operational_tags.some((t) => t.startsWith('review_signal'))) s += 8

  if (provider.service_area.length >= 24) s += 6

  if (provider.operational_notes && provider.operational_notes.length > 40) s += 6

  return Math.min(100, Math.round(s))
}

/** Compact scalar for sort composites — derived only from internal completeness. */
export function internalCompletenessContribution(provider: Provider): number {
  return internalCompletenessScore(provider) * 0.22
}
