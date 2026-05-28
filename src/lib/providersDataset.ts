import providersJson from '../data/providers.json'
import type { Provider } from '../types/provider'

/**
 * Pre-enriched national dataset — output of `npm run data:build-production`.
 * Enrichment and manual overrides are applied at build time; do not re-process here.
 */
export const PROVIDERS: Provider[] = providersJson as Provider[]
