/**
 * Read a provider snapshot JSON and emit curation queue JSON (+ stdout summary).
 * Accepts enriched snapshots from `data:ingest` (preferred) or raw rows (auto-enriched).
 *
 * Usage: npm run data:curation -- [path/to/providers.json]
 * Default: data/processed/providers.normalized.json
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildCurationSweepReport } from '../src/lib/dataOperations/curationReports'
import { enrichProvider } from '../src/lib/enrichment/enrichProvider'
import type { Provider, ProviderRaw } from '../src/types/provider'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')

function snapshotStamp(d = new Date()): string {
  return d.toISOString().replace(/:/g, '-').replace(/\.\d{3}Z$/, 'Z')
}

function looksEnriched(row: unknown): row is Provider {
  if (typeof row !== 'object' || row === null) return false
  const r = row as Record<string, unknown>
  return Array.isArray(r.capabilities) && typeof r.primary_segment_confidence === 'number'
}

function main() {
  const arg = process.argv[2]
  const jsonPath = resolve(process.cwd(), arg ?? 'data/processed/providers.normalized.json')

  if (!existsSync(jsonPath)) {
    console.error(`[curation] File not found: ${jsonPath}`)
    process.exit(2)
  }

  const parsed = JSON.parse(readFileSync(jsonPath, 'utf8')) as unknown
  if (!Array.isArray(parsed) || parsed.length === 0) {
    console.error('[curation] Expected non-empty JSON array.')
    process.exit(2)
  }

  const enriched: Provider[] = looksEnriched(parsed[0])
    ? (parsed as Provider[])
    : (parsed as ProviderRaw[]).map(enrichProvider)

  const generatedAt = new Date().toISOString()
  const report = buildCurationSweepReport(enriched, generatedAt)

  const stamp = snapshotStamp(new Date(generatedAt))
  const outPath = resolve(REPO_ROOT, `data/reports/curation-sweep.${stamp}.json`)
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  console.log('── Curation sweep ──')
  console.log(`Low confidence (unlocked): ${report.lowConfidenceProviders.length}`)
  console.log(`No website: ${report.withoutWebsites.length}`)
  console.log(`Thin capability inference: ${report.thinCapabilityInference.length}`)
  console.log(`Segment spread heuristic: ${report.conflictingSegmentHeuristic.length}`)
  console.log(`Written: ${outPath}`)
}

main()
