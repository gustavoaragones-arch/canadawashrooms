# Provider Page Audit
**Canada Washrooms — Production Readiness Audit**
Generated: 2026-05-27

---

## Current State

Provider pages exist at `/provider/:providerSlug` via `src/pages/ProviderPage.tsx`.
The route is registered correctly in `App.tsx` before the catch-all landing pattern.

---

## Provider Fields: Display Readiness

### Safe for Public Display (always reliable)

| Field | Source | Notes |
|---|---|---|
| `company_name` | Raw CSV | Name as listed on Google Maps |
| `city` | Normalized from CSV | Consistently normalized |
| `phone` | Normalized from CSV | Formatted to CA format |
| `website` | Normalized from CSV | Cleaned URL |
| `rating` | Raw CSV (Google) | Float, may be 0.0 |
| `review_count` | Raw CSV (Google) | Integer, may be 0 |
| `service_area` | Derived from address | May be sparse ("Calgary, AB") |
| `primary_segment` | Enriched (inferred) | Shown as display label |
| `supported_segments` | Enriched (inferred) | Shown as "Also supports" |
| `province_code` | Stamped at build time | New field; may be missing on old data |
| `province` | Stamped at build time | New field; may be missing on old data |

### Inferred Fields (should display with transparency disclaimer)

| Field | Inference Source | Reliability |
|---|---|---|
| `capabilities` (string[]) | enrichProvider pipeline | Medium — based on categories + reviews |
| `operational_tags` (string[]) | enrichProvider pipeline | Medium |
| `trust_signals` (string[]) | enrichProvider pipeline | Medium |
| `operational_trust_cues` | operationalTrustCues.ts | Medium — template-based |
| `inferred_specialties` | review text inference | Low–Medium |
| `winter_service` | review signal inference | Low — easily wrong for new operators |
| `remote_logistics` | review signal inference | Low |
| `luxury_trailers` | review signal inference | Low |
| `primary_segment_confidence` | enrichProvider | Internal scoring 0–1 |

**ProviderPage.tsx correctly displays the TRANSPARENCY disclaimer** at the bottom of
the Operational Notes section (`TRANSPARENCY.capabilityInference`). This is good.

### Missing from Public Display

| Missing field | Impact |
|---|---|
| No physical address displayed | Users cannot verify location easily |
| No province shown in header | Ontario/BC providers have no geographic context |
| No "last updated" date | Users cannot gauge data freshness |
| No explicit "This is inferred" labeling on each capability chip | Inferred vs verified is not communicated per-chip |

---

## ProviderPage.tsx Section Analysis

### Breadcrumb
- Shows: Home → {SegmentTitle} → {CompanyName}
- Segment guide link uses `segmentLandingPath()` which returns null for cities not in
  `LANDING_ROUTE_GROUPS` (e.g. all Ontario cities)
- **Degrades gracefully** — renders as plain text span, not broken link
- **Enhancement:** Add province to breadcrumb for national context

### Hero
- Shows: trust labels, phone-only badge, company name, primary segment, service area,
  Google rating/reviews, also-supports segments, CTAs
- Missing: `province_code` display — an Ontario provider shows no provincial context

### Operational Fit
- Shows: `bestSuitedForLines()` — derived from segment + capability flags
- Shows: `compatibilityTraits` from `buildProviderIntelligence()`
- **Quality depends entirely on enrichment quality** — a thin provider with no reviews
  will show empty or generic fit lines

### Capabilities
- Shows all 12 `CAPABILITY_DISPLAY` entries as active/inactive chips
- Active = green-tinted, inactive = grey strikethrough
- **All chips always render** — even if all 12 are inactive, the section renders
  with all capabilities as greyed-out strikethroughs. For minimal providers, this
  looks like a list of things they don't do.

### Operational Notes
- Shows: `operational_notes` (free text from analyst or import)
- Shows: `inferred_specialties`
- Shows: `trust_signals`
- Shows: `operationalFitNotes` from intelligence
- **Most providers have no `operational_notes`** — the "No free-text operational notes"
  fallback displays. This is honest but creates a weak page for most providers.

### Related Providers
- Shows up to 5 related providers using `relatedProviders()` scoring
- Uses `ProviderCard` in `compact` variant
- **City-weighted scoring** — if a provider is in a city with few providers, related
  will show operators from other cities (lower score but still shown)

---

## JSON-LD (Schema.org) Issues

### `src/seo/providerSchema.ts`

```typescript
address: {
  '@type': 'PostalAddress',
  addressLocality: provider.city,
  addressRegion: 'AB',    // ← HARDCODED
  addressCountry: 'CA',
},
```

`addressRegion` is hardcoded to `'AB'` for ALL providers regardless of province.
An Ontario provider's JSON-LD will declare `addressRegion: 'AB'`. This is factually
incorrect and may confuse Google's structured data processing.

**Fix:** Use `provider.province_code ?? 'AB'` for `addressRegion`.
**File:** `src/seo/providerSchema.ts` line 18
**Priority:** HIGH

### `src/seo/schema.ts` (landing page JSON-LD)

Same issue — `localBusinessFromProvider()` hardcodes `addressRegion: 'AB'`:
```typescript
addressRegion: 'AB',    // line 20 — HARDCODED
```

Also contains:
```typescript
description: 'Portable sanitation operators compatible with this project context (Alberta MVP dataset).'
// line 101 — "Alberta MVP dataset" text in production JSON-LD
```

**Fix:** Use `p.province_code ?? 'AB'`; update description.
**File:** `src/seo/schema.ts` lines 20, 101
**Priority:** HIGH

---

## Provider Page SEO Assessment

### What is generated correctly
- `<title>` — company name + segment + city + site name
- `<meta description>` — rating + service area + confirmation disclaimer
- Canonical URL — `/provider/{id}/`
- JSON-LD `LocalBusiness` — name, phone, website, rating (when present)

### What is missing or weak
- `addressRegion` incorrect for non-AB providers
- No `sameAs` links (company website, Google Maps link)
- No `openingHours` (could be derived from operational notes)
- No sitemap entry — provider pages are not discoverable via sitemap
- `og:image` not set — shares will show no image

---

## Curation Readiness

Provider pages were specifically designed to support manual curation. Assessment:

| Curation need | Current support |
|---|---|
| See why a provider was categorized | ✓ Segment + confidence + operational tags shown |
| See inferred vs explicit signals | Partial — trust signals shown but not labeled as inferred/explicit |
| Compare similar operators | ✓ Related providers panel |
| Understand capability derivation | Partial — TRANSPARENCY disclaimer present but vague |
| Identify thin providers | ✓ Empty capabilities clearly visible as strikethrough list |
| See raw review signals | Partial — operational_tags show review_signal markers |
| Understand segment fit | ✓ bestSuitedForLines + compatibilityTraits |
| Know province/geography | ✗ No province display in header |

**Overall curation readiness: GOOD for Alberta providers with existing data.
Degrades for thin providers or new Ontario data until enrichment quality improves.**
