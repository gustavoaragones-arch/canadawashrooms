import manualOverridesJson from '../data/manual-overrides.json'
import providersJson from '../data/providers.json'
import type { Provider, ProviderRaw } from '../types/provider'
import {
  applyManualOverridesFile,
  type ManualOverridesFile,
} from './dataOperations/manualOverridesFile'
import { enrichProvider } from './enrichment/enrichProvider'

const manualOverrides = manualOverridesJson as ManualOverridesFile

const mergedRaw = applyManualOverridesFile(providersJson as ProviderRaw[], manualOverrides)

function safeEnrich(raw: ProviderRaw, index: number): Provider | null {
  try {
    return enrichProvider(raw)
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn(`[providersDataset] enrich failed at row ${index}`, err)
    }
    return null
  }
}

/** Defensive: malformed rows are dropped so retrieval never hard-crashes the SPA. */
export const PROVIDERS: Provider[] = mergedRaw
  .map((row, index) => safeEnrich(row, index))
  .filter((p): p is Provider => p != null)
