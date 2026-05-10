import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { EditorialChrome, EditorialSection } from '../components/editorial/EditorialChrome'
import { DocumentMeta } from '../components/seo/DocumentMeta'
import { PLATFORM_QUOTE_EMAIL } from '../lib/lead'
import { buildStaticDocumentMeta } from '../seo/metadata'

const meta = buildStaticDocumentMeta({
  title: 'Contact',
  description:
    'Reach Canada Washrooms for operational inquiries or platform questions — email-first, no ticket system.',
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
          <EditorialSection title="How to reach us">
            <p>
              This project stays intentionally lightweight:{' '}
              <strong className="font-semibold text-cwr-steel">credible email paths</strong>, no support
              desk theater. We respond as operational capacity allows.
            </p>
          </EditorialSection>

          <EditorialSection title="Operational inquiries">
            <p>
              Structured project inquiries from the matcher open your email client with context and a
              machine-readable payload. You can also start directly:
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
              For coverage questions, methodology notes, or dataset feedback:
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
              Listing updates and future claiming flows will remain practical — no aggressive upsell. If you
              represent an operator on the Alberta roster, use the general contact line with “Operator
              listing” in the message.
            </p>
          </EditorialSection>

          <EditorialSection title="Context">
            <p>
              <Link to="/about" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                About
              </Link>{' '}
              ·{' '}
              <Link to="/methodology" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                Methodology
              </Link>
            </p>
          </EditorialSection>
        </EditorialChrome>
      </AppShell>
    </>
  )
}
