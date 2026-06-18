import { Link } from 'react-router-dom'
import { SITE_LOGO, SITE_NAME } from '../config/site'

export function SiteHeader() {
  return (
    <header className="border-b border-cwr-border bg-cwr-surface/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:py-4 sm:px-6 lg:px-8">
        <Link to="/" className="group shrink-0" aria-label={SITE_NAME}>
          <img
            src={SITE_LOGO}
            alt={SITE_NAME}
            width={320}
            height={142}
            className="h-[4.5rem] w-auto transition-opacity duration-150 group-hover:opacity-90 sm:h-20"
            decoding="async"
          />
        </Link>
        <div className="hidden shrink-0 flex-col items-end gap-1 text-right text-sm sm:flex">
          <span className="text-xs text-cwr-muted">Live in Alberta, Ontario &amp; BC</span>
          <nav aria-label="Platform pages" className="mt-1.5 flex gap-4">
            <Link
              className="font-semibold text-cwr-ink underline-offset-4 hover:text-cwr-accent hover:underline"
              to="/providers"
            >
              Browse Providers
            </Link>
            <Link className="font-medium text-cwr-steel underline-offset-4 hover:text-cwr-ink hover:underline" to="/about">
              About
            </Link>
            <Link className="font-medium text-cwr-steel underline-offset-4 hover:text-cwr-ink hover:underline" to="/coverage">
              Coverage
            </Link>
            <Link className="font-medium text-cwr-steel underline-offset-4 hover:text-cwr-ink hover:underline" to="/contact">
              Contact
            </Link>
          </nav>
        </div>
        <nav
          aria-label="Platform pages"
          className="flex max-w-[50%] shrink-0 flex-wrap justify-end gap-x-2 gap-y-1 text-[11px] font-medium text-cwr-steel sm:hidden"
        >
          <Link
            className="font-semibold text-cwr-ink underline-offset-4 hover:text-cwr-accent hover:underline"
            to="/providers"
          >
            Browse
          </Link>
          <Link className="underline-offset-4 hover:text-cwr-ink hover:underline" to="/about">
            About
          </Link>
          <Link className="underline-offset-4 hover:text-cwr-ink hover:underline" to="/coverage">
            Coverage
          </Link>
          <Link className="underline-offset-4 hover:text-cwr-ink hover:underline" to="/contact">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  )
}
