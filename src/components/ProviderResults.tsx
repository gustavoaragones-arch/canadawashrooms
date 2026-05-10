import { MatchSummaryPanel } from './MatchSummaryPanel'
import { ProviderCard } from './ProviderCard'
import { matchHeadline } from '../lib/matchHeadlines'
import type { FilterCapability, PrimarySegment, Provider } from '../types/provider'

interface ProviderResultsProps {
  segment: PrimarySegment
  city: string
  activeCapabilities: FilterCapability[]
  activeFilterLabels: string[]
  isRelaxed: boolean
  providers: Provider[]
  /** When set, replaces the operational summary headline (e.g. editorial landing H1 context). */
  summaryHeadline?: string
}

export function ProviderResults({
  segment,
  city,
  activeCapabilities,
  activeFilterLabels,
  isRelaxed,
  providers,
  summaryHeadline,
}: ProviderResultsProps) {
  const headline = summaryHeadline ?? matchHeadline(segment, city)

  if (providers.length === 0) {
    return (
      <section
        className="mx-auto max-w-3xl px-4 pb-12 pt-2 sm:px-6 md:pb-16 lg:max-w-4xl lg:px-8"
        aria-live="polite"
      >
        <MatchSummaryPanel
          headline={headline}
          city={city}
          activeFilterLabels={activeFilterLabels}
          isRelaxed={false}
          providerCount={0}
        />
        <div className="mt-8 rounded-2xl border border-dashed border-cwr-border bg-cwr-surface px-6 py-12 text-center shadow-card">
          <p className="text-lg font-semibold text-cwr-ink">No operators in this cohort yet</p>
          <p className="mt-3 text-sm leading-relaxed text-cwr-muted">
            The Alberta MVP dataset does not list a provider for this project type in {city}. Try a
            nearby priority city or switch project context — coverage expands as we validate field
            data.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      className="mx-auto max-w-3xl px-4 pb-12 pt-2 sm:px-6 md:pb-20 lg:max-w-4xl lg:px-8"
      aria-label={`Compatibility-ranked operators for ${headline}`}
    >
      <MatchSummaryPanel
        headline={headline}
        city={city}
        activeFilterLabels={activeFilterLabels}
        isRelaxed={isRelaxed}
        providerCount={providers.length}
      />

      {!isRelaxed ? (
        <p className="mt-8 text-sm leading-relaxed text-cwr-muted">
          Ranked for{' '}
          <span className="font-medium text-cwr-steel">compatibility signals</span> in your segment,
          capability overlap, and field reputation — not an alphabetical directory.
        </p>
      ) : (
        <p className="mt-8 text-sm leading-relaxed text-cwr-muted">
          Showing the closest operational fits in {city}. Confirm heating, pump cadence, and access
          constraints directly with the operator before mobilization.
        </p>
      )}

      <div className="mt-10 flex flex-col gap-8 lg:gap-10">
        {providers.map((p) => (
          <ProviderCard
            key={p.id}
            provider={p}
            segment={segment}
            city={city}
            activeCapabilities={activeCapabilities}
            activeFilterLabels={activeFilterLabels}
            isRelaxedFallback={isRelaxed}
          />
        ))}
      </div>
    </section>
  )
}
