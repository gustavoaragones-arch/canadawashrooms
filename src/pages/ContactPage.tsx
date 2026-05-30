import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { EditorialChrome, EditorialSection } from '../components/editorial/EditorialChrome'
import { DocumentMeta } from '../components/seo/DocumentMeta'
import { OWNER } from '../config/owner'
import { PLATFORM_QUOTE_EMAIL } from '../lib/lead'
import { buildStaticDocumentMeta } from '../seo/metadata'

const meta = buildStaticDocumentMeta({
  title: 'Contact',
  description:
    'Contact CanadaWashrooms.ca — operated by Albor Digital, Alberta, Canada. For operational inquiries and general questions.',
  canonicalPath: '/contact',
})

export default function ContactPage() {
  const generalHref = `mailto:${PLATFORM_QUOTE_EMAIL}?subject=${encodeURIComponent('Canada Washrooms — general contact')}`
  const inquiryHref = `mailto:${PLATFORM_QUOTE_EMAIL}?subject=${encodeURIComponent('Canada Washrooms — operational inquiry')}`

  return (
    <>
      <DocumentMeta meta={meta} />
      <AppShell>
        <EditorialChrome kicker="Canada Washrooms" title="Contact">

          <EditorialSection title="Operated by">
            <p className="text-cwr-steel">
              <strong className="font-semibold text-cwr-ink">{OWNER.name}</strong>
              <br />
              {OWNER.province}, {OWNER.country}
              <br />
              <span className="text-xs">{OWNER.legalStructure}</span>
            </p>
          </EditorialSection>

          <EditorialSection title="How to reach us">
            <p>
              Email is the primary contact channel — no support desk or ticket system.
              We respond as operational capacity allows.
            </p>
          </EditorialSection>

          <EditorialSection title="Operational inquiries">
            <p>
              For quote requests and project-specific questions, use the inquiry flow on any provider
              listing, or start directly:
            </p>
            <p>
              <a
                href={inquiryHref}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cwr-ink px-5 py-2.5 text-sm font-semibold text-cwr-surface transition-colors hover:bg-cwr-steel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent"
              >
                Email — operational inquiry
              </a>
            </p>
            <p className="text-xs text-cwr-muted">{PLATFORM_QUOTE_EMAIL}</p>
          </EditorialSection>

          <EditorialSection title="General & methodology questions">
            <p>
              For coverage questions, methodology notes, dataset feedback, or operator listing
              updates:
            </p>
            <p>
              <a
                href={generalHref}
                className="font-semibold text-cwr-accent underline-offset-4 hover:underline"
              >
                {PLATFORM_QUOTE_EMAIL}
              </a>
            </p>
          </EditorialSection>

          <EditorialSection title="Operators">
            <p>
              If you represent an operator listed on CanadaWashrooms.ca and want to update your
              information, use the general contact line with "Operator listing" in the subject.
              Listing updates are handled on a best-effort basis.
            </p>
          </EditorialSection>

          <EditorialSection title="Context">
            <p>
              <Link to="/about" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                About
              </Link>
              {' · '}
              <Link to="/methodology" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                Methodology
              </Link>
              {' · '}
              <Link to="/privacy" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </EditorialSection>

        </EditorialChrome>
      </AppShell>
    </>
  )
}
