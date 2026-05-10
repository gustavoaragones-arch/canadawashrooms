/**
 * Source attribution vocabulary — reserved for future per-field export and selective UI.
 * MVP keeps attribution narrative at page-level and footers; do not sprinkle citations everywhere.
 */
export type SignalProvenanceKind =
  | 'google_reviews_derived'
  | 'google_business_categories'
  | 'provider_website_declared'
  | 'manual_analyst_lock'
  | 'operational_inference'
  | 'public_listing_metadata'
