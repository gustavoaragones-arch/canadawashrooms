import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { EditorialChrome, EditorialSection } from '../components/editorial/EditorialChrome'
import { DocumentMeta } from '../components/seo/DocumentMeta'
import { OWNER } from '../config/owner'
import { PLATFORM_QUOTE_EMAIL } from '../lib/lead'
import { buildStaticDocumentMeta } from '../seo/metadata'

const meta = buildStaticDocumentMeta({
  title: 'Privacy Policy',
  description:
    'Privacy Policy for CanadaWashrooms.ca — operated by Albor Digital, an Alberta-based sole proprietorship.',
  canonicalPath: '/privacy',
})

const LAST_UPDATED = 'May 2026'

export default function PrivacyPolicyPage() {
  return (
    <>
      <DocumentMeta meta={meta} />
      <AppShell>
        <EditorialChrome kicker="Legal" title="Privacy Policy">

          <EditorialSection title="Overview">
            <p>
              This Privacy Policy describes how <strong className="font-semibold text-cwr-steel">
              CanadaWashrooms.ca</strong> collects, uses, and handles information when you use
              this website. The platform is owned and operated by{' '}
              <strong className="font-semibold text-cwr-steel">{OWNER.name}</strong>,{' '}
              an {OWNER.province}-based {OWNER.legalStructure}.
            </p>
            <p className="text-xs text-cwr-muted">Last updated: {LAST_UPDATED}</p>
          </EditorialSection>

          <EditorialSection title="Information we collect">
            <p>
              CanadaWashrooms.ca is a <strong className="font-semibold text-cwr-steel">
              passive informational directory</strong>. We do not require account registration
              and do not collect personal information as part of normal browsing.
            </p>
            <p>When you use this website, the following may be collected automatically:</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-cwr-accent">
              <li>
                <strong className="font-semibold text-cwr-steel">Usage data</strong> — pages
                visited, time spent, browser type, and general geographic region (country or
                province level). This is collected via standard web analytics and does not
                identify you personally.
              </li>
              <li>
                <strong className="font-semibold text-cwr-steel">Inquiry form data</strong> —
                if you submit an inquiry through the platform, your message and any contact
                information you voluntarily provide is used solely to respond to your request.
              </li>
            </ul>
          </EditorialSection>

          <EditorialSection title="How we use information">
            <ul className="list-disc space-y-2 pl-5 marker:text-cwr-accent">
              <li>To operate and improve the platform</li>
              <li>To respond to direct contact or inquiry requests</li>
              <li>To analyze aggregate usage patterns for product development</li>
            </ul>
            <p>
              We do not sell, rent, or share personal information with third parties for
              marketing purposes.
            </p>
          </EditorialSection>

          <EditorialSection title="Third-party services">
            <p>
              This website may use third-party services including web analytics providers.
              These services may set cookies or collect usage data subject to their own
              privacy policies. We aim to use privacy-respecting analytics where possible.
            </p>
            <p>
              Provider listings on this platform contain links to external operator websites.
              We are not responsible for the privacy practices of those third-party websites.
            </p>
          </EditorialSection>

          <EditorialSection title="Cookies">
            <p>
              CanadaWashrooms.ca may use cookies to support basic site functionality and
              analytics. These are small text files stored in your browser. You can disable
              cookies in your browser settings; doing so may affect some site features.
            </p>
          </EditorialSection>

          <EditorialSection title="Data retention">
            <p>
              Inquiry emails are retained only as long as needed to respond to your request.
              Analytics data is aggregated and not associated with individual identities.
            </p>
          </EditorialSection>

          <EditorialSection title="Your rights">
            <p>
              Depending on your location, you may have rights regarding your personal
              information, including access, correction, or deletion. To exercise these rights,
              contact us at{' '}
              <a
                href={`mailto:${PLATFORM_QUOTE_EMAIL}`}
                className="font-semibold text-cwr-accent underline-offset-4 hover:underline"
              >
                {PLATFORM_QUOTE_EMAIL}
              </a>
              .
            </p>
          </EditorialSection>

          <EditorialSection title="Jurisdiction">
            <p>{OWNER.jurisdictionStatement}</p>
          </EditorialSection>

          <EditorialSection title="Contact">
            <p>
              Questions about this Privacy Policy:{' '}
              <a
                href={`mailto:${PLATFORM_QUOTE_EMAIL}`}
                className="font-semibold text-cwr-accent underline-offset-4 hover:underline"
              >
                {PLATFORM_QUOTE_EMAIL}
              </a>
            </p>
            <p>
              <Link to="/terms" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">Terms of Use</Link>
              {' · '}
              <Link to="/disclaimer" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">Disclaimer</Link>
            </p>
          </EditorialSection>

        </EditorialChrome>
      </AppShell>
    </>
  )
}
