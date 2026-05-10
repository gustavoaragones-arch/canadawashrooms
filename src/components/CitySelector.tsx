import { emitProductionAnalytics } from '../lib/analytics/productionAnalytics'
import { PRIORITY_CITIES, type PriorityCity } from '../lib/segments'

interface CitySelectorProps {
  disabled: boolean
  selected: PriorityCity | null
  onSelect: (city: PriorityCity) => void
}

export function CitySelector({ disabled, selected, onSelect }: CitySelectorProps) {
  return (
    <section
      id="location"
      className="scroll-mt-28 border-y border-cwr-border bg-cwr-surface"
      aria-labelledby="location-heading"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="location-heading" className="text-2xl font-semibold tracking-tight text-cwr-ink">
              Where is the project?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-cwr-muted">
              Alberta-first rollout. Priority cities ship with curated matching data for MVP
              validation.
            </p>
          </div>
          {disabled ? (
            <p className="text-sm font-medium text-cwr-accent">Select a project type to continue.</p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap gap-3" role="group" aria-label="Alberta priority cities">
          {PRIORITY_CITIES.map((city) => {
            const isSelected = selected === city
            return (
              <button
                key={city}
                type="button"
                disabled={disabled}
                onClick={() => {
                  emitProductionAnalytics('city_selected', { city })
                  onSelect(city)
                }}
                aria-pressed={isSelected}
                className={[
                  'min-h-11 rounded-full border px-5 py-2.5 text-sm font-semibold transition-[border-color,background-color,color] duration-150 ease-out',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent active:scale-[0.99]',
                  disabled
                    ? 'cursor-not-allowed border-cwr-border bg-cwr-bg text-cwr-muted'
                    : isSelected
                      ? 'border-cwr-accent bg-cwr-accent-muted text-cwr-ink'
                      : 'border-cwr-border bg-cwr-bg text-cwr-ink hover:border-cwr-steel/40',
                ].join(' ')}
              >
                {city}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
