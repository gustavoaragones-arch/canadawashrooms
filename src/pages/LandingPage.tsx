import { useEffect, useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { useOperationalInquiry } from '../components/inquiry/OperationalInquiryContext'
import { MatchWorkspace } from '../components/MatchWorkspace'
import { OperationalSearchPanel } from '../components/OperationalSearchPanel'
import { DocumentMeta } from '../components/seo/DocumentMeta'
import { JsonLd } from '../components/seo/JsonLd'
import { PROVIDERS } from '../lib/providersDataset'
import { editorialInternalLinks } from '../seo/internalLinks'
import { resolveLandingRoute } from '../seo/landingRoutes'
import { buildLandingDocumentMeta } from '../seo/metadata'
import { segmentDensityNote } from '../lib/intelligence/operationalTrustCues'
import { countAlbertaSegmentCoverage, providersInScope } from '../lib/matching'
import { matchHeadline } from '../lib/matchHeadlines'
import { SEGMENT_FAQS } from '../seo/faqs'
import { buildLandingJsonLd } from '../seo/schema'
import { TRANSPARENCY } from '../lib/transparencyCopy'
import { segmentLabel } from '../lib/segments'
import { fillCity, SEGMENT_SEO } from '../seo/segmentSeo'
import type { PrimarySegment } from '../types/provider'

const SEGMENT_INQUIRY_CTA: Record<PrimarySegment, string> = {
  construction: 'Request winter-ready units',
  event: 'Request event restroom quote',
  oilfield: 'Request remote-site servicing',
  general: 'Request operational quote',
}

export default function LandingPage() {
  const { openInquiry } = useOperationalInquiry()
  const { segmentSlug, citySlug } = useParams()

  const resolved = useMemo(
    () => resolveLandingRoute(segmentSlug, citySlug),
    [segmentSlug, citySlug],
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [segmentSlug, citySlug])

  const coverage = useMemo(() => {
    if (!resolved) {
      return { matched: 0, primaryFit: 0, secondaryFit: 0, segmentAlberta: 0 }
    }
    const scoped = providersInScope(PROVIDERS, resolved.segment, resolved.city)
    const primaryFit = scoped.filter((p) => p.primary_segment === resolved.segment).length
    const secondaryFit = scoped.length - primaryFit
    const segmentAlberta = countAlbertaSegmentCoverage(PROVIDERS, resolved.segment)
    return {
      matched: scoped.length,
      primaryFit,
      secondaryFit,
      segmentAlberta,
    }
  }, [resolved])

  if (!resolved) {
    return <Navigate to="/" replace />
  }

  const seo = SEGMENT_SEO[resolved.segment]
  const docMeta = buildLandingDocumentMeta(resolved)
  const faqs = SEGMENT_FAQS[resolved.segment]
  const scopeProviders = providersInScope(PROVIDERS, resolved.segment, resolved.city)
  const jsonLd = buildLandingJsonLd({
    resolved,
    providers: scopeProviders,
    faqs,
    meta: docMeta,
  })

  const h1 = fillCity(seo.h1Template, resolved.city)
  const intro = fillCity(seo.introTemplate, resolved.city)
  const insightLines = seo.operationalInsights.map((line) => fillCity(line, resolved.city))
  const climateContext = fillCity(seo.climateContext, resolved.city)
  const projectSuitability = fillCity(seo.projectSuitability, resolved.city)
  const servicingExpectations = fillCity(seo.servicingExpectations, resolved.city)
  const summaryHeadline = matchHeadline(resolved.segment, resolved.city)
  const related = editorialInternalLinks(resolved)

  return (
    <>
      <DocumentMeta meta={docMeta} />
      <JsonLd data={jsonLd} />

      <AppShell mainClassName="pb-44 md:pb-0">
        <article className="border-b border-cwr-border bg-cwr-surface">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16 lg:max-w-[42rem] lg:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cwr-accent">
              Alberta · High-intent operational guide
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-cwr-ink sm:text-4xl">
              {h1}
            </h1>
            <p className="cwr-landing-intro mt-6 text-base leading-relaxed text-cwr-muted sm:text-lg">
              {intro}
            </p>
            <p className="mt-5 border-l-2 border-cwr-accent/25 pl-4 text-xs leading-relaxed text-cwr-steel sm:text-sm">
              {TRANSPARENCY.operationalTags} {TRANSPARENCY.availability}
            </p>
            <p className="mt-3 text-xs text-cwr-muted">
              <Link
                to="/methodology"
                className="font-semibold text-cwr-accent underline-offset-4 hover:underline"
              >
                Matching methodology
              </Link>{' '}
              — how cohorts, enrichment, and review-adjacent inference are applied (no pay-to-rank).
            </p>
            <div className="mt-6 rounded-xl border border-cwr-border bg-cwr-bg/70 px-4 py-4 sm:px-5">
              <p className="text-sm leading-relaxed text-cwr-steel">
                <span className="font-semibold text-cwr-ink">{coverage.matched}</span> operator
                {coverage.matched === 1 ? '' : 's'} in {resolved.city} match this guide’s{' '}
                <span className="font-semibold text-cwr-ink">{segmentLabel(resolved.segment)}</span>{' '}
                scope
                {coverage.secondaryFit > 0 ? (
                  <>
                    {' '}
                    ({coverage.primaryFit} primary · {coverage.secondaryFit} corroborated secondary fit)
                  </>
                ) : (
                  <> ({coverage.primaryFit} primary-classified)</>
                )}
                .
              </p>
              <p className="mt-3 text-sm leading-relaxed text-cwr-muted">
                {segmentDensityNote(coverage.segmentAlberta, resolved.segment)}
              </p>
            </div>

            <div className="mt-8">
              <OperationalSearchPanel segment={resolved.segment} city={resolved.city} variant="page" />
            </div>

            <ul className="mt-8 flex flex-wrap gap-2.5" aria-label="Typical capabilities for this context">
              {seo.capabilityBadges.map((badge) => (
                <li
                  key={badge}
                  className="rounded-lg border border-cwr-border bg-cwr-bg px-3 py-2 text-xs font-semibold text-cwr-steel shadow-[inset_0_1px_0_rgb(255_255_255/0.65)]"
                >
                  {badge}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() =>
                  openInquiry({
                    segment: resolved.segment,
                    city: resolved.city,
                    ctaOrigin: 'landing',
                  })
                }
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cwr-ink px-5 py-2.5 text-sm font-semibold text-cwr-surface transition-colors duration-150 hover:bg-cwr-steel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent"
              >
                {SEGMENT_INQUIRY_CTA[resolved.segment]}
              </button>
            </div>

            <div className="mt-14 space-y-12 border-t border-cwr-border pt-12">
              <section aria-labelledby="landing-operational-insights">
                <h2
                  id="landing-operational-insights"
                  className="text-lg font-semibold tracking-tight text-cwr-ink"
                >
                  Operational signals to verify
                </h2>
                <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-cwr-muted marker:text-cwr-accent">
                  {insightLines.map((line, idx) => (
                    <li key={`${resolved.segment}-insight-${idx}`}>{line}</li>
                  ))}
                </ul>
              </section>
              <section aria-labelledby="landing-climate">
                <h2 id="landing-climate" className="text-lg font-semibold tracking-tight text-cwr-ink">
                  Alberta climate & site realities
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-cwr-muted">{climateContext}</p>
              </section>
              <section aria-labelledby="landing-suitability">
                <h2 id="landing-suitability" className="text-lg font-semibold tracking-tight text-cwr-ink">
                  Project fit
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-cwr-muted">{projectSuitability}</p>
              </section>
              <section aria-labelledby="landing-servicing">
                <h2 id="landing-servicing" className="text-lg font-semibold tracking-tight text-cwr-ink">
                  Servicing expectations
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-cwr-muted">{servicingExpectations}</p>
              </section>
            </div>
          </div>
        </article>

        <section
          id="operator-matching"
          className="scroll-mt-28"
          aria-label="Compare operators for this project context"
        >
          <MatchWorkspace
            segment={resolved.segment}
            city={resolved.city}
            summaryHeadline={summaryHeadline}
          />
        </section>

        <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:max-w-[42rem] lg:px-8 lg:py-16">
          <h2 className="text-xl font-semibold tracking-tight text-cwr-ink">Operational FAQs</h2>
          <p className="mt-2 text-sm text-cwr-muted">
            Practical answers for site planners — not generic marketing FAQs.
          </p>
          <dl className="mt-10 space-y-10">
            {faqs.map((item) => (
              <div key={item.question}>
                <dt className="text-base font-semibold text-cwr-ink">{item.question}</dt>
                <dd className="mt-3 text-sm leading-relaxed text-cwr-muted">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="border-t border-cwr-border bg-cwr-bg/60">
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:max-w-[42rem] lg:px-8">
            <h2 className="text-xl font-semibold tracking-tight text-cwr-ink">
              Run the interactive matcher
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cwr-muted">
              Prefer stepping through intent, city, and capability filters manually? The homepage flow
              preserves context switching without jumping between disconnected listings.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-cwr-ink px-6 py-3.5 text-sm font-semibold text-cwr-surface transition-colors duration-150 hover:bg-cwr-steel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent"
            >
              Open full matching flow
            </Link>
          </div>
        </section>

        {related.length > 0 ? (
          <section className="mx-auto max-w-3xl px-4 pb-20 pt-4 sm:px-6 lg:max-w-[42rem] lg:px-8 lg:pb-24">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-cwr-muted">
              Related operational guides
            </h2>
            <ul className="mt-5 space-y-3">
              {related.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm font-semibold text-cwr-accent underline-offset-4 transition-colors duration-150 hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </AppShell>
    </>
  )
}
