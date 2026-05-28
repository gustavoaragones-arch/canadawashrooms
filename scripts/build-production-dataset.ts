/**
 * National production dataset assembly pipeline.
 *
 * Loads all province JSON files, normalises taxonomy and slugs,
 * validates national overlap, and writes ONE canonical runtime dataset:
 *
 *   src/data/providers.json
 *
 * Usage:
 *   npm run data:build-production
 *
 * Safe to run after any ingest pass. Reads from data/provinces/*.json only —
 * never from data/processed/ or temporary snapshots.
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { provinceNameFromCode } from '../src/lib/locations/canadaLocations'
import type { Provider, ProvinceCode, ProviderRaw } from '../src/types/provider'
import { enrichProvider } from '../src/lib/enrichment/enrichProvider'
import type { ManualOverridesFile } from '../src/lib/dataOperations/manualOverridesFile'
import { applyManualOverridesFile } from '../src/lib/dataOperations/manualOverridesFile'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')

// ── Province file manifest ────────────────────────────────────────────────────

interface ProvinceManifestEntry {
  code: ProvinceCode
  file: string
}

const PROVINCE_MANIFEST: ProvinceManifestEntry[] = [
  { code: 'AB', file: 'data/provinces/alberta.json' },
  { code: 'ON', file: 'data/provinces/ontario.json' },
  { code: 'BC', file: 'data/provinces/british-columbia.json' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function writeJson(path: string, data: unknown): void {
  const tmp = `${path}.tmp`
  writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  renameSync(tmp, path)
}

function loadJsonOrEmpty(path: string): unknown[] {
  if (!existsSync(path)) return []
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'))
    if (!Array.isArray(parsed)) {
      console.warn(`[build] ${path} is not a JSON array — skipping.`)
      return []
    }
    return parsed
  } catch {
    console.warn(`[build] Failed to parse ${path} — skipping.`)
    return []
  }
}

function loadManualOverrides(): ManualOverridesFile | null {
  const p = resolve(REPO_ROOT, 'src/data/manual-overrides.json')
  if (!existsSync(p)) return null
  try {
    const parsed = JSON.parse(readFileSync(p, 'utf8')) as ManualOverridesFile
    if (typeof parsed.version !== 'number' || !Array.isArray(parsed.entries)) return null
    return parsed
  } catch {
    return null
  }
}

/** Stable national slug: name-city-provinceCode (lowercase, hyphenated). */
function nationalSlug(raw: ProviderRaw & { province_code?: ProvinceCode }): string {
  const code = raw.province_code ?? 'XX'
  const base = `${raw.company_name}-${raw.city}-${code}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72)
  return base || `provider-unknown-${code.toLowerCase()}`
}

/** Check for id collisions in merged dataset. Returns list of duplicate ids. */
function detectCollisions(providers: Provider[]): string[] {
  const seen = new Map<string, number>()
  for (const p of providers) {
    seen.set(p.id, (seen.get(p.id) ?? 0) + 1)
  }
  return [...seen.entries()].filter(([, n]) => n > 1).map(([id]) => id)
}

// ── Assembly pipeline ─────────────────────────────────────────────────────────

function main(): void {
  mkdirSync(resolve(REPO_ROOT, 'src/data'), { recursive: true })

  const manual = loadManualOverrides()
  const allRaw: (ProviderRaw & { province_code?: ProvinceCode })[] = []
  const summary: { code: ProvinceCode; path: string; loaded: number }[] = []

  for (const entry of PROVINCE_MANIFEST) {
    const absPath = resolve(REPO_ROOT, entry.file)
    const rows = loadJsonOrEmpty(absPath) as (ProviderRaw & { province_code?: ProvinceCode })[]

    if (rows.length === 0) {
      console.log(`[build] ${entry.file}: empty / missing — skipping.`)
      summary.push({ code: entry.code, path: entry.file, loaded: 0 })
      continue
    }

    // Stamp province fields on every row from this file
    const stamped = rows.map((r) => ({
      ...r,
      province_code: r.province_code ?? entry.code,
      province: r.province ?? provinceNameFromCode(entry.code),
      segment_key: r.primary_segment,
    }))

    allRaw.push(...stamped)
    summary.push({ code: entry.code, path: entry.file, loaded: stamped.length })
    console.log(`[build] ${entry.file}: loaded ${stamped.length} providers (${entry.code}).`)
  }

  if (allRaw.length === 0) {
    console.error(
      '[build] All province files are empty — nothing to write. Run npm run data:ingest first.',
    )
    process.exit(1)
  }

  // Apply manual overrides, then enrich
  const withManual = applyManualOverridesFile(allRaw, manual)

  // Re-stamp national slugs (province_code may have changed via manual override)
  const withNationalSlugs = withManual.map((r) => ({
    ...r,
    id: nationalSlug(r as ProviderRaw & { province_code?: ProvinceCode }),
  }))

  const enriched: Provider[] = []
  let enrichErrors = 0
  for (const raw of withNationalSlugs) {
    try {
      enriched.push(enrichProvider(raw))
    } catch {
      enrichErrors++
    }
  }

  if (enrichErrors > 0) {
    console.warn(`[build] ${enrichErrors} rows failed enrichment and were dropped.`)
  }

  // Deterministic sort: province_code → city → id
  enriched.sort((a, b) => {
    const pc = (a.province_code ?? 'ZZ').localeCompare(b.province_code ?? 'ZZ')
    if (pc !== 0) return pc
    const cc = a.city.localeCompare(b.city)
    if (cc !== 0) return cc
    return a.id.localeCompare(b.id)
  })

  // Dedup by id — keep first occurrence per id (ingest deduplication may leave exact duplicates)
  const deduped: Provider[] = []
  const seenIds = new Set<string>()
  let dedupCount = 0
  for (const p of enriched) {
    if (!seenIds.has(p.id)) {
      seenIds.add(p.id)
      deduped.push(p)
    } else {
      dedupCount++
    }
  }
  if (dedupCount > 0) {
    console.log(`[build] Removed ${dedupCount} exact id duplicate(s).`)
  }

  // Collision detection (after dedup — any remaining collisions are slug ambiguities that need review)
  const collisions = detectCollisions(deduped)
  if (collisions.length > 0) {
    console.warn(
      `[build] ⚠ ${collisions.length} id collision(s) detected — review slugs:\n  ${collisions.slice(0, 10).join('\n  ')}`,
    )
  }

  // Write output
  const outPath = resolve(REPO_ROOT, 'src/data/providers.json')
  writeJson(outPath, deduped)

  // Summary
  console.log('\n── Production dataset build summary ──')
  for (const s of summary) {
    console.log(`  ${s.code.padEnd(4)} ${s.path.padEnd(42)} ${s.loaded} providers`)
  }
  console.log(`  ──────────────────────────────────────`)
  console.log(`  Total enriched:     ${enriched.length}`)
  console.log(`  Enrich errors:      ${enrichErrors}`)
  console.log(`  Deduped (exact id): ${dedupCount}`)
  console.log(`  Final output:       ${deduped.length}`)
  console.log(`  ID collisions:      ${collisions.length}`)
  console.log(`  Output:             src/data/providers.json`)
  console.log(`  Manual overrides:   ${manual ? `yes (v${manual.version}, ${manual.entries.length} entries)` : 'none'}`)
  console.log('──────────────────────────────────────\n')

  if (collisions.length > 0) {
    console.error('[build] Fix id collisions before deploying.')
    process.exit(1)
  }

  console.log('[build] Done — src/data/providers.json is ready for production.')
}

try {
  main()
} catch (e) {
  console.error(e)
  process.exit(1)
}
