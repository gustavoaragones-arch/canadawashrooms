import type { SignalProvenanceKind } from './sourceAttribution'

/**
 * Future operator claiming / verification — no accounts or workflows yet.
 * `listing_provenance` may be attached to dataset rows when claiming ships.
 */
export type ProviderVerificationState =
  | 'unclaimed_public_listing'
  | 'claim_submitted'
  | 'operator_acknowledged'
  /** Reserved: deeper field verification — not implied anywhere in MVP UI. */
  | 'field_verified_partner'

export interface ProviderListingProvenance {
  verification_state: ProviderVerificationState
  /** Stable key tying Maps/listing identity to an operator record when claiming exists. */
  listing_entity_key?: string
  /** Optional snapshot of dominant signal sources for CRM / exports. */
  dominant_signal_sources?: SignalProvenanceKind[]
}
