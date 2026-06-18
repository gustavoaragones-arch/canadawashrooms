import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { ProviderCard } from '../components/ProviderCard'
import { DocumentMeta } from '../components/seo/DocumentMeta'
import { buildStaticDocumentMeta } from '../seo/metadata'
import { CANADA_PROVINCES } from '../lib/locations/canadaLocations'
import { PROVIDERS } from '../lib/providersDataset'
import { getFeaturedProviders } from '../lib/getFeaturedProviders'
import { segmentLabel } from '../lib/segments'
import type { PrimarySegment } from '../types/provider'

const PROVINCE_SLUGS: Record<string, string> = {
  AB: 'alberta',
  ON: 'ontario',
  BC: 'british-columbia',
}

const ALL_SEGMENTS: { key: PrimarySegment; slug: string }[] = [
  { key: 'construction', slug: 'construction-jobsites' },
  { key: 'event', slug: 'events-weddings' },
  { key: 'general', slug: 'general-portable-washrooms' },
  { key: 'oilfield', slug: 'remote-oilfield-operations' },
  { key: 'site_services', slug: 'waste-site-services' },
]

const meta = buildStaticDocumentMeta({
  title: 'Portable Washroom Providers in Canada',
  description:
    'Browse all portable toilet and washroom rental companies across Canada — Alberta, Ontario, and British Columbia. Construction, events, general rentals, and remote site operators.',
  canonicalPath: '/providers/',
})

export default function ProvidersPage() {
  const totalCount = PROVIDERS.length
  const liveProvinces = CANADA_PROVINCES.filter((p) => p.live)

  return (
    <>
      <DocumentMeta meta={meta} />
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-sm text-cwr-muted">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link to="/" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                  Home
                </Link>
              </li>
              <li aria-hidden>→</li>
              <li className="font-medium text-cwr-ink">All Providers</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mt-8 border-b border-cwr-border pb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-cwr-ink sm:text-4xl">
              Portable Washroom Providers in Canada
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-cwr-steel">
              Directory of portable toilet and washroom rental operators across Canada. Confirm
              availability, pricing, and servicing range directly with each operator.
            </p>
            {/* Stats row */}
            <div className="mt-6 flex flex-wrap gap-4">
              <Stat label="Providers" value={totalCount} />
              <Stat label="Provinces" value={liveProvinces.length} />
              <Stat label="Service categories" value={ALL_SEGMENTS.length} />
              <Stat
                label="Cities"
                value={CANADA_PROVINCES.flatMap((p) => p.cities.filter((c) => c.live)).length}
              />
            </div>
          </header>

          {/* Browse by category */}
          <section className="mt-10" aria-labelledby="categories-nav-heading">
            <h2
              id="categories-nav-heading"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-cwr-muted"
            >
              Browse by category
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {ALL_SEGMENTS.map(({ key, slug }) => {
                const count = PROVIDERS.filter((p) => p.public_categories?.includes(key)).length
                return (
                  <li key={key}>
                    <Link
                      to={`/${slug}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-cwr-border bg-cwr-bg px-4 py-2 text-sm font-semibold text-cwr-ink transition-colors hover:border-cwr-steel/40 hover:bg-cwr-surface"
                    >
                      {segmentLabel(key)}
                      <span className="rounded-full bg-cwr-surface px-2 py-0.5 text-xs font-medium text-cwr-muted">
                        {count}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* Province sections */}
          {liveProvinces.map((province) => {
            const featured = getFeaturedProviders(PROVIDERS, {
              limit: 4,
              provinceCode: province.code,
            })
            const provinceCount = PROVIDERS.filter((p) => p.province_code === province.code).length
            const liveCities = province.cities.filter((c) => c.live)

            return (
              <section
                key={province.code}
                className="mt-14"
                aria-labelledby={`province-${province.code}-heading`}
              >
                <div className="flex items-baseline justify-between border-b border-cwr-border pb-4">
                  <div>
                    <h2
                      id={`province-${province.code}-heading`}
                      className="text-xl font-semibold text-cwr-ink"
                    >
                      {province.name}
                    </h2>
                    <p className="mt-0.5 text-sm text-cwr-muted">
                      {provinceCount} operator{provinceCount === 1 ? '' : 's'} ·{' '}
                      {liveCities.length} cities
                    </p>
                  </div>
                  <Link
                    to={`/${PROVINCE_SLUGS[province.code]}`}
                    className="text-sm font-semibold text-cwr-accent underline-offset-4 hover:underline"
                  >
                    View all →
                  </Link>
                </div>

                {/* City shortcuts */}
                <ul className="mt-4 flex flex-wrap gap-2">
                  {liveCities.map((city) => {
                    const count = PROVIDERS.filter(
                      (p) =>
                        p.province_code === province.code &&
                        p.city.toLowerCase() === city.name.toLowerCase(),
                    ).length
                    return (
                      <li key={city.slug}>
                        <Link
                          to={`/city/${city.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-cwr-border bg-cwr-bg px-3 py-1.5 text-sm text-cwr-ink transition-colors hover:border-cwr-steel/40 hover:bg-cwr-surface"
                        >
                          {city.name}
                          {count > 0 ? (
                            <span className="text-xs text-cwr-muted">{count}</span>
                          ) : null}
                        </Link>
                      </li>
                    )
                  })}
                </ul>

                {/* Featured operator cards */}
                {featured.length > 0 ? (
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    {featured.map((provider) => (
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
                ) : null}
              </section>
            )
          })}

          {/* Footer nav */}
          <div className="mt-12 border-t border-cwr-border pt-8 text-sm text-cwr-muted">
            <Link to="/" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
              ← Find providers by project type
            </Link>
          </div>

        </div>
      </AppShell>
    </>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-cwr-border bg-cwr-bg px-4 py-3 text-center">
      <p className="text-2xl font-bold tracking-tight text-cwr-ink">{value}</p>
      <p className="mt-0.5 text-xs text-cwr-muted">{label}</p>
    </div>
  )
}
