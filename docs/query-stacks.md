# Alberta Outscraper query stacks

Operational intent: pull **overlapping** Google Maps slices so enrichment sees real language (servicing cadence, winter gear, trailers, lease roads) — not a single fat keyword dump.

**Cities (fixed grid):** Calgary, Edmonton, Fort McMurray, Red Deer, Canmore.

**Five category stacks** (run as separate saved searches / exports):

| Stack | Example queries / Maps categories | Intent |
|-------|-------------------------------------|--------|
| **1 — Construction / jobsite** | “portable toilet rental construction Calgary”, “jobsite washroom service”, category *Portable toilet supplier* filtered by industrial corridor pins | Long-cycle serviced units, crane/lift mentions, weekly routes |
| **2 — Event / wedding / luxury** | “luxury restroom trailer Alberta”, “wedding portable toilets Canmore”, category *Party equipment rental* + trailer keywords | Flush systems, guest throughput, planner-facing servicing windows |
| **3 — Oilfield / remote** | “oilfield portable toilet Fort McMurray”, “remote camp sanitation”, “lease road washroom service” | Heated inventory, camp/dispatch language, winter access |
| **4 — Heated / winterized** | “heated portable toilet Edmonton”, “winterized washroom rental”, “frozen jobsite toilet” | Cold-weather ops — **cross-cuts** stacks 1–3; expect overlap by design |
| **5 — General portable** | “portable washroom rental Red Deer”, “ADA portable toilet”, residential / short-term phrasing | Practical rentals, septic/handwash adjacency |

## Overlap rationale

- Same operator often appears under **construction** and **heated** queries → **listing-identity dedupe** collapses only exact same-address listings; shared brand/web/phone across pulls stays as **relationship signals** in overlap review. Stack overlap **raises** review corpus density without inventing operators.
- **Event** vs **luxury trailer** queries overlap heavily → review signal weighting must down-rank generic praise (handled in `reviewSignalQuality` + pipeline threshold).
- **Oilfield** and **remote camp** queries overlap → remote logistics inference benefits from stacked pulls.

## Enrichment goals per stack

1. **Construction** — `weekly_service`, `crane_liftable`, handwash; segment confidence toward `construction`.
2. **Event** — `luxury_trailers`, `flush_toilets`, `wedding_friendly`; flush/trailer language separated from generic “great service”.
3. **Oilfield / remote** — `remote_logistics`, `winter_service`, camp/heated tokens; segment confidence toward `oilfield`.
4. **Heated / winterized** — strengthens winter inference **only** when operational markers outweigh generic noise.
5. **General** — ADA, septic, short-term; keeps long-tail operators without forcing industrial/event labels.

## Execution cadence (internal)

1. Export CSV per stack **per city** (or multi-city batch if Outscraper supports it — keep city column trustworthy).
2. Run `npm run data:ingest -- path/to/export.csv` — never auto-promote to `src/data/providers.json`.
3. Review `data/reports/qa-report.json`, `organizational-overlap-review.json`, `weak-metadata-report.json`.
4. Merge promoted rows after human disposition; apply locks in `src/data/manual-overrides.json`.
5. Repeat — Alberta density improves through **iteration**, not one-shot breadth.

## Routing note

Programmatic landing routes stay **sparse** (segment × priority city). Matcher scope uses **primary + supported segments** in-city so secondary-fit operators appear where enrichment supports them — without Canada-wide page sprawl.
