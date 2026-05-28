import { useEffect, useMemo, useRef, useState } from 'react'
import { emitProductionAnalytics } from '../../lib/analytics/productionAnalytics'
import type { OperationalInquiryDraft } from '../../types/inquiry'
import { buildOperationalInquirySummary } from '../../lib/inquiry/buildInquirySummary'
import { operationalInquiryMailto } from '../../lib/inquiry/operationalInquiryMailto'
import { providerInquiryFitLines } from '../../lib/inquiry/providerInquiryContext'
import { buildInquiryPayload, serializeInquiryPayloadJson } from '../../lib/inquiry/serializeInquiry'
import { segmentLabel } from '../../lib/segments'
import { useOperationalInquiry } from './OperationalInquiryContext'

const DURATION_OPTS = [
  { value: '', label: 'Timeline (optional)' },
  { value: 'a few days', label: 'A few days' },
  { value: '1–4 weeks', label: '1–4 weeks' },
  { value: '1–3 months', label: '1–3 months' },
  { value: '3+ months', label: '3+ months' },
  { value: 'uncertain / TBD', label: 'Uncertain / TBD' },
]

const HEADCOUNT_OPTS = [
  { value: '', label: 'Scale (optional)' },
  { value: 'under 15', label: 'Under 15' },
  { value: '15–40', label: '15–40' },
  { value: '40–100', label: '40–100' },
  { value: '100+', label: '100+' },
]

const SERVICE_OPTS = [
  { value: '', label: 'Servicing cadence (optional)' },
  { value: 'daily service', label: 'Daily' },
  { value: '2–3× per week', label: '2–3× per week' },
  { value: 'weekly service', label: 'Weekly' },
  { value: 'as-needed / on-call', label: 'As-needed' },
]

const TRAILER_OPTS = [
  { value: '', label: 'Trailer / comfort (optional)' },
  { value: 'standard units acceptable', label: 'Standard units acceptable' },
  { value: 'luxury trailer emphasis', label: 'Luxury trailer emphasis' },
  { value: 'VIP / multi-stall trailer', label: 'VIP / multi-stall trailer' },
]

const EVENT_CTX_OPTS = [
  { value: '', label: 'Event type (optional)' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'festival', label: 'Festival / public event' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'community', label: 'Community / municipal' },
  { value: 'other', label: 'Other' },
]

const RENTAL_PATTERN_OPTS = [
  { value: '', label: 'Engagement pattern (optional)' },
  { value: 'short-term single mobilization', label: 'Short-term (single mobilization)' },
  { value: 'recurring / multi-phase', label: 'Recurring / multi-phase' },
  { value: 'seasonal standby', label: 'Seasonal standby' },
]

const WINTER_OPTS = [
  { value: 'none', label: 'No winter-specific requirement' },
  { value: 'shoulder', label: 'Shoulder-season cold exposure' },
  { value: 'full', label: 'Full winter operations' },
]

function triToString(v: boolean | null | undefined): '' | 'yes' | 'no' {
  if (v === true) return 'yes'
  if (v === false) return 'no'
  return ''
}

function stringToTri(s: string): boolean | null {
  if (s === 'yes') return true
  if (s === 'no') return false
  return null
}

function SegmentFields({
  draft,
  patch,
}: {
  draft: OperationalInquiryDraft
  patch: (p: Partial<OperationalInquiryDraft>) => void
}) {
  const sel =
    'mt-1 w-full rounded-xl border border-cwr-border bg-cwr-surface px-3 py-2.5 text-sm text-cwr-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent'

  switch (draft.segment) {
    case 'construction':
      return (
        <>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
            Project duration
            <select
              className={sel}
              value={draft.projectDuration ?? ''}
              onChange={(e) => patch({ projectDuration: e.target.value || undefined })}
            >
              {DURATION_OPTS.map((o) => (
                <option key={o.value || 'empty'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
            On-site headcount (band)
            <select
              className={sel}
              value={draft.headcountBand ?? ''}
              onChange={(e) => patch({ headcountBand: e.target.value || undefined })}
            >
              {HEADCOUNT_OPTS.map((o) => (
                <option key={o.value || 'empty'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
            Servicing frequency
            <select
              className={sel}
              value={draft.servicingFrequency ?? ''}
              onChange={(e) => patch({ servicingFrequency: e.target.value || undefined })}
            >
              {SERVICE_OPTS.map((o) => (
                <option key={o.value || 'empty'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </>
      )
    case 'event':
      return (
        <>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
            Guest count (band)
            <select
              className={sel}
              value={draft.headcountBand ?? ''}
              onChange={(e) => patch({ headcountBand: e.target.value || undefined })}
            >
              {HEADCOUNT_OPTS.map((o) => (
                <option key={o.value || 'empty'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
            Trailer expectations
            <select
              className={sel}
              value={draft.trailerExpectations ?? ''}
              onChange={(e) => patch({ trailerExpectations: e.target.value || undefined })}
            >
              {TRAILER_OPTS.map((o) => (
                <option key={o.value || 'empty'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
            Event context
            <select
              className={sel}
              value={draft.eventContext ?? ''}
              onChange={(e) => patch({ eventContext: e.target.value || undefined })}
            >
              {EVENT_CTX_OPTS.map((o) => (
                <option key={o.value || 'empty'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
            Timeline
            <select
              className={sel}
              value={draft.projectDuration ?? ''}
              onChange={(e) => patch({ projectDuration: e.target.value || undefined })}
            >
              {DURATION_OPTS.map((o) => (
                <option key={o.value || 'empty'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </>
      )
    case 'oilfield':
      return (
        <>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
            Crew scale (band)
            <select
              className={sel}
              value={draft.headcountBand ?? ''}
              onChange={(e) => patch({ headcountBand: e.target.value || undefined })}
            >
              {HEADCOUNT_OPTS.map((o) => (
                <option key={o.value || 'empty'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
            Remote access / road constraints
            <textarea
              className={`${sel} min-h-[4.5rem] resize-y`}
              placeholder="Road ban windows, lease roads, pilot requirements…"
              value={draft.remoteAccessNotes ?? ''}
              onChange={(e) => patch({ remoteAccessNotes: e.target.value || undefined })}
              rows={3}
            />
          </label>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
            Camp support
            <select
              className={sel}
              value={triToString(draft.campSupportNeeded)}
              onChange={(e) => patch({ campSupportNeeded: stringToTri(e.target.value) })}
            >
              <option value="">Not specified</option>
              <option value="yes">Yes — camp-scale expectations</option>
              <option value="no">No — transient site only</option>
            </select>
          </label>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
            Mobilization length
            <select
              className={sel}
              value={draft.projectDuration ?? ''}
              onChange={(e) => patch({ projectDuration: e.target.value || undefined })}
            >
              {DURATION_OPTS.map((o) => (
                <option key={o.value || 'empty'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </>
      )
    case 'general':
      return (
        <>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
            Short-term vs recurring
            <select
              className={sel}
              value={draft.rentalPattern ?? ''}
              onChange={(e) => patch({ rentalPattern: e.target.value || undefined })}
            >
              {RENTAL_PATTERN_OPTS.map((o) => (
                <option key={o.value || 'empty'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
            Headcount (band)
            <select
              className={sel}
              value={draft.headcountBand ?? ''}
              onChange={(e) => patch({ headcountBand: e.target.value || undefined })}
            >
              {HEADCOUNT_OPTS.map((o) => (
                <option key={o.value || 'empty'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
            ADA-accessible units
            <select
              className={sel}
              value={triToString(draft.adaNeeded)}
              onChange={(e) => patch({ adaNeeded: stringToTri(e.target.value) })}
            >
              <option value="">Not specified</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
            Handwash stations
            <select
              className={sel}
              value={triToString(draft.handwashStationsNeeded)}
              onChange={(e) => patch({ handwashStationsNeeded: stringToTri(e.target.value) })}
            >
              <option value="">Not specified</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
        </>
      )
  }
}

export function OperationalInquirySurface() {
  const { open, openArgs, draft, setDraft, closeInquiry } = useOperationalInquiry()
  const [copied, setCopied] = useState(false)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeInquiry()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closeInquiry])

  useEffect(() => {
    if (!open) return
    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    requestAnimationFrame(() => {
      document.getElementById('inquiry-city-field')?.focus()
    })
    return () => {
      previouslyFocusedRef.current?.focus?.()
      previouslyFocusedRef.current = null
    }
  }, [open])

  const payload = useMemo(() => {
    if (!draft || !openArgs) return null
    const cityCtx = draft.cityOrLocation.trim() || openArgs.city
    const targeting = {
      segment_context: draft.segment,
      city_context: cityCtx,
      primary_provider_id: openArgs.provider?.id,
      primary_provider_name: openArgs.provider?.company_name,
      active_capability_labels: openArgs.activeCapabilityLabels?.filter(Boolean),
    }
    return buildInquiryPayload(draft, targeting, {
      inquiry_surface_origin: openArgs.ctaOrigin,
    })
  }, [draft, openArgs])

  const summaryPreview = useMemo(() => {
    if (!draft) return ''
    return buildOperationalInquirySummary(draft, {
      providerName: openArgs?.provider?.company_name,
    })
  }, [draft, openArgs?.provider?.company_name])

  const mailtoHref = payload ? operationalInquiryMailto(payload) : ''

  const fitLines =
    openArgs?.provider != null
      ? providerInquiryFitLines(openArgs.provider, openArgs.segment)
      : []

  if (!open || !draft || !openArgs || !payload) return null

  function patch(partial: Partial<OperationalInquiryDraft>) {
    setDraft((d) => (d ? { ...d, ...partial } : d))
  }

  async function copyJson() {
    const p = payload
    if (!p) return
    try {
      await navigator.clipboard.writeText(serializeInquiryPayloadJson(p))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const segmentTitle = segmentLabel(draft.segment)

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-cwr-ink/45 backdrop-blur-[2px]"
        aria-label="Close inquiry"
        onClick={closeInquiry}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="operational-inquiry-title"
        aria-describedby="inquiry-dialog-desc"
        className="relative flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-cwr-border bg-cwr-surface shadow-[0_-12px_48px_-12px_rgb(20_20_19/0.35)] sm:max-h-[85vh] sm:rounded-2xl sm:shadow-card"
      >
        <div className="flex items-start justify-between gap-3 border-b border-cwr-border px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cwr-accent">
              Quote request
            </p>
            <h2 id="operational-inquiry-title" className="mt-1 text-lg font-semibold text-cwr-ink">
              {openArgs.provider ? (
                <>
                  <span className="block truncate">{openArgs.provider.company_name}</span>
                  <span className="mt-0.5 block text-sm font-normal text-cwr-muted">
                    {segmentTitle} · {openArgs.city}
                  </span>
                </>
              ) : (
                <>
                  {segmentTitle}
                  <span className="mt-0.5 block text-sm font-normal text-cwr-muted">
                    {openArgs.city}
                  </span>
                </>
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeInquiry}
            className="min-h-11 shrink-0 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-cwr-muted transition-colors hover:border-cwr-border hover:text-cwr-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {fitLines.length > 0 ? (
            <div className="mb-5 rounded-xl border border-cwr-border bg-cwr-bg/80 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
                Why this listing might fit
              </p>
              <ul className="mt-2 space-y-1.5 text-sm leading-snug text-cwr-steel">
                {fitLines.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="text-cwr-accent" aria-hidden>
                      ·
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p id="inquiry-dialog-desc" className="text-xs leading-relaxed text-cwr-muted">
            Structured fields help operators respond with realistic servicing plans — no account
            required. Your message opens in your email client; we do not store submissions on our
            servers.
          </p>

          <div className="mt-5 space-y-4">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
              City / site location
              <input
                id="inquiry-city-field"
                className="mt-1 w-full rounded-xl border border-cwr-border bg-cwr-surface px-3 py-2.5 text-sm text-cwr-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent"
                value={draft.cityOrLocation}
                onChange={(e) => patch({ cityOrLocation: e.target.value })}
                autoComplete="address-level2"
              />
            </label>

            <SegmentFields draft={draft} patch={patch} />

            <label className="block text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
              Winter / cold exposure
              <select
                className="mt-1 w-full rounded-xl border border-cwr-border bg-cwr-surface px-3 py-2.5 text-sm text-cwr-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent"
                value={draft.winterRequirements ?? 'none'}
                onChange={(e) => patch({ winterRequirements: e.target.value })}
              >
                {WINTER_OPTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
              Operational notes (optional)
              <textarea
                className="mt-1 min-h-[4rem] w-full resize-y rounded-xl border border-cwr-border bg-cwr-surface px-3 py-2.5 text-sm text-cwr-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent"
                placeholder="Gate times, induction, fuel/power, unusual hazards…"
                value={draft.specialConditions ?? ''}
                onChange={(e) => patch({ specialConditions: e.target.value || undefined })}
                rows={3}
              />
            </label>

            <details className="rounded-xl border border-cwr-border bg-cwr-bg/50 px-4 py-3">
              <summary className="cursor-pointer text-xs font-semibold text-cwr-steel">
                Contact details (optional)
              </summary>
              <div className="mt-3 space-y-3">
                <input
                  className="w-full rounded-lg border border-cwr-border bg-cwr-surface px-3 py-2 text-sm text-cwr-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent"
                  placeholder="Name"
                  value={draft.contactName ?? ''}
                  onChange={(e) => patch({ contactName: e.target.value || undefined })}
                  autoComplete="name"
                />
                <input
                  className="w-full rounded-lg border border-cwr-border bg-cwr-surface px-3 py-2 text-sm text-cwr-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent"
                  placeholder="Email"
                  type="email"
                  value={draft.contactEmail ?? ''}
                  onChange={(e) => patch({ contactEmail: e.target.value || undefined })}
                  autoComplete="email"
                />
                <input
                  className="w-full rounded-lg border border-cwr-border bg-cwr-surface px-3 py-2 text-sm text-cwr-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent"
                  placeholder="Phone"
                  type="tel"
                  value={draft.contactPhone ?? ''}
                  onChange={(e) => patch({ contactPhone: e.target.value || undefined })}
                  autoComplete="tel"
                />
              </div>
            </details>
          </div>

          <div className="mt-6 rounded-xl border border-cwr-border bg-cwr-bg/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-cwr-muted">
              Request summary
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cwr-ink">{summaryPreview}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-cwr-border bg-cwr-surface px-5 py-4 sm:flex-row sm:flex-wrap sm:px-6">
          <a
            href={mailtoHref}
            onClick={() =>
              emitProductionAnalytics('inquiry_completed_mailto', {
                segment: draft.segment,
                city: draft.cityOrLocation,
              })
            }
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-cwr-ink px-4 py-3 text-center text-sm font-semibold text-cwr-surface transition-colors duration-150 hover:bg-cwr-steel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent"
          >
            Send via email
          </a>
          <button
            type="button"
            onClick={() => void copyJson()}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-cwr-border bg-cwr-bg px-4 py-3 text-sm font-semibold text-cwr-ink transition-colors hover:border-cwr-steel/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cwr-accent"
          >
            {copied ? 'Copied JSON' : 'Copy structured payload'}
          </button>
        </div>
      </div>
    </div>
  )
}
