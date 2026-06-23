import { providerDisplayCategories } from '../lib/taxonomy/publicPrimaryCategories'
import { publicCategoryLabel } from '../lib/taxonomy/publicCategoryMapper'
import type { Provider } from '../types/provider'

interface ProviderServicesOfferedProps {
  provider: Provider
  className?: string
}

export function ProviderServicesOffered({ provider, className = '' }: ProviderServicesOfferedProps) {
  const categories = providerDisplayCategories(provider)

  return (
    <div className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cwr-muted">
        Services offered
      </p>
      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Services offered">
        {categories.map((cat) => (
          <li
            key={cat}
            className="rounded-lg border border-cwr-accent/25 bg-cwr-accent-muted px-3 py-1.5 text-xs font-semibold text-cwr-accent"
          >
            {publicCategoryLabel(cat)}
          </li>
        ))}
      </ul>
    </div>
  )
}
