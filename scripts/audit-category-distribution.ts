/**
 * Audit category distribution across the national dataset.
 * Run: npx tsx scripts/audit-category-distribution.ts
 *
 * Verifies that "general" is the dominant category (expected: 80–90%+ of providers).
 */

import providersJson from '../src/data/providers.json' assert { type: 'json' }
import type { Provider } from '../src/types/provider'

const providers = providersJson as Provider[]

const CATEGORIES = [
  'general',
  'construction',
  'event',
  'oilfield',
  'site_services',
] as const

const PROVINCES = ['AB', 'ON', 'BC'] as const

const AUDIT_CITIES = [
  'Toronto',
  'Calgary',
  'Edmonton',
  'Surrey',
  'Vancouver',
  'Mississauga',
  'Hamilton',
]

console.log('\n════════════════════════════════════════')
console.log('  CANADA WASHROOMS — CATEGORY AUDIT')
console.log('════════════════════════════════════════')
console.log(`Total providers: ${providers.length}\n`)

// ── National category totals ──────────────────────────────────────────────
console.log('NATIONAL CATEGORY TOTALS')
console.log('─────────────────────────')
for (const cat of CATEGORIES) {
  const count = providers.filter(
    (p) =>
      p.public_categories?.includes(cat as import('../src/types/provider').PrimarySegment) ??
      p.primary_segment === cat,
  ).length
  const pct = ((count / providers.length) * 100).toFixed(1)
  const bar = '█'.repeat(Math.round(count / 2))
  console.log(`${cat.padEnd(16)} ${String(count).padStart(4)}  (${pct}%)  ${bar}`)
}

// ── Per-province breakdown ────────────────────────────────────────────────
console.log('\nPER-PROVINCE BREAKDOWN')
console.log('─────────────────────────')
for (const prov of PROVINCES) {
  const provProviders = providers.filter((p) => p.province_code === prov)
  console.log(`\n  ${prov} — ${provProviders.length} providers`)
  for (const cat of CATEGORIES) {
    const count = provProviders.filter(
      (p) =>
        p.public_categories?.includes(cat as import('../src/types/provider').PrimarySegment) ??
        p.primary_segment === cat,
    ).length
    const pct = provProviders.length > 0 ? ((count / provProviders.length) * 100).toFixed(1) : '0.0'
    console.log(`    ${cat.padEnd(16)} ${String(count).padStart(3)}  (${pct}%)`)
  }
}

// ── Per-city breakdown ────────────────────────────────────────────────────
console.log('\nPER-CITY BREAKDOWN (audited cities)')
console.log('─────────────────────────────────────')
for (const city of AUDIT_CITIES) {
  const cityProviders = providers.filter((p) => p.city.toLowerCase() === city.toLowerCase())
  if (cityProviders.length === 0) {
    console.log(`\n  ${city}: no providers`)
    continue
  }
  console.log(`\n  ${city} — ${cityProviders.length} providers`)
  for (const cat of CATEGORIES) {
    const count = cityProviders.filter(
      (p) =>
        p.public_categories?.includes(cat as import('../src/types/provider').PrimarySegment) ??
        p.primary_segment === cat,
    ).length
    const pct = ((count / cityProviders.length) * 100).toFixed(1)
    console.log(`    ${cat.padEnd(16)} ${String(count).padStart(3)}  (${pct}%)`)
  }
}

// ── Completeness check ────────────────────────────────────────────────────
console.log('\nCOMPLETENESS CHECK')
console.log('─────────────────────────')
const noCategories = providers.filter(
  (p) => !p.public_categories || p.public_categories.length === 0,
).length
const withWebsite = providers.filter((p) => p.website).length
const withPhone = providers.filter((p) => p.phone).length
const withHeated = providers.filter((p) => p.heated || p.winterized).length
const withHandwash = providers.filter((p) => p.handwash_available).length
const withADA = providers.filter((p) => p.ada_accessible).length

console.log(`Providers with no public_categories: ${noCategories}`)
console.log(`Providers with website: ${withWebsite} (${((withWebsite / providers.length) * 100).toFixed(1)}%)`)
console.log(`Providers with phone:   ${withPhone} (${((withPhone / providers.length) * 100).toFixed(1)}%)`)
console.log(`Providers with heated:  ${withHeated}`)
console.log(`Providers with handwash:${withHandwash}`)
console.log(`Providers with ADA:     ${withADA}`)

console.log('\n════════════════════════════════════════\n')
