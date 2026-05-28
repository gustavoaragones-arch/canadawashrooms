# System Overview Audit
**Canada Washrooms — Production Readiness Audit**
Generated: 2026-05-27

---

## Architecture Summary

Canada Washrooms is a static React SPA (Vite + TypeScript + Tailwind CSS) with a
client-side data pipeline. There is no backend server, API, or database. All provider
data is bundled at build time via `src/data/providers.json`.

### Technology Stack
| Layer | Technology |
|---|---|
| UI | React 19 + React Router v7 |
| Styling | Tailwind CSS v4 |
| Build | Vite v8 + TypeScript 6 |
| Data | Static JSON embedded in bundle |
| Hosting | Vercel (SPA) |
| Scripts | tsx (ESM TypeScript scripts) |

---

## Route Hierarchy (App.tsx)

```
/                              → HomePage
/about                         → AboutPage (lazy)
/methodology                   → MethodologyPage (lazy)
/contact                       → ContactPage (lazy)
/alberta-coverage              → AlbertaCoveragePage (lazy)   ← ALBERTA-ONLY
/provider/:providerSlug        → ProviderPage
/:segmentSlug/:citySlug        → LandingPage
*                              → Navigate to /
```

**Problem:** `/alberta-coverage` is a hardcoded Alberta-only route. It is referenced in
`src/seo/publishedRoutes.ts` as a static crawlable path. Blocks national launch.

---

## Major Systems

### 1. Data Lifecycle

```
CSV (raw Outscraper export)
  ↓
scripts/ingest-outscraper.ts
  ↓ normalizeOutscraperRecord()   — city, phone, website, segment hint, province
  ↓ dedupeProviders()             — listing-identity merge only
  ↓ applyManualOverridesFile()    — analyst layer
  ↓ enrichProvider()              — capabilities, segments, trust signals
  ↓
data/provinces/{province}.json   ← province snapshot
data/processed/providers.normalized.json  ← legacy mirror
data/snapshots/providers.{stamp}.json     ← timestamped
data/reports/                             ← QA artifacts
  ↓
scripts/build-production-dataset.ts
  ↓ load all province files
  ↓ stamp province_code / province
  ↓ applyManualOverridesFile() (SECOND TIME)
  ↓ enrichProvider()             (SECOND TIME)
  ↓ nationalSlug()
  ↓ sort + collision check
  ↓
src/data/providers.json         ← runtime dataset (pre-enriched)
```

### ⚠ CRITICAL: Double Enrichment

`src/lib/providersDataset.ts` reads `providers.json` then runs:
1. `applyManualOverridesFile()` — third application of manual overrides
2. `enrichProvider()` — third enrichment pass at runtime in the browser

This means:
- The enrichment pipeline runs in every user's browser on every page load
- Manual overrides are applied three times total (ingest + build script + runtime)
- The client bundle includes the entire `enrichProvider` chain (~50KB+ logic)
- If enrichment logic changes between releases and the cached `providers.json` is stale,
  runtime output diverges from what was validated at build time

**Files affected:** `src/lib/providersDataset.ts`, `scripts/build-production-dataset.ts`

### 2. Enrichment Lifecycle

`enrichProvider(raw: ProviderRaw) → Provider`

Pipeline:
- Normalize remaining raw fields (city, phone, website)
- `deriveSupportedSegments()` — infer which segments the provider supports
- `buildCapabilityTokens()` — build capability key set
- `runInferredCapabilityPipeline()` — review-signal capability inference
- `deriveServiceTypes()` — service type tags
- `deriveSpecialties()` — specialty tags from reviews
- `deriveTrustSignals()` — trust signal strings
- `deriveOperationalTrustCues()` — UI-facing operational phrases
- Assemble final `Provider` shape

**Note:** Enrichment is pure and deterministic — same input always yields same output.
This means the runtime re-enrichment produces identical output to build-time enrichment
*today*, but this relies on the `providers.json` data being in the correct `ProviderRaw`
shape, and on enrichment logic being stable between builds.

### 3. Retrieval Lifecycle

```
User selects segment → city → (optional) filters
  ↓
resolveMatches(PROVIDERS, segment, city, activeCapabilities)
  ↓ providersInScope()  — city + segment filter
  ↓ internalRankScore() — composite score
  ↓ sortProvidersByRelevance()
  ↓ FilterBar (capability exact/relaxed match)
  ↓ ProviderResults → ProviderCard
```

Parallel path (search bar):
```
User types query
  ↓
runOperationalSearch(PROVIDERS, query, context)
  ↓ interpretOperationalQuery() — tokenize, expand, infer
  ↓ selectPool()                — city + segment gate
  ↓ scoreProvider()             — token + capability + signal match
  ↓ OperationalSearchPanel results
```

### 4. Inquiry Lifecycle

```
User clicks "Request a quote" on ProviderCard or ProviderPage
  ↓
openInquiry({ segment, city, provider, ctaOrigin })
  ↓
OperationalInquirySurface modal
  ↓
buildInquirySummary() → mailto: link
  ↓ mailto: to site contact address (pre-composed email body)
```

No backend — inquiry is a mailto link. No capture, no CRM, no follow-up.

---

## Single Points of Failure

| Risk | Location | Impact |
|---|---|---|
| `providers.json` empty or corrupt | `src/data/providers.json` | Entire platform returns no results |
| Runtime re-enrichment exception | `src/lib/providersDataset.ts:safeEnrich` | Individual rows silently dropped |
| `manual-overrides.json` missing | `src/lib/providersDataset.ts` | Warning logged; overrides silently skipped |
| Landing route not in `LANDING_ROUTE_GROUPS` | `src/seo/landingRoutes.ts` | Route resolves to null; page redirects to home |

---

## Hardcoded Alberta Assumptions (by file)

- `src/seo/publishedRoutes.ts` — `/alberta-coverage/` in static paths
- `src/App.tsx` — `/alberta-coverage` route
- `src/seo/schema.ts` — `addressRegion: 'AB'` on all landing page LocalBusiness JSON-LD
- `src/seo/providerSchema.ts` — `addressRegion: 'AB'` on all provider page JSON-LD
- `src/seo/segmentSeo.ts` — all copy references Alberta climate, seasons, operations
- `src/lib/matching.ts` — function named `countAlbertaSegmentCoverage()`
- `src/seo/landingRoutes.ts` — `LANDING_ROUTE_GROUPS` contains only AB cities
- `src/lib/segments.ts` — oilfield IntentCard: "Alberta's remote and industrial operations"
- `src/lib/intelligence/operationalTrustCues.ts` — references "province CSVs" (fixed)
