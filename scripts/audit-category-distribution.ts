/**
 * UX-10/11 — Category inflation & accuracy audit.
 * Run: npx tsx scripts/audit-category-distribution.ts
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import providersJson from '../src/data/providers.json' assert { type: 'json' }
import { PUBLIC_CATEGORY_LABELS } from '../src/lib/taxonomy/publicCategoryMapper'
import type { PrimarySegment, Provider, ProvinceCode } from '../src/types/provider'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const BASELINE_PATH = resolve(__dirname, 'reports/category-baseline-ux10.json')

const providers = providersJson as Provider[]

const CATEGORIES: PrimarySegment[] = [
  'general',
  'construction',
  'event',
  'oilfield',
  'site_services',
]

const PROVINCES: ProvinceCode[] = ['AB', 'SK', 'ON', 'BC']

const OVERLAP_CITIES = [
  'Calgary',
  'Edmonton',
  'Toronto',
  'Mississauga',
  'Saskatoon',
  'Regina',
  'Surrey',
  'Vancouver',
]

const OVERLAP_SEGMENTS: PrimarySegment[] = ['construction', 'event', 'site_services']

function pct(n: number, total: number): string {
  return total > 0 ? `${((n / total) * 100).toFixed(1)}%` : '0.0%'
}

function categoryCount(provider: Provider): number {
  return provider.public_categories?.length ?? 0
}

function hasCategory(provider: Provider, cat: PrimarySegment): boolean {
  return provider.public_categories?.includes(cat) ?? false
}

/** Trace why each category would be assigned under current mapper rules. */
export function explainCategorySignals(provider: Provider): Record<PrimarySegment, string[]> {
  const reasons: Record<PrimarySegment, string[]> = {
    general: [],
    construction: [],
    event: [],
    oilfield: [],
    site_services: [],
  }

  reasons.general.push('default portable sanitation operator')

  if (provider.construction_ready) reasons.construction.push('construction_ready=true')
  if (provider.crane_liftable) reasons.construction.push('crane_liftable=true')
  if (provider.weekly_service) reasons.construction.push('weekly_service=true')

  if (provider.luxury_units) reasons.event.push('luxury_units=true')
  if (provider.luxury_trailers) reasons.event.push('luxury_trailers=true')
  if (provider.flush_toilets) reasons.event.push('flush_toilets=true')
  if (provider.wedding_friendly) reasons.event.push('wedding_friendly=true')

  if (provider.primary_segment === 'oilfield') reasons.oilfield.push('primary_segment=oilfield')
  if (provider.oilfield_ready) reasons.oilfield.push('oilfield_ready=true')
  if (provider.remote_support) reasons.oilfield.push('remote_support=true')
  if (provider.camp_support) reasons.oilfield.push('camp_support=true')
  if (provider.remote_logistics) reasons.oilfield.push('remote_logistics=true')

  if (provider.septic_service) reasons.site_services.push('septic_service=true')
  if (provider.roll_off_disposal) reasons.site_services.push('roll_off_disposal=true')

  return reasons
}

function jaccard(a: Set<string>, b: Set<string>): number {
  const intersection = [...a].filter((id) => b.has(id)).length
  const union = new Set([...a, ...b]).size
  return union > 0 ? (intersection / union) * 100 : 0
}

function providerIdsInCityCategory(city: string, segment: PrimarySegment): Set<string> {
  return new Set(
    providers
      .filter(
        (p) =>
          p.city.toLowerCase() === city.toLowerCase() && hasCategory(p, segment),
      )
      .map((p) => p.id),
  )
}

console.log('\n════════════════════════════════════════════════════════════')
console.log('  UX-10 — CATEGORY INFLATION & ACCURACY AUDIT')
console.log('════════════════════════════════════════════════════════════')
console.log(`Dataset: ${providers.length} providers (AB + SK + ON + BC)\n`)

// ── STEP 1: Category count distribution ─────────────────────────────────────
console.log('STEP 1 — CATEGORY COUNT DISTRIBUTION')
console.log('─────────────────────────────────────')
const countBuckets = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, none: 0 }
for (const p of providers) {
  const n = categoryCount(p)
  if (n === 0) countBuckets.none++
  else if (n >= 1 && n <= 5) countBuckets[n as 1 | 2 | 3 | 4 | 5]++
}
for (const n of [1, 2, 3, 4, 5] as const) {
  console.log(`${n} categor${n === 1 ? 'y' : 'ies'} → ${countBuckets[n]} providers (${pct(countBuckets[n], providers.length)})`)
}
if (countBuckets.none) console.log(`0 categories → ${countBuckets.none} providers`)

const fourPlus = countBuckets[4] + countBuckets[5]
const inflationFlag = fourPlus / providers.length > 0.25
console.log(`\nProviders with 4+ categories: ${fourPlus} (${pct(fourPlus, providers.length)})`)
console.log(`Inflation flag (>25% at 4+ categories): ${inflationFlag ? '⚠ YES — CATEGORY INFLATION DETECTED' : 'no'}`)

// ── STEP 2: Category size report ────────────────────────────────────────────
console.log('\nSTEP 2 — CATEGORY SIZE REPORT (NATIONAL)')
console.log('─────────────────────────────────────────')
for (const cat of CATEGORIES) {
  const count = providers.filter((p) => hasCategory(p, cat)).length
  const bar = '█'.repeat(Math.min(60, Math.round(count / 2)))
  console.log(
    `${PUBLIC_CATEGORY_LABELS[cat].padEnd(32)} ${String(count).padStart(4)}  (${pct(count, providers.length).padStart(6)})  ${bar}`,
  )
}

console.log('\nPer-province category coverage:')
for (const prov of PROVINCES) {
  const provProviders = providers.filter((p) => p.province_code === prov)
  console.log(`\n  ${prov} — ${provProviders.length} providers`)
  for (const cat of CATEGORIES) {
    const count = provProviders.filter((p) => hasCategory(p, cat)).length
    console.log(`    ${PUBLIC_CATEGORY_LABELS[cat].padEnd(32)} ${String(count).padStart(3)}  (${pct(count, provProviders.length)})`)
  }
  const dist = { 3: 0, 4: 0, 5: 0 }
  for (const p of provProviders) {
    const n = categoryCount(p)
    if (n === 3 || n === 4 || n === 5) dist[n]++
  }
  console.log(`    Category counts: 3=${dist[3]}, 4=${dist[4]}, 5=${dist[5]}`)
}

// ── STEP 3: All-five providers ──────────────────────────────────────────────
console.log('\nSTEP 3 — PROVIDERS WITH ALL FIVE CATEGORIES')
console.log('─────────────────────────────────────────────')
const allFive = providers.filter((p) => categoryCount(p) === 5)
console.log(`Total: ${allFive.length} providers (${pct(allFive.length, providers.length)})\n`)

for (const p of allFive.slice(0, 15)) {
  const reasons = explainCategorySignals(p)
  console.log(`• ${p.company_name}`)
  console.log(`  ${p.city}, ${p.province_code} | primary: ${p.primary_segment}`)
  console.log(`  Categories: ${p.public_categories?.map((c) => PUBLIC_CATEGORY_LABELS[c]).join(' · ')}`)
  console.log('  Assignment signals:')
  for (const cat of CATEGORIES) {
    if (hasCategory(p, cat)) {
      console.log(`    ${PUBLIC_CATEGORY_LABELS[cat]}: ${reasons[cat].join('; ')}`)
    }
  }
  console.log('')
}
if (allFive.length > 15) {
  console.log(`  … and ${allFive.length - 15} more\n`)
}

console.log('STEP 4 — CATEGORY MAPPING LOGIC (UX-11 STRICT RULES)')
console.log('────────────────────────────────────────')
console.log(`
Priority at enrich time:
  1. curated_public_categories (CSV Yes/No columns)
  2. derivePublicCategories() strict signals

Strict rules (publicCategoryMapper.ts):
  GENERAL      → always (default discoverability)
  CONSTRUCTION → construction_ready | weekly_service | crane_liftable | jobsite language
  EVENT        → luxury_units | luxury_trailers | wedding_friendly | flush_toilets
  OILFIELD     → primary oilfield OR ≥2 of oilfield_ready, remote_logistics, camp_support, remote_support
  SITE_SERVICES→ septic_service | roll_off_disposal | explicit waste/septic/hydrovac listing language
`)

// Signal hit rates among category members
console.log('Signal hit rates among providers IN each category:')
const oilfieldMembers = providers.filter((p) => hasCategory(p, 'oilfield'))
const siteMembers = providers.filter((p) => hasCategory(p, 'site_services'))
const oilfieldHits = {
  oilfield_ready: oilfieldMembers.filter((p) => p.oilfield_ready).length,
  winterized: oilfieldMembers.filter((p) => p.winterized).length,
  heated: oilfieldMembers.filter((p) => p.heated).length,
  winter_service: oilfieldMembers.filter((p) => p.winter_service).length,
  remote_logistics: oilfieldMembers.filter((p) => p.remote_logistics).length,
  primary_oilfield: oilfieldMembers.filter((p) => p.primary_segment === 'oilfield').length,
}
const siteHits = {
  septic_service: siteMembers.filter((p) => p.septic_service).length,
  site_support: siteMembers.filter((p) => p.site_support).length,
  roll_off_disposal: siteMembers.filter((p) => p.roll_off_disposal).length,
  primary_site: siteMembers.filter((p) => p.primary_segment === 'site_services').length,
}
console.log('  Oilfield members:', oilfieldMembers.length, oilfieldHits)
console.log('  Site services members:', siteMembers.length, siteHits)

// ── STEP 6: City overlap ────────────────────────────────────────────────────
console.log('\nSTEP 6 — CATEGORY OVERLAP BY CITY (construction / event / site_services)')
console.log('────────────────────────────────────────────────────────────────────────')
let overlapFailures = 0
for (const city of OVERLAP_CITIES) {
  const pools = Object.fromEntries(
    OVERLAP_SEGMENTS.map((seg) => [seg, providerIdsInCityCategory(city, seg)]),
  ) as Record<PrimarySegment, Set<string>>

  const sizes = OVERLAP_SEGMENTS.map((s) => `${s}=${pools[s].size}`).join(', ')
  const ce = jaccard(pools.construction, pools.event)
  const cs = jaccard(pools.construction, pools.site_services)
  const es = jaccard(pools.event, pools.site_services)
  const maxOverlap = Math.max(ce, cs, es)
  const flag = maxOverlap > 70 ? '⚠' : ' '
  if (maxOverlap > 70) overlapFailures++

  console.log(`\n${flag} ${city} (${sizes})`)
  console.log(`    construction ∩ event:        ${ce.toFixed(1)}%`)
  console.log(`    construction ∩ site_services: ${cs.toFixed(1)}%`)
  console.log(`    event ∩ site_services:        ${es.toFixed(1)}%`)
}

console.log(`\nCities with >70% pairwise overlap: ${overlapFailures}/${OVERLAP_CITIES.length}`)

// ── STEP 7: National summary ────────────────────────────────────────────────
console.log('\nSTEP 7 — NATIONAL SUMMARY')
console.log('─────────────────────────')
console.log(`Providers with 4+ categories: ${fourPlus} (${pct(fourPlus, providers.length)})`)
console.log(`Providers with all 5 categories: ${allFive.length} (${pct(allFive.length, providers.length)})`)

const topCities = [...new Set(providers.map((p) => p.city))]
  .map((city) => ({
    city,
    count: providers.filter((p) => p.city === city).length,
  }))
  .filter((c) => c.count >= 2)
  .sort((a, b) => b.count - a.count)
  .slice(0, 10)

console.log('\nTop cities by provider count (category coverage):')
for (const { city } of topCities) {
  const cityProviders = providers.filter((p) => p.city === city)
  const parts = CATEGORIES.map((cat) => {
    const n = cityProviders.filter((p) => hasCategory(p, cat)).length
    return `${cat}=${n}`
  }).join(', ')
  console.log(`  ${city} (${cityProviders.length}): ${parts}`)
}

console.log(`\nInflation targets: 4+ <20% ${fourPlus / providers.length < 0.2 ? 'PASS' : 'FAIL'} | all-5 <3% ${allFive.length / providers.length < 0.03 ? 'PASS' : 'FAIL'}`)

function summarizeDataset(list: Provider[]) {
  const buckets = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const p of list) {
    const n = p.public_categories?.length ?? 0
    if (n >= 1 && n <= 5) buckets[n as 1 | 2 | 3 | 4 | 5]++
  }
  const catCounts = Object.fromEntries(
    CATEGORIES.map((cat) => [cat, list.filter((p) => p.public_categories?.includes(cat)).length]),
  ) as Record<PrimarySegment, number>
  return { buckets, catCounts, fourPlus: buckets[4] + buckets[5] }
}

if (existsSync(BASELINE_PATH)) {
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) as Provider[]
  const before = summarizeDataset(baseline)
  const after = summarizeDataset(providers)

  console.log('\nVALIDATION — BEFORE vs AFTER (UX-11)')
  console.log('──────────────────────────────────────')
  console.log(`Providers with 4+ categories: ${before.fourPlus} (${pct(before.fourPlus, baseline.length)}) → ${after.fourPlus} (${pct(after.fourPlus, providers.length)})`)
  for (const cat of CATEGORIES) {
    console.log(
      `${PUBLIC_CATEGORY_LABELS[cat].padEnd(32)} ${String(before.catCounts[cat]).padStart(4)} → ${String(after.catCounts[cat]).padStart(4)}`,
    )
  }

  const removals = baseline
    .map((b) => {
      const a = providers.find((p) => p.id === b.id)
      if (!a) return null
      const beforeCats = new Set(b.public_categories ?? [])
      const afterCats = new Set(a.public_categories ?? [])
      const removed = CATEGORIES.filter((c) => beforeCats.has(c) && !afterCats.has(c))
      return removed.length
        ? {
            id: b.id,
            name: b.company_name,
            city: b.city,
            province: b.province_code,
            before: b.public_categories ?? [],
            after: a.public_categories ?? [],
            removed,
          }
        : null
    })
    .filter((x): x is NonNullable<typeof x> => x != null)
    .sort((a, b) => b.removed.length - a.removed.length)

  console.log(`\nTop category removals (${Math.min(25, removals.length)} of ${removals.length} providers changed):`)
  for (const row of removals.slice(0, 25)) {
    console.log(
      `• ${row.name} (${row.city}, ${row.province}) — removed: ${row.removed.map((c) => PUBLIC_CATEGORY_LABELS[c]).join(', ')}`,
    )
  }

  const calgaryBefore = new Set(
    baseline.filter((p) => p.city === 'Calgary' && p.public_categories?.includes('construction')).map((p) => p.id),
  )
  const calgaryEventBefore = new Set(
    baseline.filter((p) => p.city === 'Calgary' && p.public_categories?.includes('event')).map((p) => p.id),
  )
  const calgaryConstrAfter = new Set(
    providers.filter((p) => p.city === 'Calgary' && p.public_categories?.includes('construction')).map((p) => p.id),
  )
  const calgaryEventAfter = new Set(
    providers.filter((p) => p.city === 'Calgary' && p.public_categories?.includes('event')).map((p) => p.id),
  )
  console.log(`\nCalgary construction ∩ event overlap: ${jaccard(calgaryBefore, calgaryEventBefore).toFixed(1)}% → ${jaccard(calgaryConstrAfter, calgaryEventAfter).toFixed(1)}%`)
}

console.log('\n════════════════════════════════════════════════════════════\n')
