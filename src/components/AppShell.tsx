import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { TRANSPARENCY } from '../lib/transparencyCopy'
import { SiteHeader } from './SiteHeader'

interface AppShellProps {
  children: ReactNode
  /** Extra classes on `<main>` (e.g. bottom padding for mobile sticky bar). */
  mainClassName?: string
}

export function AppShell({ children, mainClassName }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main-content" className="cwr-skip-link">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className={mainClassName}>
        {children}
      </main>
      <footer className="mt-auto border-t border-cwr-border bg-cwr-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <div className="lg:col-span-1">
              <p className="text-sm font-semibold text-cwr-ink">Canada Washrooms</p>
              <p className="mt-2 text-sm leading-relaxed text-cwr-muted">
                Alberta-first portable sanitation discovery — structured matching, not a marketplace.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cwr-muted">
                Platform
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link className="text-cwr-accent underline-offset-4 hover:underline" to="/about">
                    About
                  </Link>
                </li>
                <li>
                  <Link className="text-cwr-accent underline-offset-4 hover:underline" to="/methodology">
                    Methodology
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-cwr-accent underline-offset-4 hover:underline"
                    to="/alberta-coverage"
                  >
                    Alberta coverage
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cwr-muted">
                Contact
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link className="text-cwr-accent underline-offset-4 hover:underline" to="/contact">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cwr-muted">
                Data transparency
              </p>
              <p className="mt-3 text-sm leading-relaxed text-cwr-muted">{TRANSPARENCY.shortFooter}</p>
            </div>
          </div>
          <div className="mt-10 border-t border-cwr-border pt-6 text-xs leading-relaxed text-cwr-muted">
            <p>{TRANSPARENCY.informationalPositioning}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
