const HERO_BG = '/canada-portable-bathrooms.jpg'

export function Hero() {
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
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cwr-surface/20 via-transparent to-cwr-surface/75"
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cwr-accent">
          CanadaWashrooms.ca
        </p>
        <p className="mt-2 text-sm font-medium text-cwr-steel">
          Now live in Alberta and Ontario. British Columbia coming next.
        </p>
        <h1
          id="hero-heading"
          className="cwr-hero-headline-glow mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-cwr-ink sm:mt-6 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
        >
          Portable Washroom Rentals Across Canada
        </h1>
        <p className="cwr-hero-intro-panel mt-4 max-w-2xl rounded-xl border border-cwr-border/70 px-4 py-3.5 text-base leading-relaxed text-cwr-steel backdrop-blur-[2px] sm:mt-5 sm:px-5 sm:py-4 sm:text-lg">
          Compare portable toilet, restroom trailer, construction site, and event washroom providers
          across Alberta and Ontario.{' '}
          <span className="font-medium text-cwr-ink">Confirm availability and pricing directly with each operator</span>{' '}
          before you book.
        </p>
        <dl className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-6">
          <div className="rounded-2xl border border-cwr-border bg-cwr-bg px-5 py-4 shadow-card">
            <dt className="text-xs font-semibold uppercase tracking-wider text-cwr-muted">
              5 categories
            </dt>
            <dd className="mt-1 text-base font-semibold text-cwr-ink">Construction to events</dd>
            <dd className="mt-1 text-sm text-cwr-muted">
              Jobsites, weddings, remote operations, waste services, and everyday rentals — all in one place
            </dd>
          </div>
          <div className="rounded-2xl border border-cwr-border bg-cwr-bg px-5 py-4 shadow-card">
            <dt className="text-xs font-semibold uppercase tracking-wider text-cwr-muted">
              How it works
            </dt>
            <dd className="mt-1 text-base font-semibold text-cwr-ink">Pick type, then city</dd>
            <dd className="mt-1 text-sm text-cwr-muted">
              Choose your project type and location, filter by features, and see operators matched for that context
            </dd>
          </div>
          <div className="rounded-2xl border border-cwr-border bg-cwr-bg px-5 py-4 shadow-card">
            <dt className="text-xs font-semibold uppercase tracking-wider text-cwr-muted">
              Listings
            </dt>
            <dd className="mt-1 text-base font-semibold text-cwr-ink">Phone &amp; web operators</dd>
            <dd className="mt-1 text-sm text-cwr-muted">
              Includes operators with and without websites — call or email to verify availability before you commit
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
