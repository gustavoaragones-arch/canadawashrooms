# QA iteration loop (Alberta density)

Tight feedback cycle between Outscraper drops and curated JSON — no dashboards required.

## After each ingest

1. **`qa-report.json`** — watch `duplicateCandidates`, `weakMetadataProviders`, `thinEnrichmentProviders`, `lowConfidenceSegments`, `malformedCsvRows`.
2. **`duplicate-review.json`** — resolve `preMergeCandidates` before merging snapshots; re-scan `postEnrichmentPairs` after enrichment changes.
3. **`weak-metadata-report.json`** — prioritize operators with thin reviews + missing categories for a second stack pull or manual research.
4. **`review-signal-summary.json`** — confirm operational keyword mass grows; `weakGenericReviews` should not dominate.

## Product adjustments (when metrics stall)

| Symptom | Lever |
|--------|--------|
| False luxury / winter flags | Tune `SIGNAL_THRESHOLD` + generic praise suppression in `reviewPipeline` / `reviewSignalQuality` |
| Segment ambiguity | `src/data/manual-overrides.json` locks + `primary_segment_confidence` |
| Duplicate churn | Verify dedupe keys; merge rows before re-ingest |
| Sparse city × segment grid | Additional targeted query stack pass — not new provinces |

## Promotion checklist

- [ ] Duplicates reconciled  
- [ ] Critical operators manually locked where inference is noisy  
- [ ] Spot-check 3–5 cards per segment on landing matchers  
- [ ] Copy `data/snapshots/providers.<stamp>.json` → merge → `src/data/providers.json`  

See also: `docs/data-ingestion.md`, `docs/query-stacks.md`.
