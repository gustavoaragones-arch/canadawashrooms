import type { FilterCapability, PrimarySegment } from './provider'

/** Surface that opened the inquiry — reserved for future routing / analytics. */
export type InquirySurfaceOrigin = 'card' | 'landing' | 'mobile_bar' | 'home'

/**
 * In-browser inquiry draft — collected client-side only until mailto handoff.
 * Designed for future persistence without schema churn.
 */
export interface OperationalInquiryDraft {
  segment: PrimarySegment
  /** User-facing location (city name or site description). */
  cityOrLocation: string
  /** Free text or preset token — duration of need. */
  projectDuration?: string
  /** Crew (construction/oilfield) or guests (event) band. */
  headcountBand?: string
  /** Construction: servicing cadence expectation. */
  servicingFrequency?: string
  /** Event: trailer / comfort expectation. */
  trailerExpectations?: string
  /** Event: wedding, festival, corporate, etc. */
  eventContext?: string
  /** Oilfield / remote: access constraint narrative. */
  remoteAccessNotes?: string
  campSupportNeeded?: boolean | null
  /** Winter posture required — none / shoulder / full winter. */
  winterRequirements?: string
  /** General: rental pattern. */
  rentalPattern?: string
  adaNeeded?: boolean | null
  handwashStationsNeeded?: boolean | null
  /** User-selected or matcher-derived capability emphasis. */
  priorityCapabilities?: FilterCapability[]
  specialConditions?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
}

/** Future routing hooks — not consumed by backends yet. */
export interface InquiryRoutingMeta {
  channel: 'mailto_platform_v1'
  matching_context_version: 1
  /** Reserved for priority routing / SLA tiers. */
  intent_priority: 'standard' | 'elevated_field'
  /** Where the user entered the flow — future routing priors (not acted on yet). */
  inquiry_surface_origin?: InquirySurfaceOrigin
}

/** How this inquiry was targeted — supports future multi-provider routing. */
export interface InquiryProviderTargetingMeta {
  segment_context: PrimarySegment
  city_context: string
  primary_provider_id?: string
  primary_provider_name?: string
  /** Snapshot of matcher filters when inquiry opened from workspace. */
  active_capability_labels?: string[]
}

/** Serializable payload for mailto bodies, CRM export, or future API. */
export interface OperationalInquiryPayload {
  schema_version: 1
  created_at_iso: string
  summary_line: string
  draft: OperationalInquiryDraft
  routing: InquiryRoutingMeta
  targeting: InquiryProviderTargetingMeta
}
