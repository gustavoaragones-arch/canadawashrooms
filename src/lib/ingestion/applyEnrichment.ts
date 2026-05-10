import { enrichProvider } from '../enrichment/enrichProvider'
import type { Provider, ProviderRaw } from '../../types/provider'
import { dedupeProviders } from './dedupeProviders'
import { normalizeOutscraperRecord } from './normalizeOutscraperRecord'
import { parseOutscraperCsv } from './parseOutscraperCsv'
import type { ProviderIngestRecord } from './types'

/** Canonical enrichment pass for curated JSON rows. */
export function applyEnrichmentPipeline(rawRows: ProviderRaw[]): Provider[] {
  return rawRows.map(enrichProvider)
}

/**
 * Full local ingest: CSV → normalized rows → dedupe → enrich.
 * Wire this in Node scripts or CI when importing Outscraper drops.
 */
export function ingestOutscraperCsvWorkflow(csvText: string): Provider[] {
  const rows = parseOutscraperCsv(csvText)
  const candidates: ProviderIngestRecord[] = []
  for (const row of rows) {
    const n = normalizeOutscraperRecord(row)
    if (n) candidates.push(n)
  }
  const deduped = dedupeProviders(candidates)
  return applyEnrichmentPipeline(deduped)
}
