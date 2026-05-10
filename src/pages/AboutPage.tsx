import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { EditorialChrome, EditorialSection } from '../components/editorial/EditorialChrome'
import { DocumentMeta } from '../components/seo/DocumentMeta'
import { PLATFORM_QUOTE_EMAIL } from '../lib/lead'
import { TRANSPARENCY } from '../lib/transparencyCopy'
import { buildStaticDocumentMeta } from '../seo/metadata'

const meta = buildStaticDocumentMeta({
  title: 'About',
  description:
    'Canada Washrooms explains its Alberta-first portable sanitation matcher: operational retrieval, enrichment discipline, and what the platform does not promise.',
  canonicalPath: '/about',
})

export default function AboutPage() {
  return (
    <>
      <DocumentMeta meta={meta} />
      <AppShell>
        <EditorialChrome kicker="Canada Washrooms" title="About this platform">
          <EditorialSection title="What this is">
            <p>
              Canada Washrooms is a{' '}
              <strong className="font-semibold text-cwr-steel">structured discovery layer</strong> for
              portable sanitation in Alberta. It connects project context — construction, events, remote
              industrial sites, or everyday rentals — with operators whose{' '}
              <strong className="font-semibold text-cwr-steel">public signals and declared fields</strong>{' '}
              suggest a realistic operational fit.
            </p>
            <p>
              The product bias is practical: winter servicing, narrow access, occupancy swings, and pump
              cadence matter more here than generic directory completeness.
            </p>
          </EditorialSection>

          <EditorialSection title="Alberta authority">
            <p>
              The MVP dataset is intentionally{' '}
              <strong className="font-semibold text-cwr-steel">Alberta-scoped</strong>: priority cities,
              corridor logistics, freeze–thaw, remote road realities, construction seasonality, and event
              windows that actually change how operators mobilize. Expansion to other provinces is
              deliberate — not a spray map.
            </p>
            <p>
              <Link to="/alberta-coverage" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                Alberta coverage
              </Link>{' '}
              lists the cities and segments currently routed in this release.
            </p>
          </EditorialSection>

          <EditorialSection title="What we do not claim">
            <p>{TRANSPARENCY.informationalPositioning}</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-cwr-accent">
              <li>No guarantee of availability, pricing, or fleet depth.</li>
              <li>No substitute for operator confirmation on heating, winter chemistry, camp SLAs, or venue constraints.</li>
              <li>No implied regulatory or trade certification unless an operator publishes it independently.</li>
            </ul>
          </EditorialSection>

          <EditorialSection title="Responsible use">
            <p>{TRANSPARENCY.availability}</p>
            <p className="text-cwr-steel">{TRANSPARENCY.capabilityInference}</p>
          </EditorialSection>

          <EditorialSection title="Learn more">
            <p>
              <Link to="/methodology" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                Methodology
              </Link>{' '}
              describes matching, enrichment, and review-adjacent inference in plain language.
            </p>
            <p>
              Operational inquiries route through{' '}
              <a className="font-semibold text-cwr-accent underline-offset-4 hover:underline" href={`mailto:${PLATFORM_QUOTE_EMAIL}`}>
                {PLATFORM_QUOTE_EMAIL}
              </a>
              . General questions:{' '}
              <Link to="/contact" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                Contact
              </Link>
              .
            </p>
          </EditorialSection>
        </EditorialChrome>
      </AppShell>
    </>
  )
}
