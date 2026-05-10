import { normalizeAddress } from '../normalize/address'
import { normalizeBusinessName } from '../normalize/businessName'
import { normalizePhone } from '../normalize/phone'
import { normalizeWebsite } from '../normalize/website'
import type { ProviderIngestRecord } from './types'

export type DuplicateConfidenceLevel = 'high' | 'medium'

export type DuplicateSimilarityReason =
  | 'shared_normalized_website'
  | 'shared_normalized_phone'
  | 'shared_address_and_name'

export interface DuplicateReviewCandidate {
  providerIds: [string, string]
  providerNames: [string, string]
  matchingPhone: string | null
  matchingWebsite: string | null
  similarityReason: DuplicateSimilarityReason
  confidenceLevel: DuplicateConfidenceLevel
}

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

function addressNameKey(rec: ProviderIngestRecord): string | null {
  const addr = rec.address_full?.trim()
  if (!addr) return null
  const name = normalizeBusinessName(rec.company_name)
  if (!name) return null
  return `${normalizeAddress(addr)}|${name}`
}

/**
 * Pre-merge duplicate candidates for human review — same tier order as production dedupe (website → phone → address+name).
 * Emits at most one card per pair (strongest matching signal first).
 */
export function collectPreDedupeDuplicateCandidates(
  records: ProviderIngestRecord[],
): DuplicateReviewCandidate[] {
  const out: DuplicateReviewCandidate[] = []
  const seen = new Set<string>()

  for (let i = 0; i < records.length; i++) {
    for (let j = i + 1; j < records.length; j++) {
      const a = records[i]
      const b = records[j]
      const pairKey = [a.id, b.id].sort().join('\0')
      if (seen.has(pairKey)) continue

      const wa = websiteKey(a)
      const wb = websiteKey(b)
      const pa = phoneKey(a)
      const pb = phoneKey(b)
      const aa = addressNameKey(a)
      const ab = addressNameKey(b)

      let similarityReason: DuplicateSimilarityReason | null = null
      let confidenceLevel: DuplicateConfidenceLevel = 'medium'
      let matchingPhone: string | null = null
      let matchingWebsite: string | null = null

      if (wa && wb && wa === wb) {
        similarityReason = 'shared_normalized_website'
        confidenceLevel = 'high'
        matchingWebsite = wa
      } else if (pa && pb && pa === pb) {
        similarityReason = 'shared_normalized_phone'
        confidenceLevel = 'high'
        matchingPhone = pa
      } else if (aa && ab && aa === ab) {
        similarityReason = 'shared_address_and_name'
        confidenceLevel = 'medium'
      }

      if (!similarityReason) continue

      seen.add(pairKey)
      out.push({
        providerIds: [a.id, b.id],
        providerNames: [a.company_name, b.company_name],
        matchingPhone,
        matchingWebsite,
        similarityReason,
        confidenceLevel,
      })
    }
  }

  return out
}
