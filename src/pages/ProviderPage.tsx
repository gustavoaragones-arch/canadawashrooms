import { useLayoutEffect, useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { ProviderCard } from '../components/ProviderCard'
import { ProviderFeatureBadges } from '../components/ProviderFeatureBadges'
import { ProviderServicesOffered } from '../components/ProviderServicesOffered'
import { useOperationalInquiry } from '../components/inquiry/OperationalInquiryContext'
import { DocumentMeta } from '../components/seo/DocumentMeta'
import { JsonLd } from '../components/seo/JsonLd'
import { emitProductionAnalytics } from '../lib/analytics/productionAnalytics'
import { segmentDisplayLabel } from '../lib/providerDetail'
import { getProviderBySlug, relatedProviders } from '../lib/providersLookup'
import { segmentLandingPath } from '../seo/landingRoutes'
import { buildProviderDocumentMeta } from '../seo/providerPageMeta'
import { buildProviderLocalBusinessJsonLd } from '../seo/providerSchema'

function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '')
  return digits.startsWith('+') ? `tel:${digits}` : `tel:+${digits}`
}

function formatPhoneDisplay(phone: string): string {
  return phone.replace(/^\+1/, '').trim() || phone
}

export default function ProviderPage() {
  const { providerSlug } = useParams()
  const { openInquiry } = useOperationalInquiry()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [providerSlug])

  const provider = useMemo(() => getProviderBySlug(providerSlug), [providerSlug])

  if (!provider) {
    return <Navigate to="/" replace />
  }

  const meta = buildProviderDocumentMeta(provider)
  const jsonLd = buildProviderLocalBusinessJsonLd(provider, meta)
  const related = relatedProviders(provider, { limit: 5 })
  const segmentGuidePath = segmentLandingPath(provider.primary_segment, provider.city)
  const segmentTitle = segmentDisplayLabel(provider.primary_segment)
  const locationLine = [
    provider.city,
    provider.province ?? provider.province_code ?? '',
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <>
      <DocumentMeta meta={meta} />
      <JsonLd data={jsonLd} />

      <AppShell>
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:max-w-4xl lg:px-8 lg:py-10">
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

          <header className="mt-6 border-b border-cwr-border pb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-cwr-ink sm:text-4xl">
              {provider.company_name}
            </h1>

            <p className="mt-2 text-base text-cwr-steel">{locationLine}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {provider.rating > 0 ? (
                <p className="font-semibold text-cwr-ink">
                  <span className="text-amber-600">★</span> {provider.rating.toFixed(1)}
                  <span className="ml-1.5 font-medium text-cwr-muted">
                    ({provider.review_count} Google review{provider.review_count === 1 ? '' : 's'})
                  </span>
                </p>
              ) : (
                <p className="text-cwr-muted">No Google rating available</p>
              )}
              {provider.phone ? (
                <a
                  href={telHref(provider.phone)}
                  onClick={() =>
                    emitProductionAnalytics('provider_phone_click', {
                      provider_id: provider.id,
                      surface: 'provider_page',
                    })
                  }
                  className="font-semibold text-cwr-accent underline-offset-4 hover:underline"
                >
                  {formatPhoneDisplay(provider.phone)}
                </a>
              ) : null}
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
                  className="font-semibold text-cwr-accent underline-offset-4 hover:underline"
                >
                  Visit website ↗
                </a>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={telHref(provider.phone)}
                onClick={() =>
                  emitProductionAnalytics('provider_phone_click', {
                    provider_id: provider.id,
                    surface: 'provider_page',
                  })
                }
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-cwr-ink px-5 py-3 text-sm font-semibold text-cwr-surface transition-colors hover:bg-cwr-steel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent sm:min-w-[11rem]"
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
                  className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-cwr-border bg-cwr-surface px-5 py-3 text-sm font-semibold text-cwr-ink transition-colors hover:border-cwr-steel/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent sm:min-w-[11rem]"
                >
                  Website
                </a>
              ) : null}
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
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-cwr-border bg-cwr-bg px-5 py-3 text-sm font-semibold text-cwr-ink transition-colors hover:border-cwr-steel/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent sm:min-w-[11rem]"
              >
                Request a quote
              </button>
            </div>

            <ProviderServicesOffered provider={provider} className="mt-8" />
            <ProviderFeatureBadges provider={provider} className="mt-6" />

            {provider.service_area ? (
              <p className="mt-6 text-sm leading-relaxed text-cwr-steel">
                <span className="font-semibold text-cwr-ink">Service area:</span>{' '}
                {provider.service_area}
              </p>
            ) : null}

            {provider.google_maps_url ? (
              <p className="mt-3">
                <a
                  href={provider.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    emitProductionAnalytics('provider_maps_click', {
                      provider_id: provider.id,
                      surface: 'provider_page',
                    })
                  }
                  className="text-sm font-semibold text-cwr-accent underline-offset-4 hover:underline"
                >
                  View on Google Maps ↗
                </a>
              </p>
            ) : null}
          </header>

          {provider.operational_notes ? (
            <section className="mt-8" aria-labelledby="provider-about-heading">
              <h2 id="provider-about-heading" className="text-lg font-semibold text-cwr-ink">
                About this provider
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-cwr-steel">
                {provider.operational_notes}
              </p>
            </section>
          ) : null}

          {related.length > 0 ? (
            <section
              className="mt-12 border-t border-cwr-border pt-10"
              aria-labelledby="related-providers-heading"
            >
              <h2 id="related-providers-heading" className="text-lg font-semibold text-cwr-ink">
                Similar providers nearby
              </h2>
              <p className="mt-2 text-sm text-cwr-muted">
                Other portable washroom operators in {provider.city} and surrounding areas.
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
