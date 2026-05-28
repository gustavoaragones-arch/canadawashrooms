# Manual Curation Workflow

This document defines the human quality-refinement process for the Canada Washrooms operational directory.

**Goal:** High-trust directory quality — not mass-scraping scale.

---

## Overview

The curation loop runs after each ingest cycle. For each provider in the national dataset, a curator reviews and corrects:

1. **Category (segment)** — Is the operator in the right segment?
2. **Capabilities** — Are the inferred capabilities accurate?
3. **Province + city** — Is the geographic data correct?
4. **Service area** — Does the service area description make sense?
5. **Operational signals** — Are remote/winter/event signals warranted?
6. **Operational notes** — Can we add a useful note from public sources?

---

## Step-by-Step Loop

### Step 1 — Open provider page

Navigate to `/provider/{provider-id}` and inspect:
- Company name, city, province
- Primary segment (is it correct?)
- Capabilities (are active chips accurate or over-inferred?)
- Best suited for (does it make sense?)
- Review count (is the data thin?)

### Step 2 — Verify against public signals

Check:
- Google Maps listing (search company name + city)
- Website (if present)
- Google review themes — do they mention construction? events? remote?

### Step 3 — Apply overrides (if needed)

Edit `src/data/manual-overrides.json` to:

```json
{
  "version": 1,
  "entries": [
    {
      "id": "provider-slug-here",
      "overrides": {
        "primary_segment": "construction",
        "primary_segment_confidence": 0.92,
        "supported_segments": ["general"],
        "blocked_capabilities": ["luxury_units", "flush_toilets"],
        "curated_specialties": ["Long-term jobsite rentals", "High-capacity crew servicing"],
        "trust_signals_append": ["verified_construction_focus"]
      }
    }
  ]
}
```

Available override fields:
| Field | Type | Purpose |
|---|---|---|
| `primary_segment` | PrimarySegment | Force the segment classification |
| `primary_segment_confidence` | 0–1 | Set explicit confidence |
| `supported_segments` | PrimarySegment[] | Override secondary segments |
| `blocked_capabilities` | FilterCapability[] | Disable over-inferred caps |
| `blocked_inference` | key[] | Disable inference flags |
| `trust_signals_replace` | string[] | Replace trust signal list |
| `trust_signals_append` | string[] | Add signals to default list |
| `curated_specialties` | string[] | Human-written specialty lines |
| `winter_service` | boolean | Lock winter inference |
| `remote_logistics` | boolean | Lock remote inference |
| `luxury_trailers` | boolean | Lock luxury inference |
| `flushing_units` | boolean | Lock flush inference |

### Step 4 — Add operational note (optional)

For providers where you have verified context, add an `operational_notes` field directly to the province JSON file before rebuilding:

```json
{
  "id": "rhino-calgary-ab",
  "operational_notes": "Regional chain with Calgary and Edmonton dispatch. Construction-focused fleet; confirmed weekly servicing on active jobsites."
}
```

Or add via `manual-overrides.json` using `trust_signals_append` + `curated_specialties`.

### Step 5 — Add Google Maps URL (optional)

Add `google_maps_url` directly in the province JSON or via override:

```json
{
  "id": "rhino-calgary-ab",
  "google_maps_url": "https://maps.google.com/?cid=..."
}
```

### Step 6 — Rebuild

After any manual changes, run:

```bash
npm run data:build-production
```

Verify output: `src/data/providers.json` is updated.

### Step 7 — Spot-check

Open `/provider/{id}` in the browser and verify the changes look correct.

---

## Priority Curation Queue

Work through providers in this order:

1. **High review count** (≥ 20 reviews) — these pages will get the most traffic
2. **Segment confidence < 0.6** — these are most likely miscategorized
3. **Phone-only providers** — need verified notes since no website to cross-check
4. **Multi-city operators** — confirm each city node is genuinely distinct
5. **Low review count** (< 5) — flag and add a note where possible

---

## Segment Classification Guide

| Segment | Assign when |
|---|---|
| `construction` | Reviews/website mention jobsites, crews, long-term rentals, construction |
| `event` | Luxury trailers, weddings, flush units, event mentions |
| `oilfield` | Remote sites, camps, winterized, heated, lease access, industrial |
| `site_services` | Septic, waste hauling, roll-off bins, disposal, integrated services |
| `general` | None of the above — standard short-term portable toilet rentals |

**When in doubt, use `general`.** Over-categorization is worse than under-categorization.

---

## Red Flags

- **"CA" as city** — normalization failure; find correct city and override
- **Same company, two cities with same slug** — check if these are genuinely distinct nodes (different dispatch, different service area) or true duplicates
- **Rating 0.0, review_count 0** — unverified listing; add a note
- **`primary_segment_confidence` < 0.4** — treat as uncategorized, needs human review

---

## Output Quality Targets

| Metric | Target |
|---|---|
| Correctly categorized | ≥ 90% |
| Providers with operational notes | ≥ 30% |
| Providers with verified capability chips | ≥ 70% |
| Phone-only providers with notes | ≥ 50% |
