/**
 * publicCategoryMapper — derives the public_categories array for a provider.
 *
 * Filtering layer only — intentionally separate from primary_segment (internal ranking).
 * UX-11: strict inclusion rules so categories act as real filters, not decorative labels.
 */

import type { PrimarySegment, Provider, ProviderRaw, PublicPrimaryCategory } from '../../types/provider'
import { displayPublicCategories } from './publicPrimaryCategories'

type ProviderLike = (ProviderRaw | Provider) & {
  luxury_trailers?: boolean
  remote_logistics?: boolean
  flushing_units?: boolean
  flush_toilets?: boolean
  weekly_service?: boolean
  badges?: string[]
  google_categories?: string[]
}

function listingBlob(provider: ProviderLike): string {
  return [...(provider.badges ?? []), ...(provider.google_categories ?? [])]
    .join(' ')
    .toLowerCase()
}

function hasConstructionSignals(provider: ProviderLike): boolean {
  if (provider.construction_ready || provider.weekly_service || provider.crane_liftable) {
    return true
  }
  const blob = listingBlob(provider)
  return /jobsite|job site|contractor|long[\s-]term rental|construction site/.test(blob)
}

function hasEventSignals(provider: ProviderLike): boolean {
  if (
    provider.luxury_units ||
    provider.luxury_trailers ||
    provider.flush_toilets ||
    provider.flushing_units
  ) {
    return true
  }
  const blob = listingBlob(provider)
  if (/wedding|event restroom|luxury trailer|special event|party rental/.test(blob)) {
    return true
  }
  if (provider.wedding_friendly && /wedding|event|party|trailer|restroom/.test(blob)) {
    return true
  }
  return false
}

function countStrongOilfieldSignals(provider: ProviderLike): number {
  let count = 0
  if (provider.oilfield_ready) count++
  if (provider.remote_logistics) count++
  if (provider.camp_support) count++
  if (provider.remote_support) count++
  return count
}

function hasOilfieldSignals(provider: ProviderLike): boolean {
  if (provider.primary_segment === 'oilfield') return true
  return countStrongOilfieldSignals(provider) >= 2
}

/** Strict signal-based categories — used when no curated CSV list is present. */
export function derivePublicCategories(provider: ProviderLike): PrimarySegment[] {
  const cats = new Set<PrimarySegment>()

  // RULE 1 — universal default for portable sanitation operators
  cats.add('general')

  // RULE 2 — construction requires explicit jobsite signals
  if (hasConstructionSignals(provider)) {
    cats.add('construction')
  }

  // RULE 3 — events require explicit luxury/event signals
  if (hasEventSignals(provider)) {
    cats.add('event')
  }

  // RULE 4 — oilfield requires strong remote/industrial posture (not winter heat alone)
  if (hasOilfieldSignals(provider)) {
    cats.add('oilfield')
  }

  // RULE 5 — waste/site requires septic, disposal, or explicit waste-service language
  // Waste/site capabilities are shown under Available Services — not a primary category.
  return [...cats]
}

/** Final public categories stored on provider rows — four primary intents only. */
export function finalizePublicCategories(
  categories: PrimarySegment[],
  provider: ProviderLike,
): PublicPrimaryCategory[] {
  return displayPublicCategories(categories, {
    promoteConstruction: Boolean(
      provider.construction_ready ||
        provider.septic_service ||
        provider.site_support ||
        provider.roll_off_disposal,
    ),
  })
}

/**
 * RULE 6 — curated CSV categories win over inference.
 * Always ensures general is present; strips legacy site_services primary category.
 */
export function resolvePublicCategories(
  raw: Pick<ProviderRaw, 'curated_public_categories'>,
  provider: ProviderLike,
): PublicPrimaryCategory[] {
  const curated = raw.curated_public_categories
  const inferred = curated?.length
    ? curated
    : derivePublicCategories(provider)
  return finalizePublicCategories(inferred, provider)
}

/**
 * Human-readable label for each public category key.
 * Canonical names — must match INTENT_CARDS titles.
 */
export const PUBLIC_CATEGORY_LABELS: Record<PublicPrimaryCategory, string> = {
  construction: 'Construction & Jobsites',
  event: 'Events & Weddings',
  oilfield: 'Remote & Oilfield',
  general: 'General Portable Washrooms',
}

export function publicCategoryLabel(cat: PublicPrimaryCategory): string {
  return PUBLIC_CATEGORY_LABELS[cat] ?? cat
}
