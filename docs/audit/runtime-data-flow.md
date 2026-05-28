# Runtime Data Flow Audit
**Canada Washrooms — Production Readiness Audit**
Generated: 2026-05-27

---

## Canonical Data File

```
src/data/providers.json
```

This is the only file that the runtime application reads for provider data.
It is the output of `scripts/build-production-dataset.ts`.

**It is currently populated with stale Alberta-only data** (the old pre-national dataset).
It must be regenerated after Ontario ingest completes.

---

## Data Entry Point

```
src/lib/providersDataset.ts
```

This module is imported by:
- `src/lib/providersLookup.ts` → ProviderPage.tsx
- `src/lib/matching.ts` → HomePage.tsx (via resolveMatches)
- `src/lib/search/operationalSearch.ts` → OperationalSearchPanel component
- `src/pages/LandingPage.tsx`

### What it does

```typescript
// 1. Import pre-enriched JSON
import providersJson from '../data/providers.json'

// 2. Import manual overrides
import manualOverridesJson from '../data/manual-overrides.json'

// 3. Apply manual overrides AGAIN at runtime
const mergedRaw = applyManualOverridesFile(providersJson as ProviderRaw[], manualOverrides)

// 4. Run full enrichProvider() AGAIN for every row at runtime
export const PROVIDERS: Provider[] = mergedRaw
  .map((row, index) => safeEnrich(row, index))
  .filter((p): p is Provider => p != null)
```

### Problem: Triple Processing

| Stage | Location | When |
|---|---|---|
| First apply overrides + enrich | `scripts/ingest-outscraper.ts` | At ingest time |
| Second apply overrides + enrich | `scripts/build-production-dataset.ts` | At build-dataset time |
| Third apply overrides + enrich | `src/lib/providersDataset.ts` | At browser runtime |

The enrichment is deterministic so output matches, but:
1. The full enrichment module is included in the client JS bundle (wasted KBs)
2. Any future non-determinism in enrichment (e.g., date-based logic) will cause divergence
3. `safeEnrich` silently drops rows that throw — rows valid at build time may fail at runtime
4. `providers.json` stores `ProviderRaw` data but `build-production-dataset.ts` already
   calls `enrichProvider()` — the output is actually `Provider` shape, not `ProviderRaw`.
   Casting it back as `ProviderRaw` and re-enriching creates type-unsafe aliasing.

### Recommended Fix

`providers.json` should store fully-enriched `Provider` rows. `providersDataset.ts`
should simply read and export them with no re-processing. Manual overrides are a
build-time concern only.

**Files affected:** `src/lib/providersDataset.ts`, `scripts/build-production-dataset.ts`
**Priority:** HIGH

---

## Which File Is Canonical

`src/data/providers.json` — but its content is stale. The build script
(`npm run data:build-production`) must be run after each provincial ingest to update it.

**Current state of province files:**
- `data/provinces/alberta.json` — empty `[]` placeholder
- `data/provinces/ontario.json` — empty `[]` placeholder
- `data/provinces/british-columbia.json` — empty `[]` placeholder

All ingest runs are required to populate them before the production build.

---

## Systems That Mutate Provider Shape

| System | What it does |
|---|---|
| `normalizeOutscraperRecord.ts` | Creates `ProviderIngestRecord` from CSV row |
| `dedupeProviders.ts` | Merges listing-identity duplicates |
| `applyManualOverridesFile.ts` | Applies analyst-curated overrides |
| `enrichProvider.ts` | Derives capabilities, segments, trust signals |
| `build-production-dataset.ts` | Stamps `province_code`, `province`, `segment_key`, renews `id` |
| `providersDataset.ts` (runtime) | Re-applies overrides + enrichment in browser |

---

## Where Enrichment Occurs (Timeline)

```
ingest-outscraper.ts          → enrichProvider() called → province file
build-production-dataset.ts   → enrichProvider() called → providers.json
providersDataset.ts (browser) → enrichProvider() called → PROVIDERS constant
```

---

## Taxonomy Assumptions in Data Layer

| Location | Assumption | Problem |
|---|---|---|
| `normalizeOutscraperRecord.ts` | `inferSegmentHint()` returns `'event'`, `'oilfield'`, `'site_services'` | Uses old type keys, not new canonical labels |
| `enrichProvider.ts` | `deriveSupportedSegments()` hardcodes `'event'`, `'oilfield'`, `'site_services'` | Same |
| `matching.ts` | `providersInScope()` filters by `p.city === city` — exact string match | City names must be normalized consistently |
| `providersDataset.ts` | Casts `providers.json` as `ProviderRaw[]` | Type-unsafe if json is already `Provider` shape |

---

## Old Segment Key Dependencies

The following files use `'event'` and `'oilfield'` (old keys) as values — not just labels:

| File | Usage |
|---|---|
| `src/types/provider.ts` | `PrimarySegment` union type definition |
| `src/lib/enrichment/enrichProvider.ts` | `deriveSupportedSegments()` comparisons |
| `src/lib/matching.ts` | `inferredAlignmentScore()` switch logic |
| `src/lib/ingestion/normalizeOutscraperRecord.ts` | `inferSegmentHint()` return values |
| `src/lib/search/interpretOperationalQuery.ts` | `segmentHints.add()` calls |
| `src/lib/search/operationalSearch.ts` | `selectPool()` segment comparisons |
| `src/seo/segmentSeo.ts` | Record key `event:`, `oilfield:` |
| `src/seo/landingRoutes.ts` | `segment: 'event'`, `segment: 'oilfield'` |
| `src/lib/segments.ts` | `SEGMENT_FILTERS` record keys |

**Note:** The desired canonical keys (`remote_oilfield`, `waste_site`) in the user's
taxonomy spec are NOT the same as the current `PrimarySegment` type values (`oilfield`,
`site_services`). A decision is needed: either rename the TypeScript type and migrate
all references, or accept that `segmentKeys.ts` provides the mapping layer and the
underlying type keys remain unchanged. See `taxonomy-audit.md` for full analysis.
