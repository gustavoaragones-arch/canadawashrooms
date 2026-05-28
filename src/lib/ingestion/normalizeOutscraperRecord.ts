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

/** Returns true if a CSV cell is "yes" (case-insensitive). */
function isYes(row: Record<string, string>, colName: string): boolean {
  return cell(row, colName).toLowerCase() === 'yes'
}

/**
 * Extract deduplicated badge strings from the primary category + subtypes columns.
 * Subtypes are pipe-separated (e.g. "Portable toilet supplier|Portable shower supplier").
 */
function extractBadges(row: Record<string, string>): string[] {
  const seen = new Set<string>()
  const add = (s: string) => {
    const v = s.replace(/^["']+|["']+$/g, '').trim()
    if (v) seen.add(v)
  }
  const category = cell(row, 'category', 'categories', 'type')
  if (category) add(category)
  const subtypes = cell(row, 'subtypes')
  if (subtypes) {
    for (const s of subtypes.split('|')) add(s)
  }
  return [...seen]
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

  // ── Explicit feature columns (curator-filled in CSV) ──────────────────────────
  // These take priority over inferred signals — they are human-confirmed.
  const csv_construction   = isYes(row, 'Construction & Jobsites')
  const csv_oilfield       = isYes(row, 'Remote & Oilfield Operations')
  const csv_events         = isYes(row, 'Events & Weddings')
  const csv_waste_services = isYes(row, 'Waste & Site Services')
  const csv_heated         = isYes(row, 'Heated Restroom')
  const csv_handwash       = isYes(row, 'Handwashing Stations')
  const csv_accessible     = isYes(row, 'wheelchair accessible')

  // ── Segment: prefer explicit CSV columns, fall back to category inference ─────
  const catNorm = category ? normalizeCategory(category) : ''
  const inferredSegment = inferSegmentHint(catNorm)
  let primary_segment: PrimarySegment = inferredSegment
  if (csv_waste_services && !csv_construction && !csv_oilfield && !csv_events) {
    primary_segment = 'site_services'
  } else if (csv_oilfield && !csv_construction) {
    primary_segment = 'oilfield'
  } else if (csv_construction) {
    primary_segment = 'construction'
  } else if (csv_events && !csv_construction && !csv_oilfield) {
    primary_segment = 'event'
  }

  // Province inference: try row column first, then source filename, fallback AB
  const VALID_CODES = new Set<string>(['AB', 'ON', 'BC'])
  const rowProvinceRaw = cell(row, 'province', 'province_code', 'state').toUpperCase()
  const province_code: ProvinceCode = VALID_CODES.has(rowProvinceRaw)
    ? (rowProvinceRaw as ProvinceCode)
    : (sourceFilename ? (inferProvinceCodeFromFilename(sourceFilename) ?? 'AB') : 'AB')
  const province = provinceNameFromCode(province_code)

  const id = slugId(`${name}-${city}`, province_code)
  const badges = extractBadges(row)

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
    badges: badges.length ? badges : (category ? [category] : []),
    // ── Feature capabilities from explicit CSV columns ──────────────────────────
    heated:            csv_heated,
    handwash_available: csv_handwash,
    ada_accessible:    csv_accessible,
    winterized:        csv_heated,         // heated units are also winterized
    construction_ready: csv_construction,
    oilfield_ready:    csv_oilfield,
    wedding_friendly:  csv_events,
    luxury_units:      false,              // needs manual curation
    google_categories: category ? [normalizeCategory(category)] : [],
    address_full: address || undefined,
  }
}
