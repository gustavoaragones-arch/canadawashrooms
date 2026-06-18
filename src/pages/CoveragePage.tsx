import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { EditorialChrome, EditorialSection } from '../components/editorial/EditorialChrome'
import { DocumentMeta } from '../components/seo/DocumentMeta'
import { segmentLabel } from '../lib/segments'
import { LIVE_PROVINCES } from '../lib/locations/canadaLocations'
import { allResolvedLandings, listingPath } from '../seo/landingRoutes'
import { buildStaticDocumentMeta } from '../seo/metadata'

const meta = buildStaticDocumentMeta({
  title: 'Coverage',
  description:
    'Provinces and cities with published portable washroom guides on Canada Washrooms. Live in Alberta, Ontario, and British Columbia.',
  canonicalPath: '/coverage',
})

const AB_CITIES = new Set(['calgary', 'edmonton', 'fort-mcmurray', 'red-deer', 'canmore'])
const ON_CITIES = new Set(['toronto', 'mississauga', 'brampton', 'hamilton', 'ottawa', 'london', 'vaughan', 'markham'])
const BC_CITIES = new Set(['surrey', 'vancouver', 'abbotsford', 'kelowna', 'nanaimo', 'coquitlam', 'victoria', 'whistler'])

export default function CoveragePage() {
  const routes = useMemo(() => allResolvedLandings(), [])

  const routesByProvince = useMemo(() => ({
    AB: routes.filter((r) => AB_CITIES.has(r.citySlug)),
    ON: routes.filter((r) => ON_CITIES.has(r.citySlug)),
    BC: routes.filter((r) => BC_CITIES.has(r.citySlug)),
  }), [routes])

  return (
    <>
      <DocumentMeta meta={meta} />
      <AppShell>
        <EditorialChrome kicker="Coverage" title="National portable washroom coverage">

          <EditorialSection title="Live provinces">
            <p>
              Canada Washrooms is now live in{' '}
              <strong className="font-semibold text-cwr-steel">Alberta</strong>,{' '}
              <strong className="font-semibold text-cwr-steel">Ontario</strong>, and{' '}
              <strong className="font-semibold text-cwr-steel">British Columbia</strong>.
              Coverage expands as province datasets are curated.
            </p>
            <p>
              Presence on this site means a listing is in the curated cohort for the routed
              city and category. It does not imply guaranteed availability, verified
              certification, or province-wide dispatch — confirm all details directly with
              the operator.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {LIVE_PROVINCES.map((p) => (
                <Link
                  key={p.code}
                  to={`/${p.name.toLowerCase().replace(/\s+/g, '-')}/`}
                  className="rounded-lg border border-cwr-border bg-cwr-bg px-3 py-1.5 text-xs font-semibold text-cwr-accent underline-offset-4 hover:underline"
                >
                  {p.name} · {p.cities.filter((c) => c.live).length} cities live
                </Link>
              ))}
            </div>
          </EditorialSection>

          {routesByProvince.AB.length > 0 ? (
            <EditorialSection title="Alberta — published routes">
              <ul className="mt-4 space-y-2 border-t border-cwr-border pt-4">
                {routesByProvince.AB.map((r) => (
                  <li key={`${r.segmentSlug}-${r.citySlug}`}>
                    <Link
                      to={listingPath(r)}
                      className="text-sm font-semibold text-cwr-accent underline-offset-4 hover:underline"
                    >
                      {segmentLabel(r.segment)} — {r.city}
                    </Link>
                  </li>
                ))}
              </ul>
            </EditorialSection>
          ) : null}

          {routesByProvince.ON.length > 0 ? (
            <EditorialSection title="Ontario — published routes">
              <ul className="mt-4 space-y-2 border-t border-cwr-border pt-4">
                {routesByProvince.ON.map((r) => (
                  <li key={`${r.segmentSlug}-${r.citySlug}`}>
                    <Link
                      to={listingPath(r)}
                      className="text-sm font-semibold text-cwr-accent underline-offset-4 hover:underline"
                    >
                      {segmentLabel(r.segment)} — {r.city}
                    </Link>
                  </li>
                ))}
              </ul>
            </EditorialSection>
          ) : null}

          {routesByProvince.BC.length > 0 ? (
            <EditorialSection title="British Columbia — published routes">
              <ul className="mt-4 space-y-2 border-t border-cwr-border pt-4">
                {routesByProvince.BC.map((r) => (
                  <li key={`${r.segmentSlug}-${r.citySlug}`}>
                    <Link
                      to={listingPath(r)}
                      className="text-sm font-semibold text-cwr-accent underline-offset-4 hover:underline"
                    >
                      {segmentLabel(r.segment)} — {r.city}
                    </Link>
                  </li>
                ))}
              </ul>
            </EditorialSection>
          ) : null}

          <EditorialSection title="More">
            <p>
              <Link to="/methodology" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                Methodology
              </Link>
              {' · '}
              <Link to="/about" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                About
              </Link>
            </p>
          </EditorialSection>

        </EditorialChrome>
      </AppShell>
    </>
  )
}
