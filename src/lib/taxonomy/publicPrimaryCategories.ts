import type { PrimarySegment, PublicPrimaryCategory } from '../../types/provider'

export type { PublicPrimaryCategory }

export const PUBLIC_PRIMARY_CATEGORIES: PublicPrimaryCategory[] = [
  'general',
  'construction',
  'event',
  'oilfield',
]

export function isPublicPrimaryCategory(
  segment: PrimarySegment,
): segment is PublicPrimaryCategory {
  return segment !== 'site_services'
}

/** Strip legacy waste category and ensure general baseline for display/filtering. */
export function displayPublicCategories(
  categories: PrimarySegment[] | undefined,
  options?: {
    /** When site_services was removed, promote construction for waste-capable operators. */
    promoteConstruction?: boolean
  },
): PublicPrimaryCategory[] {
  const input = categories ?? []
  const hadSiteServices = input.includes('site_services')
  const out = new Set<PublicPrimaryCategory>()

  for (const cat of input) {
    if (isPublicPrimaryCategory(cat)) out.add(cat)
  }

  out.add('general')

  if (options?.promoteConstruction && hadSiteServices && !out.has('construction')) {
    out.add('construction')
  }

  return PUBLIC_PRIMARY_CATEGORIES.filter((c) => out.has(c))
}

export function providerDisplayCategories(provider: {
  public_categories?: PrimarySegment[]
  construction_ready?: boolean
  septic_service?: boolean
  site_support?: boolean
  roll_off_disposal?: boolean
}): PublicPrimaryCategory[] {
  return displayPublicCategories(provider.public_categories, {
    promoteConstruction: Boolean(
      provider.construction_ready ||
        provider.septic_service ||
        provider.site_support ||
        provider.roll_off_disposal,
    ),
  })
}
