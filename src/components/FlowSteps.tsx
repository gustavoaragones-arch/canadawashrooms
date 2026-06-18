import type { PrimarySegment } from '../types/provider'
import { segmentLabel, type PriorityCity } from '../lib/segments'

interface FlowStepsProps {
  segment: PrimarySegment | null
  city: PriorityCity | null
  /** When true, omit outer page container — for use inside Hero. */
  embedded?: boolean
}

export function FlowSteps({ segment, city, embedded = false }: FlowStepsProps) {
  const steps = [
    {
      key: 'intent',
      label: 'Project type',
      detail: segment ? segmentLabel(segment) : 'Pick a project type',
      done: Boolean(segment),
    },
    {
      key: 'city',
      label: 'Location',
      detail: city ?? 'City',
      done: Boolean(segment && city),
    },
    {
      key: 'filters',
      label: 'Features needed',
      detail: segment && city ? 'Refine your list' : 'Pick type & city first',
      done: Boolean(segment && city),
    },
  ] as const

  return (
    <nav
      aria-label="Matching steps"
      className={embedded ? undefined : 'mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'}
    >
      <ol className="flex flex-col gap-3 rounded-2xl border border-cwr-border bg-cwr-surface p-4 shadow-card sm:flex-row sm:items-stretch sm:gap-0 sm:divide-x sm:divide-cwr-border sm:p-0">
        {steps.map((step, index) => (
          <li key={step.key} className="flex flex-1 flex-col gap-1 sm:px-6 sm:py-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cwr-muted">
              Step {index + 1}
            </span>
            <span className="text-sm font-semibold text-cwr-ink">{step.label}</span>
            <span
              className={
                step.done
                  ? 'text-sm text-cwr-steel'
                  : 'text-sm text-cwr-muted italic sm:not-italic'
              }
            >
              {step.detail}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  )
}
