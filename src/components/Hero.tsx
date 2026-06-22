import { FlowSteps } from './FlowSteps'
import { compareProvidersCopy } from '../lib/seo/canadianTerminology'
import type { PrimarySegment } from '../types/provider'
import type { PriorityCity } from '../lib/segments'

const HERO_BG = '/canada-portable-bathrooms.png'

interface HeroProps {
  segment: PrimarySegment | null
  city: PriorityCity | null
}

export function Hero({ segment, city }: HeroProps) {
  return (
    <section
      className="relative overflow-hidden border-b border-cwr-border bg-cwr-surface"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HERO_BG})` }}
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cwr-accent">
          CanadaWashrooms.ca
        </p>
        <p className="mt-2 text-sm font-medium text-cwr-steel">
          Now live in Alberta, Ontario, and British Columbia.
        </p>
        <h1
          id="hero-heading"
          className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-cwr-ink sm:mt-6 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
        >
          Portable Washroom Rentals
          <br />
          Across Canada
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-cwr-steel sm:mt-5 sm:text-lg">
          {compareProvidersCopy()} Browse restroom trailer, construction site, and event providers
          across Alberta, Ontario, and British Columbia.{' '}
          <span className="font-medium text-cwr-ink">Confirm availability and pricing directly with each operator</span>{' '}
          before you book.
        </p>
        <div className="mt-8 sm:mt-10">
          <FlowSteps segment={segment} city={city} embedded />
        </div>
      </div>
    </section>
  )
}
