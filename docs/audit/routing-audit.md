# Routing Audit
**Canada Washrooms — Production Readiness Audit**
Generated: 2026-05-27

---

## Current Route Structure

```
/                              HomePage         — OK
/about                         AboutPage        — OK (lazy)
/methodology                   MethodologyPage  — OK (lazy)
/contact                       ContactPage      — OK (lazy)
/alberta-coverage              AlbertaCoveragePage — BLOCKER (Alberta-only)
/provider/:providerSlug        ProviderPage     — OK (national-safe slugs)
/:segmentSlug/:citySlug        LandingPage      — PARTIAL (Alberta cities only)
*                              → Navigate to /  — OK
```

Route resolution is handled by React Router v7's `BrowserRouter` with `<Routes>`.
The SPA has no server-side routing. A Vercel rewrite rule must catch all paths and
serve `index.html`.

---

## Landing Route System

### Current Coverage (`LANDING_ROUTE_GROUPS` in `src/seo/landingRoutes.ts`)

**All 26 landing routes are Alberta cities only.**

| Segment | Cities | Province |
|---|---|---|
| construction-portable-washrooms | Calgary, Edmonton, Fort McMurray, Red Deer, Canmore | AB only |
| luxury-restroom-trailers | Calgary, Edmonton, Canmore, Red Deer | AB only |
| remote-site-sanitation | Fort McMurray, Calgary, Edmonton, Red Deer | AB only |
| portable-washroom-rentals | Calgary, Edmonton, Fort McMurray, Red Deer, Canmore | AB only |
| waste-site-services | Calgary, Edmonton, Fort McMurray, Red Deer, Canmore | AB only |

**No Ontario or BC city is in `LANDING_ROUTE_GROUPS`.**

This means:
- Ontario providers (Toronto, Mississauga, etc.) will have no landing pages
- `/construction-portable-washrooms/toronto/` will resolve to the catch-all route
  and `resolveLandingRoute()` will return `null`, redirecting to `/`
- Ontario providers will exist in `providers.json` but have no discoverable entry points
  beyond the homepage flow and direct `/provider/:slug` links

### `priorityCitySlug()` Gap

`src/seo/landingRoutes.ts:priorityCitySlug()` only resolves cities that exist in
`LANDING_ROUTE_GROUPS`. Ontario cities like Toronto, Mississauga, Hamilton return `null`.

This affects:
- `ProviderPage.tsx` breadcrumb — segment guide link won't resolve for Ontario providers
- `segmentLandingPath()` — returns null for Ontario providers (breadcrumb degrades gracefully)

**These are non-blocking for provider pages but block SEO landing routes for Ontario.**

---

## Provider Page Routing

Route: `/provider/:providerSlug`

**National slug format:** `{company}-{city}-{province_code}`
Examples: `rhino-calgary-ab`, `halco-portables-welland-on`

**Slug lookup:** `getProviderBySlug(slug)` in `src/lib/providersLookup.ts` does:
```typescript
return PROVIDERS.find((p) => p.id.toLowerCase() === normalized) ?? null
```

This matches on `provider.id` exactly. The `id` in the national dataset is the
`nationalSlug()` output from `build-production-dataset.ts`. This is correct.

**Current risk:** If `providers.json` still contains the pre-national dataset
(without province suffix in IDs), then URLs like `/provider/rhino-calgary-ab`
will return 404 (redirect to home) because old IDs are `rhino-calgary` without suffix.

**This is a breaking change for any existing links when migrating from old to new slugs.**

### No 301 Redirect Strategy

There is no mechanism to redirect `/provider/rhino-calgary` → `/provider/rhino-calgary-ab`.
If old-format slugs exist anywhere (social links, bookmarks, Google cache), they will
silently redirect to `/`.

---

## Alberta-Only Route: `/alberta-coverage`

`src/App.tsx` line 36: `<Route path="/alberta-coverage" element={<AlbertaCoveragePage />} />`

`src/seo/publishedRoutes.ts` includes `/alberta-coverage/` in `EDITORIAL_STATIC_PATHS`.

`AlbertaCoveragePage.tsx` renders a list of all landing routes with city and segment.
Because `allResolvedLandings()` currently returns only AB cities, this page accurately
lists only Alberta routes.

**Problem:** Once Ontario routes are added to `LANDING_ROUTE_GROUPS`, this page becomes
misleading (it would show Ontario routes under an "Alberta coverage" URL).

**Recommended fix:**
1. Rename route to `/coverage` or `/available-routes`
2. Rename `AlbertaCoveragePage` to `CoveragePage`
3. Update `EDITORIAL_STATIC_PATHS`
4. 301 redirect `/alberta-coverage` → `/coverage`

---

## SEO Route Generation

There is no sitemap.xml generator in the scripts directory. No `generate-seo-files.ts`
exists (referenced in `publishedRoutes.ts` comment but not present).

Static paths declared in `src/seo/publishedRoutes.ts`:
```
/
/about/
/methodology/
/contact/
/alberta-coverage/   ← needs to change
```

Landing routes dynamically come from `allResolvedLandings()`.

Provider pages are not included in any static path list. `/provider/:slug` URLs are
not pre-rendered or included in any sitemap — this is acceptable for a Vite SPA but
limits crawlability for provider-specific SEO value.

---

## Slug Collision Risk Assessment

National slug format: `{slug(company_name)}-{slug(city)}-{province_code}`

Theoretical collisions:
- Two companies with identical normalized names in the same city and province
  → Same ID generated → `build-production-dataset.ts` collision detection will catch
  this and exit with error

- Same company in two provinces (e.g. a national chain in Calgary AB and Calgary ON)
  → Different `province_code` suffix → No collision

- City slug normalization: "Fort McMurray" → `fort-mcmurray-ab`
  Length limit in `nationalSlug()` is 72 chars → safe for all known city names

**The collision detection in `build-production-dataset.ts` is a hard guardrail. This
is production-safe.**

---

## Route Ordering Risk

In `App.tsx`, `/provider/:providerSlug` is declared BEFORE `/:segmentSlug/:citySlug`.
This is correct and intentional — provider routes must take precedence over the
catch-all landing pattern.

**Risk if order changes:** `/provider/calgary` would try to resolve as a landing page
with `segmentSlug=provider`, `citySlug=calgary`, returning null and redirecting to home.

---

## Readiness for National Landing Routes

To add Ontario landing pages, the only file that needs updating is:
`src/seo/landingRoutes.ts` — add Ontario cities to `LANDING_ROUTE_GROUPS`

**But:** This also requires:
1. Ontario `SegmentSeoDefinition` content that is NOT Alberta-specific
2. Ontario providers in `providers.json` (via ingest + build)
3. `priorityCitySlug()` will then resolve Ontario cities automatically

**Blocker:** `segmentSeo.ts` copy is currently Alberta-specific.
Adding `toronto` to `LANDING_ROUTE_GROUPS` with current copy would generate pages
saying "Alberta climate" and "Alberta seasons" for Toronto users.
