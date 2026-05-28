/**
 * Sitemap generator — writes dist/sitemap.xml.
 *
 * Run after `npm run build` so dist/ exists:
 *   npm run sitemap
 *
 * Includes:
 *   - Editorial static pages
 *   - All landing routes (segment × city)
 *   - All provider pages (from src/data/providers.json)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')

const SITE_ORIGIN = 'https://www.canadawashrooms.ca'

// ── Static editorial paths ────────────────────────────────────────────────────

const EDITORIAL_PATHS: string[] = ['/', '/about/', '/methodology/', '/contact/', '/coverage/']

// ── Landing routes (self-contained mirror of LANDING_ROUTE_GROUPS) ────────────
// Keep in sync with src/seo/landingRoutes.ts

interface LandingEntry {
  segmentSlug: string
  citySlug: string
}

const LANDING_ENTRIES: LandingEntry[] = [
  // construction
  ...['calgary','edmonton','fort-mcmurray','red-deer','canmore','toronto','mississauga','brampton','hamilton','vaughan','markham']
    .map(c => ({ segmentSlug: 'construction-portable-washrooms', citySlug: c })),
  // event
  ...['calgary','edmonton','canmore','red-deer','toronto','mississauga','hamilton','vaughan','markham']
    .map(c => ({ segmentSlug: 'luxury-restroom-trailers', citySlug: c })),
  // oilfield / remote
  ...['fort-mcmurray','calgary','edmonton','red-deer']
    .map(c => ({ segmentSlug: 'remote-site-sanitation', citySlug: c })),
  // general
  ...['calgary','edmonton','fort-mcmurray','red-deer','canmore','toronto','mississauga','brampton','hamilton','vaughan','markham']
    .map(c => ({ segmentSlug: 'portable-washroom-rentals', citySlug: c })),
  // site services
  ...['calgary','edmonton','fort-mcmurray','red-deer','canmore','toronto','mississauga','brampton','hamilton']
    .map(c => ({ segmentSlug: 'waste-site-services', citySlug: c })),
]

// ── Provider slugs from the national dataset ──────────────────────────────────

interface MinimalProvider {
  id: string
}

function loadProviderIds(): string[] {
  const p = resolve(REPO_ROOT, 'src/data/providers.json')
  if (!existsSync(p)) {
    console.warn('[sitemap] src/data/providers.json not found — no provider URLs.')
    return []
  }
  try {
    const data = JSON.parse(readFileSync(p, 'utf8')) as MinimalProvider[]
    return data.filter((r) => typeof r.id === 'string' && r.id.length > 0).map((r) => r.id)
  } catch {
    console.warn('[sitemap] Failed to parse providers.json.')
    return []
  }
}

// ── XML builder ──────────────────────────────────────────────────────────────

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function urlEntry(loc: string, priority: string, changefreq: string): string {
  return [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
].join('\n')
}

function buildSitemap(entries: string[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
  ].join('\n')
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main(): void {
  const entries: string[] = []

  for (const path of EDITORIAL_PATHS) {
    entries.push(urlEntry(`${SITE_ORIGIN}${path}`, path === '/' ? '1.0' : '0.7', 'weekly'))
  }

  for (const { segmentSlug, citySlug } of LANDING_ENTRIES) {
    entries.push(urlEntry(`${SITE_ORIGIN}/${segmentSlug}/${citySlug}/`, '0.8', 'weekly'))
  }

  const providerIds = loadProviderIds()
  for (const id of providerIds) {
    entries.push(urlEntry(`${SITE_ORIGIN}/provider/${id}/`, '0.6', 'monthly'))
  }

  const xml = buildSitemap(entries)

  const outDir = resolve(REPO_ROOT, 'dist')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(resolve(outDir, 'sitemap.xml'), xml, 'utf8')

  console.log('[sitemap] Written: dist/sitemap.xml')
  console.log(`  Editorial:      ${EDITORIAL_PATHS.length}`)
  console.log(`  Landing routes: ${LANDING_ENTRIES.length}`)
  console.log(`  Provider pages: ${providerIds.length}`)
  console.log(`  Total URLs:     ${entries.length}`)
}

try {
  main()
} catch (e) {
  console.error(e)
  process.exit(1)
}
