/**
 * Future organization → operational node → coverage hierarchy.
 * Optional on dataset rows; ingestion/enrichment may populate incrementally.
 */
export interface OperationalRelationshipHooks {
  /** Stable key for parent brand / Maps CID / franchise root — not a merge trigger. */
  organization_key?: string
  /** Stable key for this surfaced operational service node (city-scoped listing identity). */
  operational_node_key?: string
  /** Declared or inferred brand linkage cues — informational only. */
  shared_brand_signals?: string[]
  /** Related listing IDs (same org, different geography) — never implies duplicate. */
  related_provider_ids?: string[]
  /** Analyst or pipeline confidence in relationship edges — reserved for tooling. */
  relationship_confidence?: number
}
