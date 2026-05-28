/**
 * publicCategoryMapper — derives the public_categories array for a provider.
 *
 * This is the FILTERING layer. A provider can belong to multiple categories.
 * Intentionally different from primary_segment (kept for internal ranking only).
 *
 * Design principle:
 *   Capability signals in scraped data are sparse — most providers only have
 *   inferred signals, not explicit ones. The mapper therefore errs toward
 *   INCLUSION rather than exclusion. Differentiation between categories comes
 *   from what EXTRA capabilities a provider has, not from what it lacks.
 *
 * Category rules:
 *
 * GENERAL — universal baseline: every portable sanitation provider belongs here.
 *   Only pure industrial waste/septic firms with no portable unit presence are excluded.
 *
 * CONSTRUCTION — all general providers (portable toilets on jobsites is the #1 use
 *   case of the industry). Explicitly excluded only for pure event/luxury operators.
 *
 * EVENT — all general providers (any portable toilet company can serve an event).
 *   Providers with luxury/event signals are ranked higher within this category.
 *
 * OILFIELD/REMOTE — providers with explicit cold-climate or remote logistics posture.
 *   This is an ADDITIVE category (a provider can be general + oilfield).
 *
 * SITE_SERVICES — providers with waste, septic, or disposal capabilities.
 */

import type { PrimarySegment, Provider, ProviderRaw } from '../../types/provider'

type ProviderLike = (ProviderRaw | Provider) & {
  luxury_trailers?: boolean
  remote_logistics?: boolean
  flushing_units?: boolean
  winter_service?: boolean
}

export function derivePublicCategories(provider: ProviderLike): PrimarySegment[] {
  const cats = new Set<PrimarySegment>()

  // ── GENERAL ──────────────────────────────────────────────────────────────────
  // Universal baseline — every operator in this directory offers portable
  // sanitation services. Always included.
  cats.add('general')

  // ── CONSTRUCTION ─────────────────────────────────────────────────────────────
  // All general providers belong here — portable toilets on jobsites is the
  // primary industry use case. Explicit construction signals rank providers higher.
  if (cats.has('general')) {
    cats.add('construction')
  }
  if (
    provider.primary_segment === 'construction' ||
    provider.construction_ready ||
    provider.crane_liftable ||
    provider.weekly_service ||
    provider.handwash_available
  ) {
    cats.add('construction')
  }

  // ── EVENT ────────────────────────────────────────────────────────────────────
  // All general providers belong here — any portable toilet company can serve
  // an outdoor event. Providers with explicit luxury/event signals rank higher.
  if (cats.has('general')) {
    cats.add('event')
  }
  if (
    provider.primary_segment === 'event' ||
    provider.luxury_units ||
    (provider as ProviderLike).luxury_trailers ||
    provider.flush_toilets ||
    provider.wedding_friendly
  ) {
    cats.add('event')
  }

  // ── OILFIELD / REMOTE ────────────────────────────────────────────────────────
  // Explicit remote/winter/industrial capability signals.
  // This is additive — a provider can be general + construction + oilfield.
  if (
    provider.primary_segment === 'oilfield' ||
    provider.oilfield_ready ||
    provider.winterized ||
    provider.heated ||
    provider.remote_support ||
    provider.camp_support ||
    (provider as ProviderLike).remote_logistics
  ) {
    cats.add('oilfield')
  }

  // ── SITE SERVICES ────────────────────────────────────────────────────────────
  // Providers with waste, septic, or disposal capabilities.
  if (
    provider.primary_segment === 'site_services' ||
    provider.septic_service ||
    provider.site_support ||
    provider.roll_off_disposal
  ) {
    cats.add('site_services')
  }

  return [...cats]
}

/**
 * Human-readable label for each public category key.
 * Canonical names — must match INTENT_CARDS titles.
 */
export const PUBLIC_CATEGORY_LABELS: Record<PrimarySegment, string> = {
  construction: 'Construction & Jobsites',
  event: 'Events & Weddings',
  oilfield: 'Remote & Oilfield',
  general: 'General Portable Washrooms',
  site_services: 'Waste & Site Services',
}

export function publicCategoryLabel(cat: PrimarySegment): string {
  return PUBLIC_CATEGORY_LABELS[cat] ?? cat
}
