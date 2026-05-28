import { normalizeAddress } from '../normalize/address'
import { normalizeBusinessName } from '../normalize/businessName'
import { normalizeCity } from '../normalize/city'
import { normalizePhone } from '../normalize/phone'
import { normalizeWebsite } from '../normalize/website'
import type { Provider } from '../../types/provider'
import type { ProviderIngestRecord } from './types'

/** QA / export — not a merge trigger by itself. */
export type OverlapConfidenceLevel = 'high' | 'medium' | 'low'

export type OperationalOverlapCategory =
  | 'true_duplicate_risk'
  | 'organizational_overlap'
  | 'operational_ambiguity'

export type OperationalRelationshipType =
  | 'shared_website'
  | 'shared_phone'
  | 'shared_brand'
  | 'same_address'
  | 'probable_duplicate'
  | 'multi_city_operator'

export interface ProviderOverlapProbe {
  id: string
  company_name: string
  city: string
  phone: string
  website: string | null
  address_full?: string
}

export interface OrganizationalOverlapSignal {
  providerIds: [string, string]
  providerNames: [string, string]
  cities: [string, string]
  relationship_type: OperationalRelationshipType
  overlap_category: OperationalOverlapCategory
  overlap_confidence: OverlapConfidenceLevel
  matchingPhone: string | null
  matchingWebsite: string | null
  notes: string | null
}

export type OrganizationalOverlapReviewRecord = OrganizationalOverlapSignal & {
  source: 'pre_dedupe_cartesian_scan' | 'post_enrichment_pair_scan'
}

export function probeFromIngestRecord(rec: ProviderIngestRecord): ProviderOverlapProbe {
  return {
    id: rec.id,
    company_name: rec.company_name,
    city: rec.city,
    phone: rec.phone,
    website: rec.website,
    address_full: rec.address_full,
  }
}

export function probeFromProvider(p: Provider): ProviderOverlapProbe {
  return {
    id: p.id,
    company_name: p.company_name,
    city: p.city,
    phone: p.phone,
    website: p.website,
    address_full: (p as Provider & { address_full?: string }).address_full,
  }
}

function websiteKey(p: ProviderOverlapProbe): string | null {
  if (!p.website) return null
  const w = normalizeWebsite(p.website)
  return w ? w.toLowerCase() : null
}

function phoneKey(p: ProviderOverlapProbe): string | null {
  const d = normalizePhone(p.phone).replace(/\D/g, '')
  return d.length >= 10 ? d : null
}

/** Address + name only (legacy helper) — use listing merge key for destructive merges. */
function addressNameKey(p: ProviderOverlapProbe): string | null {
  const addr = p.address_full?.trim()
  if (!addr) return null
  const name = normalizeBusinessName(p.company_name)
  if (!name) return null
  return `${normalizeAddress(addr)}|${name}`
}

function addressOnlyKey(p: ProviderOverlapProbe): string | null {
  const addr = p.address_full?.trim()
  if (!addr) return null
  const a = normalizeAddress(addr)
  return a.length > 3 ? a : null
}

/**
 * Destructive merge key: same operational geography + same normalized listing identity.
 * Rows without `address_full` do not merge automatically — preserves multi-node brands.
 */
export function strictListingIdentityMergeKey(rec: ProviderIngestRecord): string | null {
  return strictListingIdentityMergeKeyFromProbe(probeFromIngestRecord(rec))
}

export function strictListingIdentityMergeKeyFromProbe(p: ProviderOverlapProbe): string | null {
  const addr = p.address_full?.trim()
  if (!addr) return null
  const name = normalizeBusinessName(p.company_name)
  if (!name) return null
  const city = normalizeCity(p.city).trim()
  if (!city) return null
  return `${city.toLowerCase()}|${normalizeAddress(addr)}|${name}`
}

/**
 * Classify relationship between two operational service nodes.
 * Shared website/phone alone never implies duplicate — only organizational or ambiguity signals.
 */
export function classifyOperationalOverlapPair(
  a: ProviderOverlapProbe,
  b: ProviderOverlapProbe,
): OrganizationalOverlapSignal | null {
  const cityA = normalizeCity(a.city)
  const cityB = normalizeCity(b.city)
  const sameCity = cityA.toLowerCase() === cityB.toLowerCase()

  const wa = websiteKey(a)
  const wb = websiteKey(b)
  const sharedWeb = Boolean(wa && wb && wa === wb)

  const pa = phoneKey(a)
  const pb = phoneKey(b)
  const sharedPhone = Boolean(pa && pb && pa === pb)

  const idKeyA = strictListingIdentityMergeKeyFromProbe(a)
  const idKeyB = strictListingIdentityMergeKeyFromProbe(b)
  const sameListingIdentity = Boolean(idKeyA && idKeyB && idKeyA === idKeyB)

  const nameA = normalizeBusinessName(a.company_name)
  const nameB = normalizeBusinessName(b.company_name)
  const sharedBrandName = nameA.length > 2 && nameA === nameB

  const addrNameA = addressNameKey(a)
  const addrNameB = addressNameKey(b)
  const addrOnlyA = addressOnlyKey(a)
  const addrOnlyB = addressOnlyKey(b)

  const base = {
    providerIds: [a.id, b.id] as [string, string],
    providerNames: [a.company_name, b.company_name] as [string, string],
    cities: [cityA, cityB] as [string, string],
  }

  if (sameListingIdentity) {
    return {
      ...base,
      relationship_type: 'probable_duplicate',
      overlap_category: 'true_duplicate_risk',
      overlap_confidence: 'high',
      matchingPhone: sharedPhone ? pa : null,
      matchingWebsite: sharedWeb ? wa : null,
      notes:
        'Identical operational geography and listing identity (city + normalized address + name). Only tier eligible for automatic merge — verify before deleting rows.',
    }
  }

  if (sharedWeb && !sameCity) {
    return {
      ...base,
      relationship_type: 'multi_city_operator',
      overlap_category: 'organizational_overlap',
      overlap_confidence: 'high',
      matchingPhone: null,
      matchingWebsite: wa,
      notes:
        'Shared website across different cities — distinct operational service nodes; do not collapse.',
    }
  }

  if (sharedPhone && !sameCity) {
    return {
      ...base,
      relationship_type: 'shared_phone',
      overlap_category: 'operational_ambiguity',
      overlap_confidence: 'medium',
      matchingPhone: pa,
      matchingWebsite: null,
      notes:
        'Shared dispatch number across cities — related operations possible; preserve geographic nodes unless listing identity matches.',
    }
  }

  if (sharedWeb && sameCity) {
    return {
      ...base,
      relationship_type: 'shared_website',
      overlap_category: 'organizational_overlap',
      overlap_confidence: 'medium',
      matchingPhone: sharedPhone ? pa : null,
      matchingWebsite: wa,
      notes:
        'Shared website within the same city — may be multiple listings or nodes; merge only if listing identity key matches.',
    }
  }

  if (sharedPhone && sameCity) {
    return {
      ...base,
      relationship_type: 'shared_phone',
      overlap_category: 'operational_ambiguity',
      overlap_confidence: 'medium',
      matchingPhone: pa,
      matchingWebsite: null,
      notes:
        'Shared phone within the same city — confirm regional structure before any merge.',
    }
  }

  if (
    sameCity &&
    addrOnlyA &&
    addrOnlyB &&
    addrOnlyA === addrOnlyB &&
    !sharedBrandName
  ) {
    return {
      ...base,
      relationship_type: 'same_address',
      overlap_category: 'operational_ambiguity',
      overlap_confidence: 'medium',
      matchingPhone: null,
      matchingWebsite: null,
      notes:
        'Same normalized street address with different business labels — review source rows; not an automatic duplicate.',
    }
  }

  if (sharedBrandName && !sameCity && !sharedWeb) {
    return {
      ...base,
      relationship_type: 'shared_brand',
      overlap_category: 'organizational_overlap',
      overlap_confidence: 'low',
      matchingPhone: null,
      matchingWebsite: null,
      notes:
        'Normalized brand match across cities without shared web — common for regional operators; keep nodes separate.',
    }
  }

  if (addrNameA && addrNameB && addrNameA === addrNameB && !sameCity) {
    return {
      ...base,
      relationship_type: 'same_address',
      overlap_category: 'operational_ambiguity',
      overlap_confidence: 'low',
      matchingPhone: null,
      matchingWebsite: null,
      notes:
        'Same address+name signature across different cities — likely data entry variance; verify against operational geography.',
    }
  }

  return null
}

export function collectPreDedupeOrganizationalOverlaps(
  records: ProviderIngestRecord[],
): OrganizationalOverlapReviewRecord[] {
  const out: OrganizationalOverlapReviewRecord[] = []
  const seen = new Set<string>()

  for (let i = 0; i < records.length; i++) {
    for (let j = i + 1; j < records.length; j++) {
      const a = probeFromIngestRecord(records[i])
      const b = probeFromIngestRecord(records[j])
      const pairKey = [a.id, b.id].sort().join('\0')
      if (seen.has(pairKey)) continue

      const signal = classifyOperationalOverlapPair(a, b)
      if (!signal) continue

      seen.add(pairKey)
      out.push({ ...signal, source: 'pre_dedupe_cartesian_scan' })
    }
  }

  return out
}

export function collectEnrichedOrganizationalOverlaps(
  providers: Provider[],
): OrganizationalOverlapReviewRecord[] {
  const out: OrganizationalOverlapReviewRecord[] = []
  const seen = new Set<string>()

  for (let i = 0; i < providers.length; i++) {
    for (let j = i + 1; j < providers.length; j++) {
      const a = probeFromProvider(providers[i])
      const b = probeFromProvider(providers[j])
      const pairKey = [a.id, b.id].sort().join('\0')
      if (seen.has(pairKey)) continue

      const signal = classifyOperationalOverlapPair(a, b)
      if (!signal) continue

      seen.add(pairKey)
      out.push({ ...signal, source: 'post_enrichment_pair_scan' })
    }
  }

  return out
}
