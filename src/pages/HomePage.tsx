import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { useOperationalInquiry } from '../components/inquiry/OperationalInquiryContext'
import { CitySelector } from '../components/CitySelector'
import { FlowSteps } from '../components/FlowSteps'
import { Hero } from '../components/Hero'
import { OperationalSearchPanel } from '../components/OperationalSearchPanel'
import { IntentSelector } from '../components/IntentSelector'
import { MatchWorkspace } from '../components/MatchWorkspace'
import { DocumentMeta } from '../components/seo/DocumentMeta'
import { JsonLd } from '../components/seo/JsonLd'
import { defaultSiteMeta } from '../seo/metadata'
import { buildHomeJsonLd } from '../seo/schema'
import type { PriorityCity } from '../lib/segments'
import type { PrimarySegment } from '../types/provider'

export default function HomePage() {
  const { openInquiry } = useOperationalInquiry()
  const [segment, setSegment] = useState<PrimarySegment | null>(null)
  const [city, setCity] = useState<PriorityCity | null>(null)

  const homeMeta = useMemo(() => defaultSiteMeta(), [])

  useEffect(() => {
    if (!segment) return
    requestAnimationFrame(() => {
      document.getElementById('location')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }, [segment])

  useEffect(() => {
    if (!segment || !city) return
    requestAnimationFrame(() => {
      document.getElementById('filters')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }, [city, segment])

  function handleIntent(segmentChoice: PrimarySegment) {
    setSegment(segmentChoice)
    setCity(null)
  }

  function handleCity(cityChoice: PriorityCity) {
    setCity(cityChoice)
  }

  return (
    <>
      <DocumentMeta meta={homeMeta} />
      <JsonLd data={buildHomeJsonLd(homeMeta)} />

      <AppShell mainClassName={segment && city ? 'pb-44 md:pb-0' : undefined}>
        <Hero />
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-4 sm:px-6 lg:px-8">
          <OperationalSearchPanel
            segment={segment}
            city={city}
            variant={segment && city ? 'page' : 'hero'}
          />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <FlowSteps segment={segment} city={city} />
        </div>
        <IntentSelector selected={segment} onSelect={handleIntent} />
        <CitySelector disabled={!segment} selected={city} onSelect={handleCity} />
        {segment && city ? (
          <>
            <div className="mx-auto max-w-6xl px-4 pb-3 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() =>
                  openInquiry({
                    segment,
                    city,
                    ctaOrigin: 'home',
                  })
                }
                className="w-full rounded-2xl border border-cwr-border bg-cwr-surface px-5 py-4 text-left shadow-card transition-colors duration-150 hover:border-cwr-steel/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cwr-muted">
                  Request a quote
                </span>
                <span className="mt-1 block text-sm font-semibold text-cwr-ink">
                  Describe your site and needs — we open your email with a draft you can send to
                  operators.
                </span>
              </button>
            </div>
            <section id="operator-matching" aria-label="Operator matching workspace">
              <MatchWorkspace segment={segment} city={city} />
            </section>
          </>
        ) : (
          <section className="mx-auto max-w-6xl px-4 pb-16 text-center sm:px-6 lg:px-8">
            <p className="rounded-2xl border border-dashed border-cwr-border bg-cwr-surface px-5 py-8 text-sm leading-relaxed text-cwr-muted shadow-card sm:px-6 sm:py-10">
              {!segment
                ? 'Pick a project type above, then a city — you will get filters and a shortlist of portable washroom providers for that area.'
                : 'Choose a city to load filters and provider matches for that location.'}
            </p>
          </section>
        )}
      </AppShell>
    </>
  )
}
