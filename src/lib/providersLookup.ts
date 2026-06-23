import { PROVIDERS } from './providersDataset'
import { activeProviderFeatures } from './providerFeatures'
import {
  metroCityProximityRank,
  metroRegionCities,
  metroRegionForCity,
  normalizeCityName,
} from './locations/cityRegions'
import { provinceForCity, provinceNameFromCode } from './locations/canadaLocations'
import type { PrimarySegment, ProvinceCode, Provider } from '../types/provider'

export function getProviderBySlug(slug: string | undefined): Provider | null {
  if (!slug) return null
  const normalized = slug.trim().toLowerCase()
  return PROVIDERS.find((p) => p.id.toLowerCase() === normalized) ?? null
}

export type RelatedProviderScope = 'city' | 'region' | 'province' | 'national'

export interface RelatedProvidersResult {
  providers: Provider[]
  scope: RelatedProviderScope
}

function providerProvinceCode(provider: Provider): ProvinceCode | null {
  if (provider.province_code) return provider.province_code
  return provinceForCity(provider.city)?.code ?? null
}

function providerCategories(provider: Provider): PrimarySegment[] {
  return provider.public_categories?.length
    ? provider.public_categories
    : [provider.primary_segment]
}

function sharedCategoryCount(a: Provider, b: Provider): number {
  const aCats = new Set(providerCategories(a))
  return providerCategories(b).filter((cat) => aCats.has(cat)).length
}

function sharedFeatureCount(a: Provider, b: Provider): number {
  const aFeatures = new Set(activeProviderFeatures(a))
  return activeProviderFeatures(b).filter((feature) => aFeatures.has(feature)).length
}

function qualityScore(provider: Provider): number {
  return provider.rating * 6 + Math.min(provider.review_count, 400) * 0.04
}

function compareRelatedProviders(
  a: Provider,
  b: Provider,
  anchor: Provider,
  metroRegion: ReturnType<typeof metroRegionForCity>,
): number {
  const anchorCity = normalizeCityName(anchor.city)
  const aSameCity = normalizeCityName(a.city) === anchorCity
  const bSameCity = normalizeCityName(b.city) === anchorCity
  if (aSameCity !== bSameCity) return aSameCity ? -1 : 1

  const anchorProvince = providerProvinceCode(anchor)
  const aSameProvince = providerProvinceCode(a) === anchorProvince
  const bSameProvince = providerProvinceCode(b) === anchorProvince
  if (aSameProvince !== bSameProvince) return aSameProvince ? -1 : 1

  const aRank = metroCityProximityRank(a.city, metroRegion)
  const bRank = metroCityProximityRank(b.city, metroRegion)
  if (aRank !== bRank) return aRank - bRank

  const categoryDelta = sharedCategoryCount(b, anchor) - sharedCategoryCount(a, anchor)
  if (categoryDelta !== 0) return categoryDelta

  const featureDelta = sharedFeatureCount(b, anchor) - sharedFeatureCount(a, anchor)
  if (featureDelta !== 0) return featureDelta

  return qualityScore(b) - qualityScore(a)
}

function sortRelatedProviders(
  candidates: Provider[],
  anchor: Provider,
  metroRegion: ReturnType<typeof metroRegionForCity>,
): Provider[] {
  return [...candidates].sort((a, b) => compareRelatedProviders(a, b, anchor, metroRegion))
}

function appendUnique(
  current: Provider[],
  candidates: Provider[],
  limit: number,
): Provider[] {
  const seen = new Set(current.map((p) => p.id))
  const next = [...current]
  for (const candidate of candidates) {
    if (seen.has(candidate.id)) continue
    next.push(candidate)
    seen.add(candidate.id)
    if (next.length >= limit) break
  }
  return next
}

function resolveScope(
  providers: Provider[],
  anchor: Provider,
  regionCities: Set<string> | null,
): RelatedProviderScope {
  if (providers.length === 0) return 'city'

  const anchorCity = normalizeCityName(anchor.city)
  const anchorProvince = providerProvinceCode(anchor)

  if (providers.every((p) => normalizeCityName(p.city) === anchorCity)) {
    return 'city'
  }

  if (regionCities && providers.every((p) => regionCities.has(normalizeCityName(p.city)))) {
    return 'region'
  }

  if (
    anchorProvince &&
    providers.every((p) => providerProvinceCode(p) === anchorProvince)
  ) {
    return 'province'
  }

  return 'national'
}

export function relatedProvidersHeading(
  scope: RelatedProviderScope,
  anchor: Provider,
): { title: string; subtitle: string } {
  const city = anchor.city
  const province =
    anchor.province ??
    (anchor.province_code ? provinceNameFromCode(anchor.province_code) : 'your province')

  switch (scope) {
    case 'city':
      return {
        title: `Other providers in ${city}`,
        subtitle: `Portable washroom operators also serving ${city}.`,
      }
    case 'region':
      return {
        title: `Other providers near ${city}`,
        subtitle: `Portable washroom operators in the ${city} area and surrounding communities.`,
      }
    case 'province':
      return {
        title: `Other providers in ${province}`,
        subtitle: `Portable washroom operators across ${province}.`,
      }
    case 'national':
      return {
        title: 'Other providers across Canada',
        subtitle: 'Portable washroom operators in other parts of Canada.',
      }
  }
}

/**
 * Geographic-first related providers for provider detail pages.
 *
 * Previous behaviour (pre UX-09): scored all providers nationally using segment match
 * plus rating/reviews. Same-city only added +48 — easily beaten by high-rated operators
 * in other provinces, so e.g. Niagara Falls could surface Saskatoon and Surrey listings.
 *
 * New order: same city → metro region → same province → national (only when province
 * inventory is fewer than 3 other providers).
 */
export function relatedProviders(
  anchor: Provider,
  options?: { limit?: number; preferSegment?: PrimarySegment },
): RelatedProvidersResult {
  const limit = options?.limit ?? 5
  const anchorProvince = providerProvinceCode(anchor)
  const anchorCity = normalizeCityName(anchor.city)
  const metroRegion = metroRegionForCity(anchor.city, anchorProvince)
  const regionCities = metroRegion ? metroRegionCities(anchor.city, anchorProvince) : null

  const others = PROVIDERS.filter((p) => p.id !== anchor.id)

  const sameCity = others.filter((p) => normalizeCityName(p.city) === anchorCity)
  let results = sortRelatedProviders(sameCity, anchor, metroRegion).slice(0, limit)

  if (results.length < limit && regionCities) {
    const regional = others.filter((p) => regionCities.has(normalizeCityName(p.city)))
    results = appendUnique(
      results,
      sortRelatedProviders(regional, anchor, metroRegion),
      limit,
    )
  }

  if (results.length < limit && anchorProvince) {
    const provincial = others.filter((p) => providerProvinceCode(p) === anchorProvince)
    results = appendUnique(
      results,
      sortRelatedProviders(provincial, anchor, metroRegion),
      limit,
    )
  }

  const provincialPoolSize = anchorProvince
    ? others.filter((p) => providerProvinceCode(p) === anchorProvince).length
    : 0

  if (results.length < limit && provincialPoolSize < 3) {
    results = appendUnique(results, sortRelatedProviders(others, anchor, metroRegion), limit)
  }

  return {
    providers: results,
    scope: resolveScope(results, anchor, regionCities),
  }
}
