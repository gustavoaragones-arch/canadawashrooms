import { TERMINOLOGY_FAQ } from '../../lib/seo/canadianTerminology'

interface TerminologyFaqProps {
  heading?: string
  className?: string
}

export function TerminologyFaq({
  heading = 'Canadian terminology',
  className = '',
}: TerminologyFaqProps) {
  return (
    <section
      className={className}
      aria-labelledby="terminology-faq-heading"
    >
      <h2
        id="terminology-faq-heading"
        className="text-xl font-semibold tracking-tight text-cwr-ink"
      >
        {heading}
      </h2>
      <p className="mt-2 text-sm text-cwr-muted">
        Common naming variations for the same type of rental equipment.
      </p>
      <dl className="mt-8 space-y-6">
        <div>
          <dt className="text-base font-semibold text-cwr-ink">{TERMINOLOGY_FAQ.question}</dt>
          <dd className="mt-3 text-sm leading-relaxed text-cwr-muted">{TERMINOLOGY_FAQ.answer}</dd>
        </div>
      </dl>
    </section>
  )
}
