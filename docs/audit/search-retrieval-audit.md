# Search & Retrieval Audit
**Canada Washrooms — Production Readiness Audit**
Generated: 2026-05-27

---

## Retrieval Systems Overview

There are two distinct retrieval paths:

| System | File | Usage |
|---|---|---|
| **Matching flow** | `src/lib/matching.ts` | Homepage guided flow (segment + city + filters) |
| **Operational search** | `src/lib/search/operationalSearch.ts` | Free-text search bar |

Both systems pull from `PROVIDERS` (the fully-loaded dataset in memory).
Neither system touches a network, database, or index — all retrieval is in-process JavaScript.

---

## Matching Flow (Homepage)

### Entry Point
```typescript
resolveMatches(providers, segment, city, activeCapabilities)
```

### Flow
1. `providersInScope(providers, segment, city)` — filter to city + segment pool
2. If capabilities selected: exact match → fallback to relaxed (all in scope)
3. `sortProvidersByRelevance()` → `internalRankScore()`

### Ranking Signals (internalRankScore)

| Signal | Weight | Notes |
|---|---|---|
| Active capability match | 1000× per cap | Dominant signal when filters active |
| Badge overlap | 118× per badge | Compares provider.badges to segment INTENT_CARD badges |
| Segment fit | 120 (primary), 82 (supported), 34 (other) | |
| Inferred alignment | 0–100 | Segment-specific capability bonuses |
| Trust density | 0–52+ | trust_signals + review_count + rating + website |
| Segment confidence | ×22 | primary_segment_confidence (0–1) |
| Completeness | Variable | from providerCompleteness.ts |
| Rating | ×13 | |
| Review count | min(520) × 0.048 | capped |

### Province Awareness

`providersInScope()` filters by `p.city === city` — exact city name match only.

**No province filtering.** If a provider from Calgary AB and a different provider from
a hypothetical "Calgary ON" both exist in the dataset, they would be in the same pool
when a user searches for "Calgary". This is unlikely in practice but architecturally
unguarded.

**Recommended fix:** Add optional `province_code` filter to `providersInScope()` for
future-proofing when city name collisions become possible.

### Alberta-Specific Function Name

```typescript
// src/lib/matching.ts line 26-33
export function countAlbertaSegmentCoverage(
  providers: Provider[],
  segment: PrimarySegment,
): number {
```

This function is used in `LandingPage.tsx` for editorial copy ("X operators").
The name suggests Alberta scope but the implementation filters the entire providers
array. Rename to `countSegmentCoverage()`.

---

## Operational Search (Free-Text)

### Entry Point
```typescript
runOperationalSearch(providers, rawQuery, context)
```

### Pipeline

```
rawQuery
  ↓ interpretOperationalQuery()
    ↓ PHRASE_EXPANSIONS (regex replacements)
    ↓ detectCitySlug()          — national (all CANADA_PROVINCES cities)
    ↓ tokenize()
    ↓ stripCityTokens()         — national (uses LIVE_CITIES)
    ↓ relaxOperationalTypos()   — Levenshtein 1-edit correction
    ↓ expandOperationalTokens() — synonym expansion
    ↓ inferSegmentsAndCapabilities()
  ↓ selectPool()
    ↓ if context.segment + context.city: use providersInScope()
    ↓ elif context.city: filter by city
    ↓ elif context.segment: filter by segment
    ↓ else: entire dataset
    ↓ if citySlug detected in query: add city filter
  ↓ scoreProvider() for each in pool
  ↓ filter by cutoff (26% of max score)
  ↓ sort by score descending
```

### Current Search Retrieval Signals

| Signal | Score | Notes |
|---|---|---|
| Token in provider blob | +44 per token | company, badges, area, capabilities, tags, specialties |
| Loose capability match | +36 | partial string match |
| Implied capability match | +74 per cap | structured FilterCapability |
| Implied inference key match | +66 per key | winter_service, remote_logistics, luxury_trailers, flushing_units |
| Segment context alignment | +92 (primary), +56 (supported) | |
| City match | +54 | |
| Segment confidence | ×21 | |
| Review count | min(420) × 0.051 | |
| Rating | ×10 | |
| Review signal tag | +24 | review_signal in operational_tags |
| City-only query bonus | +26 | when no operational terms detected |

### Missing from `CAP_KEYS` in operationalSearch.ts

The `CAP_KEYS` array used to build provider blobs for search scoring is:
```typescript
'weekly_service', 'crane_liftable', 'handwash_available', 'luxury_units',
'flush_toilets', 'wedding_friendly', 'heated', 'winterized', 'remote_support',
'camp_support', 'ada_accessible', 'septic_service'
```

**Missing:** `site_support`, `roll_off_disposal`

These `site_services` segment capabilities were added to `FilterCapability` but never
added to the search blob builder. A provider whose only distinguishing capabilities are
`site_support` or `roll_off_disposal` will have those missing from their search index
and will score lower than they should for waste/site-services queries.

**File:** `src/lib/search/operationalSearch.ts` lines 17–43
**Fix:** Add `'site_support'` and `'roll_off_disposal'` to the `CAP_KEYS` array and type.

### Province Bias in Search

- `selectPool()` does not filter by province
- Searches like "portable washrooms toronto" detect `toronto` as a city and filter to
  Toronto providers only — this is correct national behavior
- Searches without city context return the entire dataset — correct

**Search is effectively province-aware through city detection. No Alberta bias exists
in search retrieval logic.** The city lookup was updated in PHASE NATIONAL-01 to cover
all provinces.

### Search Dictionary Completeness

`relaxOperationalTypos()` dictionary:
```
winterized, heated, wedding, remote, oilfield, crane, liftable,
accessible, flush, luxury, weekly, camp, septic, handwash, washroom, portable
```

Missing from dictionary (but handled by synonym expansion):
- `disposal`, `roll-off`, `rolloff` — site_services terms not in typo dictionary
- Ontario-specific terms (none yet needed)

---

## `providerSearchModel.ts` (Architecture Only)

`src/lib/search/providerSearchModel.ts` defines `ProviderSearchDocument` and
`buildProviderSearchDocument()`. This is **not used** by the runtime UI.

It appears to be preparatory architecture for a future worker-based or static index.
The actual search uses `blobForProvider()` in `operationalSearch.ts` directly.

**No action needed** — these are future primitives. Do not remove.

---

## Retrieval Gaps for National Launch

| Gap | Impact | Fix |
|---|---|---|
| `CAP_KEYS` missing site_services capabilities | site_services providers under-score in search | Add `site_support`, `roll_off_disposal` to CAP_KEYS |
| No province filter in `providersInScope()` | Potential city name collision (low risk now) | Add optional `province_code` param |
| `countAlbertaSegmentCoverage()` name | Confusing; not an actual blocker | Rename |
| Empty `providers.json` | No results returned for any query | Run ingest + build-production |
| Ontario has no landing routes | Ontario providers unreachable via guided flow | Add Ontario cities to LANDING_ROUTE_GROUPS |
