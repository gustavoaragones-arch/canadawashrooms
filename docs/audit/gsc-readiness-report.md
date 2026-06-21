# Google Search Console Readiness Report — CanadaWashrooms.ca

**Audit date:** 2026-06-21  
**Target sitemap:** `https://canadawashrooms.ca/sitemap.xml`  
**Related:** [sitemap-audit.md](./sitemap-audit.md) · [seo-audit-data.json](./seo-audit-data.json) · [title-description-audit.csv](./title-description-audit.csv)

---

## Verdict

**NOT READY for Google Search Console submission.**

The site has strong on-page SEO infrastructure in React (canonicals, landing JSON-LD, provider LocalBusiness), but production crawling will fail on **404 responses** for nearly all URLs and the live sitemap omits **149 of 230** expected pages (all providers and all city pages).

---

## Critical issues (block launch)

### C1 — SPA routes return HTTP 404 on production

| | |
|---|---|
| **Description** | Direct requests to `/about/`, `/alberta/`, `/provider/*`, landing pages, etc. return Vercel `NOT_FOUND` (404). Only `/` and static assets resolve. React Router never runs for crawlers. |
| **SEO impact** | **Total indexing failure** for sitemap URLs. GSC will report "Submitted URL not found (404)". |
| **Files affected** | Missing `vercel.json`; `public/_redirects` (Cloudflare/Netlify format, ignored on Vercel) |
| **Recommended fix** | Add `vercel.json` with SPA fallback: rewrite non-file routes to `/index.html`. Exclude `/assets/*`, `sitemap.xml`, `robots.txt`, and static public files. Redeploy and re-verify all sitemap URLs return 200. |

### C2 — Production sitemap missing all provider pages (129 URLs)

| | |
|---|---|
| **Description** | Production sitemap contains 81 URLs; zero `/provider/{slug}/` entries despite 129 providers in the dataset. |
| **SEO impact** | Provider detail pages rely entirely on internal links for discovery; severely limits long-tail local SEO indexing. |
| **Files affected** | Sitemap generation/deploy pipeline; `scripts/generate-sitemap.ts` |
| **Recommended fix** | Regenerate sitemap from unified source including all provider IDs. Deploy updated `sitemap.xml` to production. |

### C3 — Production sitemap missing all city pages (20 URLs)

| | |
|---|---|
| **Description** | `/city/{slug}/` routes exist in app and `publishedRoutes.ts` but are absent from production sitemap. |
| **SEO impact** | City directory pages won't be discovered efficiently via sitemap; weak local landing footprint. |
| **Files affected** | Sitemap generator; `src/seo/publishedRoutes.ts` → `liveCityPaths()` |
| **Recommended fix** | Add all `LIVE_CITIES` paths to sitemap generation and deploy. |

---

## High-priority issues

### H1 — Sitemap generator out of sync with application routes

| | |
|---|---|
| **Description** | `scripts/generate-sitemap.ts` uses a hardcoded duplicate of landing routes (missing BC cities, wrong editorial list) and `www` origin. Production sitemap (81 URLs) and local generator output (181 URLs) diverge from expected inventory (230 URLs). |
| **SEO impact** | Recurring deploy drift; incomplete or incorrect sitemap on each release. |
| **Files affected** | `scripts/generate-sitemap.ts` |
| **Recommended fix** | Refactor sitemap script to import `EDITORIAL_STATIC_PATHS`, `liveCityPaths()`, `allResolvedLandings()`, and provider IDs from shared modules. Use `SITE_ORIGIN` from a Node-safe config (`canadawashrooms.ca`). Wire into `npm run build`. |

### H2 — Dual URL taxonomy for segments (category hubs vs landing slugs)

| | |
|---|---|
| **Description** | Category navigation uses `/construction-jobsites/` while SEO landings use `/construction-portable-washrooms/calgary/`. Five category hubs + 64 landing pages serve overlapping intent. |
| **SEO impact** | Not duplicate content if differentiated, but increases crawl budget use and user confusion. Risk of internal link dilution. |
| **Files affected** | `src/App.tsx`, `src/pages/CategoryPage.tsx`, `src/seo/segmentSeo.ts`, `src/seo/landingRoutes.ts` |
| **Recommended fix** | Document hierarchy: category hubs = national indexes; landings = city×segment. Cross-link bidirectionally (partially done). Consider canonical hints if content overlap grows. |

### H3 — Title and meta description length exceed SERP best practices

| | |
|---|---|
| **Description** | ~170 titles exceed 60 characters; ~150 descriptions exceed 160 characters. Landing and provider templates are verbose. |
| **SEO impact** | Truncation in search results; reduced CTR. |
| **Files affected** | `src/seo/segmentSeo.ts`, `src/seo/providerPageMeta.ts`, `src/seo/metadata.ts` |
| **Recommended fix** | Shorten title templates (move brand suffix, trim em-dash clauses). Target 50–60 char primary titles. Trim landing descriptions to ≤155 chars. See `title-description-audit.csv`. |

### H4 — Homepage meta description stale (Alberta/Ontario only)

| | |
|---|---|
| **Description** | `defaultSiteMeta()` still says "Now live in Alberta and Ontario" — BC is live. |
| **SEO impact** | Misleading SERP snippet; trust signal mismatch. |
| **Files affected** | `src/seo/metadata.ts` |
| **Recommended fix** | Update to "Alberta, Ontario, and British Columbia." |

---

## Medium-priority issues

### M1 — Missing JSON-LD on province, city, and category pages

| | |
|---|---|
| **Description** | Only `DocumentMeta` (title, description, canonical). No `WebPage` or `BreadcrumbList` structured data. |
| **SEO impact** | Reduced rich result eligibility; weaker entity signals for local geography pages. |
| **Files affected** | `src/pages/ProvincePage.tsx`, `CityPage.tsx`, `CategoryPage.tsx` |
| **Recommended fix** | Add `buildStaticWebPageJsonLd()` helper mirroring homepage pattern; include breadcrumbs. |

### M2 — Provider pages missing BreadcrumbList JSON-LD

| | |
|---|---|
| **Description** | HTML breadcrumb present; JSON-LD only emits `LocalBusiness`. |
| **SEO impact** | Missed breadcrumb rich results; inconsistent with landing pages. |
| **Files affected** | `src/seo/providerSchema.ts`, `src/pages/ProviderPage.tsx` |
| **Recommended fix** | Extend provider JSON-LD to `@graph` with BreadcrumbList linking Home → segment landing → provider. |

### M3 — Legal and utility pages have short meta descriptions

| | |
|---|---|
| **Description** | `/contact/` (25 chars), `/privacy/` (36 chars), `/providers/` (50 chars) below 80-char guidance. |
| **SEO impact** | Low snippet quality if indexed; minor. |
| **Files affected** | Respective page meta builders |
| **Recommended fix** | Expand descriptions to 120–155 chars with plain-language summaries. |

### M4 — Internal linking to category hubs from homepage absent

| | |
|---|---|
| **Description** | Homepage `IntentSelector` selects segment for filter flow but does not link to `/construction-jobsites/` etc. Category hubs reachable via `/providers` and sitemap only. |
| **SEO impact** | Slower discovery of national category indexes. |
| **Files affected** | `src/components/IntentSelector.tsx`, `src/pages/HomePage.tsx` |
| **Recommended fix** | Add optional "Browse all {category} operators →" links on intent cards or province section. |

---

## Low-priority issues

### L1 — Local sitemap script uses `www` origin

| | |
|---|---|
| **Description** | `scripts/generate-sitemap.ts` line 20: `SITE_ORIGIN = 'https://www.canadawashrooms.ca'`. App uses apex. |
| **SEO impact** | Low if production sitemap is built elsewhere; causes confusion in local builds. |
| **Files affected** | `scripts/generate-sitemap.ts` |
| **Recommended fix** | Align to `https://canadawashrooms.ca`. |

### L2 — Provider slug in audit sample 404

| | |
|---|---|
| **Description** | Sample URL `/provider/rhino-calgary-ab/` returned 404 on production (SPA issue + possible slug change). Verify slug exists in dataset post-deploy. |
| **SEO impact** | None once SPA rewrite fixed if slug valid in `providers.json`. |
| **Files affected** | `src/data/providers.json` |
| **Recommended fix** | Re-verify provider IDs after C1 fix. |

### L3 — `/methodology/` title exactly 30 chars

| | |
|---|---|
| **Description** | At lower bound of title length guidance. |
| **SEO impact** | Minimal. |
| **Recommended fix** | Optional: expand to "Data methodology" for clarity. |

---

## GSC readiness checklist (final)

| # | Requirement | Result |
|---|-------------|--------|
| 1 | Sitemap valid XML | **PASS** |
| 2 | Sitemap complete (all public routes) | **FAIL** |
| 3 | URLs return HTTP 200 | **FAIL** |
| 4 | Canonicals correct (absolute, apex) | **PASS** |
| 5 | Robots.txt valid | **PASS** |
| 6 | No unintended noindex | **PASS** |
| 7 | No orphan provider pages | **FAIL** |
| 8 | Internal linking complete | **PARTIAL** |
| 9 | Provider pages in sitemap | **FAIL** |
| 10 | Landing pages in sitemap | **PARTIAL** (56/64 on production) |
| 11 | Metadata complete | **PARTIAL** |
| 12 | Structured data valid | **PARTIAL** |

**Score: 4 PASS · 3 PARTIAL · 5 FAIL**

---

## Recommended remediation order

1. **Add Vercel SPA rewrites** — unblocks all URL 200 checks (C1)
2. **Unify and regenerate sitemap** — include editorial + cities + landings + providers (C2, C3, H1)
3. **Deploy and re-crawl** — verify every sitemap URL returns 200 with correct canonical in HTML
4. **Fix homepage meta + title lengths** (H3, H4)
5. **Add JSON-LD to province/city/category/provider breadcrumbs** (M1, M2)
6. **Submit sitemap in GSC** — only after steps 1–3 pass

---

## Audit artifacts

| File | Purpose |
|------|---------|
| `docs/audit/sitemap-audit.md` | Full inventory and technical audit |
| `docs/audit/gsc-readiness-report.md` | This prioritized remediation report |
| `docs/audit/seo-audit-data.json` | Machine-readable counts, missing URLs, URL checks |
| `docs/audit/title-description-audit.csv` | Per-URL title/description lengths |
| `scripts/audit-seo-gsc.ts` | Re-runnable audit script |

Re-run after fixes:

```bash
npm run build && npm run sitemap
npx tsx scripts/audit-seo-gsc.ts
```

Then verify production:

```bash
curl -sI https://canadawashrooms.ca/alberta/ | head -5
curl -sI https://canadawashrooms.ca/provider/rhino-calgary-ab/ | head -5
```

Both should return `HTTP/2 200` before GSC submission.
