# Data ingestion — operational workflow

Internal-only pipeline for Outscraper CSV drops. Nothing here ships to the browser bundle unless you later promote JSON into `src/data/`.

Alberta query planning lives in **`docs/query-stacks.md`**; QA cadence in **`docs/qa-iteration.md`**.

## Layout

| Path | Role |
|------|------|
| `data/raw/` | Drop raw CSV exports (gitignored `*.csv`; keep `.gitkeep`). |
| `data/processed/providers.normalized.json` | Latest enriched snapshot from the last successful ingest (gitignored). |
| `data/snapshots/providers.<ISO-stamp>.json` | Timestamped rollback / diff anchors (gitignored). |
| `data/reports/` | QA, duplicates, weak metadata, review signals, curation sweep (gitignored JSON). |
| `src/data/manual-overrides.json` | Analyst locks — **tracked** in git; merges before enrichment (runtime + ingest). |

## Commands

```bash
npm run data:ingest -- path/to/outscraper-export.csv
npm run data:curation --              # reads data/processed/providers.normalized.json
npm run typecheck:scripts            # scripts + imported lib surface
```

Promotion to production UI data is manual: copy a reviewed snapshot into `src/data/providers.json` (or merge selectively). **`data:ingest` never writes there.**

## Flow (deterministic)

1. **Parse CSV** — `parseOutscraperCsvWithDiagnostics`: RFC4180-style lines; rows whose column count diverges from the header are **skipped**, counted in QA, and fail the process exit code (`1`) so operators notice.
2. **Normalize** — `normalizeOutscraperRecord`: flexible Outscraper column aliases → `ProviderRaw`-shaped ingest row; rows without a usable business name are skipped with row-index reasons (console + QA counts).
3. **Dedupe** — `dedupeProviders`: merge order **website → phone → normalized address + business name** (never name-only). Review counts use **`Math.max`**, not sum.
4. **Manual overrides** — shallow merge from `src/data/manual-overrides.json` into each row’s `manual_enrichment_overrides` by **`id`** (slug from normalize step).
5. **Enrich** — `enrichProvider`: inference + locks; manual booleans and segment locks beat inference; optional blocks for capabilities / inference flags; optional trust / curated specialties (see types).
6. **Artifacts** — timestamped snapshot + `processed` mirror + reports (latest copies plus stamped copies).

Invalid CSV geometry stops rows from entering the merge — **no partial silent corruption** of earlier dataset files because outputs are isolated under `data/` and production JSON is untouched.

## Manual overrides (`src/data/manual-overrides.json`)

Schema: `{ "version": number, "entries": [{ "id": string, "patch": ManualEnrichmentOverrides }] }`.

Example entry (use ingest-normalized `id` — slug from name + city):

```json
{
  "version": 1,
  "entries": [
    {
      "id": "acme-rentals-calgary",
      "patch": {
        "primary_segment": "construction",
        "primary_segment_confidence": 0.93,
        "winter_service": true,
        "blocked_capabilities": ["luxury_units"],
        "trust_signals_append": ["manual_verified_servicing_cadence"]
      }
    }
  ]
}
```

Patch fields (non-exhaustive):

- Segment: `primary_segment`, `primary_segment_confidence`, `supported_segments`
- Confirm inference-aligned locks: `winter_service`, `remote_logistics`, `luxury_trailers`, `flushing_units`, `septic_service`, `crane_liftable`
- Block declared filters: `blocked_capabilities` (`FilterCapability` keys)
- Block inferred ops flags: `blocked_inference` (`InferenceOverrideShape` keys)
- Trust: `trust_signals_replace` | `trust_signals_append`
- Specialties: `curated_specialties` (replaces derived list when non-empty)

**Priority:** explicit manual booleans / segment / blocks apply **after** inference aggregation inside `enrichProvider`.

## QA outputs

- **`qa-report.json`** — counts: totals, duplicate signals (pre-merge cartesian + post-enrichment pair scan), weak metadata, missing web/phone, low-confidence segments (unlocked), thin enrichment, skipped normalize rows, malformed CSV rows.
- **`duplicate-review.json`** — `preMergeCandidates` (website / phone / address+name) and `postEnrichmentPairs` (shared phone/web on enriched rows). Human disposition only — **no auto-delete**.
- **`weak-metadata-report.json`** — rows from internal completeness / trust / review volume heuristics (`weakProviderRecords`).
- **`review-signal-summary.json`** — corpus buckets: operational keyword frequencies (weighted corpus), winter / luxury-remote regex tallies, weak-generic review counts.
- **`curation-sweep.<stamp>.json`** — low-confidence lists, missing websites, thin inference, segment-spread heuristic flags.

Console prints the same QA totals in a short operational summary.

## Curation utilities

Programmatic helpers live in `src/lib/dataOperations/curationReports.ts` (used by `data:curation`). Extend these for future province batches or scheduled jobs without adding servers.

## Future hooks (not implemented)

- Province expansion: extra columns → normalize aliases → same dedupe tiers.
- Scheduled ingestion: wrap `npm run data:ingest` in CI with artifact upload.
- Automated enrichment: plug models **behind** existing normalization contracts.
- Lead routing / claiming: consume enriched JSON + manual locks as source of truth.

## Sandbox note

Some environments block `tsx` IPC pipes. If `data:ingest` fails with `listen EPERM`, run the command on a full-permission runner or substitute a local `node` compile step.
