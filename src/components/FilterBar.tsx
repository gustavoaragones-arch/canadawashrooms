import { emitProductionAnalytics } from '../lib/analytics/productionAnalytics'
import { SEGMENT_FILTERS, segmentLabel } from '../lib/segments'
import type { FilterCapability, PrimarySegment } from '../types/provider'
import type { PriorityCity } from '../lib/segments'

interface FilterBarProps {
  segment: PrimarySegment
  city: PriorityCity
  active: Set<FilterCapability>
  onToggle: (capability: FilterCapability) => void
  onClear: () => void
}

export function FilterBar({ segment, city, active, onToggle, onClear }: FilterBarProps) {
  const defs = SEGMENT_FILTERS[segment]
  const count = active.size

  return (
    <section
      id="filters"
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8"
      aria-labelledby="filters-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="filters-heading" className="text-xl font-semibold tracking-tight text-cwr-ink">
            Narrow by on-site requirements
          </h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-cwr-muted">
            <span>
              {segmentLabel(segment)} · {city}
            </span>
            <span className="hidden sm:inline" aria-hidden>
              ·
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors duration-150 ${
                count > 0
                  ? 'border-cwr-accent/40 bg-cwr-accent-muted text-cwr-ink'
                  : 'border-cwr-border bg-cwr-bg text-cwr-muted'
              }`}
            >
              {count === 0 ? '0 filters' : `${count} active`}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (count > 0) emitProductionAnalytics('capability_filters_cleared', { segment, city })
            onClear()
          }}
          disabled={count === 0}
          className="self-start rounded-full border border-cwr-border bg-cwr-surface px-4 py-2.5 text-sm font-semibold text-cwr-steel transition-all duration-150 hover:border-cwr-steel/35 hover:bg-cwr-bg disabled:cursor-not-allowed disabled:opacity-40 enabled:active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent sm:self-auto min-h-11"
        >
          Clear all filters
        </button>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-cwr-muted">
        Filters adapt to your project type. Multiple selections require an operator to satisfy{' '}
        <span className="font-medium text-cwr-steel">every</span> active capability — or we surface
        the closest operational alternatives automatically.
      </p>

      <div className="mt-6 flex flex-wrap gap-2.5" role="group" aria-label="Capability filters">
        {defs.map((def) => {
          const isOn = active.has(def.capability)
          return (
            <button
              key={def.id}
              type="button"
              aria-pressed={isOn}
              onClick={() => {
                emitProductionAnalytics('capability_filter_toggled', {
                  capability: def.capability,
                  segment,
                  city,
                })
                onToggle(def.capability)
              }}
              className={[
                'min-h-11 rounded-full border px-4 py-2.5 text-sm font-semibold transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent',
                'active:scale-[0.99]',
                isOn
                  ? 'border-cwr-accent bg-cwr-accent-muted text-cwr-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.5)] ring-2 ring-cwr-accent/20'
                  : 'border-cwr-border bg-cwr-surface text-cwr-steel hover:border-cwr-steel/40 hover:bg-cwr-bg',
              ].join(' ')}
            >
              {def.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}
