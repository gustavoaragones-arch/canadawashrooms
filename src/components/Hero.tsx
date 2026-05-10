export function Hero() {
  return (
    <section
      className="relative overflow-hidden border-b border-cwr-border bg-cwr-surface"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-12deg, transparent, transparent 11px, currentColor 11px, currentColor 12px)',
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cwr-accent">
          Operational sanitation intelligence · Alberta-first
        </p>
        <h1
          id="hero-heading"
          className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-cwr-ink sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]"
        >
          Match portable sanitation to how your{' '}
          <span className="text-cwr-steel">Alberta project</span> actually runs.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cwr-muted">
          Calgary corridor construction, Canmore-adjacent event logistics, Fort McMurray–grade remote
          camps — same province, different servicing assumptions. Start from segment and city, then
          filter on capabilities aligned with freeze–thaw, lease-road access, and real occupancy. Retrieval
          is informational: confirm winter readiness and dispatch with operators before mobilizing.
        </p>
        <dl className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-cwr-border bg-cwr-bg px-5 py-4 shadow-card">
            <dt className="text-xs font-semibold uppercase tracking-wider text-cwr-muted">
              Coverage
            </dt>
            <dd className="mt-1 text-base font-semibold text-cwr-ink">Alberta operational MVP</dd>
            <dd className="mt-1 text-sm text-cwr-muted">City-scoped guides — no province sprawl yet</dd>
          </div>
          <div className="rounded-2xl border border-cwr-border bg-cwr-bg px-5 py-4 shadow-card">
            <dt className="text-xs font-semibold uppercase tracking-wider text-cwr-muted">
              Intelligence layer
            </dt>
            <dd className="mt-1 text-base font-semibold text-cwr-ink">Structured provider fit</dd>
            <dd className="mt-1 text-sm text-cwr-muted">
              Capability-aware retrieval and review-adjacent inference — ranked cohorts, not guaranteed fit
            </dd>
          </div>
          <div className="rounded-2xl border border-cwr-border bg-cwr-bg px-5 py-4 shadow-card">
            <dt className="text-xs font-semibold uppercase tracking-wider text-cwr-muted">
              Contact paths
            </dt>
            <dd className="mt-1 text-base font-semibold text-cwr-ink">Web + phone parity</dd>
            <dd className="mt-1 text-sm text-cwr-muted">Industrial operators without sites stay in scope</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
