import type { FilterCapability, PrimarySegment, Provider } from '../types/provider'

interface ProviderOperationalDetailProps {
  provider: Provider
  activeSegment: PrimarySegment
  activeCapabilities: FilterCapability[]
}

/**
 * Inline operational note shown below the feature badges on a provider card.
 * Only renders when the provider has a curated operational_notes string.
 * All internal matching vocabulary has been removed from cards — see ProviderPage
 * for the full detail view.
 */
export function ProviderOperationalDetail({
  provider,
}: ProviderOperationalDetailProps) {
  if (!provider.operational_notes) return null

  return (
    <div className="rounded-xl border border-dashed border-cwr-border bg-cwr-bg/60 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cwr-muted">
        Operator note
      </p>
      <p className="mt-2 text-sm leading-relaxed text-cwr-steel">
        {provider.operational_notes}
      </p>
    </div>
  )
}
