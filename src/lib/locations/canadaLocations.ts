/**
 * National location model.
 * Province → cities with metadata for national-aware retrieval and UI.
 *
 * "live" marks provinces and cities included in the current published dataset.
 * "comingSoon" marks planned expansions.
 */

export type ProvinceCode = 'AB' | 'ON' | 'BC'

export interface CanadaCity {
  name: string
  provinceCode: ProvinceCode
  /** Slug used in URLs and dataset IDs. */
  slug: string
  live: boolean
}

export interface CanadaProvince {
  name: string
  code: ProvinceCode
  live: boolean
  cities: CanadaCity[]
}

export const CANADA_PROVINCES: CanadaProvince[] = [
  {
    name: 'Alberta',
    code: 'AB',
    live: true,
    cities: [
      { name: 'Calgary', provinceCode: 'AB', slug: 'calgary', live: true },
      { name: 'Edmonton', provinceCode: 'AB', slug: 'edmonton', live: true },
      { name: 'Fort McMurray', provinceCode: 'AB', slug: 'fort-mcmurray', live: true },
      { name: 'Red Deer', provinceCode: 'AB', slug: 'red-deer', live: true },
      { name: 'Canmore', provinceCode: 'AB', slug: 'canmore', live: true },
      { name: 'Lethbridge', provinceCode: 'AB', slug: 'lethbridge', live: false },
      { name: 'Medicine Hat', provinceCode: 'AB', slug: 'medicine-hat', live: false },
    ],
  },
  {
    name: 'Ontario',
    code: 'ON',
    live: true,
    cities: [
      { name: 'Toronto', provinceCode: 'ON', slug: 'toronto', live: true },
      { name: 'Mississauga', provinceCode: 'ON', slug: 'mississauga', live: true },
      { name: 'Brampton', provinceCode: 'ON', slug: 'brampton', live: true },
      { name: 'Hamilton', provinceCode: 'ON', slug: 'hamilton', live: true },
      { name: 'Ottawa', provinceCode: 'ON', slug: 'ottawa', live: true },
      { name: 'London', provinceCode: 'ON', slug: 'london', live: true },
      { name: 'Vaughan', provinceCode: 'ON', slug: 'vaughan', live: true },
      { name: 'Markham', provinceCode: 'ON', slug: 'markham', live: true },
      { name: 'Welland', provinceCode: 'ON', slug: 'welland', live: false },
      { name: 'Kitchener', provinceCode: 'ON', slug: 'kitchener', live: false },
    ],
  },
  {
    name: 'British Columbia',
    code: 'BC',
    live: true,
    cities: [
      { name: 'Surrey', provinceCode: 'BC', slug: 'surrey', live: true },
      { name: 'Vancouver', provinceCode: 'BC', slug: 'vancouver', live: true },
      { name: 'Abbotsford', provinceCode: 'BC', slug: 'abbotsford', live: true },
      { name: 'Kelowna', provinceCode: 'BC', slug: 'kelowna', live: true },
      { name: 'Nanaimo', provinceCode: 'BC', slug: 'nanaimo', live: true },
      { name: 'Coquitlam', provinceCode: 'BC', slug: 'coquitlam', live: true },
      { name: 'Victoria', provinceCode: 'BC', slug: 'victoria', live: true },
      { name: 'Whistler', provinceCode: 'BC', slug: 'whistler', live: false },
      { name: 'Kamloops', provinceCode: 'BC', slug: 'kamloops', live: false },
      { name: 'Prince George', provinceCode: 'BC', slug: 'prince-george', live: false },
    ],
  },
]

/** All live cities across all provinces. */
export const LIVE_CITIES: CanadaCity[] = CANADA_PROVINCES.flatMap((p) =>
  p.cities.filter((c) => c.live),
)

/** All live provinces. */
export const LIVE_PROVINCES: CanadaProvince[] = CANADA_PROVINCES.filter((p) => p.live)

/** Lookup city by name (case-insensitive). */
export function findCity(name: string): CanadaCity | null {
  const n = name.trim().toLowerCase()
  for (const p of CANADA_PROVINCES) {
    const c = p.cities.find((c) => c.name.toLowerCase() === n || c.slug === n)
    if (c) return c
  }
  return null
}

/** Lookup province by city name. */
export function provinceForCity(cityName: string): CanadaProvince | null {
  const n = cityName.trim().toLowerCase()
  for (const p of CANADA_PROVINCES) {
    if (p.cities.some((c) => c.name.toLowerCase() === n || c.slug === n)) return p
  }
  return null
}

/** Infer province code from a filename (for ingest routing). */
export function inferProvinceCodeFromFilename(filename: string): ProvinceCode | null {
  const lower = filename.toLowerCase()
  if (/alberta|calgary|edmonton|fort.?mc|red.?deer|canmore|lethbridge/.test(lower)) return 'AB'
  if (/ontario|toronto|mississauga|brampton|hamilton|ottawa|vaughan|welland|london.on/.test(lower))
    return 'ON'
  if (/british.?columbia|bc[_\-.]|vancouver|kelowna|kamloops|surrey|abbotsford/.test(lower))
    return 'BC'
  return null
}

/** Full province name from code. */
export function provinceNameFromCode(code: ProvinceCode): string {
  return CANADA_PROVINCES.find((p) => p.code === code)?.name ?? code
}
