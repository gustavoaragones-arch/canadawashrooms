import { Link, useParams, useLocation, Navigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { ProviderCard } from '../components/ProviderCard'
import { DocumentMeta } from '../components/seo/DocumentMeta'
import { buildStaticDocumentMeta } from '../seo/metadata'
import { CANADA_PROVINCES } from '../lib/locations/canadaLocations'
import { PROVIDERS } from '../lib/providersDataset'
import { getFeaturedProviders } from '../lib/getFeaturedProviders'
import { LANDING_ROUTE_GROUPS } from '../seo/landingRoutes'
import type { PrimarySegment } from '../types/provider'

const PROVINCE_SLUGS: Record<string, string> = {
  AB: 'alberta',
  ON: 'ontario',
  BC: 'british-columbia',
}

interface CategoryConfig {
  segment: PrimarySegment
  slug: string
  label: string
  description: string
  seoTitle: string
  seoDescription: string
}

const CATEGORIES: CategoryConfig[] = [
  {
    segment: 'construction',
    slug: 'construction-jobsites',
    label: 'Construction & Jobsites',
    description:
      'Portable washroom providers serving construction sites, infrastructure projects, and long-term jobsite contracts across Canada. Includes standard units, handwashing stations, and crane-liftable configurations.',
    seoTitle: 'Construction & Jobsite Portable Washrooms in Canada',
    seoDescription:
      'Find portable toilet and washroom rental providers for construction sites and jobsites across Canada — Alberta, Ontario, and British Columbia.',
  },
  {
    segment: 'event',
    slug: 'events-weddings',
    label: 'Events & Weddings',
    description:
      'Restroom trailer and portable washroom providers for weddings, outdoor events, festivals, and private gatherings. Includes luxury trailer units, flush toilet options, and VIP restroom configurations.',
    seoTitle: 'Event & Wedding Portable Washrooms in Canada',
    seoDescription:
      'Find restroom trailer and portable washroom rental providers for weddings and outdoor events across Canada — luxury units, flush toilets, and standard rentals.',
  },
  {
    segment: 'general',
    slug: 'general-portable-washrooms',
    label: 'General Portable Washrooms',
    description:
      'General portable toilet and washroom rentals for any project or occasion. Standard units available across Alberta, Ontario, and British Columbia.',
    seoTitle: 'General Portable Washroom Rentals in Canada',
    seoDescription:
      'Browse portable toilet and washroom rental providers across Canada. Standard units for any project — construction, events, or residential use.',
  },
  {
    segment: 'oilfield',
    slug: 'remote-oilfield-operations',
    label: 'Remote & Oilfield Operations',
    description:
      'Heated and winterized portable washroom solutions for remote sites, oilfield camps, and industrial operations in northern and rural Canada. Includes camp support, remote logistics, and extended-deployment units.',
    seoTitle: 'Remote & Oilfield Portable Washrooms in Canada',
    seoDescription:
      'Find heated and winterized portable washroom providers for remote sites, oilfield camps, and industrial operations across Canada.',
  },
  {
    segment: 'site_services',
    slug: 'waste-site-services',
    label: 'Waste & Site Services',
    description:
      'Integrated waste management, roll-off disposal, septic services, and temporary site support for construction and infrastructure projects. Providers offering more than portable toilet rental alone.',
    seoTitle: 'Waste & Site Services in Canada',
    seoDescription:
      'Find waste management, roll-off disposal, septic, and integrated site service providers for construction and infrastructure projects across Canada.',
  },
]

const SLUG_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]))

export default function CategoryPage() {
  const params = useParams<{ categorySlug?: string }>()
  const location = useLocation()
  // Support both /:categorySlug param and static route paths like /construction-jobsites
  const resolvedSlug =
    params.categorySlug ?? location.pathname.replace(/^\/|\/$/g, '')
  const config = SLUG_MAP[resolvedSlug ?? '']
  if (!config) return <Navigate to="/providers" replace />

  const { segment, label, description, seoTitle, seoDescription, slug } = config

  // All providers with this category
  const categoryProviders = PROVIDERS.filter((p) =>
    p.public_categories?.includes(segment) ?? p.primary_segment === segment,
  )

  // Province breakdown
  const provinceBreakdown = CANADA_PROVINCES.filter((p) => p.live).map((prov) => ({
    province: prov,
    count: categoryProviders.filter((p) => p.province_code === prov.code).length,
  }))

  // City breakdown (top 10 by count)
  const cityBreakdown = CANADA_PROVINCES.flatMap((prov) =>
    prov.cities
      .filter((c) => c.live)
      .map((c) => ({
        city: c,
        count: categoryProviders.filter(
          (p) => p.city.toLowerCase() === c.name.toLowerCase(),
        ).length,
      })),
  )
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)

  // Featured providers (quality-scored)
  const featured = getFeaturedProviders(categoryProviders, { limit: 6 })

  // Landing route cities for this segment (for "Browse by city" quick links)
  const landingGroup = LANDING_ROUTE_GROUPS.find((g) => g.segment === segment)

  const meta = buildStaticDocumentMeta({
    title: seoTitle,
    description: seoDescription,
    canonicalPath: `/${slug}/`,
  })

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
                <Link to="/providers" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                  All Providers
                </Link>
              </li>
              <li aria-hidden>→</li>
              <li className="font-medium text-cwr-ink">{label}</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mt-8 border-b border-cwr-border pb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-cwr-ink sm:text-4xl">
              {label}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-cwr-steel">
              {description}
            </p>
            {/* Stats */}
            <div className="mt-5 flex flex-wrap gap-3">
              <span className="rounded-xl border border-cwr-border bg-cwr-bg px-4 py-2 text-sm font-semibold text-cwr-steel">
                {categoryProviders.length} providers nationally
              </span>
              {provinceBreakdown.filter((p) => p.count > 0).map(({ province, count }) => (
                <Link
                  key={province.code}
                  to={`/${PROVINCE_SLUGS[province.code]}`}
                  className="rounded-xl border border-cwr-border bg-cwr-bg px-4 py-2 text-sm font-semibold text-cwr-steel transition-colors hover:border-cwr-steel/40 hover:bg-cwr-surface"
                >
                  {province.name} · {count}
                </Link>
              ))}
            </div>
          </header>

          {/* Top cities for this category */}
          {cityBreakdown.length > 0 ? (
            <section className="mt-10" aria-labelledby="city-breakdown-heading">
              <h2
                id="city-breakdown-heading"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-cwr-muted"
              >
                Cities with listings
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {cityBreakdown.map(({ city, count }) => {
                  // If a landing page exists for this city+segment, link there; else link to city page
                  const hasLanding = landingGroup?.cities.some((c) => c.citySlug === city.slug)
                  const href = hasLanding
                    ? `/${landingGroup!.segmentSlug}/${city.slug}/`
                    : `/city/${city.slug}`
                  return (
                    <li key={city.slug}>
                      <Link
                        to={href}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-cwr-border bg-cwr-bg px-3 py-1.5 text-sm text-cwr-ink transition-colors hover:border-cwr-steel/40 hover:bg-cwr-surface"
                      >
                        {city.name}
                        <span className="text-xs text-cwr-muted">{count}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          ) : null}

          {/* Featured providers */}
          {featured.length > 0 ? (
            <section className="mt-10" aria-labelledby="featured-category-heading">
              <h2 id="featured-category-heading" className="text-base font-semibold text-cwr-ink">
                Featured {label} operators
              </h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {featured.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    segment={segment}
                    city={provider.city}
                    activeCapabilities={[]}
                    activeFilterLabels={[]}
                    isRelaxedFallback={false}
                    variant="compact"
                  />
                ))}
              </div>
              {categoryProviders.length > 6 ? (
                <p className="mt-5 text-sm text-cwr-muted">
                  Showing {featured.length} of {categoryProviders.length} operators.{' '}
                  <Link to="/" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                    Search all {label} providers →
                  </Link>
                </p>
              ) : null}
            </section>
          ) : null}

          {/* Footer nav */}
          <div className="mt-12 border-t border-cwr-border pt-8 text-sm text-cwr-muted">
            <Link
              to="/providers"
              className="font-semibold text-cwr-accent underline-offset-4 hover:underline"
            >
              ← All providers
            </Link>
          </div>

        </div>
      </AppShell>
    </>
  )
}
