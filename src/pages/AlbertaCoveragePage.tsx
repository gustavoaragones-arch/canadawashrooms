import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { EditorialChrome, EditorialSection } from '../components/editorial/EditorialChrome'
import { DocumentMeta } from '../components/seo/DocumentMeta'
import { segmentLabel } from '../lib/segments'
import { allResolvedLandings, listingPath } from '../seo/landingRoutes'
import { buildStaticDocumentMeta } from '../seo/metadata'

const meta = buildStaticDocumentMeta({
  title: 'Alberta coverage',
  description:
    'Priority cities and segment routes currently available on Canada Washrooms — Alberta-first portable sanitation matching.',
  canonicalPath: '/alberta-coverage',
})

export default function AlbertaCoveragePage() {
  const cities = useMemo(() => {
    const set = new Set(allResolvedLandings().map((r) => r.city))
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [])

  const routes = useMemo(() => allResolvedLandings(), [])

  return (
    <>
      <DocumentMeta meta={meta} />
      <AppShell>
        <EditorialChrome kicker="Coverage" title="Alberta operational coverage">
          <EditorialSection title="Scope">
            <p>
              The MVP is deliberately{' '}
              <strong className="font-semibold text-cwr-steel">Alberta-first</strong>: winter servicing
              realities, remote logistics, construction demand cycles, event seasonality in corridor
              communities, and oilfield-adjacent mobilization patterns all inform how guides are written and
              how operators are segmented — even when the same operator brand appears in multiple cities.
            </p>
            <p>
              Presence on this site does not imply province-wide dispatch, guaranteed winter inventory, or
              verified certification — only that the listing sits in the current curated cohort for the
              routed city and segment.
            </p>
          </EditorialSection>

          <EditorialSection title="Priority cities">
            <p className="text-cwr-steel">Cities with at least one published segment landing:</p>
            <ul className="flex flex-wrap gap-2 pt-2">
              {cities.map((city) => (
                <li
                  key={city}
                  className="rounded-lg border border-cwr-border bg-cwr-bg px-3 py-1.5 text-xs font-semibold text-cwr-ink"
                >
                  {city}
                </li>
              ))}
            </ul>
          </EditorialSection>

          <EditorialSection title="Published routes">
            <p className="text-cwr-steel">
              Each link opens the operational guide and matcher for that city + segment context.
            </p>
            <ul className="mt-4 space-y-2 border-t border-cwr-border pt-4">
              {routes.map((r) => (
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

          <EditorialSection title="More">
            <p>
              <Link to="/methodology" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                Methodology
              </Link>{' '}
              ·{' '}
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
