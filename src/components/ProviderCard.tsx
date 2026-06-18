import { Link } from 'react-router-dom'
import { getCompatibilityLabel } from '../lib/compatibilityLabel'
import { emitProductionAnalytics } from '../lib/analytics/productionAnalytics'
import { TRANSPARENCY } from '../lib/transparencyCopy'
import { publicCategoryLabel } from '../lib/taxonomy/publicCategoryMapper'
import type { FilterCapability, PrimarySegment, Provider } from '../types/provider'
import { useOperationalInquiry } from './inquiry/OperationalInquiryContext'
import { ProviderOperationalDetail } from './ProviderOperationalDetail'

/**
 * Feature flags rendered on cards — user-friendly labels for real CSV-sourced signals.
 * Only fields that are actually truthy in the dataset are shown.
 * Uses `winterized` as a fallback for `heated` to cover old enrichment flags.
 */
const FEATURE_MAP: { key: keyof Provider; label: string; alt?: keyof Provider }[] = [
  { key: 'heated',             label: 'Heated Restrooms',       alt: 'winterized' },
  { key: 'handwash_available', label: 'Handwashing Stations' },
  { key: 'ada_accessible',     label: 'Wheelchair Accessible' },
  { key: 'luxury_units',       label: 'Luxury Trailer Units' },
  { key: 'flushing_units',     label: 'Flush Toilets',          alt: 'flush_toilets' },
  { key: 'crane_liftable',     label: 'Crane Liftable' },
  { key: 'weekly_service',     label: 'Weekly Servicing' },
]

function FeatureBadges({ provider }: { provider: Provider }) {
  const active = FEATURE_MAP.filter(
    (f) => provider[f.key] || (f.alt && provider[f.alt as keyof Provider]),
  )
  if (!active.length) return null
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cwr-muted">
        Available features
      </p>
      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Provider features">
        {active.map((f) => (
          <li
            key={f.key}
            className="rounded-lg border border-cwr-border bg-cwr-bg px-3 py-1.5 text-xs font-semibold text-cwr-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.65)]"
          >
            {f.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

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
  activeCapabilities,
  activeFilterLabels,
  isRelaxedFallback,
  variant = 'default',
}: ProviderCardProps) {
  const { openInquiry } = useOperationalInquiry()
  const compact = variant === 'compact'
  const detailPath = `/provider/${provider.id}`
  // Show public_categories if present; fall back to primary_segment label
  const categoryLabels: string[] = provider.public_categories?.length
    ? provider.public_categories.map(publicCategoryLabel)
    : [publicCategoryLabel(provider.primary_segment)]
  const matchLabel = getCompatibilityLabel(
    provider,
    segment,
    activeCapabilities,
    isRelaxedFallback,
  )

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
        className={`relative z-10 flex flex-col gap-6 pointer-events-none ${compact ? 'px-4 py-4 sm:px-5 sm:py-5' : 'px-5 py-6 sm:px-7 sm:py-8'}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
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
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {categoryLabels.map((label) => (
                <span
                  key={label}
                  className="inline-block rounded-md border border-cwr-accent/25 bg-cwr-accent-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-cwr-accent"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
          {!compact ? (
            <div className="shrink-0 pt-1 text-right">
              <span className="inline-block rounded-md border border-cwr-border bg-cwr-bg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-cwr-steel">
                {matchLabel}
              </span>
            </div>
          ) : null}
        </div>

        {!compact ? <FeatureBadges provider={provider} /> : null}

        <div className="rounded-xl border border-dashed border-cwr-border bg-cwr-bg/80 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cwr-muted">
            Service area
          </p>
          <p className="mt-2 text-sm leading-relaxed text-cwr-steel line-clamp-2">
            {provider.service_area}
          </p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-cwr-border pt-4">
          <div>
            <p
              className="text-base font-semibold text-cwr-ink"
              aria-label={`Google rating ${provider.rating} out of 5, ${provider.review_count} reviews`}
            >
              <span className="text-amber-500">★</span> {provider.rating.toFixed(1)}
              <span className="ml-2 text-sm font-medium text-cwr-muted">
                ({provider.review_count} reviews)
              </span>
            </p>
          </div>
          {compact ? (
            <span className="text-xs font-semibold text-cwr-accent">View profile →</span>
          ) : null}
        </div>

        {!compact ? (
          <ProviderOperationalDetail
            provider={provider}
            activeSegment={segment}
            activeCapabilities={activeCapabilities}
          />
        ) : null}
      </div>

      <div className="relative z-20 flex flex-col gap-3 border-t border-cwr-border bg-cwr-bg/50 px-5 py-5 sm:px-7">
        {!compact ? (
          <p className="text-center text-[10px] leading-snug text-cwr-muted">{TRANSPARENCY.availability}</p>
        ) : null}
        {!provider.website && !compact ? (
          <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
            Phone-only provider
          </p>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
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
            className="pointer-events-auto inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-xl bg-cwr-ink px-4 py-3.5 text-center text-sm font-semibold text-cwr-surface transition-colors duration-150 hover:bg-cwr-steel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent sm:min-w-[10.5rem]"
          >
            Request a quote
          </button>
          <a
            href={telHref(provider.phone)}
            onClick={() =>
              emitProductionAnalytics('provider_phone_click', { provider_id: provider.id })
            }
            className="pointer-events-auto inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-cwr-border bg-cwr-surface px-4 py-3.5 text-center text-sm font-semibold text-cwr-ink transition-colors duration-150 hover:border-cwr-steel/45 hover:bg-cwr-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent sm:min-w-[10.5rem]"
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
              className="pointer-events-auto inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-transparent px-4 py-3.5 text-center text-sm font-semibold text-cwr-accent underline-offset-4 transition-colors duration-150 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent sm:flex-none"
            >
              Website
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}
