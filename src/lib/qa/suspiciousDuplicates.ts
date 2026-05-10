import { normalizeAddress } from '../normalize/address'
import { normalizeBusinessName } from '../normalize/businessName'
import { normalizePhone } from '../normalize/phone'
import { normalizeWebsite } from '../normalize/website'
import type { Provider } from '../../types/provider'

export interface DedupeKeyPartsExport {
  websiteKey: string | null
  phoneKey: string | null
  addressNameKey: string | null
}

/** Expose same tier logic as ingestion dedupe for QA sweeps on enriched providers. */
export function dedupeKeyParts(provider: Provider): DedupeKeyPartsExport {
  const websiteKey = provider.website
    ? (normalizeWebsite(provider.website)?.toLowerCase() ?? null)
    : null
  const digits = normalizePhone(provider.phone).replace(/\D/g, '')
  const phoneKey = digits.length >= 10 ? digits : null

  const addr = (provider as Provider & { address_full?: string }).address_full
  const addressNameKey =
    addr && provider.company_name
      ? `${normalizeAddress(addr)}|${normalizeBusinessName(provider.company_name)}`
      : null

  return { websiteKey, phoneKey, addressNameKey }
}
