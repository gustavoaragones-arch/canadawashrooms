import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { EditorialChrome, EditorialSection } from '../components/editorial/EditorialChrome'
import { DocumentMeta } from '../components/seo/DocumentMeta'
import { OWNER } from '../config/owner'
import { PLATFORM_QUOTE_EMAIL } from '../lib/lead'
import { buildStaticDocumentMeta } from '../seo/metadata'

const meta = buildStaticDocumentMeta({
  title: 'Terms of Use',
  description:
    'Terms of Use for CanadaWashrooms.ca — operated by Albor Digital, an Alberta-based sole proprietorship.',
  canonicalPath: '/terms',
})

const LAST_UPDATED = 'May 2026'

export default function TermsPage() {
  return (
    <>
      <DocumentMeta meta={meta} />
      <AppShell>
        <EditorialChrome kicker="Legal" title="Terms of Use">

          <EditorialSection title="Overview">
            <p>
              By accessing CanadaWashrooms.ca, you agree to these Terms of Use. This website
              is owned and operated by{' '}
              <strong className="font-semibold text-cwr-steel">{OWNER.name}</strong>,{' '}
              an {OWNER.province}-based {OWNER.legalStructure}.
            </p>
            <p className="text-xs text-cwr-muted">Last updated: {LAST_UPDATED}</p>
          </EditorialSection>

          <EditorialSection title="Nature of the platform">
            <p>
              CanadaWashrooms.ca is an <strong className="font-semibold text-cwr-steel">
              informational directory</strong> for portable washroom and sanitation providers
              in Canada. {OWNER.platformDisclaimer}
            </p>
            <p>
              Provider information is sourced from public business data, operator-declared
              fields, and platform curation. We make no guarantee as to the accuracy,
              completeness, or currency of any listing.
            </p>
          </EditorialSection>

          <EditorialSection title="No booking or transaction relationship">
            <p>
              This platform does not facilitate rental bookings, payments, or contracts.
              Any arrangement made between a user and a provider listed here is solely between
              that user and the provider. {OWNER.name} is not a party to any such arrangement.
            </p>
          </EditorialSection>

          <EditorialSection title="User conduct">
            <p>You agree not to:</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-cwr-accent">
              <li>Scrape or systematically extract provider data from this platform</li>
              <li>Use this platform for commercial competitor intelligence</li>
              <li>Submit false or misleading inquiry requests</li>
              <li>Attempt to access non-public areas of the platform</li>
            </ul>
          </EditorialSection>

          <EditorialSection title="Intellectual property">
            <p>
              All original content, code, design, and editorial copy on CanadaWashrooms.ca
              is the property of {OWNER.name}. Provider listings reference publicly available
              business information; individual provider names, contact details, and descriptions
              belong to their respective owners.
            </p>
          </EditorialSection>

          <EditorialSection title="Limitation of liability">
            <p>
              To the fullest extent permitted by law, {OWNER.name} is not liable for any
              direct, indirect, incidental, or consequential damages arising from your use of
              this platform or reliance on any provider listing, including but not limited to
              unavailability of services, pricing discrepancies, or equipment capability claims.
            </p>
          </EditorialSection>

          <EditorialSection title="Third-party links">
            <p>
              Provider listings may include links to external operator websites. We are not
              responsible for the content, accuracy, or practices of those websites.
            </p>
          </EditorialSection>

          <EditorialSection title="Changes to these terms">
            <p>
              We may update these Terms of Use at any time. Continued use of the platform
              after changes constitutes acceptance of the revised terms. The date at the top
              of this page reflects the most recent update.
            </p>
          </EditorialSection>

          <EditorialSection title="Jurisdiction">
            <p>{OWNER.jurisdictionStatement}</p>
          </EditorialSection>

          <EditorialSection title="Contact">
            <p>
              Questions about these Terms:{' '}
              <a
                href={`mailto:${PLATFORM_QUOTE_EMAIL}`}
                className="font-semibold text-cwr-accent underline-offset-4 hover:underline"
              >
                {PLATFORM_QUOTE_EMAIL}
              </a>
            </p>
            <p>
              <Link to="/privacy" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">Privacy Policy</Link>
              {' · '}
              <Link to="/disclaimer" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">Disclaimer</Link>
            </p>
          </EditorialSection>

        </EditorialChrome>
      </AppShell>
    </>
  )
}
