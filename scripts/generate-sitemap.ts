/**
 * Sitemap generator — writes dist/sitemap.xml from publishedRoutes.ts only.
 *
 * Run after `npm run build`:
 *   npm run sitemap
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  SITEMAP_ORIGIN,
  allPublishedPaths,
} from '../src/seo/publishedRoutes'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')

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

function priorityFor(path: string): string {
  if (path === '/') return '1.0'
  if (path.startsWith('/provider/')) return '0.6'
  if (path.startsWith('/city/')) return '0.7'
  if (path.match(/^\/[^/]+\/[^/]+\/$/) && !path.startsWith('/city/')) return '0.8'
  return '0.7'
}

function changefreqFor(path: string): string {
  if (path.startsWith('/provider/')) return 'monthly'
  return 'weekly'
}

function main(): void {
  const inventory = allPublishedPaths()
  const entries = inventory.all.map((path) => {
    const loc = `${SITEMAP_ORIGIN}${path === '/' ? '/' : path}`
    return urlEntry(loc, priorityFor(path), changefreqFor(path))
  })

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
  ].join('\n')

  const outDir = resolve(REPO_ROOT, 'dist')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(resolve(outDir, 'sitemap.xml'), xml, 'utf8')

  console.log('[sitemap] Written: dist/sitemap.xml')
  console.log(`  Origin:         ${SITEMAP_ORIGIN}`)
  console.log(`  Editorial:      ${inventory.editorial.length}`)
  console.log(`  Province:       ${inventory.province.length}`)
  console.log(`  Category hubs:  ${inventory.category.length}`)
  console.log(`  City:           ${inventory.city.length}`)
  console.log(`  Landing:        ${inventory.landing.length}`)
  console.log(`  Provider:       ${inventory.provider.length}`)
  console.log(`  Total URLs:     ${inventory.all.length}`)
}

try {
  main()
} catch (e) {
  console.error(e)
  process.exit(1)
}
