import { activeProviderAvailableServices } from '../lib/providerAvailableServices'
import type { Provider } from '../types/provider'

interface ProviderFeatureBadgesProps {
  provider: Provider
  className?: string
}

export function ProviderFeatureBadges({ provider, className = '' }: ProviderFeatureBadgesProps) {
  const services = activeProviderAvailableServices(provider)
  if (services.length === 0) return null

  return (
    <div className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cwr-muted">
        Available services
      </p>
      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Available services">
        {services.map((label) => (
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
