# Taxonomy Audit
**Canada Washrooms — Production Readiness Audit**
Generated: 2026-05-27

---

## Current State

The `PrimarySegment` TypeScript union type (in `src/types/provider.ts`) is:

```typescript
export type PrimarySegment =
  | 'construction'
  | 'event'
  | 'oilfield'
  | 'general'
  | 'site_services'
```

The desired canonical internal keys (from PHASE NATIONAL-01 spec) are:

```
construction
events          ← MISMATCH (current: 'event')
remote_oilfield ← MISMATCH (current: 'oilfield')
general
waste_site      ← MISMATCH (current: 'site_services')
```

Three keys differ. `segmentKeys.ts` was created to provide label mapping helpers,
but the underlying `PrimarySegment` type and all runtime comparisons still use the
old keys (`event`, `oilfield`, `site_services`).

---

## Taxonomy Decision Required

Two valid paths forward:

### Option A: Rename the TypeScript type (full migration)
- Change `PrimarySegment` to use `'events'`, `'remote_oilfield'`, `'waste_site'`
- Update every file that references these string literals (~25 files)
- Regenerate `providers.json` (all `primary_segment` values change)
- Clean but requires a coordinated migration pass

### Option B: Accept current keys, use `segmentKeys.ts` as the mapping layer
- Keep `PrimarySegment` as-is with `'event'`, `'oilfield'`, `'site_services'`
- `segmentKeys.ts` provides UI labels ("Weddings & Events", "Remote & Oilfield Operations")
- No migration needed; `providers.json` unchanged
- Canonical "internal keys" in documentation differ from actual TypeScript type values

**Recommendation:** Option B is lower risk for national launch. The current keys are
already in production data and the entire enrichment pipeline. Document the mapping
clearly in `segmentKeys.ts` and accept that the spec terminology is UI-facing only.

---

## Migration Checklist (if Option A is chosen)

### Files requiring `PrimarySegment` value changes

- [ ] `src/types/provider.ts` — change union type definition
- [ ] `src/lib/enrichment/enrichProvider.ts` — `deriveSupportedSegments()` (lines ~37–74)
- [ ] `src/lib/matching.ts` — `inferredAlignmentScore()`, `segmentFitScore()`
- [ ] `src/lib/ingestion/normalizeOutscraperRecord.ts` — `inferSegmentHint()` return values
- [ ] `src/lib/search/interpretOperationalQuery.ts` — all `segmentHints.add()` calls
- [ ] `src/lib/search/operationalSearch.ts` — `selectPool()`, segment comparisons
- [ ] `src/seo/segmentSeo.ts` — Record keys `event:`, `oilfield:`, `site_services:`
- [ ] `src/seo/landingRoutes.ts` — all `segment:` values in `LANDING_ROUTE_GROUPS`
- [ ] `src/lib/segments.ts` — `SEGMENT_FILTERS` record keys, `INTENT_CARDS` segment values
- [ ] `src/lib/matchHeadlines.ts` — `switch(segment)` cases
- [ ] `src/lib/compatibilityLabel.ts` — segment case logic
- [ ] `src/lib/intelligence/providerIntelligence.ts` — segment comparisons
- [ ] `src/lib/intelligence/operationalTrustCues.ts` — segment label map
- [ ] `src/lib/providerDetail.ts` — `bestSuitedForLines()` segment checks
- [ ] `src/lib/taxonomy/segmentKeys.ts` — mapping keys
- [ ] `src/seo/faqs.ts` — `SEGMENT_FAQS` record keys
- [ ] `src/pages/LandingPage.tsx` — `SEGMENT_INQUIRY_CTA` keys
- [ ] `data/provinces/*.json` — all `primary_segment` field values in provider rows
- [ ] `src/data/providers.json` — all `primary_segment` field values

---

## Existing Mismatches (current state)

### Slug mismatches (segmentSeo.ts slugs vs spec)

| Segment (type) | Current URL slug | Note |
|---|---|---|
| `construction` | `construction-portable-washrooms` | Fine |
| `event` | `luxury-restroom-trailers` | Misleading — segment is general events |
| `oilfield` | `remote-site-sanitation` | Fine |
| `general` | `portable-washroom-rentals` | Fine |
| `site_services` | `waste-site-services` | Fine |

**Problem:** The `event` segment slug `luxury-restroom-trailers` is too narrow.
General events (non-luxury, outdoor festivals, etc.) won't find this page via
intuitive URL navigation.

### Alberta-specific copy in segment definitions (segmentSeo.ts)

Every `SegmentSeoDefinition` entry contains Alberta-specific copy that will be shown
on Ontario and BC landing pages once those cities are added to `LANDING_ROUTE_GROUPS`:

- `construction`: "Alberta-season realities", "Alberta cold-weather ops", "near {city}, plan for anchoring"
- `event`: "mountain-adjacent venues", "mountain-corridor venues near {city}", "Alberta events"
- `oilfield`: "Alberta's operating environment", "Alberta remote operations", "Fort McMurray–style remote"
- `general`: "Alberta yards freeze", "near {city}, winter drops", "Alberta projects"
- `site_services`: "Many Alberta operators", "Alberta operators"

**Risk:** Ontario landing pages will display Alberta climate copy. Incorrect and
potentially trust-damaging for users outside Alberta.

**Recommended fix:** Either:
1. Make `climateContext`, `introTemplate`, and `operationalInsights` province-aware
   (e.g., province-keyed overrides per `SegmentSeoDefinition`)
2. Remove province-specific claims; use generic Canadian operational language

### `INTENT_CARDS` oilfield microcopy

In `src/lib/segments.ts` line 34:
```
"Rugged portable sanitation built for Alberta's remote and industrial operations."
```
This shows on the homepage for all users. Should not reference Alberta specifically.

### `segmentKeys.ts` mapping inconsistency

`src/lib/taxonomy/segmentKeys.ts` maps UI labels to segment keys, but the canonical
key it uses for "Events & Weddings" is `'event'` (not `'events'`). This creates a
documentation inconsistency with the PHASE NATIONAL-01 spec.

---

## Segment SEO Slug Audit

| Segment | Slug | Landing URL pattern | Risk |
|---|---|---|---|
| construction | `construction-portable-washrooms` | `/construction-portable-washrooms/calgary/` | Low |
| event | `luxury-restroom-trailers` | `/luxury-restroom-trailers/calgary/` | High — narrow slug excludes non-luxury events |
| oilfield | `remote-site-sanitation` | `/remote-site-sanitation/fort-mcmurray/` | Low |
| general | `portable-washroom-rentals` | `/portable-washroom-rentals/calgary/` | Low |
| site_services | `waste-site-services` | `/waste-site-services/calgary/` | Low |

**Note:** The `event` slug `luxury-restroom-trailers` was chosen for high-intent
Alberta event traffic but excludes lower-luxury searches like "event portable washrooms
toronto". Consider adding a secondary slug or broadening.

---

## FilterCapability Completeness

`FilterCapability` type in `src/types/provider.ts`:
```
weekly_service | crane_liftable | handwash_available | luxury_units |
flush_toilets | wedding_friendly | heated | winterized | remote_support |
camp_support | ada_accessible | septic_service | site_support | roll_off_disposal
```

`CAP_KEYS` array in `src/lib/search/operationalSearch.ts` (used for search scoring):
```
weekly_service, crane_liftable, handwash_available, luxury_units, flush_toilets,
wedding_friendly, heated, winterized, remote_support, camp_support, ada_accessible,
septic_service
```

**Missing from search scoring:** `site_support`, `roll_off_disposal`

These two capabilities were added for the `site_services` segment but were NOT added
to the search scoring array. Providers with only these capabilities as differentiators
will score lower in operational search.

**File:** `src/lib/search/operationalSearch.ts` lines 17–43
**Priority:** HIGH
