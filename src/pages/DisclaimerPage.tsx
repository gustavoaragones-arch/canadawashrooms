import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { EditorialChrome, EditorialSection } from '../components/editorial/EditorialChrome'
import { DocumentMeta } from '../components/seo/DocumentMeta'
import { OWNER } from '../config/owner'
import { PLATFORM_QUOTE_EMAIL } from '../lib/lead'
import { TRANSPARENCY } from '../lib/transparencyCopy'
import { buildStaticDocumentMeta } from '../seo/metadata'

const meta = buildStaticDocumentMeta({
  title: 'Disclaimer',
  description:
    'Disclaimer for CanadaWashrooms.ca — informational provider directory operated by Albor Digital, Alberta, Canada.',
  canonicalPath: '/disclaimer',
})

const LAST_UPDATED = 'May 2026'

export default function DisclaimerPage() {
  return (
    <>
      <DocumentMeta meta={meta} />
      <AppShell>
        <EditorialChrome kicker="Legal" title="Disclaimer">

          <EditorialSection title="Platform nature">
            <p>
              CanadaWashrooms.ca is an <strong className="font-semibold text-cwr-steel">
              informational provider directory</strong> owned and operated by{' '}
              <strong className="font-semibold text-cwr-steel">{OWNER.name}</strong>,{' '}
              an {OWNER.province}-based {OWNER.legalStructure}.
            </p>
            <p>{OWNER.platformDisclaimer}</p>
            <p className="text-xs text-cwr-muted">Last updated: {LAST_UPDATED}</p>
          </EditorialSection>

          <EditorialSection title="No warranty on provider information">
            <p>{TRANSPARENCY.informationalPositioning}</p>
            <p>
              Provider listings are compiled from publicly available business data, including
              Google Business profiles, operator-declared information, and platform curation.
              We do not independently verify:
            </p>
            <ul className="list-disc space-y-2 pl-5 marker:text-cwr-accent">
              <li>Equipment availability or fleet capacity</li>
              <li>Current pricing or quote accuracy</li>
              <li>Servicing schedules or route coverage</li>
              <li>Trade certifications or regulatory compliance</li>
              <li>ADA / accessibility equipment specifications</li>
              <li>Winterization or heating capabilities beyond declared signals</li>
            </ul>
          </EditorialSection>

          <EditorialSection title="Capability inference">
            <p>{TRANSPARENCY.capabilityInference}</p>
            <p>{TRANSPARENCY.operationalTags}</p>
          </EditorialSection>

          <EditorialSection title="Confirm with operators">
            <p>
              <strong className="font-semibold text-cwr-steel">
                Always confirm directly with the operator
              </strong>{' '}
              before committing to a rental or service agreement. {TRANSPARENCY.availability}
            </p>
          </EditorialSection>

          <EditorialSection title="No liability">
            <p>
              {OWNER.name} and CanadaWashrooms.ca accept no liability for decisions made
              in reliance on information presented on this platform, including but not limited
              to service unavailability, pricing differences, equipment specification
              discrepancies, or scheduling conflicts.
            </p>
          </EditorialSection>

          <EditorialSection title="External links">
            <p>
              Links to external operator websites are provided for convenience.{' '}
              {OWNER.name} is not responsible for the content, accuracy, or practices of
              any linked website.
            </p>
          </EditorialSection>

          <EditorialSection title="Contact">
            <p>
              Questions:{' '}
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
              <Link to="/terms" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">Terms of Use</Link>
            </p>
          </EditorialSection>

        </EditorialChrome>
      </AppShell>
    </>
  )
}
