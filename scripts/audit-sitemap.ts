/**
 * Sitemap validation — fails CI/build if sitemap is incomplete or invalid.
 *
 *   npm run audit:sitemap
 *
 * Optional live HTTP checks (post-deploy):
 *   AUDIT_ORIGIN=https://canadawashrooms.ca npm run audit:sitemap -- --live
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  SITEMAP_ORIGIN,
  allPublishedPaths,
  normalizePublishedPath,
} from '../src/seo/publishedRoutes'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const SITEMAP_FILE = resolve(REPO_ROOT, 'dist/sitemap.xml')
const LIVE = process.argv.includes('--live')
const AUDIT_ORIGIN = (process.env.AUDIT_ORIGIN ?? SITEMAP_ORIGIN).replace(/\/$/, '')

function parseSitemapLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
}

function pathFromLoc(loc: string): string {
  const url = new URL(loc)
  return normalizePublishedPath(url.pathname)
}

async function checkHttp200(path: string): Promise<{ ok: boolean; status: number; issue?: string }> {
  const url = `${AUDIT_ORIGIN}${path === '/' ? '/' : path}`
  try {
    const res = await fetch(url, { redirect: 'follow' })
    if (res.status !== 200) {
      return { ok: false, status: res.status, issue: `HTTP ${res.status}` }
    }
    const text = await res.text()
    if (text.includes('NOT_FOUND') && text.length < 200) {
      return { ok: false, status: res.status, issue: 'Vercel NOT_FOUND body' }
    }
    return { ok: true, status: res.status }
  } catch (e) {
    return {
      ok: false,
      status: 0,
      issue: e instanceof Error ? e.message : String(e),
    }
  }
}

async function main(): Promise<void> {
  const errors: string[] = []
  const inventory = allPublishedPaths()
  const expected = new Set(inventory.all)

  if (!existsSync(SITEMAP_FILE)) {
    console.error('[audit-sitemap] FAIL: dist/sitemap.xml not found — run npm run sitemap first')
    process.exit(1)
  }

  const xml = readFileSync(SITEMAP_FILE, 'utf8')
  const locs = parseSitemapLocs(xml)
  const sitemapPaths = locs.map(pathFromLoc)
  const sitemapSet = new Set(sitemapPaths)

  if (locs.length !== sitemapPaths.length) {
    errors.push('Duplicate or unparseable loc entries in sitemap')
  }

  if (new Set(sitemapPaths).size !== sitemapPaths.length) {
    errors.push(`Duplicate paths in sitemap (${sitemapPaths.length} locs, ${new Set(sitemapPaths).size} unique)`)
  }

  for (const loc of locs) {
    if (loc.includes('localhost')) errors.push(`localhost URL in sitemap: ${loc}`)
    if (loc.includes('://www.')) errors.push(`www URL in sitemap: ${loc}`)
    if (!loc.startsWith(SITEMAP_ORIGIN)) {
      errors.push(`Wrong origin in sitemap (expected ${SITEMAP_ORIGIN}): ${loc}`)
    }
  }

  const missing = [...expected].filter((p) => !sitemapSet.has(p))
  const extra = [...sitemapSet].filter((p) => !expected.has(p))

  if (missing.length) {
    errors.push(`Missing from sitemap (${missing.length}): ${missing.slice(0, 10).join(', ')}${missing.length > 10 ? '…' : ''}`)
  }
  if (extra.length) {
    errors.push(`Extra in sitemap (${extra.length}): ${extra.slice(0, 10).join(', ')}${extra.length > 10 ? '…' : ''}`)
  }

  if (inventory.provider.length === 0) {
    errors.push('No provider paths in expected inventory')
  }
  if (inventory.city.length === 0) {
    errors.push('No city paths in expected inventory')
  }

  console.log('[audit-sitemap] Inventory vs sitemap')
  console.log(`  Expected total: ${expected.size}`)
  console.log(`  Sitemap total:  ${sitemapSet.size}`)
  console.log(`  Editorial:      ${inventory.editorial.length}`)
  console.log(`  Province:       ${inventory.province.length}`)
  console.log(`  Category:       ${inventory.category.length}`)
  console.log(`  City:           ${inventory.city.length}`)
  console.log(`  Landing:        ${inventory.landing.length}`)
  console.log(`  Provider:       ${inventory.provider.length}`)

  if (LIVE) {
    console.log(`[audit-sitemap] Live HTTP checks against ${AUDIT_ORIGIN}`)
    const sample = [
      '/',
      '/about/',
      '/contact/',
      '/methodology/',
      '/coverage/',
      '/alberta/',
      '/ontario/',
      '/british-columbia/',
      '/city/calgary/',
      '/city/toronto/',
      '/providers/',
      '/construction-jobsites/',
      inventory.landing[0] ?? '/construction-portable-washrooms/calgary/',
      inventory.provider[0] ?? '/provider/rhino-calgary-ab/',
    ]
    const uniqueSample = [...new Set(sample.map(normalizePublishedPath))]

    for (const path of uniqueSample) {
      const result = await checkHttp200(path)
      if (!result.ok) {
        errors.push(`Live check failed ${path}: ${result.issue ?? result.status}`)
      } else {
        console.log(`  ✓ ${path} → ${result.status}`)
      }
    }
  }

  if (errors.length) {
    console.error('[audit-sitemap] FAIL')
    for (const e of errors) console.error(`  - ${e}`)
    process.exit(1)
  }

  console.log('[audit-sitemap] PASS')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
