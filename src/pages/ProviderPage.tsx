import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { ProviderCard } from '../components/ProviderCard'
import { useOperationalInquiry } from '../components/inquiry/OperationalInquiryContext'
import { DocumentMeta } from '../components/seo/DocumentMeta'
import { JsonLd } from '../components/seo/JsonLd'
import { emitProductionAnalytics } from '../lib/analytics/productionAnalytics'
import { buildProviderIntelligence } from '../lib/intelligence/providerIntelligence'
import { deriveTrustTierLabels } from '../lib/intelligence/trustTiers'
import {
  bestSuitedForLines,
  providerCapabilityChips,
  segmentDisplayLabel,
} from '../lib/providerDetail'
import { getProviderBySlug, relatedProviders } from '../lib/providersLookup'
import { segmentLandingPath } from '../seo/landingRoutes'
import { buildProviderDocumentMeta } from '../seo/providerPageMeta'
import { buildProviderLocalBusinessJsonLd } from '../seo/providerSchema'
import { segmentLabel } from '../lib/segments'
import { TRANSPARENCY } from '../lib/transparencyCopy'

function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '')
  return digits.startsWith('+') ? `tel:${digits}` : `tel:+${digits}`
}

export default function ProviderPage() {
  const { providerSlug } = useParams()
  const { openInquiry } = useOperationalInquiry()

  const provider = useMemo(() => getProviderBySlug(providerSlug), [providerSlug])

  if (!provider) {
    return <Navigate to="/" replace />
  }

  const meta = buildProviderDocumentMeta(provider)
  const jsonLd = buildProviderLocalBusinessJsonLd(provider, meta)
  const intelligence = buildProviderIntelligence(provider, {
    activeSegment: provider.primary_segment,
  })
  const trustLabels = deriveTrustTierLabels(provider)
  const capabilityChips = providerCapabilityChips(provider)
  const suitedFor = bestSuitedForLines(provider)
  const related = relatedProviders(provider, { limit: 5 })
  const segmentGuidePath = segmentLandingPath(provider.primary_segment, provider.city)
  const segmentTitle = segmentDisplayLabel(provider.primary_segment)

  return (
    <>
      <DocumentMeta meta={meta} />
      <JsonLd data={jsonLd} />

      <AppShell>
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:max-w-4xl lg:px-8 lg:py-12">
          <nav aria-label="Breadcrumb" className="text-sm text-cwr-muted">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link to="/" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                  Home
                </Link>
              </li>
              <li aria-hidden>→</li>
              <li>
                {segmentGuidePath ? (
                  <Link
                    to={segmentGuidePath}
                    className="font-semibold text-cwr-accent underline-offset-4 hover:underline"
                  >
                    {segmentTitle}
                  </Link>
                ) : (
                  <span>{segmentTitle}</span>
                )}
              </li>
              <li aria-hidden>→</li>
              <li className="font-medium text-cwr-ink">{provider.company_name}</li>
            </ol>
          </nav>

          <header className="mt-8 border-b border-cwr-border pb-8">
            <div className="flex flex-wrap gap-2">
              {trustLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-md border border-cwr-border bg-cwr-bg px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-cwr-steel"
                >
                  {label}
                </span>
              ))}
              {!provider.website ? (
                <span className="rounded-md border border-cwr-border bg-cwr-bg px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-cwr-muted">
                  Phone-only provider
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-cwr-ink sm:text-4xl">
              {provider.company_name}
            </h1>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
                  Primary segment
                </dt>
                <dd className="mt-1 font-medium text-cwr-ink">{segmentTitle}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
                  Location
                </dt>
                <dd className="mt-1 text-cwr-steel">
                  {provider.city}
                  {provider.province ? `, ${provider.province}` : provider.province_code ? `, ${provider.province_code}` : ''}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
                  Service area
                </dt>
                <dd className="mt-1 text-cwr-steel">{provider.service_area}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
                  Google rating
                </dt>
                <dd className="mt-1 font-semibold text-cwr-ink">
                  <span className="text-amber-600">★</span> {provider.rating.toFixed(1)}
                  <span className="ml-2 font-medium text-cwr-muted">
                    ({provider.review_count} reviews)
                  </span>
                </dd>
              </div>
              {provider.supported_segments.length > 1 ? (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
                    Also supports
                  </dt>
                  <dd className="mt-1 text-cwr-steel">
                    {provider.supported_segments
                      .filter((s) => s !== provider.primary_segment)
                      .map((s) => segmentLabel(s))
                      .join(' · ')}
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() =>
                  openInquiry({
                    segment: provider.primary_segment,
                    city: provider.city,
                    provider,
                    ctaOrigin: 'provider_page',
                  })
                }
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-cwr-ink px-5 py-3 text-sm font-semibold text-cwr-surface transition-colors hover:bg-cwr-steel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent sm:min-w-[11rem]"
              >
                Request a quote
              </button>
              <a
                href={telHref(provider.phone)}
                onClick={() =>
                  emitProductionAnalytics('provider_phone_click', {
                    provider_id: provider.id,
                    surface: 'provider_page',
                  })
                }
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-cwr-border bg-cwr-surface px-5 py-3 text-sm font-semibold text-cwr-ink transition-colors hover:border-cwr-steel/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent sm:min-w-[11rem]"
              >
                Call now
              </a>
              {provider.website ? (
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    emitProductionAnalytics('provider_website_click', {
                      provider_id: provider.id,
                      surface: 'provider_page',
                    })
                  }
                  className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-transparent px-5 py-3 text-sm font-semibold text-cwr-accent underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent sm:flex-none"
                >
                  Website
                </a>
              ) : null}
            </div>
          </header>

          <section className="mt-10" aria-labelledby="provider-fit-heading">
            <h2 id="provider-fit-heading" className="text-lg font-semibold text-cwr-ink">
              Operational fit
            </h2>
            <p className="mt-2 text-sm text-cwr-muted">
              Best suited for (from listing signals and enrichment — verify on your site):
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-cwr-steel">
              {suitedFor.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {intelligence.compatibilityTraits.length > 0 ? (
              <ul className="mt-6 space-y-2 border-t border-cwr-border pt-6 text-sm text-cwr-muted">
                {intelligence.compatibilityTraits.map((t) => (
                  <li key={t}>· {t}</li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="mt-10" aria-labelledby="provider-capabilities-heading">
            <h2 id="provider-capabilities-heading" className="text-lg font-semibold text-cwr-ink">
              Capabilities
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Declared and inferred capabilities">
              {capabilityChips.map((chip) => (
                <li
                  key={chip.key}
                  className={[
                    'rounded-lg border px-3 py-2 text-xs font-semibold',
                    chip.active
                      ? 'border-cwr-accent/35 bg-cwr-accent-muted text-cwr-ink'
                      : 'border-cwr-border bg-cwr-bg/60 text-cwr-muted line-through decoration-cwr-muted/50',
                  ].join(' ')}
                >
                  {chip.label}
                </li>
              ))}
            </ul>
            {provider.operational_tags.length > 0 ? (
              <div className="mt-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
                  Operational tags
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {provider.operational_tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-md border border-cwr-border bg-cwr-bg px-2.5 py-1 font-mono text-[11px] text-cwr-steel"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section className="mt-10" aria-labelledby="provider-notes-heading">
            <h2 id="provider-notes-heading" className="text-lg font-semibold text-cwr-ink">
              Operational notes
            </h2>
            <div className="mt-4 space-y-6 text-sm leading-relaxed text-cwr-steel">
              {provider.operational_notes ? (
                <p>{provider.operational_notes}</p>
              ) : (
                <p className="text-cwr-muted">No free-text operational notes on this listing.</p>
              )}
              {provider.inferred_specialties.length > 0 ? (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
                    Inferred specialties
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {provider.inferred_specialties.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {provider.trust_signals.length > 0 ? (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
                    Trust signals
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {provider.trust_signals.map((sig) => (
                      <li
                        key={sig}
                        className="rounded-md border border-cwr-border bg-cwr-bg px-2.5 py-1 text-xs text-cwr-steel"
                      >
                        {sig.replace(/_/g, ' ')}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {intelligence.operationalFitNotes.length > 0 ? (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
                    Compatibility notes
                  </p>
                  <ul className="mt-2 space-y-2">
                    {intelligence.operationalFitNotes.map((n) => (
                      <li key={n}>· {n}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <p className="mt-6 text-xs text-cwr-muted">{TRANSPARENCY.capabilityInference}</p>
          </section>

          {related.length > 0 ? (
            <section className="mt-14 border-t border-cwr-border pt-12" aria-labelledby="related-providers-heading">
              <h2 id="related-providers-heading" className="text-lg font-semibold text-cwr-ink">
                Related providers
              </h2>
              <p className="mt-2 text-sm text-cwr-muted">
                Similar operators in {provider.city} and adjacent segment fits — for comparison during
                curation.
              </p>
              <div className="mt-8 flex flex-col gap-6">
                {related.map((p) => (
                  <ProviderCard
                    key={p.id}
                    provider={p}
                    segment={provider.primary_segment}
                    city={provider.city}
                    activeCapabilities={[]}
                    activeFilterLabels={[]}
                    isRelaxedFallback={false}
                    variant="compact"
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </AppShell>
    </>
  )
}
