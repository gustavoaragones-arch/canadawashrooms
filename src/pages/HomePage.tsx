import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { useOperationalInquiry } from '../components/inquiry/OperationalInquiryContext'
import { CitySelector } from '../components/CitySelector'
import { Hero } from '../components/Hero'
import { OperationalSearchPanel } from '../components/OperationalSearchPanel'
import { IntentSelector } from '../components/IntentSelector'
import { MatchWorkspace } from '../components/MatchWorkspace'
import { ProviderCard } from '../components/ProviderCard'
import { DocumentMeta } from '../components/seo/DocumentMeta'
import { JsonLd } from '../components/seo/JsonLd'
import { TerminologyFaq } from '../components/seo/TerminologyFaq'
import { defaultSiteMeta } from '../seo/metadata'
import { buildHomeJsonLd } from '../seo/schema'
import { CANADA_PROVINCES } from '../lib/locations/canadaLocations'
import { PROVIDERS } from '../lib/providersDataset'
import { getFeaturedProviders } from '../lib/getFeaturedProviders'
import type { PriorityCity } from '../lib/segments'
import type { PrimarySegment } from '../types/provider'

const PROVINCE_SLUGS: Record<string, string> = {
  AB: 'alberta',
  ON: 'ontario',
  BC: 'british-columbia',
}

// Pre-compute: top 8 quality-scored providers across Canada for the homepage preview
const FEATURED_PROVIDERS = getFeaturedProviders(PROVIDERS, { limit: 8 })

function FeaturedProviders() {
  if (FEATURED_PROVIDERS.length === 0) return null
  return (
    <section
      className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8"
      aria-labelledby="featured-providers-heading"
    >
      <div className="mb-4 flex items-baseline justify-between">
        <h2
          id="featured-providers-heading"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-cwr-muted"
        >
          Top-rated providers across Canada
        </h2>
        <Link
          to="/alberta"
          className="text-xs font-semibold text-cwr-accent underline-offset-4 hover:underline"
        >
          Browse all →
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
        {FEATURED_PROVIDERS.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            segment="general"
            city={provider.city}
            activeCapabilities={[]}
            activeFilterLabels={[]}
            isRelaxedFallback={false}
            variant="compact"
          />
        ))}
      </div>
    </section>
  )
}

function ProvinceSection() {
  const provinceCounts = useMemo(
    () =>
      CANADA_PROVINCES.map((p) => ({
        ...p,
        count: PROVIDERS.filter((pr) => pr.province_code === p.code).length,
        slug: PROVINCE_SLUGS[p.code] ?? p.code.toLowerCase(),
      })),
    [],
  )

  return (
    <section
      className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8"
      aria-labelledby="province-browse-heading"
    >
      <h2
        id="province-browse-heading"
        className="text-xs font-semibold uppercase tracking-[0.18em] text-cwr-muted"
      >
        Browse by province
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {provinceCounts.map((p) => (
          <Link
            key={p.code}
            to={`/${p.slug}`}
            className="group block rounded-2xl border border-cwr-border bg-cwr-bg px-5 py-5 shadow-card transition-colors hover:border-cwr-steel/40 hover:bg-cwr-surface"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-cwr-ink group-hover:text-cwr-accent">
                {p.name}
              </span>
              {!p.live && (
                <span className="rounded-full border border-cwr-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cwr-muted">
                  Coming soon
                </span>
              )}
            </div>
            {p.live ? (
              <>
                <p className="mt-1.5 text-sm text-cwr-muted">
                  {p.count > 0 ? `${p.count} operator${p.count === 1 ? '' : 's'} listed` : 'Dataset in progress'}
                </p>
                <p className="mt-1 text-xs text-cwr-muted">
                  {p.cities.filter((c) => c.live).map((c) => c.name).join(', ')}
                </p>
              </>
            ) : (
              <p className="mt-1.5 text-sm text-cwr-muted">
                {p.cities.map((c) => c.name).slice(0, 4).join(', ')} &amp; more
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}

export default function HomePage() {
  const { openInquiry } = useOperationalInquiry()
  const [segment, setSegment] = useState<PrimarySegment | null>(null)
  const [city, setCity] = useState<PriorityCity | null>(null)

  const homeMeta = useMemo(() => defaultSiteMeta(), [])

  useEffect(() => {
    if (!segment) return
    requestAnimationFrame(() => {
      document.getElementById('location')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }, [segment])

  useEffect(() => {
    if (!segment || !city) return
    requestAnimationFrame(() => {
      document.getElementById('filters')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }, [city, segment])

  function handleIntent(segmentChoice: PrimarySegment) {
    setSegment(segmentChoice)
    setCity(null)
  }

  function handleCity(cityChoice: PriorityCity) {
    setCity(cityChoice)
  }

  return (
    <>
      <DocumentMeta meta={homeMeta} />
      <JsonLd data={buildHomeJsonLd(homeMeta)} />

      <AppShell mainClassName={segment && city ? 'pb-44 md:pb-0' : undefined}>
        {/* 1 — Hero (includes step rail) */}
        <Hero segment={segment} city={city} />

        {/* 2 — Project type (primary entry point) */}
        <IntentSelector selected={segment} onSelect={handleIntent} />

        {/* 4 — Location (only makes sense after a category is chosen) */}
        <CitySelector disabled={!segment} selected={city} onSelect={handleCity} />

        {segment && city ? (
          <>
            {/* 5 — Quote CTA */}
            <div className="mx-auto max-w-6xl px-4 pb-3 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() =>
                  openInquiry({
                    segment,
                    city,
                    ctaOrigin: 'home',
                  })
                }
                className="w-full rounded-2xl border border-cwr-border bg-cwr-surface px-5 py-4 text-left shadow-card transition-colors duration-150 hover:border-cwr-steel/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cwr-muted">
                  Request a quote
                </span>
                <span className="mt-1 block text-sm font-semibold text-cwr-ink">
                  Describe your site and needs — we open your email with a draft you can send to
                  operators.
                </span>
              </button>
            </div>

            {/* 6 — Results */}
            <section id="operator-matching" aria-label="Operator results">
              <MatchWorkspace segment={segment} city={city} />
            </section>

            {/* 7 — Advanced search (below results — power user tool) */}
            <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-cwr-muted">
                Advanced search by feature or city
              </p>
              <OperationalSearchPanel segment={segment} city={city} variant="page" />
            </div>
          </>
        ) : (
          <>
            {/* No context yet — prompt and browse-by-province */}
            <section className="mx-auto max-w-6xl px-4 pb-10 text-center sm:px-6 lg:px-8">
              <p className="rounded-2xl border border-dashed border-cwr-border bg-cwr-surface px-5 py-8 text-sm leading-relaxed text-cwr-muted shadow-card sm:px-6 sm:py-10">
                {!segment
                  ? 'Pick a project type above, then a city — you will get filters and a shortlist of portable washroom operators for that area.'
                  : 'Choose a city to see available portable washroom operators.'}
              </p>
            </section>
            <ProvinceSection />
            <FeaturedProviders />
            <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
              <TerminologyFaq heading="Portable washroom terminology in Canada" />
            </section>
          </>
        )}
      </AppShell>
    </>
  )
}
