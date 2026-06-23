import { Link, useParams, Navigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { DocumentMeta } from '../components/seo/DocumentMeta'
import { ProviderCard } from '../components/ProviderCard'
import { buildStaticDocumentMeta } from '../seo/metadata'
import { CANADA_PROVINCES } from '../lib/locations/canadaLocations'
import { PROVIDERS } from '../lib/providersDataset'
import { getFeaturedProviders } from '../lib/getFeaturedProviders'
import { segmentLabel } from '../lib/segments'
import { publicCategoryLabel } from '../lib/taxonomy/publicCategoryMapper'
import { providerDisplayCategories } from '../lib/taxonomy/publicPrimaryCategories'
import { LANDING_ROUTE_GROUPS } from '../seo/landingRoutes'
import type { PrimarySegment, PublicPrimaryCategory } from '../types/provider'

const PROVINCE_SLUGS: Record<string, string> = {
  AB: 'alberta',
  SK: 'saskatchewan',
  ON: 'ontario',
  BC: 'british-columbia',
}

const ALL_CATEGORIES: PublicPrimaryCategory[] = [
  'general',
  'construction',
  'event',
  'oilfield',
]

export default function CityPage() {
  const { citySlug } = useParams<{ citySlug: string }>()
  // Resolve city from all provinces
  const cityEntry = CANADA_PROVINCES.flatMap((p) => p.cities).find(
    (c) => c.slug === citySlug?.toLowerCase(),
  )

  if (!cityEntry) return <Navigate to="/" replace />

  const province = CANADA_PROVINCES.find((p) => p.code === cityEntry.provinceCode)!

  // All providers in this city, sorted by review count then rating
  const cityProviders = PROVIDERS.filter(
    (p) => p.city.toLowerCase() === cityEntry.name.toLowerCase(),
  ).sort((a, b) => {
    if (b.review_count !== a.review_count) return b.review_count - a.review_count
    return b.rating - a.rating
  })

  // Featured providers (quality-scored top 4)
  const featuredProviders = getFeaturedProviders(cityProviders, { limit: 4 })
  const remainingProviders = cityProviders.filter(
    (p) => !featuredProviders.some((f) => f.id === p.id),
  )

  // Category breakdown counts
  const categoryCounts = ALL_CATEGORIES.map((cat) => ({
    cat,
    count: cityProviders.filter((p) => providerDisplayCategories(p).includes(cat)).length,
  })).filter((c) => c.count > 0)

  // Landing route entries for this city (for "Browse by type" links)
  const landingLinks = LANDING_ROUTE_GROUPS.filter((g) =>
    g.cities.some((c) => c.citySlug === citySlug),
  ).map((g) => ({
    segment: g.segment as PrimarySegment,
    segmentSlug: g.segmentSlug,
    citySlug: citySlug!,
  }))

  const meta = buildStaticDocumentMeta({
    title: `Portable Washroom Providers in ${cityEntry.name}`,
    description: `Find portable toilet and washroom rental providers in ${cityEntry.name}, ${province.name}. ${cityProviders.length} operators listed — construction, events, general rentals, and more.`,
    canonicalPath: `/city/${citySlug}/`,
  })

  const providerCount = cityProviders.length

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
              <li>
                <Link
                  to={`/${PROVINCE_SLUGS[cityEntry.provinceCode] ?? cityEntry.provinceCode.toLowerCase()}`}
                  className="font-semibold text-cwr-accent underline-offset-4 hover:underline"
                >
                  {province.name}
                </Link>
              </li>
              <li aria-hidden>→</li>
              <li className="font-medium text-cwr-ink">{cityEntry.name}</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mt-8 border-b border-cwr-border pb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-cwr-ink sm:text-4xl">
              Portable Washroom Providers in {cityEntry.name}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-cwr-steel">
              {providerCount > 0
                ? `${providerCount} operator${providerCount === 1 ? '' : 's'} listed in ${cityEntry.name}, ${province.name}.`
                : `No providers listed yet in ${cityEntry.name}.`}{' '}
              Confirm availability, pricing, and servicing range directly with each operator.
            </p>

            {/* Category breakdown */}
            {categoryCounts.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {categoryCounts.map(({ cat, count }) => (
                  <span
                    key={cat}
                    className="rounded-lg border border-cwr-border bg-cwr-bg px-3 py-1.5 text-xs font-semibold text-cwr-steel"
                  >
                    {publicCategoryLabel(cat)} · {count}
                  </span>
                ))}
              </div>
            ) : null}
          </header>

          {/* Browse by type shortcut links */}
          {landingLinks.length > 0 ? (
            <section className="mt-8" aria-labelledby="category-links-heading">
              <h2
                id="category-links-heading"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-cwr-muted"
              >
                Browse by type
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {landingLinks.map(({ segment, segmentSlug, citySlug: cs }) => (
                  <li key={segment}>
                    <Link
                      to={`/${segmentSlug}/${cs}/`}
                      className="inline-block rounded-xl border border-cwr-border bg-cwr-bg px-4 py-2 text-sm font-semibold text-cwr-ink transition-colors hover:border-cwr-steel/40 hover:bg-cwr-surface"
                    >
                      {segmentLabel(segment)}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Provider listing */}
          {cityProviders.length > 0 ? (
            <>
              {/* Featured operators */}
              <section className="mt-10" aria-labelledby="featured-heading">
                <h2 id="featured-heading" className="text-base font-semibold text-cwr-ink">
                  Featured operators in {cityEntry.name}
                </h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {featuredProviders.map((provider) => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      segment="general"
                      city={cityEntry.name}
                      activeCapabilities={[]}
                      activeFilterLabels={[]}
                      isRelaxedFallback={false}
                    />
                  ))}
                </div>
              </section>

              {/* Remaining providers */}
              {remainingProviders.length > 0 ? (
                <section className="mt-12" aria-labelledby="all-providers-heading">
                  <h2 id="all-providers-heading" className="text-base font-semibold text-cwr-ink">
                    More providers in {cityEntry.name}
                  </h2>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    {remainingProviders.map((provider) => (
                      <ProviderCard
                        key={provider.id}
                        provider={provider}
                        segment="general"
                        city={cityEntry.name}
                        activeCapabilities={[]}
                        activeFilterLabels={[]}
                        isRelaxedFallback={false}
                        variant="compact"
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-cwr-border bg-cwr-surface px-5 py-10 text-center">
              <p className="text-sm text-cwr-muted">
                No providers are currently listed for {cityEntry.name}. Use the{' '}
                <Link to="/" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                  search tool
                </Link>{' '}
                to find nearby operators.
              </p>
            </div>
          )}

          {/* Footer nav */}
          <div className="mt-12 border-t border-cwr-border pt-8 text-sm text-cwr-muted">
            <Link
              to={`/${PROVINCE_SLUGS[cityEntry.provinceCode] ?? cityEntry.provinceCode.toLowerCase()}`}
              className="font-semibold text-cwr-accent underline-offset-4 hover:underline"
            >
              ← All {province.name} providers
            </Link>
          </div>

        </div>
      </AppShell>
    </>
  )
}
