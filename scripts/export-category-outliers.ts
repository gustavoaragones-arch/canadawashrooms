/**
 * Export providers with 4+ public categories for analyst QA review.
 * Run: npx tsx scripts/export-category-outliers.ts
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import providersJson from '../src/data/providers.json' assert { type: 'json' }
import { PUBLIC_CATEGORY_LABELS } from '../src/lib/taxonomy/publicCategoryMapper'
import type { PrimarySegment, Provider } from '../src/types/provider'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const providers = providersJson as Provider[]

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function labelCategories(cats: PrimarySegment[]): string {
  return cats.map((c) => PUBLIC_CATEGORY_LABELS[c]).join('; ')
}

const outliers = providers
  .filter((p) => (p.public_categories?.length ?? 0) >= 4)
  .sort((a, b) => {
    const countDelta = (b.public_categories?.length ?? 0) - (a.public_categories?.length ?? 0)
    if (countDelta !== 0) return countDelta
    const prov = (a.province_code ?? '').localeCompare(b.province_code ?? '')
    if (prov !== 0) return prov
    return a.company_name.localeCompare(b.company_name)
  })

const header = [
  'Provider',
  'Province',
  'City',
  'Current Categories',
  'Category Count',
  'Provider ID',
  'Website',
  'Primary Segment',
].join(',')

const lines = outliers.map((p) =>
  [
    escapeCsv(p.company_name),
    p.province_code ?? '',
    escapeCsv(p.city),
    escapeCsv(labelCategories(p.public_categories ?? [])),
    String(p.public_categories?.length ?? 0),
    p.id,
    escapeCsv(p.website ?? ''),
    p.primary_segment,
  ].join(','),
)

const outDir = resolve(REPO_ROOT, 'data/reports')
mkdirSync(outDir, { recursive: true })
const outPath = resolve(outDir, 'category-outliers-4plus.csv')
writeFileSync(outPath, `${header}\n${lines.join('\n')}\n`, 'utf8')

console.log(`[export] Wrote ${outliers.length} providers to ${outPath}`)
