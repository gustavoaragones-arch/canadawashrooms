import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { EditorialChrome, EditorialSection } from '../components/editorial/EditorialChrome'
import { DocumentMeta } from '../components/seo/DocumentMeta'
import { OWNER } from '../config/owner'
import { PLATFORM_QUOTE_EMAIL } from '../lib/lead'
import { TRANSPARENCY } from '../lib/transparencyCopy'
import { buildStaticDocumentMeta } from '../seo/metadata'

const meta = buildStaticDocumentMeta({
  title: 'About',
  description:
    'CanadaWashrooms.ca is an independent portable washroom directory owned and operated by Albor Digital, an Alberta-based sole proprietorship.',
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
              Canada Washrooms is a <strong className="font-semibold text-cwr-steel">
              provider discovery platform</strong> for portable washroom rentals across Canada.
              It helps people find and compare portable toilet, restroom trailer, and site
              sanitation providers for construction projects, events, remote sites, and general
              use — by city, project type, and available features.
            </p>
            <p>
              {OWNER.platformDisclaimer}
            </p>
          </EditorialSection>

          <EditorialSection title="Ownership">
            <p>{OWNER.ownershipStatement}</p>
            <p>{OWNER.businessDescription}</p>
            <p>
              The platform is part of a broader portfolio of digital products, directories,
              software applications, and information resources developed and maintained by
              Albor Digital.
            </p>
          </EditorialSection>

          <EditorialSection title="Coverage">
            <p>
              The directory is currently live in{' '}
              <strong className="font-semibold text-cwr-steel">Alberta, Ontario, and British Columbia</strong>.
              Coverage is intentional — curated operators with verified contact information,
              not a bulk-scraped map.
            </p>
            <p>
              <Link to="/coverage" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                Coverage
              </Link>{' '}
              lists the cities and categories currently included.
            </p>
          </EditorialSection>

          <EditorialSection title="What we do not claim">
            <p>{TRANSPARENCY.informationalPositioning}</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-cwr-accent">
              <li>No guarantee of availability, pricing, or fleet capacity.</li>
              <li>No substitute for direct operator confirmation on heating, servicing schedules, accessibility, or site constraints.</li>
              <li>No implied trade certification or regulatory endorsement unless independently published by the operator.</li>
            </ul>
          </EditorialSection>

          <EditorialSection title="Data transparency">
            <p>{TRANSPARENCY.availability}</p>
            <p className="text-cwr-steel">{TRANSPARENCY.capabilityInference}</p>
          </EditorialSection>

          <EditorialSection title="Legal">
            <p>
              <Link to="/privacy" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">Privacy Policy</Link>
              {' · '}
              <Link to="/terms" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">Terms of Use</Link>
              {' · '}
              <Link to="/disclaimer" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">Disclaimer</Link>
            </p>
          </EditorialSection>

          <EditorialSection title="Learn more">
            <p>
              <Link to="/methodology" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                Methodology
              </Link>{' '}
              describes how providers are listed, enriched, and ranked.
            </p>
            <p>
              General questions and operator listing inquiries:{' '}
              <a className="font-semibold text-cwr-accent underline-offset-4 hover:underline" href={`mailto:${PLATFORM_QUOTE_EMAIL}`}>
                {PLATFORM_QUOTE_EMAIL}
              </a>
            </p>
          </EditorialSection>

        </EditorialChrome>
      </AppShell>
    </>
  )
}
