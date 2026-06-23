import { activeProviderFeatures } from '../lib/providerFeatures'
import type { Provider } from '../types/provider'

interface ProviderFeatureBadgesProps {
  provider: Provider
  className?: string
}

export function ProviderFeatureBadges({ provider, className = '' }: ProviderFeatureBadgesProps) {
  const features = activeProviderFeatures(provider)
  if (features.length === 0) return null

  return (
    <div className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cwr-muted">
        Available features
      </p>
      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Available features">
        {features.map((label) => (
          <li
            key={label}
            className="rounded-lg border border-cwr-border bg-cwr-bg px-3 py-1.5 text-xs font-semibold text-cwr-ink"
          >
            {label}
          </li>
        ))}
      </ul>
    </div>
  )
}
