import { mergeProviders } from './mergeProviders'
import { strictListingIdentityMergeKey } from './organizationalOverlap'
import type { ProviderIngestRecord } from './types'

/**
 * Relationship-aware collapse: merges only when listing identity matches
 * (same operational geography + normalized address + normalized business name).
 *
 * Shared website or phone alone never merges — multi-city operational nodes stay intact.
 */
export function dedupeProviders(records: ProviderIngestRecord[]): ProviderIngestRecord[] {
  const sorted = [...records].sort((a, b) => b.review_count - a.review_count)
  const merged: ProviderIngestRecord[] = []

  function findMergeTarget(rec: ProviderIngestRecord): number | null {
    const key = strictListingIdentityMergeKey(rec)
    if (!key) return null

    for (let i = 0; i < merged.length; i++) {
      const k2 = strictListingIdentityMergeKey(merged[i])
      if (k2 === key) return i
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
