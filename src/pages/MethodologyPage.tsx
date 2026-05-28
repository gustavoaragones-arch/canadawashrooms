import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { EditorialChrome, EditorialSection } from '../components/editorial/EditorialChrome'
import { DocumentMeta } from '../components/seo/DocumentMeta'
import { TRANSPARENCY } from '../lib/transparencyCopy'
import { buildStaticDocumentMeta } from '../seo/metadata'

const meta = buildStaticDocumentMeta({
  title: 'Methodology',
  description:
    'How Canada Washrooms matches portable sanitation operators in Alberta: cohort ranking, enrichment passes, review signal inference, and segment categorization — without marketing claims.',
  canonicalPath: '/methodology',
})

export default function MethodologyPage() {
  return (
    <>
      <DocumentMeta meta={meta} />
      <AppShell>
        <EditorialChrome kicker="Transparency" title="Methodology">
          <EditorialSection id="matching" title="Project-to-provider matching">
            <p>
              Matching starts from your{' '}
              <strong className="font-semibold text-cwr-steel">segment</strong> (construction, luxury
              event trailers, remote industrial, or general rental) and a{' '}
              <strong className="font-semibold text-cwr-steel">priority city</strong>. Operators must be in
              cohort for that city; secondary-fit operators may appear when they support the segment but
              classify differently.
            </p>
            <p>
              Optional <strong className="font-semibold text-cwr-steel">capability filters</strong> narrow
              the list to boolean traits we can evaluate consistently on each record (servicing cadence,
              heating, remote posture, ADA, etc.). When filters cannot all be satisfied, we may relax and
              label the cohort — ranked by closest overlap, not hidden entirely.
            </p>
            <p className="text-cwr-steel">{TRANSPARENCY.availability}</p>
          </EditorialSection>

          <EditorialSection title="Enrichment methodology">
            <p>
              Raw listings are normalized (names, phones, cities, categories, badges) then passed through
              an enrichment layer that derives{' '}
              <strong className="font-semibold text-cwr-steel">capabilities</strong>,{' '}
              <strong className="font-semibold text-cwr-steel">operational tags</strong>, and{' '}
              <strong className="font-semibold text-cwr-steel">supported segments</strong> from structured
              fields plus conservative inference rules.
            </p>
            <p>
              Analyst locks (<strong className="font-semibold text-cwr-steel">manual enrichment overrides</strong>)
              can pin segment placement, block misleading inference, or replace trust phrases when field
              evidence contradicts automated reads.
            </p>
            <p className="text-cwr-steel">{TRANSPARENCY.operationalTags}</p>
          </EditorialSection>

          <EditorialSection title="Review signal inference">
            <p>
              Where review text and volume support it, we derive{' '}
              <strong className="font-semibold text-cwr-steel">review-backed operational signals</strong>{' '}
              — always as hints tied to public text patterns and volume, never as guarantees of current
              fleet or certification.
            </p>
            <p>{TRANSPARENCY.capabilityInference}</p>
          </EditorialSection>

          <EditorialSection title="Operational categorization">
            <p>
              Primary segment reflects how an operator most often presents for retrieval: construction jobsite
              posture, upscale event trailers, remote/camp-grade logistics, or general short-term rental.
              Supported segments capture adjacent contexts inferred or declared so planners do not miss a
              viable operator because of a narrow primary label alone.
            </p>
          </EditorialSection>

          <EditorialSection title="Operational nodes vs corporate rollup">
            <p>
              Canada Washrooms treats each listing as an{' '}
              <strong className="font-semibold text-cwr-steel">operational service node</strong> — scoped by
              geography (city and coverage reality), not folded into a single national brand record. A company
              may operate under one website or dispatch number in multiple cities; those locations stay
              distinct for matching and enrichment QA unless they are the same normalized address and listing
              identity.
            </p>
          </EditorialSection>

          <EditorialSection title="Source attribution (foundation)">
            <p>
              Internally we track provenance kinds such as Google reviews, business categories, declared
              website/listing fields, analyst locks, and operational inference — for future exports and
              selective disclosure. The live UI stays calm: narrative transparency on{' '}
              <Link to="/about" className="font-semibold text-cwr-accent underline-offset-4 hover:underline">
                About
              </Link>{' '}
              and footers, not citation clutter on every token.
            </p>
          </EditorialSection>

          <EditorialSection title="Future: operator claiming">
            <p>
              Dataset rows may later carry optional <strong className="font-semibold text-cwr-steel">listing provenance</strong>{' '}
              fields for verification state — designed so claiming can attach to a stable listing identity
              without changing how matching works today.
            </p>
          </EditorialSection>
        </EditorialChrome>
      </AppShell>
    </>
  )
}
