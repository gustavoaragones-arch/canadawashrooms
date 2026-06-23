import { Link } from 'react-router-dom'
import { emitProductionAnalytics } from '../lib/analytics/productionAnalytics'
import type { FilterCapability, PrimarySegment, Provider } from '../types/provider'
import { useOperationalInquiry } from './inquiry/OperationalInquiryContext'
import { ProviderFeatureBadges } from './ProviderFeatureBadges'
import { ProviderOperationalDetail } from './ProviderOperationalDetail'
import { ProviderServicesOffered } from './ProviderServicesOffered'

interface ProviderCardProps {
  provider: Provider
  segment: PrimarySegment
  /** Matcher workspace city — aligns inquiry targeting with the active cohort. */
  city: string
  activeCapabilities: FilterCapability[]
  activeFilterLabels: string[]
  isRelaxedFallback: boolean
  /** Compact layout for related-provider lists on detail pages. */
  variant?: 'default' | 'compact'
}

function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '')
  return digits.startsWith('+') ? `tel:${digits}` : `tel:+${digits}`
}

export function ProviderCard({
  provider,
  segment,
  city,
  activeFilterLabels,
  variant = 'default',
}: ProviderCardProps) {
  const { openInquiry } = useOperationalInquiry()
  const compact = variant === 'compact'
  const detailPath = `/provider/${provider.id}`

  return (
    <article
      id={`provider-anchor-${provider.id}`}
      className="group relative flex scroll-mt-32 flex-col rounded-2xl border border-cwr-border bg-cwr-surface shadow-card transition-[box-shadow,border-color] duration-200 ease-out hover:border-cwr-steel/25 hover:shadow-[0_16px_40px_-12px_rgb(20_20_19/0.18)] focus-within:border-cwr-steel/30 focus-within:shadow-[0_16px_40px_-12px_rgb(20_20_19/0.18)]"
    >
      <Link
        to={detailPath}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent"
        aria-label={`View ${provider.company_name} profile`}
      />

      <div
        className={`relative z-10 flex flex-col gap-5 pointer-events-none ${compact ? 'px-4 py-4 sm:px-5 sm:py-5' : 'px-5 py-6 sm:px-7 sm:py-7'}`}
      >
        <div className="min-w-0">
          <h3
            className={
              compact
                ? 'text-lg font-semibold tracking-tight text-cwr-ink group-hover:text-cwr-accent'
                : 'text-xl font-semibold tracking-tight text-cwr-ink sm:text-[1.35rem] group-hover:text-cwr-accent'
            }
          >
            {provider.company_name}
          </h3>
          <p className="mt-1 text-sm text-cwr-steel">
            {provider.city}
            {provider.province_code ? `, ${provider.province_code}` : ''}
          </p>
          <p
            className="mt-3 text-base font-semibold text-cwr-ink"
            aria-label={`Google rating ${provider.rating} out of 5, ${provider.review_count} reviews`}
          >
            {provider.rating > 0 ? (
              <>
                <span className="text-amber-500">★</span> {provider.rating.toFixed(1)}
                <span className="ml-2 text-sm font-medium text-cwr-muted">
                  ({provider.review_count} reviews)
                </span>
              </>
            ) : (
              <span className="text-sm font-normal text-cwr-muted">No rating data</span>
            )}
          </p>
        </div>

        <ProviderServicesOffered provider={provider} />
        {!compact ? <ProviderFeatureBadges provider={provider} /> : null}

        {!compact && provider.service_area ? (
          <p className="text-sm leading-relaxed text-cwr-steel line-clamp-2">
            <span className="font-semibold text-cwr-ink">Service area:</span> {provider.service_area}
          </p>
        ) : null}

        {!compact ? (
          <ProviderOperationalDetail provider={provider} />
        ) : null}

        {compact ? (
          <span className="text-xs font-semibold text-cwr-accent">View profile →</span>
        ) : null}
      </div>

      <div className="relative z-20 flex flex-col gap-3 border-t border-cwr-border bg-cwr-bg/50 px-5 py-5 sm:px-7">
        {!provider.website && !compact ? (
          <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
            Phone-only provider
          </p>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
          <a
            href={telHref(provider.phone)}
            onClick={() =>
              emitProductionAnalytics('provider_phone_click', { provider_id: provider.id })
            }
            className="pointer-events-auto inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-cwr-ink px-4 py-3.5 text-center text-sm font-semibold text-cwr-surface transition-colors duration-150 hover:bg-cwr-steel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent sm:min-w-[10.5rem]"
          >
            Call now
          </a>
          {provider.website ? (
            <a
              href={provider.website}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                emitProductionAnalytics('provider_website_click', { provider_id: provider.id })
              }
              className="pointer-events-auto inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-cwr-border bg-cwr-surface px-4 py-3.5 text-center text-sm font-semibold text-cwr-ink transition-colors duration-150 hover:border-cwr-steel/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent sm:min-w-[10.5rem]"
            >
              Website
            </a>
          ) : null}
          <button
            type="button"
            onClick={() =>
              openInquiry({
                segment,
                city,
                provider,
                activeCapabilityLabels: activeFilterLabels,
                ctaOrigin: 'card',
              })
            }
            className="pointer-events-auto inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-xl border border-cwr-border bg-cwr-bg px-4 py-3.5 text-center text-sm font-semibold text-cwr-ink transition-colors duration-150 hover:border-cwr-steel/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent sm:min-w-[10.5rem]"
          >
            Request a quote
          </button>
        </div>
      </div>
    </article>
  )
}
