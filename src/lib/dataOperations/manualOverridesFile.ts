import type { ManualEnrichmentOverrides, ProviderRaw } from '../../types/provider'

/** Analyst merge layer — consumed by runtime (`providersDataset`) and `scripts/ingest-outscraper.ts`. */
export interface ManualOverridesFile {
  version: number
  entries: Array<{
    id: string
    patch: ManualEnrichmentOverrides
  }>
}

/** Merge analyst patches onto ingest rows before enrichment — keys in patch win over row-level manual fields. */
export function applyManualOverridesFile(
  rows: ProviderRaw[],
  file: ManualOverridesFile | null,
): ProviderRaw[] {
  if (!file?.entries?.length) return rows
  const map = new Map(file.entries.map((e) => [e.id, e.patch]))
  return rows.map((r) => {
    const patch = map.get(r.id)
    if (!patch) return r
    return {
      ...r,
      manual_enrichment_overrides: {
        ...r.manual_enrichment_overrides,
        ...patch,
      },
    }
  })
}
