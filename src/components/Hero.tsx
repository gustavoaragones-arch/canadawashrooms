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
          Portable washroom matching across Canada
        </p>
        <p className="mt-2 text-sm font-medium text-cwr-steel">
          Now live in Alberta and Ontario. British Columbia coming next.
        </p>
        <h1
          id="hero-heading"
          className="cwr-hero-headline-glow mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-cwr-ink sm:mt-6 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
        >
          Find the right portable toilet rental for your project.
        </h1>
        <p className="cwr-hero-intro-panel mt-4 max-w-2xl rounded-xl border border-cwr-border/70 px-4 py-3.5 text-base leading-relaxed text-cwr-steel backdrop-blur-[2px] sm:mt-5 sm:px-5 sm:py-4 sm:text-lg">
          Compare portable toilets, washrooms, and restroom trailers for construction, weddings and events,
          and remote sites — by city and what you need on site.{' '}
          <span className="font-medium text-cwr-ink">Live in Alberta and Ontario;</span> confirm
          servicing and pricing with operators before you book.
        </p>
        <dl className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-6">
          <div className="rounded-2xl border border-cwr-border bg-cwr-bg px-5 py-4 shadow-card">
            <dt className="text-xs font-semibold uppercase tracking-wider text-cwr-muted">
              Where we are today
            </dt>
            <dd className="mt-1 text-base font-semibold text-cwr-ink">Canada-wide focus</dd>
            <dd className="mt-1 text-sm text-cwr-muted">
              Alberta cities first — portable toilets, washrooms, and oilfield-friendly options in the
              live dataset
            </dd>
          </div>
          <div className="rounded-2xl border border-cwr-border bg-cwr-bg px-5 py-4 shadow-card">
            <dt className="text-xs font-semibold uppercase tracking-wider text-cwr-muted">
              How matching works
            </dt>
            <dd className="mt-1 text-base font-semibold text-cwr-ink">Project-based matching</dd>
            <dd className="mt-1 text-sm text-cwr-muted">
              Pick project type and location, then narrow by features — ranked for fit, not a generic
              directory
            </dd>
          </div>
          <div className="rounded-2xl border border-cwr-border bg-cwr-bg px-5 py-4 shadow-card">
            <dt className="text-xs font-semibold uppercase tracking-wider text-cwr-muted">
              Listings
            </dt>
            <dd className="mt-1 text-base font-semibold text-cwr-ink">Phone &amp; web</dd>
            <dd className="mt-1 text-sm text-cwr-muted">
              Includes operators with and without websites — call or email to verify availability
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
