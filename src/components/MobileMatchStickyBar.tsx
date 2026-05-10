import type { ReactNode } from 'react'
import type { PrimarySegment } from '../types/provider'
import { useOperationalInquiry } from './inquiry/OperationalInquiryContext'

interface MobileMatchStickyBarProps {
  segment: PrimarySegment
  headline: string
  city: string
  activeFilterCount: number
  providerCount: number
  isRelaxed: boolean
  activeCapabilityLabels: string[]
  /** Compact operational search strip above the status row (mobile). */
  topSlot?: ReactNode
}

export function MobileMatchStickyBar({
  segment,
  headline,
  city,
  activeFilterCount,
  providerCount,
  isRelaxed,
  activeCapabilityLabels,
  topSlot,
}: MobileMatchStickyBarProps) {
  const { openInquiry } = useOperationalInquiry()

  function scrollToFilters() {
    document.getElementById('filters')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex flex-col border-t border-cwr-border bg-cwr-surface/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-8px_rgb(20_20_19/0.12)] backdrop-blur-sm md:hidden"
      role="region"
      aria-label="Match status and filters"
    >
      {topSlot ? <div className="max-h-[40vh] overflow-hidden">{topSlot}</div> : null}
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 pt-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
            {city}
            {isRelaxed ? ' · Relaxed match' : ''}
          </p>
          <p className="truncate text-sm font-semibold text-cwr-ink">{headline}</p>
          <p className="mt-0.5 text-xs text-cwr-muted">
            {providerCount} operator{providerCount === 1 ? '' : 's'} ·{' '}
            {activeFilterCount === 0
              ? 'No filters'
              : `${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            openInquiry({
              segment,
              city,
              activeCapabilityLabels,
              ctaOrigin: 'mobile_bar',
            })
          }
          className="shrink-0 rounded-xl border border-cwr-border bg-cwr-ink px-3 py-3 text-sm font-semibold text-cwr-surface transition-colors duration-150 hover:bg-cwr-steel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent min-h-11"
        >
          Inquiry
        </button>
        <button
          type="button"
          onClick={scrollToFilters}
          className="shrink-0 rounded-xl border border-cwr-border bg-cwr-bg px-3 py-3 text-sm font-semibold text-cwr-ink transition-colors duration-150 hover:border-cwr-steel/40 hover:bg-cwr-surface active:bg-cwr-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent min-h-11"
        >
          Filters
        </button>
      </div>
    </div>
  )
}
