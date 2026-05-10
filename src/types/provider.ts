import type { NormalizedReview } from './reviews'
import type { ProviderListingProvenance } from './providerVerification'

export type PrimarySegment =
  | 'construction'
  | 'event'
  | 'oilfield'
  | 'general'

/** Capability keys used by segment-specific filters (boolean on provider). */
export type FilterCapability =
  | 'weekly_service'
  | 'crane_liftable'
  | 'handwash_available'
  | 'luxury_units'
  | 'flush_toilets'
  | 'wedding_friendly'
  | 'heated'
  | 'winterized'
  | 'remote_support'
  | 'camp_support'
  | 'ada_accessible'
  | 'septic_service'

export type OperatorScale = 'solo' | 'small' | 'regional' | 'multi_route'

export type ResponsePriority = 'standard' | 'elevated' | 'priority_field'

/** Manual overrides for enrichment — explicit locks beat inference. */
export interface InferenceOverrideShape {
  winter_service?: boolean
  remote_logistics?: boolean
  luxury_trailers?: boolean
  flushing_units?: boolean
  septic_service?: boolean
  crane_liftable?: boolean
}

/** Analyst-curated overrides — supersede inference when present. */
export interface ManualEnrichmentOverrides extends InferenceOverrideShape {
  primary_segment?: PrimarySegment
  primary_segment_confidence?: number
  supported_segments?: PrimarySegment[]
  /** Force these capability-linked fields false after inference (curator blocks). */
  blocked_capabilities?: FilterCapability[]
  /** Force these inference-layer flags false even when reviews suggest otherwise. */
  blocked_inference?: (keyof InferenceOverrideShape)[]
  /** Replace default trust_signals entirely. */
  trust_signals_replace?: string[]
  /** Append after default trust signal build (ignored when trust_signals_replace set). */
  trust_signals_append?: string[]
  /** Replace derived inferred_specialties when non-empty. */
  curated_specialties?: string[]
}

export interface ProviderCore {
  id: string
  company_name: string
  primary_segment: PrimarySegment
  city: string
  service_area: string
  rating: number
  review_count: number
  website: string | null
  phone: string
  badges: string[]
  winterized: boolean
  luxury_units: boolean
  construction_ready: boolean
  oilfield_ready: boolean
  ada_accessible: boolean
  handwash_available: boolean
  weekly_service?: boolean
  crane_liftable?: boolean
  flush_toilets?: boolean
  wedding_friendly?: boolean
  heated?: boolean
  remote_support?: boolean
  camp_support?: boolean
  septic_service?: boolean
}

export interface ProviderEnrichment {
  primary_segment_confidence: number
  supported_segments: PrimarySegment[]
  capabilities: string[]
  operational_tags: string[]
  service_types: string[]
  inferred_specialties: string[]
  /** Structured trust inputs (volume, completeness, signals) — not marketing copy. */
  trust_signals: string[]
  /** Operational trust phrases derived from signals + enrichment — no invented claims. */
  operational_trust_cues: string[]
  response_priority: ResponsePriority
  winter_service: boolean
  remote_logistics: boolean
  luxury_trailers: boolean
  flushing_units: boolean
  operator_scale: OperatorScale
  years_in_business_estimate: number | null
  google_categories?: string[]
  reviews_normalized?: NormalizedReview[]
  operational_notes?: string
  /** Legacy boolean locks — merged with `manual_enrichment_overrides`. */
  inference_overrides?: Partial<InferenceOverrideShape>
  /** Analyst-curated layer — supersedes inference (segment + capability locks). */
  manual_enrichment_overrides?: ManualEnrichmentOverrides
  /** Future: claiming / verification snapshot — omit in MVP dataset rows. */
  listing_provenance?: ProviderListingProvenance
}

export interface Provider extends ProviderCore, ProviderEnrichment {}

/** Dataset row before enrichment pass. */
export type ProviderRaw = ProviderCore &
  Partial<ProviderEnrichment> & {
    google_categories?: string[]
    reviews_normalized?: NormalizedReview[]
    operational_notes?: string
    inference_overrides?: Partial<InferenceOverrideShape>
    manual_enrichment_overrides?: ManualEnrichmentOverrides
    years_in_business_estimate?: number | null
    /** Outscraper / Maps full address — ingest & dedupe only. */
    address_full?: string
  }
