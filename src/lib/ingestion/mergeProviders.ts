import { normalizeBadge } from '../normalize'
import type { ProviderIngestRecord } from './types'

function uniqStrings(list: string[]): string[] {
  return [...new Set(list.map((x) => x.trim()).filter(Boolean))]
}

/**
 * Merge two ingest records that already matched `strictListingIdentityMergeKey` (same city,
 * address, name). Prefers higher review mass, non-null website, richer categories. Not used for
 * website/phone-only overlap — those remain distinct operational nodes.
 */
export function mergeProviders(a: ProviderIngestRecord, b: ProviderIngestRecord): ProviderIngestRecord {
  const primary = a.review_count >= b.review_count ? a : b
  const secondary = primary === a ? b : a

  const website = primary.website ?? secondary.website ?? null
  const phone = primary.phone || secondary.phone
  const rating =
    primary.review_count >= secondary.review_count ? primary.rating : secondary.rating

  const badges = uniqStrings([
    ...primary.badges.map(normalizeBadge),
    ...secondary.badges.map(normalizeBadge),
  ])

  const google_categories = uniqStrings([
    ...(primary.google_categories ?? []),
    ...(secondary.google_categories ?? []),
  ])

  const reviews_normalized = [
    ...(primary.reviews_normalized ?? []),
    ...(secondary.reviews_normalized ?? []),
  ]

  const operational_notes = [primary.operational_notes, secondary.operational_notes]
    .filter(Boolean)
    .join(' | ')

  return {
    ...primary,
    /** Same listing exported twice — keep max snapshot, do not sum duplicate pulls. */
    review_count: Math.max(primary.review_count, secondary.review_count),
    rating,
    website,
    phone,
    badges,
    google_categories: google_categories.length ? google_categories : undefined,
    reviews_normalized: reviews_normalized.length ? reviews_normalized : undefined,
    operational_notes: operational_notes || undefined,
    manual_enrichment_overrides:
      primary.manual_enrichment_overrides ?? secondary.manual_enrichment_overrides,
    inference_overrides: primary.inference_overrides ?? secondary.inference_overrides,
    address_full: primary.address_full ?? secondary.address_full,
  }
}
