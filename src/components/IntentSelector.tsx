import { emitProductionAnalytics } from '../lib/analytics/productionAnalytics'
import { INTENT_CARDS } from '../lib/segments'
import type { PrimarySegment } from '../types/provider'

interface IntentSelectorProps {
  selected: PrimarySegment | null
  onSelect: (segment: PrimarySegment) => void
}

export function IntentSelector({ selected, onSelect }: IntentSelectorProps) {
  return (
    <section
      id="intent"
      className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16"
      aria-labelledby="intent-heading"
    >
      <div className="max-w-2xl">
        <h2 id="intent-heading" className="text-2xl font-semibold tracking-tight text-cwr-ink sm:text-3xl">
          What are you provisioning for?
        </h2>
        <p className="mt-3 text-base leading-relaxed text-cwr-muted">
          Pick the dominant operational profile. We route filters, trust signals, and provider
          segmentation from here — not from generic business categories.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {INTENT_CARDS.map((card) => {
          const isSelected = selected === card.segment
          return (
            <button
              key={card.segment}
              type="button"
              onClick={() => {
                emitProductionAnalytics('segment_selected', { segment: card.segment })
                onSelect(card.segment)
              }}
              aria-pressed={isSelected}
              className={[
                'group flex h-full flex-col rounded-2xl border bg-cwr-surface p-6 text-left shadow-card transition-[border-color,box-shadow,background-color] duration-150 ease-out',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent active:scale-[0.995]',
                isSelected
                  ? 'border-cwr-accent ring-2 ring-cwr-accent/25'
                  : 'border-cwr-border hover:border-cwr-steel/35',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-cwr-ink group-hover:text-cwr-steel">
                  {card.title}
                </h3>
                {isSelected ? (
                  <span className="shrink-0 rounded-full bg-cwr-accent-muted px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-cwr-accent">
                    Selected
                  </span>
                ) : null}
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-cwr-muted">{card.microcopy}</p>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Typical capabilities">
                {card.badges.map((badge) => (
                  <li
                    key={badge}
                    className="rounded-full border border-cwr-border bg-cwr-bg px-3 py-1 text-xs font-medium text-cwr-steel"
                  >
                    {badge}
                  </li>
                ))}
              </ul>
            </button>
          )
        })}
      </div>
    </section>
  )
}
