import type { PrimarySegment, ProvinceCode } from '../../types/provider'
import { inferProvinceCodeFromFilename, provinceNameFromCode } from '../locations/canadaLocations'
import { normalizeCategory } from '../normalize'
import { normalizeCity } from '../normalize/city'
import { normalizePhone } from '../normalize/phone'
import { normalizeServiceArea } from '../normalize/serviceArea'
import { normalizeWebsite } from '../normalize/website'
import type { ProviderIngestRecord } from './types'

function cell(row: Record<string, string>, ...aliases: string[]): string {
  const lower = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]),
  )
  for (const a of aliases) {
    const v = lower[a.toLowerCase()]
    if (v != null && String(v).trim() !== '') return String(v).trim()
  }
  return ''
}

function inferSegmentHint(categoryBlob: string): PrimarySegment {
  const b = categoryBlob.toLowerCase()
  if (/waste|disposal|roll[\s-]?off|dumpster|septic|sanitation service|garbage bin/.test(b)) {
    return 'site_services'
  }
  if (/oil|industrial|rental.*equipment|pipeline/.test(b)) return 'oilfield'
  if (/wedding|event|party/.test(b)) return 'event'
  if (/construction|contractor|excavat/.test(b)) return 'construction'
  return 'general'
}

function slugId(seed: string, provinceCode?: ProvinceCode): string {
  const suffix = provinceCode ? `-${provinceCode.toLowerCase()}` : ''
  const s = seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 56 - suffix.length)
  return (s || 'provider-unknown') + suffix
}

/**
 * Map a flexible Outscraper row → ingest-shaped provider (still needs QA before production).
 * Column aliases cover common export variants.
 * @param sourceFilename - optional originating CSV filename used to infer province.
 */
export function normalizeOutscraperRecord(
  row: Record<string, string>,
  sourceFilename?: string,
): ProviderIngestRecord | null {
  const name = cell(row, 'name', 'title', 'business_name')
  if (!name) return null

  const phoneRaw = cell(row, 'phone', 'phone_number')
  const siteRaw = cell(row, 'site', 'website', 'url')
  const rating = Number.parseFloat(cell(row, 'rating', 'google_rating', 'average_rating')) || 0
  const reviewCount =
    Number.parseInt(cell(row, 'reviews_count', 'reviews', 'review_count', 'total_reviews'), 10) ||
    0
  const address = cell(row, 'full_address', 'address', 'formatted_address')
  const cityRaw = cell(row, 'city', 'locality')
  const category = cell(row, 'category', 'categories', 'type')

  const city = cityRaw ? normalizeCity(cityRaw) : 'Calgary'
  const phoneNorm = phoneRaw ? normalizePhone(phoneRaw) : ''
  const website = siteRaw ? normalizeWebsite(siteRaw) : null

  const catNorm = category ? normalizeCategory(category) : ''
  const primary_segment = inferSegmentHint(catNorm)

  // Province inference: try row column first, then source filename, fallback AB
  const VALID_CODES = new Set<string>(['AB', 'ON', 'BC'])
  const rowProvinceRaw = cell(row, 'province', 'province_code', 'state').toUpperCase()
  const province_code: ProvinceCode = VALID_CODES.has(rowProvinceRaw)
    ? (rowProvinceRaw as ProvinceCode)
    : (sourceFilename ? (inferProvinceCodeFromFilename(sourceFilename) ?? 'AB') : 'AB')
  const province = provinceNameFromCode(province_code)

  const id = slugId(`${name}-${city}`, province_code)

  return {
    id,
    company_name: name,
    primary_segment,
    segment_key: primary_segment,
    city,
    province,
    province_code,
    service_area: normalizeServiceArea(address || `${city}, ${province_code}`),
    rating,
    review_count: reviewCount,
    website,
    phone: phoneNorm,
    badges: category ? [category] : [],
    winterized: false,
    luxury_units: false,
    construction_ready: primary_segment === 'construction',
    oilfield_ready: primary_segment === 'oilfield',
    ada_accessible: false,
    handwash_available: false,
    google_categories: category ? [normalizeCategory(category)] : [],
    address_full: address || undefined,
  }
}
