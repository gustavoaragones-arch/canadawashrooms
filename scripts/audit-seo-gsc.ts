/**
 * SEO / GSC readiness audit — inventory, URL checks, metadata analysis.
 * Run: npx tsx scripts/audit-seo-gsc.ts
 * Optional: AUDIT_ORIGIN=https://canadawashrooms.ca npx tsx scripts/audit-seo-gsc.ts
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import providersJson from '../src/data/providers.json' assert { type: 'json' }
import { LIVE_CITIES } from '../src/lib/locations/canadaLocations'
import { allResolvedLandings, listingPath } from '../src/seo/landingRoutes'
import { EDITORIAL_STATIC_PATHS } from '../src/seo/publishedRoutes'
import { fillCity, SEGMENT_SEO } from '../src/seo/segmentSeo'
import { segmentLabel } from '../src/lib/segments'
import type { Provider } from '../src/types/provider'

const SITE_NAME = 'Canada Washrooms'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const AUDIT_ORIGIN = (process.env.AUDIT_ORIGIN ?? 'https://canadawashrooms.ca').replace(/\/$/, '')
const CANONICAL_ORIGIN = 'https://canadawashrooms.ca'

const CATEGORY_PAGES = [
  { path: '/construction-jobsites/', title: 'Construction & Jobsite Portable Washrooms in Canada' },
  { path: '/events-weddings/', title: 'Event & Wedding Portable Washrooms in Canada' },
  { path: '/general-portable-washrooms/', title: 'General Portable Washroom Rentals in Canada' },
  { path: '/remote-oilfield-operations/', title: 'Remote & Oilfield Portable Washrooms in Canada' },
  { path: '/waste-site-services/', title: 'Waste & Site Services in Canada' },
] as const

const PROVINCE_PATHS = ['/alberta/', '/ontario/', '/british-columbia/'] as const

interface UrlRecord {
  path: string
  category: string
  title?: string
  description?: string
}

interface UrlCheck {
  url: string
  path: string
  status: number
  finalUrl: string
  redirectChain: string[]
  issue: string | null
}

function normalizePath(p: string): string {
  if (p === '/') return '/'
  return p.endsWith('/') ? p : `${p}/`
}

function parseSitemap(xml: string): string[] {
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  return locs.map((u) => {
    try {
      return normalizePath(new URL(u).pathname)
    } catch {
      return u
    }
  })
}

function buildExpectedInventory(): UrlRecord[] {
  const out: UrlRecord[] = []

  for (const path of EDITORIAL_STATIC_PATHS) {
    out.push({ path: normalizePath(path), category: 'editorial' })
  }

  for (const path of PROVINCE_PATHS) {
    if (!out.some((u) => u.path === path)) {
      out.push({ path, category: 'province' })
    }
  }

  for (const city of LIVE_CITIES) {
    out.push({ path: `/city/${city.slug}/`, category: 'city' })
  }

  for (const cat of CATEGORY_PAGES) {
    if (!out.some((u) => u.path === cat.path)) {
      out.push({ path: cat.path, category: 'category' })
    }
  }

  for (const landing of allResolvedLandings()) {
    out.push({ path: normalizePath(listingPath(landing)), category: 'landing' })
  }

  for (const p of providersJson as Provider[]) {
    out.push({ path: `/provider/${p.id}/`, category: 'provider' })
  }

  return out
}

function staticMeta(title: string, description: string) {
  const fullTitle = `${title} | ${SITE_NAME}`
  return { title: fullTitle, description }
}

function landingMeta(landing: ReturnType<typeof allResolvedLandings>[number]) {
  const seo = SEGMENT_SEO[landing.segment]
  const title = `${fillCity(seo.titleTemplate, landing.city)} | ${SITE_NAME}`
  const description = fillCity(seo.metaDescriptionTemplate, landing.city)
  return { title, description }
}

function providerMeta(provider: Provider) {
  const segmentTitle = segmentLabel(provider.primary_segment)
  const title = `${provider.company_name} | ${segmentTitle} in ${provider.city} | ${SITE_NAME}`
  const description = [
    `${provider.company_name} — ${segmentTitle.toLowerCase()} in ${provider.city}.`,
    provider.service_area ? `Service area: ${provider.service_area}.` : null,
    provider.review_count > 0
      ? `Google rating ${provider.rating.toFixed(1)} (${provider.review_count} reviews).`
      : null,
    'Compare capabilities and contact details — confirm availability with the operator.',
  ]
    .filter(Boolean)
    .join(' ')
  return { title, description }
}

function assignMetadata(records: UrlRecord[]): UrlRecord[] {
  const home = {
    title: `${SITE_NAME} — Portable toilet & washroom rentals across Canada`,
    description:
      'Find portable toilet rentals, portable washrooms, and restroom trailers for construction, events, and remote sites.',
  }
  const staticMetaMap: Record<string, { title: string; description: string }> = {
    '/': home,
    '/about/': staticMeta('About Canada Washrooms', 'Independent provider discovery for portable washroom rentals across Canada.'),
    '/methodology/': staticMeta('Methodology', 'How Canada Washrooms curates portable washroom provider listings.'),
    '/contact/': staticMeta('Contact', 'Contact Canada Washrooms.'),
    '/coverage/': staticMeta('Coverage', 'Provincial and city coverage for portable washroom listings.'),
    '/providers/': staticMeta('Portable Washroom Providers in Canada', 'National directory of portable washroom providers.'),
    '/privacy/': staticMeta('Privacy Policy', 'Privacy policy for Canada Washrooms.'),
    '/terms/': staticMeta('Terms of Use', 'Terms of use for Canada Washrooms.'),
    '/disclaimer/': staticMeta('Disclaimer', 'Disclaimer for Canada Washrooms.'),
  }

  return records.map((r) => {
    if (staticMetaMap[r.path]) {
      return { ...r, ...staticMetaMap[r.path] }
    }
    if (r.category === 'landing') {
      const landing = allResolvedLandings().find((l) => normalizePath(listingPath(l)) === r.path)
      if (landing) {
        const m = landingMeta(landing)
        return { ...r, ...m }
      }
    }
    if (r.category === 'provider') {
      const id = r.path.replace(/^\/provider\//, '').replace(/\/$/, '')
      const provider = (providersJson as Provider[]).find((p) => p.id === id)
      if (provider) {
        const m = providerMeta(provider)
        return { ...r, ...m }
      }
    }
    if (r.category === 'category') {
      const cat = CATEGORY_PAGES.find((c) => c.path === r.path)
      if (cat) {
        const m = staticMeta(cat.title, `${cat.title} — browse operators nationally.`)
        return { ...r, ...m }
      }
    }
    return r
  })
}

async function checkUrl(path: string): Promise<UrlCheck> {
  const url = `${AUDIT_ORIGIN}${path === '/' ? '/' : path}`
  const redirectChain: string[] = []
  let current = url
  let status = 0
  let hops = 0

  while (hops < 6) {
    hops++
    const res = await fetch(current, { redirect: 'manual' })
    status = res.status
    if (status >= 300 && status < 400) {
      const loc = res.headers.get('location')
      if (!loc) break
      const next = new URL(loc, current).toString()
      redirectChain.push(`${status} ${current} → ${next}`)
      current = next
      continue
    }
    break
  }

  let issue: string | null = null
  if (status === 404) issue = '404 Not Found'
  else if (status >= 500) issue = `Server error ${status}`
  else if (status >= 300 && status < 400) issue = 'Redirect loop or unresolved redirect'
  else if (redirectChain.length > 1) issue = 'Multi-hop redirect chain'
  else if (redirectChain.length === 1 && normalizePath(new URL(current).pathname) !== path) {
    issue = `Redirects to different path (${normalizePath(new URL(current).pathname)})`
  }

  return {
    url,
    path,
    status,
    finalUrl: current,
    redirectChain,
    issue,
  }
}

function thinProviderFlags(p: Provider): string[] {
  const flags: string[] = []
  if (!p.public_categories?.length) flags.push('no public_categories')
  if (!p.phone) flags.push('no phone')
  if (!p.website) flags.push('no website')
  const features = ['heated', 'handwash_available', 'ada_accessible', 'luxury_units', 'flushing_units'].filter(
    (k) => (p as Record<string, unknown>)[k],
  )
  if (features.length === 0) flags.push('no feature flags')
  if ((p.review_count ?? 0) === 0) flags.push('no reviews')
  if (flags.length >= 3) return flags
  return []
}

async function main() {
  const sitemapPath = resolve(REPO_ROOT, 'dist/sitemap.xml')
  const sitemapExists = existsSync(sitemapPath)
  const sitemapPaths = sitemapExists ? parseSitemap(readFileSync(sitemapPath, 'utf8')) : []
  const expected = buildExpectedInventory()
  const expectedPaths = new Set(expected.map((e) => e.path))
  const sitemapSet = new Set(sitemapPaths)
  const withMeta = assignMetadata(expected)

  const missingFromSitemap = [...expectedPaths].filter((p) => !sitemapSet.has(p))
  const extraInSitemap = [...sitemapSet].filter((p) => !expectedPaths.has(p))
  const orphanCandidates = {
    city: expected.filter((e) => e.category === 'city').map((e) => e.path),
    category: expected.filter((e) => e.category === 'category').map((e) => e.path),
    providers: expected.filter((e) => e.category === 'provider').map((e) => e.path),
  }

  console.log('[audit] Checking production URLs (sample + critical)...')
  const samplePaths = [
    '/',
    '/providers/',
    '/alberta/',
    '/city/calgary/',
    '/construction-jobsites/',
    '/construction-portable-washrooms/calgary/',
    '/provider/rhino-calgary-ab/',
    '/privacy/',
    ...missingFromSitemap.slice(0, 5),
  ]
  const uniqueSample = [...new Set(samplePaths.map(normalizePath))]
  const urlChecks: UrlCheck[] = []
  for (const path of uniqueSample) {
    try {
      urlChecks.push(await checkUrl(path))
      await new Promise((r) => setTimeout(r, 150))
    } catch (e) {
      urlChecks.push({
        url: `${AUDIT_ORIGIN}${path}`,
        path,
        status: 0,
        finalUrl: '',
        redirectChain: [],
        issue: `Fetch failed: ${e instanceof Error ? e.message : String(e)}`,
      })
    }
  }

  const titleRows = withMeta
    .filter((r) => r.title && r.description)
    .map((r) => ({
      url: `${CANONICAL_ORIGIN}${r.path}`,
      title: r.title!,
      titleLength: r.title!.length,
      description: r.description!,
      descriptionLength: r.description!.length,
    }))

  const duplicateTitles = new Map<string, string[]>()
  for (const row of titleRows) {
    const list = duplicateTitles.get(row.title) ?? []
    list.push(row.url)
    duplicateTitles.set(row.title, list)
  }
  const dupTitleList = [...duplicateTitles.entries()].filter(([, urls]) => urls.length > 1)

  const thinProviders = (providersJson as Provider[])
    .map((p) => ({ id: p.id, name: p.company_name, flags: thinProviderFlags(p) }))
    .filter((p) => p.flags.length > 0)

  const robots = readFileSync(resolve(REPO_ROOT, 'public/robots.txt'), 'utf8')

  const report = {
    generatedAt: new Date().toISOString(),
    auditOrigin: AUDIT_ORIGIN,
    canonicalOrigin: CANONICAL_ORIGIN,
    sitemapExists,
    counts: {
      sitemapTotal: sitemapPaths.length,
      expectedTotal: expected.length,
      editorial: expected.filter((e) => e.category === 'editorial').length,
      province: expected.filter((e) => e.category === 'province').length,
      city: expected.filter((e) => e.category === 'city').length,
      category: expected.filter((e) => e.category === 'category').length,
      landing: expected.filter((e) => e.category === 'landing').length,
      provider: expected.filter((e) => e.category === 'provider').length,
    },
    sitemapPaths,
    expectedByCategory: {
      editorial: expected.filter((e) => e.category === 'editorial').map((e) => e.path),
      province: expected.filter((e) => e.category === 'province').map((e) => e.path),
      city: expected.filter((e) => e.category === 'city').map((e) => e.path),
      category: expected.filter((e) => e.category === 'category').map((e) => e.path),
      landing: expected.filter((e) => e.category === 'landing').map((e) => e.path),
      providerCount: expected.filter((e) => e.category === 'provider').length,
    },
    missingFromSitemap,
    extraInSitemap,
    urlChecks,
    robots,
    wwwCanonicalMismatch: AUDIT_ORIGIN.includes('www.') && CANONICAL_ORIGIN !== AUDIT_ORIGIN,
    duplicateTitles: dupTitleList,
    titleIssues: titleRows.filter(
      (r) => r.titleLength < 30 || r.titleLength > 60 || r.descriptionLength < 80 || r.descriptionLength > 160,
    ),
    thinProviders,
    landingSlugs: Object.fromEntries(
      Object.entries(SEGMENT_SEO).map(([k, v]) => [k, v.slug]),
    ),
    orphanCandidates,
  }

  const outDir = resolve(REPO_ROOT, 'docs/audit')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(resolve(outDir, 'seo-audit-data.json'), JSON.stringify(report, null, 2))

  const csv = [
    'url,title,title_length,description,description_length',
    ...titleRows.map((r) =>
      [
        r.url,
        `"${r.title.replace(/"/g, '""')}"`,
        r.titleLength,
        `"${r.description.replace(/"/g, '""')}"`,
        r.descriptionLength,
      ].join(','),
    ),
  ].join('\n')
  writeFileSync(resolve(outDir, 'title-description-audit.csv'), csv)

  console.log('[audit] Data written to docs/audit/seo-audit-data.json')
  console.log(`  Expected URLs: ${expected.length}`)
  console.log(`  Sitemap URLs:  ${sitemapPaths.length}`)
  console.log(`  Missing from sitemap: ${missingFromSitemap.length}`)
  console.log(`  URL checks: ${urlChecks.length}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
