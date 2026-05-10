import { Link } from 'react-router-dom'

export function SiteHeader() {
  return (
    <header className="border-b border-cwr-border bg-cwr-surface/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex flex-col leading-tight">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cwr-muted">
            Canada Washrooms
          </span>
          <span className="text-lg font-semibold text-cwr-ink transition-colors group-hover:text-cwr-accent">
            Alberta matching
          </span>
        </Link>
        <div className="hidden items-center gap-6 text-sm text-cwr-muted sm:flex">
          <nav aria-label="Platform pages" className="flex gap-4">
            <Link className="font-medium text-cwr-steel underline-offset-4 hover:text-cwr-ink hover:underline" to="/about">
              About
            </Link>
            <Link className="font-medium text-cwr-steel underline-offset-4 hover:text-cwr-ink hover:underline" to="/methodology">
              Methodology
            </Link>
            <Link className="font-medium text-cwr-steel underline-offset-4 hover:text-cwr-ink hover:underline" to="/contact">
              Contact
            </Link>
          </nav>
          <div className="hidden text-right md:block">
            <div className="font-medium text-cwr-ink">Operational sanitation matching</div>
            <div className="text-xs uppercase tracking-wider">Portable • Serviced • Jobsite-ready</div>
          </div>
        </div>
      </div>
    </header>
  )
}
