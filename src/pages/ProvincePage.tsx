import { Link, useParams, Navigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { DocumentMeta } from '../components/seo/DocumentMeta'
import { buildStaticDocumentMeta } from '../seo/metadata'
import { CANADA_PROVINCES, type ProvinceCode } from '../lib/locations/canadaLocations'
import { PROVIDERS } from '../lib/providersDataset'
import { LANDING_ROUTE_GROUPS, listingPath } from '../seo/landingRoutes'
import { segmentLabel } from '../lib/segments'
import type { PrimarySegment } from '../types/provider'

const PROVINCE_SLUG_MAP: Record<string, ProvinceCode> = {
  alberta: 'AB',
  ontario: 'ON',
  'british-columbia': 'BC',
}

const PROVINCE_META: Record<ProvinceCode, { title: string; description: string }> = {
  AB: {
    title: 'Portable Washroom Rentals in Alberta',
    description:
      'Find portable toilet and washroom rental providers across Alberta — Calgary, Edmonton, Fort McMurray, Red Deer, and more. Construction, events, remote operations, and general rentals.',
  },
  ON: {
    title: 'Portable Washroom Rentals in Ontario',
    description:
      'Compare portable washroom providers across Ontario — Toronto, Mississauga, Hamilton, Vaughan, and more. Construction sites, events, and everyday portable toilet rentals.',
  },
  BC: {
    title: 'Portable Washroom Rentals in British Columbia — Coming Soon',
    description:
      'BC coverage coming to CanadaWashrooms.ca. Vancouver, Kelowna, Kamloops, and more will be added in the next expansion.',
  },
}

export default function ProvincePage() {
  const { provinceSlug } = useParams<{ provinceSlug: string }>()
  const provinceCode = PROVINCE_SLUG_MAP[provinceSlug?.toLowerCase() ?? '']
  const province = CANADA_PROVINCES.find((p) => p.code === provinceCode)

  if (!provinceCode || !province) return <Navigate to="/" replace />

  const liveCities = province.cities.filter((c) => c.live)
  const comingSoonCities = province.cities.filter((c) => !c.live)
  const providerCount = PROVIDERS.filter((p) => p.province_code === provinceCode).length

  const segmentLinks: PrimarySegment[] = (() => {
    if (!province.live) return []
    const segments = new Set<PrimarySegment>()
    for (const group of LANDING_ROUTE_GROUPS) {
      for (const city of group.cities) {
        if (liveCities.some((c) => c.slug === city.citySlug)) {
          segments.add(group.segment as PrimarySegment)
          break
        }
      }
    }
    return [...segments]
  })()

  const provinceMeta = PROVINCE_META[provinceCode]
  const meta = buildStaticDocumentMeta({
    title: provinceMeta.title,
    description: provinceMeta.description,
    canonicalPath: `/${provinceSlug}/`,
  })

  return (
    <>
      <DocumentMeta meta={meta} />
      <AppShell>
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-sm text-cwr-muted">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link to="/" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                  Home
                </Link>
              </li>
              <li aria-hidden>→</li>
              <li className="font-medium text-cwr-ink">{province.name}</li>
            </ol>
          </nav>

          <header className="mt-8 border-b border-cwr-border pb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cwr-accent">
              {province.live ? 'Live' : 'Coming soon'}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-cwr-ink sm:text-4xl">
              {province.live
                ? `Portable washroom providers in ${province.name}`
                : `${province.name} — coming soon`}
            </h1>
            {province.live ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-cwr-steel">
                {providerCount > 0
                  ? `${providerCount} provider${providerCount === 1 ? '' : 's'} currently in the ${province.name} dataset across ${liveCities.length} cities.`
                  : `${province.name} providers are being curated. Check back soon.`}{' '}
                Confirm availability, pricing, and servicing range directly with each operator.
              </p>
            ) : (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-cwr-steel">
                {province.name} is the next expansion after Alberta and Ontario. Dataset curation is in
                progress.
              </p>
            )}
          </header>

          {province.live ? (
            <>
              {/* Segment entry points */}
              {segmentLinks.length > 0 ? (
                <section className="mt-10" aria-labelledby="segments-heading">
                  <h2 id="segments-heading" className="text-base font-semibold text-cwr-ink">
                    Browse by category
                  </h2>
                  <ul className="mt-4 flex flex-wrap gap-3">
                    {segmentLinks.map((seg) => {
                      const firstCity = liveCities[0]
                      if (!firstCity) return null
                      const group = LANDING_ROUTE_GROUPS.find((g) => g.segment === seg)
                      const cityEntry = group?.cities.find((c) =>
                        liveCities.some((lc) => lc.slug === c.citySlug),
                      )
                      if (!cityEntry) return null
                      return (
                        <li key={seg}>
                          <Link
                            to={listingPath({ segmentSlug: group!.segmentSlug, citySlug: cityEntry.citySlug, city: cityEntry.city, segment: seg })}
                            className="inline-block rounded-xl border border-cwr-border bg-cwr-bg px-4 py-2.5 text-sm font-semibold text-cwr-ink transition-colors hover:border-cwr-steel/40 hover:bg-cwr-surface"
                          >
                            {segmentLabel(seg)}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ) : null}

              {/* Live cities */}
              {liveCities.length > 0 ? (
                <section className="mt-10" aria-labelledby="cities-heading">
                  <h2 id="cities-heading" className="text-base font-semibold text-cwr-ink">
                    Cities with published guides
                  </h2>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {liveCities.map((city) => {
                      const cityProviders = PROVIDERS.filter(
                        (p) => p.province_code === provinceCode && p.city.toLowerCase() === city.name.toLowerCase(),
                      ).length
                      return (
                        <li key={city.slug}>
                          <Link
                            to={`/?city=${city.slug}`}
                            className="block rounded-xl border border-cwr-border bg-cwr-bg px-4 py-4 transition-colors hover:border-cwr-steel/40 hover:bg-cwr-surface"
                          >
                            <span className="block text-sm font-semibold text-cwr-ink">{city.name}</span>
                            {cityProviders > 0 ? (
                              <span className="mt-1 block text-xs text-cwr-muted">
                                {cityProviders} provider{cityProviders === 1 ? '' : 's'}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ) : null}

              {/* Coming soon cities in this province */}
              {comingSoonCities.length > 0 ? (
                <section className="mt-10" aria-labelledby="coming-cities-heading">
                  <h2 id="coming-cities-heading" className="text-base font-semibold text-cwr-muted">
                    More cities coming
                  </h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {comingSoonCities.map((city) => (
                      <li
                        key={city.slug}
                        className="rounded-lg border border-dashed border-cwr-border bg-cwr-bg px-3 py-1.5 text-xs text-cwr-muted"
                      >
                        {city.name}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </>
          ) : (
            /* Coming soon cities for BC */
            <section className="mt-10" aria-labelledby="bc-cities-heading">
              <h2 id="bc-cities-heading" className="text-base font-semibold text-cwr-muted">
                Planned cities
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {province.cities.map((city) => (
                  <li
                    key={city.slug}
                    className="rounded-lg border border-dashed border-cwr-border bg-cwr-bg px-3 py-1.5 text-xs text-cwr-muted"
                  >
                    {city.name}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-12 border-t border-cwr-border pt-8">
            <p className="text-sm text-cwr-muted">
              <Link to="/coverage" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                View all coverage
              </Link>{' '}
              ·{' '}
              <Link to="/" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                Find providers
              </Link>
            </p>
          </div>
        </div>
      </AppShell>
    </>
  )
}
