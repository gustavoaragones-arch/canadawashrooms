# Launch Blockers
**Canada Washrooms — Production Readiness Audit**
Generated: 2026-05-27

---

## CRITICAL

These block any production launch or data correctness.

---

### CRITICAL-01 — `providers.json` is stale / empty

**Problem:** All `data/provinces/*.json` files are empty `[]` placeholders.
`src/data/providers.json` contains the old pre-national dataset (without province fields
and national slugs). The runtime application returns results from the old dataset.

**Risk:** Users see Alberta-only data with old slug format. Ontario providers don't exist.

**Fix:**
1. Run `npm run data:ingest -- <alberta-csv>` → populates `data/provinces/alberta.json`
2. Run `npm run data:ingest -- <ontario-csv>` → populates `data/provinces/ontario.json`
3. Run `npm run data:build-production` → regenerates `src/data/providers.json`

**Files:** `data/provinces/`, `src/data/providers.json`
**Effort:** Low (pipeline exists) — depends on having the CSV exports ready

---

### CRITICAL-02 — `addressRegion: 'AB'` hardcoded in two JSON-LD generators

**Problem:** `src/seo/providerSchema.ts` and `src/seo/schema.ts` both hardcode
`addressRegion: 'AB'` in LocalBusiness structured data. Ontario and BC providers
will emit incorrect province in JSON-LD.

**Risk:** Google structured data errors for all non-Alberta providers.

**Fix:**
- `src/seo/providerSchema.ts` line 18: `addressRegion: provider.province_code ?? 'AB'`
- `src/seo/schema.ts` line 20: `addressRegion: p.province_code ?? 'AB'`

**Files:** `src/seo/providerSchema.ts`, `src/seo/schema.ts`
**Effort:** 5 minutes

---

### CRITICAL-03 — `schema.ts` contains "Alberta MVP dataset" in production JSON-LD

**Problem:** `src/seo/schema.ts` line 101:
```
'Portable sanitation operators compatible with this project context (Alberta MVP dataset).'
```
This string is emitted in every landing page's structured data `ItemList` description.

**Risk:** Google indexes "Alberta MVP dataset" as canonical content. Looks unfinished.

**Fix:** Replace with generic: `'Portable washroom operators matched for this project
type and city — verify availability and capabilities with each operator.'`

**File:** `src/seo/schema.ts`
**Effort:** 2 minutes

---

### CRITICAL-04 — Double enrichment in `providersDataset.ts`

**Problem:** `src/lib/providersDataset.ts` re-runs `enrichProvider()` at browser
runtime on data that has already been enriched by `build-production-dataset.ts`.
Manual overrides applied three times total.

**Risk:** Runtime errors silently drop valid providers. Client bundle includes full
enrichment pipeline unnecessarily. If enrichment logic diverges from dataset version,
rows behave inconsistently.

**Fix:** Simplify `providersDataset.ts` to trust the pre-enriched JSON:
```typescript
import providersJson from '../data/providers.json'
import type { Provider } from '../types/provider'
export const PROVIDERS: Provider[] = providersJson as Provider[]
```
Remove `applyManualOverridesFile` and `enrichProvider` calls from this file.
Manual overrides are a build-time concern only.

**Files:** `src/lib/providersDataset.ts`
**Effort:** 10 minutes — then re-run `npm run data:build-production`

---

## HIGH

These block national launch or create meaningful user/SEO errors.

---

### HIGH-01 — `LANDING_ROUTE_GROUPS` contains only Alberta cities

**Problem:** `src/seo/landingRoutes.ts` has 26 landing routes — all AB cities.
Ontario providers (Toronto, Mississauga, Hamilton, etc.) have no landing pages.

**Risk:** Ontario providers exist in the dataset but have no guided entry point.
SEO value for Ontario terms is zero until routes are added.

**Fix:** Add Ontario cities to `LANDING_ROUTE_GROUPS` for each segment.
**Dependency:** Requires `segmentSeo.ts` copy to be province-neutral first (HIGH-02).

**File:** `src/seo/landingRoutes.ts`
**Effort:** Medium (15 minutes) — blocked by HIGH-02

---

### HIGH-02 — `segmentSeo.ts` copy is Alberta-specific throughout

**Problem:** Every `SegmentSeoDefinition` entry contains Alberta-specific copy
that will appear on Ontario and BC landing pages once those routes are added.
Examples: "Alberta-season realities", "Alberta climate", "Many Alberta operators",
"Alberta cold-weather ops", "Fort McMurray–style remote intensity".

**Risk:** Trust damage for Ontario/BC users. Factually incorrect content on non-AB pages.

**Fix:** Either:
1. Replace province-specific claims with generic Canadian operational language
2. Add province-keyed copy overrides to `SegmentSeoDefinition`

Option 1 is faster and less architectural complexity.

**File:** `src/seo/segmentSeo.ts`
**Effort:** High (full editorial rewrite of all 5 segment definitions)

---

### HIGH-03 — `CAP_KEYS` missing `site_support` and `roll_off_disposal`

**Problem:** `src/lib/search/operationalSearch.ts` lines 17–43 — `CAP_KEYS` array
does not include `site_support` or `roll_off_disposal`. These capabilities were added
for `site_services` segment but were not added to search scoring.

**Risk:** `site_services` providers under-score in operational search for waste/disposal
queries. Users searching for these capabilities get worse results.

**Fix:** Add both to `CAP_KEYS`:
```typescript
| 'site_support'
| 'roll_off_disposal'
```
And add to the array values.

**File:** `src/lib/search/operationalSearch.ts`
**Effort:** 5 minutes

---

### HIGH-04 — `/alberta-coverage` route and page are Alberta-only

**Problem:** The route `/alberta-coverage` exists in `App.tsx`, `publishedRoutes.ts`,
and `AlbertaCoveragePage.tsx`. Once Ontario routes are added, this page shows
non-Alberta routes under an Alberta-specific URL.

**Risk:** Confusing to users; inaccurate meta description; stale static path in SEO.

**Fix:**
1. Rename `AlbertaCoveragePage` → `CoveragePage`
2. Change route `/alberta-coverage` → `/coverage`
3. Update `EDITORIAL_STATIC_PATHS` in `publishedRoutes.ts`
4. Add 301 redirect for old URL

**Files:** `src/App.tsx`, `src/pages/AlbertaCoveragePage.tsx`, `src/seo/publishedRoutes.ts`
**Effort:** 20 minutes

---

### HIGH-05 — No province shown on provider pages for Ontario/BC providers

**Problem:** `ProviderPage.tsx` header shows city and service area but not province.
An Ontario provider (e.g. "Halco Portables — Welland") shows no indication it's in
Ontario.

**Risk:** Geographic confusion for users. A Calgary user may be looking at a Welland ON
operator without realizing it.

**Fix:** Add `provider.province ?? provider.province_code` to provider page header.

**File:** `src/pages/ProviderPage.tsx`
**Effort:** 5 minutes

---

## MEDIUM

These create operational quality gaps or technical debt but don't block launch.

---

### MEDIUM-01 — `countAlbertaSegmentCoverage()` named wrong

**File:** `src/lib/matching.ts` line 26
**Fix:** Rename to `countSegmentCoverage()`
**Effort:** 2 minutes

---

### MEDIUM-02 — IntentCard oilfield microcopy references Alberta

**Problem:** `src/lib/segments.ts` line 34:
`"Rugged portable sanitation built for Alberta's remote and industrial operations."`
Shown on homepage to all users, including Ontario users.

**Fix:** `"Rugged portable sanitation built for remote and industrial operations."`
**File:** `src/lib/segments.ts`
**Effort:** 1 minute

---

### MEDIUM-03 — No sitemap generator

**Problem:** No `scripts/generate-seo-files.ts` exists (referenced in `publishedRoutes.ts`
comment). No sitemap.xml is generated. Crawlers discover routes only through links.

**Risk:** Landing pages and provider pages have slower indexing.

**Fix:** Create a sitemap generator script that outputs:
- All editorial static paths
- All `allResolvedLandings()` URLs
- All provider IDs → `/provider/{id}/` URLs

**Files:** New `scripts/generate-sitemap.ts`
**Effort:** 1–2 hours

---

### MEDIUM-04 — Old slug format in `providers.json` breaks provider page links

**Problem:** If `providers.json` still uses old IDs (e.g. `rhino-calgary` without
`-ab` suffix), all `/provider/` links in cards will use the old format. After running
`build-production-dataset.ts`, IDs change. Any bookmarked or shared links break.

**Risk:** After the national build, existing provider page links (if any are public) break.

**Fix:** This resolves itself once `build-production-dataset.ts` is run. No permanent
fix needed, but plan a cut-over moment.

**Effort:** Zero (pipeline fix is already in place)

---

### MEDIUM-05 — `priorityCitySlug()` only resolves routes, not all live cities

**Problem:** `src/seo/landingRoutes.ts:priorityCitySlug()` resolves city names to
slugs by scanning `LANDING_ROUTE_GROUPS`. Cities not in a landing route return null.
This affects breadcrumb on `ProviderPage.tsx`.

**Risk:** Ontario providers have no breadcrumb segment guide link (degrades gracefully
but reduces internal linking).

**Fix:** After adding Ontario cities to `LANDING_ROUTE_GROUPS`, this resolves automatically.
**Effort:** Zero (blocked by HIGH-01)

---

### MEDIUM-06 — No `og:image` on any page

**Problem:** No Open Graph image is set in metadata. Social shares show no image.
**Fix:** Set a default OG image in `defaultSiteMeta`
**File:** `src/seo/metadata.ts`
**Effort:** 30 minutes (need to create image asset)

---

## LOW

These are quality improvements, not blockers.

---

### LOW-01 — `event` segment slug is too narrow

The URL `luxury-restroom-trailers` limits organic traffic for non-luxury event queries.
A user searching "event portable washrooms toronto" won't land here intuitively.
**Fix:** Consider `event-portable-washrooms` as slug. Requires 301 redirects for existing
links.

### LOW-02 — No `sameAs` links in LocalBusiness JSON-LD

Adding `sameAs` with the Google Business Profile URL would improve rich result quality.
Not currently feasible without manual curation.

### LOW-03 — `AlbertaCoveragePage` title/meta is "Alberta coverage"

The meta description references "Alberta-first portable sanitation matching".
Once Ontario is added and the page is renamed, this copy must be updated.

### LOW-04 — Inquiry flow is mailto only

No inquiry capture, no CRM integration, no confirmation email. This is acceptable for
MVP but limits ability to track conversion intent.

### LOW-05 — No analytics events for Ontario/BC segment actions

`emitProductionAnalytics` calls in `CitySelector` now pass `province` but the
analytics implementation (`productionAnalytics.ts`) may not use it in logged events.
Verify event shape is correct for national analytics tracking.

---

## Summary Table

| ID | Severity | Description | Files | Effort |
|---|---|---|---|---|
| CRITICAL-01 | CRITICAL | providers.json stale/empty | data/provinces/, src/data/ | Pipeline |
| CRITICAL-02 | CRITICAL | addressRegion hardcoded AB in JSON-LD | providerSchema.ts, schema.ts | 5 min |
| CRITICAL-03 | CRITICAL | "Alberta MVP dataset" in production JSON-LD | schema.ts | 2 min |
| CRITICAL-04 | CRITICAL | Double enrichment in providersDataset.ts | providersDataset.ts | 10 min |
| HIGH-01 | HIGH | No Ontario landing routes | landingRoutes.ts | 15 min |
| HIGH-02 | HIGH | segmentSeo.ts copy Alberta-specific | segmentSeo.ts | High (editorial) |
| HIGH-03 | HIGH | CAP_KEYS missing site_support + roll_off_disposal | operationalSearch.ts | 5 min |
| HIGH-04 | HIGH | /alberta-coverage route Alberta-only | App.tsx, publishedRoutes.ts | 20 min |
| HIGH-05 | HIGH | No province shown on provider pages | ProviderPage.tsx | 5 min |
| MEDIUM-01 | MEDIUM | countAlbertaSegmentCoverage() name | matching.ts | 2 min |
| MEDIUM-02 | MEDIUM | Oilfield card copy references Alberta | segments.ts | 1 min |
| MEDIUM-03 | MEDIUM | No sitemap generator | scripts/ | 1–2 hr |
| MEDIUM-04 | MEDIUM | Old slug format in providers.json | providers.json | Auto-resolves |
| MEDIUM-05 | MEDIUM | priorityCitySlug Ontario gap | landingRoutes.ts | Blocked by HIGH-01 |
| MEDIUM-06 | MEDIUM | No og:image | metadata.ts | 30 min |
| LOW-01 | LOW | event slug too narrow | segmentSeo.ts | Requires redirect plan |
| LOW-02 | LOW | No sameAs in JSON-LD | providerSchema.ts | Low value |
| LOW-03 | LOW | AlbertaCoveragePage stale copy | AlbertaCoveragePage.tsx | Blocked by HIGH-04 |
| LOW-04 | LOW | Inquiry is mailto only | inquiry/ | Out of scope |
| LOW-05 | LOW | Analytics province tracking unverified | productionAnalytics.ts | 30 min |

---

## National Launch Sequence (Recommended Order)

```
1. CRITICAL-02  addressRegion fix        (5 min)
2. CRITICAL-03  schema copy fix          (2 min)
3. CRITICAL-04  providersDataset fix     (10 min)
4. HIGH-03      CAP_KEYS fix             (5 min)
5. HIGH-05      Province on provider page (5 min)
6. MEDIUM-01    rename countAlbertaSegment (2 min)
7. MEDIUM-02    oilfield card copy       (1 min)
      ↓ Run ingest (Alberta CSV)
      ↓ Run ingest (Ontario CSV)
      ↓ Run npm run data:build-production
8. CRITICAL-01  verify providers.json populated
9. HIGH-02      segmentSeo.ts national copy rewrite
10. HIGH-01     Add Ontario cities to LANDING_ROUTE_GROUPS
11. HIGH-04     Rename /alberta-coverage → /coverage
12. MEDIUM-03   Sitemap generator
```

Items 1–8 (quick fixes) take approximately 2 hours.
Item 9 (editorial rewrite) is the largest effort gate before Ontario routing.
