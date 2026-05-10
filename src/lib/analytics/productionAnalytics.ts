/**
 * Lightweight analytics foundation — zero third-party scripts.
 *
 * Dispatches `CustomEvent('cwr-analytics', { detail })` on `window` for optional subscribers
 * (e.g. future worker, GTM adapter, or privacy-preserving proxy). Safe to call from UI; never throws.
 *
 * Event names (stable contract):
 * - segment_selected, city_selected
 * - capability_filter_toggled, capability_filters_cleared
 * - operational_search (debounced in search panel)
 * - inquiry_opened, inquiry_closed, inquiry_completed_mailto
 * - provider_phone_click, provider_website_click, provider_jump_to_listing
 */
export type ProductionAnalyticsDetail = {
  event: string
  payload?: Record<string, unknown>
  ts: number
}

export function emitProductionAnalytics(
  event: string,
  payload?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return
  try {
    const detail: ProductionAnalyticsDetail = {
      event,
      payload,
      ts: Date.now(),
    }
    window.dispatchEvent(new CustomEvent('cwr-analytics', { detail }))
  } catch {
    /* ignore — analytics must never break UX */
  }
}
