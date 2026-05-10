import { normalizeAddress } from '../normalize/address'
import { normalizeBusinessName } from '../normalize/businessName'
import { normalizePhone } from '../normalize/phone'
import { normalizeWebsite } from '../normalize/website'
import { mergeProviders } from './mergeProviders'
import type { ProviderIngestRecord } from './types'

function websiteKey(rec: ProviderIngestRecord): string | null {
  if (!rec.website) return null
  const w = normalizeWebsite(rec.website)
  return w ? w.toLowerCase() : null
}

function phoneKey(rec: ProviderIngestRecord): string | null {
  if (!rec.phone) return null
  const d = normalizePhone(rec.phone).replace(/\D/g, '')
  return d.length >= 10 ? d : null
}

/** Address + name composite — never used without both parts present. */
function addressNameKey(rec: ProviderIngestRecord): string | null {
  const addr = rec.address_full?.trim()
  if (!addr) return null
  const name = normalizeBusinessName(rec.company_name)
  if (!name) return null
  return `${normalizeAddress(addr)}|${name}`
}

/**
 * Dedupe priority: website → phone → normalized address+name.
 * Name alone is never a dedupe key (controlled overlap allowed).
 */
export function dedupeProviders(records: ProviderIngestRecord[]): ProviderIngestRecord[] {
  const sorted = [...records].sort((a, b) => b.review_count - a.review_count)
  const merged: ProviderIngestRecord[] = []

  function findMergeTarget(rec: ProviderIngestRecord): number | null {
    const wk = websiteKey(rec)
    const pk = phoneKey(rec)
    const ank = addressNameKey(rec)

    for (let i = 0; i < merged.length; i++) {
      const ex = merged[i]
      if (wk && websiteKey(ex) === wk) return i
      if (pk && phoneKey(ex) === pk) return i
      if (ank && addressNameKey(ex) === ank) return i
    }
    return null
  }

  for (const rec of sorted) {
    const idx = findMergeTarget(rec)
    if (idx !== null) merged[idx] = mergeProviders(merged[idx], rec)
    else merged.push(rec)
  }

  return merged
}
