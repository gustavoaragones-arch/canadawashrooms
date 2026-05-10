import { useId, useMemo, useState } from 'react'
import { buildProviderIntelligence } from '../lib/intelligence/providerIntelligence'
import { segmentLabel } from '../lib/segments'
import type { FilterCapability, PrimarySegment, Provider } from '../types/provider'

interface ProviderOperationalDetailProps {
  provider: Provider
  activeSegment: PrimarySegment
  activeCapabilities: FilterCapability[]
}

export function ProviderOperationalDetail({
  provider,
  activeSegment,
  activeCapabilities,
}: ProviderOperationalDetailProps) {
  const panelId = useId()
  const [open, setOpen] = useState(false)

  const intelligence = useMemo(
    () => buildProviderIntelligence(provider, { activeSegment }),
    [provider, activeSegment],
  )

  const capabilityPreview = provider.capabilities.slice(0, 12)

  return (
    <div className="border-t border-cwr-border pt-5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-cwr-border bg-cwr-bg px-4 py-3 text-left text-sm font-semibold text-cwr-ink transition-colors duration-150 hover:border-cwr-steel/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent min-h-12"
      >
        <span>Operational intelligence profile</span>
        <span className="text-cwr-muted" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>

      {open ? (
        <div
          id={panelId}
          className="mt-4 space-y-6 rounded-xl border border-cwr-border bg-cwr-bg/80 px-4 py-5 sm:px-5"
        >
            <section>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cwr-muted">
                Trust indicators
              </h4>
              <ul className="mt-3 flex flex-wrap gap-2">
                {intelligence.trustTierLabels.map((label) => (
                  <li
                    key={label}
                    className="rounded-md border border-cwr-border bg-cwr-surface px-2.5 py-1 text-xs font-semibold text-cwr-steel"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </section>

            {provider.operational_trust_cues.length > 0 ? (
              <section>
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cwr-muted">
                  Operational trust cues
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-cwr-muted">
                  Derived from public reviews, Google Business categories, declared listing fields, and
                  analyst locks where applied — informational retrieval cues, not guaranteed capability.
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-cwr-muted marker:text-cwr-accent">
                  {provider.operational_trust_cues.map((cue) => (
                    <li key={cue}>{cue}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cwr-muted">
                Compatibility traits
              </h4>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-cwr-muted">
                {intelligence.compatibilityTraits.map((s, i) => (
                  <li key={`${s}-${i}`}>{s}</li>
                ))}
              </ul>
            </section>

            <section>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cwr-muted">
                Operational specialties (inferred + declared)
              </h4>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-cwr-muted">
                {intelligence.inferredStrengths.slice(0, 6).map((s, i) => (
                  <li key={`${s}-${i}`}>{s}</li>
                ))}
              </ul>
            </section>

            <section>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cwr-muted">
                Supported project contexts
              </h4>
              <ul className="mt-3 flex flex-wrap gap-2">
                {provider.supported_segments.map((seg) => (
                  <li
                    key={seg}
                    className="rounded-full border border-cwr-border bg-cwr-surface px-3 py-1 text-xs font-semibold text-cwr-steel"
                  >
                    {segmentLabel(seg)}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cwr-muted">
                Capability tokens (internal matching vocabulary)
              </h4>
              <p className="mt-2 text-xs text-cwr-muted">
                Derived from declared fields, badges, categories, and conservative review inference — used
                for ranking and future APIs; confirm critical requirements with the operator.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2 font-mono text-[11px] text-cwr-steel">
                {capabilityPreview.map((c) => (
                  <li key={c} className="rounded border border-cwr-border bg-cwr-surface px-2 py-1">
                    {c}
                  </li>
                ))}
                {provider.capabilities.length > capabilityPreview.length ? (
                  <li className="px-2 py-1 text-cwr-muted">
                    +{provider.capabilities.length - capabilityPreview.length} more
                  </li>
                ) : null}
              </ul>
            </section>

            <section>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cwr-muted">
                Matcher context notes
              </h4>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-cwr-muted">
                {intelligence.operationalFitNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              {activeCapabilities.length > 0 ? (
                <p className="mt-3 text-xs text-cwr-muted">
                  Active capability filters: {activeCapabilities.join(', ')}.
                </p>
              ) : null}
            </section>

            {provider.operational_notes ? (
              <section>
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cwr-muted">
                  Operational notes (dataset)
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-cwr-steel">
                  {provider.operational_notes}
                </p>
              </section>
            ) : null}

            <section className="border-t border-cwr-border pt-4 text-[11px] text-cwr-muted">
              <p>
                Operator scale:{' '}
                <span className="font-semibold text-cwr-steel">{provider.operator_scale}</span> ·
                Response posture:{' '}
                <span className="font-semibold text-cwr-steel">{provider.response_priority}</span>
                {provider.years_in_business_estimate != null ? (
                  <>
                    {' '}
                    · Years in business (estimate):{' '}
                    <span className="font-semibold text-cwr-steel">
                      {provider.years_in_business_estimate}
                    </span>
                  </>
                ) : null}
              </p>
            </section>
        </div>
      ) : null}
    </div>
  )
}
