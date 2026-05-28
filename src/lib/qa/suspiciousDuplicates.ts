import {
  probeFromProvider,
  strictListingIdentityMergeKeyFromProbe,
} from '../ingestion/organizationalOverlap'
import { normalizeAddress } from '../normalize/address'
import { normalizeBusinessName } from '../normalize/businessName'
import { normalizePhone } from '../normalize/phone'
import { normalizeWebsite } from '../normalize/website'
import type { Provider } from '../../types/provider'

/** QA sweep keys — relationship-aware; shared web/phone are signals, not merge triggers. */
export interface OperationalNodeKeyPartsExport {
  websiteKey: string | null
  phoneKey: string | null
  addressNameKey: string | null
  /** City + normalized address + name — matches ingestion destructive-merge tier when present. */
  listingIdentityMergeKey: string | null
}

export function operationalNodeKeyParts(provider: Provider): OperationalNodeKeyPartsExport {
  const probe = probeFromProvider(provider)
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

  return {
    websiteKey,
    phoneKey,
    addressNameKey,
    listingIdentityMergeKey: strictListingIdentityMergeKeyFromProbe(probe),
  }
}

/** Alias retained for internal tooling — prefer `operationalNodeKeyParts`. */
export function dedupeKeyParts(provider: Provider): OperationalNodeKeyPartsExport {
  return operationalNodeKeyParts(provider)
}
