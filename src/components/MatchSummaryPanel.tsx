interface MatchSummaryPanelProps {
  headline: string
  city: string
  activeFilterLabels: string[]
  isRelaxed: boolean
  providerCount: number
}

export function MatchSummaryPanel({
  headline,
  city,
  activeFilterLabels,
  isRelaxed,
  providerCount,
}: MatchSummaryPanelProps) {
  return (
    <div className="rounded-2xl border border-cwr-border bg-cwr-surface shadow-card ring-1 ring-black/[0.03]">
      <div className="border-b border-cwr-border px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cwr-muted">
              Shortlist · {city}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-cwr-ink sm:text-2xl">
              {headline}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-cwr-muted">
              <span className="rounded-md border border-cwr-border bg-cwr-bg px-2 py-1 text-cwr-steel">
                AB · ON · BC · live listings
              </span>
              <span className="rounded-md border border-cwr-border bg-cwr-bg px-2 py-1 text-cwr-steel">
                Research only — confirm with operators
              </span>
            </div>
            <p className="mt-3 max-w-xl text-[11px] leading-relaxed text-cwr-muted">
              Some feature labels come from public listings and reviews. Availability and exact scope belong
              in your call or quote with the operator.
            </p>
          </div>
          <div className="shrink-0 rounded-xl border border-cwr-border bg-cwr-bg px-3 py-2 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-cwr-muted">
              Operators
            </p>
            <p className="text-lg font-semibold tabular-nums text-cwr-ink">{providerCount}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cwr-muted">
          Features selected
        </p>
        {activeFilterLabels.length === 0 ? (
          <p className="mt-2 text-sm text-cwr-muted">
            No feature filters yet — showing providers ranked for this project type and city.
          </p>
        ) : (
          <ul className="mt-3 space-y-2" aria-label="Filters applied to this match">
            {activeFilterLabels.map((label) => (
              <li
                key={label}
                className="flex items-start gap-2 text-sm text-cwr-steel"
              >
                <span className="mt-0.5 text-cwr-accent" aria-hidden>
                  ✓
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isRelaxed ? (
        <div className="border-t border-amber-200/80 bg-amber-50/90 px-5 py-4 text-sm leading-relaxed text-amber-950 sm:px-6">
          <p className="font-semibold text-amber-950">
            No one matches every selected feature — these providers may still work for your site.
          </p>
          <p className="mt-1 text-amber-950/90">
            Listed by closest fit. Confirm scope, servicing, and access with the operator before you
            commit.
          </p>
        </div>
      ) : null}
    </div>
  )
}
