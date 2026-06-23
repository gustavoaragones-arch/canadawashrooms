import type { ProvinceCode } from '../../types/provider'

export interface MetroRegion {
  provinceCode: ProvinceCode
  /** Cities in this metro — listed in rough proximity order from the regional hub. */
  cities: string[]
}

/** Metro clusters for related-provider geography. City names are matched case-insensitively. */
export const METRO_REGIONS: MetroRegion[] = [
  {
    provinceCode: 'ON',
    cities: ['Niagara Falls', 'St Catharines', 'Welland', 'Thorold', 'Fort Erie'],
  },
  {
    provinceCode: 'ON',
    cities: ['Toronto', 'Mississauga', 'Brampton', 'Vaughan', 'Markham'],
  },
  {
    provinceCode: 'ON',
    cities: ['Hamilton', 'Burlington', 'Oakville'],
  },
  {
    provinceCode: 'AB',
    cities: ['Calgary', 'Airdrie', 'Chestermere', 'Okotoks', 'Cochrane'],
  },
  {
    provinceCode: 'AB',
    cities: ['Edmonton', 'Sherwood Park', 'St Albert', 'Leduc', 'Nisku'],
  },
  {
    provinceCode: 'AB',
    cities: ['Fort McMurray'],
  },
  {
    provinceCode: 'BC',
    cities: ['Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Coquitlam', 'Abbotsford'],
  },
  {
    provinceCode: 'BC',
    cities: ['Victoria', 'Nanaimo'],
  },
  {
    provinceCode: 'BC',
    cities: ['Kelowna', 'Kamloops'],
  },
  {
    provinceCode: 'SK',
    cities: ['Regina', 'Moose Jaw'],
  },
  {
    provinceCode: 'SK',
    cities: ['Saskatoon', 'Martensville', 'Warman'],
  },
]

export function normalizeCityName(city: string): string {
  return city.trim().toLowerCase().replace(/\./g, '')
}

function normalizedCitySet(cities: string[]): Set<string> {
  return new Set(cities.map(normalizeCityName))
}

/** Cities in the same metro region as `city`, or null when the city is not clustered. */
export function metroRegionForCity(
  city: string,
  provinceCode?: ProvinceCode | null,
): MetroRegion | null {
  const normalized = normalizeCityName(city)
  for (const region of METRO_REGIONS) {
    if (provinceCode && region.provinceCode !== provinceCode) continue
    if (region.cities.some((c) => normalizeCityName(c) === normalized)) return region
  }
  return null
}

export function metroRegionCities(city: string, provinceCode?: ProvinceCode | null): Set<string> | null {
  const region = metroRegionForCity(city, provinceCode)
  return region ? normalizedCitySet(region.cities) : null
}

/** Lower index = closer to the regional hub in cluster ordering. */
export function metroCityProximityRank(city: string, region: MetroRegion | null): number {
  if (!region) return Number.MAX_SAFE_INTEGER
  const idx = region.cities.findIndex((c) => normalizeCityName(c) === normalizeCityName(city))
  return idx >= 0 ? idx : Number.MAX_SAFE_INTEGER
}
