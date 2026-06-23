/**
 * Coverage statistics derived from the national dataset at build time.
 * Used for display on provider/province/city pages and future mapping features.
 * No UI is attached here — import these helpers where needed.
 */

import type { Provider, PublicPrimaryCategory } from '../../types/provider'
import { CANADA_PROVINCES } from '../locations/canadaLocations'
import { providerDisplayCategories } from '../taxonomy/publicPrimaryCategories'

export interface ProvinceStats {
  code: string
  name: string
  providerCount: number
  cityBreakdown: CityStats[]
  categoryBreakdown: CategoryStats[]
  topRating: number
  avgRating: number
}

export interface CityStats {
  name: string
  slug: string
  providerCount: number
  provinceCode: string
}

export interface CategoryStats {
  segment: PublicPrimaryCategory
  count: number
  percentage: number
}

export interface NationalCoverage {
  totalProviders: number
  totalProvinces: number
  totalCities: number
  provinces: ProvinceStats[]
  topCities: CityStats[]
  categoryTotals: CategoryStats[]
}

const SEGMENTS: PublicPrimaryCategory[] = ['general', 'construction', 'event', 'oilfield']

function categoryBreakdown(providers: Provider[]): CategoryStats[] {
  return SEGMENTS.map((seg) => {
    const count = providers.filter((p) => providerDisplayCategories(p).includes(seg)).length
    return {
      segment: seg,
      count,
      percentage: providers.length > 0 ? Math.round((count / providers.length) * 100) : 0,
    }
  })
}

function avgRating(providers: Provider[]): number {
  if (!providers.length) return 0
  return +(providers.reduce((s, p) => s + p.rating, 0) / providers.length).toFixed(2)
}

/** Compute full national coverage statistics from the providers array. */
export function computeCoverageStats(providers: Provider[]): NationalCoverage {
  const liveProvinces = CANADA_PROVINCES.filter((p) => p.live)

  const provinces: ProvinceStats[] = liveProvinces.map((prov) => {
    const provProviders = providers.filter((p) => p.province_code === prov.code)
    const liveCities = prov.cities.filter((c) => c.live)

    const cityBreakdown: CityStats[] = liveCities
      .map((city) => ({
        name: city.name,
        slug: city.slug,
        provinceCode: prov.code,
        providerCount: provProviders.filter(
          (p) => p.city.toLowerCase() === city.name.toLowerCase(),
        ).length,
      }))
      .filter((c) => c.providerCount > 0)
      .sort((a, b) => b.providerCount - a.providerCount)

    const ratings = provProviders.filter((p) => p.rating > 0)
    const topRating = ratings.length ? Math.max(...ratings.map((p) => p.rating)) : 0

    return {
      code: prov.code,
      name: prov.name,
      providerCount: provProviders.length,
      cityBreakdown,
      categoryBreakdown: categoryBreakdown(provProviders),
      topRating,
      avgRating: avgRating(provProviders),
    }
  })

  // All cities with providers, sorted by count
  const allCities: CityStats[] = provinces
    .flatMap((prov) => prov.cityBreakdown)
    .sort((a, b) => b.providerCount - a.providerCount)

  return {
    totalProviders: providers.length,
    totalProvinces: liveProvinces.length,
    totalCities: allCities.length,
    provinces,
    topCities: allCities.slice(0, 10),
    categoryTotals: categoryBreakdown(providers),
  }
}
