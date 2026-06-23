/**
 * Local Outscraper CSV → validated snapshot + QA artifacts.
 * Does not modify src/data/providers.json — manual promotion only.
 *
 * Usage: npm run data:ingest -- path/to/export.csv
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ProvinceCode } from '../src/types/provider'
import { inferProvinceCodeFromFilename } from '../src/lib/locations/canadaLocations'

import type { ManualOverridesFile } from '../src/lib/dataOperations/manualOverridesFile'
import { buildCurationSweepReport } from '../src/lib/dataOperations/curationReports'
import type { QaSummaryReport } from '../src/lib/dataOperations/qaSummary'
import { buildIngestArtifacts, runOutscraperIngestPipeline } from '../src/lib/dataOperations/runOutscraperIngest'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')

function snapshotStamp(d = new Date()): string {
  return d.toISOString().replace(/:/g, '-').replace(/\.\d{3}Z$/, 'Z')
}

function writeJson(path: string, data: unknown) {
  const tmp = `${path}.tmp`
  writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  renameSync(tmp, path)
}

function loadManualOverrides(root: string): ManualOverridesFile | null {
  const p = resolve(root, 'src/data/manual-overrides.json')
  if (!existsSync(p)) {
    console.warn('[ingest] No src/data/manual-overrides.json — continuing without analyst overrides.')
    return null
  }
  const parsed = JSON.parse(readFileSync(p, 'utf8')) as ManualOverridesFile
  if (typeof parsed.version !== 'number' || !Array.isArray(parsed.entries)) {
    throw new Error('Invalid manual-overrides.json: expected { version: number, entries: [...] }')
  }
  return parsed
}

function printConsoleSummary(qa: QaSummaryReport) {
  const lines = [
    '── Ingest QA summary ──',
    `Providers (enriched): ${qa.totalProviders}`,
    `Organizational overlap pairs (review): ${qa.organizationalOverlapReviewTotal}`,
    `  · true duplicate risk (listing identity): ${qa.trueDuplicateRiskOverlaps}`,
    `  · organizational overlap: ${qa.organizationalOverlapSignals}`,
    `  · operational ambiguity: ${qa.operationalAmbiguityOverlaps}`,
    `Weak metadata rows: ${qa.weakMetadataProviders}`,
    `Missing websites: ${qa.missingWebsites}`,
    `Missing phones: ${qa.missingPhones}`,
    `Low segment confidence (unlocked): ${qa.lowConfidenceSegments}`,
    `Thin enrichment: ${qa.thinEnrichmentProviders}`,
    `Skipped normalize rows: ${qa.skippedNormalizationRows}`,
    `Malformed CSV rows: ${qa.malformedCsvRows}`,
    `Normalized rows pre-dedupe: ${qa.normalizedRowCountPreDedupe}`,
    '──────────────────────',
  ]
  console.log(lines.join('\n'))
}

const PROVINCE_FILE_MAP: Record<ProvinceCode, string> = {
  AB: 'data/provinces/alberta.json',
  SK: 'data/provinces/saskatchewan.json',
  ON: 'data/provinces/ontario.json',
  BC: 'data/provinces/british-columbia.json',
}

function ensureDirs(root: string) {
  for (const rel of [
    'data/raw',
    'data/processed',
    'data/snapshots',
    'data/reports',
    'data/provinces',
  ]) {
    mkdirSync(resolve(root, rel), { recursive: true })
  }
}

function main() {
  const csvArg = process.argv[2]
  if (!csvArg) {
    console.error('Usage: npm run data:ingest -- <path-to-outscraper.csv>')
    process.exit(2)
  }

  const csvPath = resolve(process.cwd(), csvArg)
  if (!existsSync(csvPath)) {
    console.error(`[ingest] CSV not found: ${csvPath}`)
    process.exit(2)
  }

  ensureDirs(REPO_ROOT)

  const csvText = readFileSync(csvPath, 'utf8')
  const manual = loadManualOverrides(REPO_ROOT)
  const sourceName = basename(csvPath)

  let ingest
  try {
    ingest = runOutscraperIngestPipeline({
      csvText,
      manualOverrides: manual,
      sourceFilename: sourceName,
    })
  } catch (e) {
    console.error('[ingest] Pipeline failed — no snapshot written.')
    console.error(e)
    process.exit(1)
  }

  const stamp = snapshotStamp(new Date(ingest.generatedAt))
  const artifacts = buildIngestArtifacts({
    ingest,
    sourceCsv: sourceName,
  })

  const provinceCode: ProvinceCode =
    ingest.inferredProvinceCode ?? inferProvinceCodeFromFilename(sourceName) ?? 'AB'
  const provinceFile = PROVINCE_FILE_MAP[provinceCode]

  const snapPath = resolve(REPO_ROOT, `data/snapshots/providers.${stamp}.json`)
  const processedPath = resolve(REPO_ROOT, 'data/processed/providers.normalized.json')
  const qaPath = resolve(REPO_ROOT, 'data/reports/qa-report.json')
  const qaStamped = resolve(REPO_ROOT, `data/reports/qa-report.${stamp}.json`)
  const overlapPath = resolve(REPO_ROOT, 'data/reports/organizational-overlap-review.json')
  const overlapStamped = resolve(REPO_ROOT, `data/reports/organizational-overlap-review.${stamp}.json`)
  const weakPath = resolve(REPO_ROOT, 'data/reports/weak-metadata-report.json')
  const weakStamped = resolve(REPO_ROOT, `data/reports/weak-metadata-report.${stamp}.json`)
  const revPath = resolve(REPO_ROOT, 'data/reports/review-signal-summary.json')
  const revStamped = resolve(REPO_ROOT, `data/reports/review-signal-summary.${stamp}.json`)
  const curationPath = resolve(REPO_ROOT, `data/reports/curation-sweep.${stamp}.json`)

  writeJson(snapPath, ingest.enriched)
  writeJson(processedPath, ingest.enriched)
  writeJson(resolve(REPO_ROOT, provinceFile), ingest.enriched)
  console.log(`[ingest] Province dataset: ${provinceFile} (${provinceCode} — ${ingest.enriched.length} providers)`)
  writeJson(qaPath, artifacts.qa)
  writeJson(qaStamped, artifacts.qa)
  writeJson(overlapPath, artifacts.organizationalOverlapReview)
  writeJson(overlapStamped, artifacts.organizationalOverlapReview)
  writeJson(weakPath, artifacts.weakMetadata)
  writeJson(weakStamped, artifacts.weakMetadata)
  writeJson(revPath, artifacts.reviewSignals)
  writeJson(revStamped, artifacts.reviewSignals)

  const curation = buildCurationSweepReport(ingest.enriched, ingest.generatedAt)
  writeJson(curationPath, curation)

  printConsoleSummary(artifacts.qa)

  if (ingest.normalizeDiagnostics.skippedRows.length > 0) {
    console.warn(
      `[ingest] ${ingest.normalizeDiagnostics.skippedRows.length} rows skipped in normalize — see QA counts.`,
    )
  }

  if (ingest.csvMalformedRowCount > 0) {
    console.error(
      `[ingest] ${ingest.csvMalformedRowCount} malformed CSV row(s) isolated — fix export or delimiter quoting.`,
    )
    process.exit(1)
  }

  console.log(`[ingest] Snapshot: ${snapPath}`)
  console.log(`[ingest] Processed mirror: ${processedPath}`)
  console.log(`[ingest] Reports written under data/reports/ (latest + stamped copies)`)
}

try {
  main()
} catch (e) {
  console.error(e)
  process.exit(1)
}
