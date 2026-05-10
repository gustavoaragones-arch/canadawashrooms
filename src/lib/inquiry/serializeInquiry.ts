import type {
  InquiryProviderTargetingMeta,
  InquiryRoutingMeta,
  OperationalInquiryDraft,
  OperationalInquiryPayload,
} from '../../types/inquiry'
import { buildOperationalInquirySummary } from './buildInquirySummary'

export function buildRoutingMeta(
  extras?: Partial<Pick<InquiryRoutingMeta, 'intent_priority' | 'inquiry_surface_origin'>>,
): InquiryRoutingMeta {
  return {
    channel: 'mailto_platform_v1',
    matching_context_version: 1,
    intent_priority: extras?.intent_priority ?? 'standard',
    ...(extras?.inquiry_surface_origin != null
      ? { inquiry_surface_origin: extras.inquiry_surface_origin }
      : {}),
  }
}

export function buildInquiryPayload(
  draft: OperationalInquiryDraft,
  targeting: InquiryProviderTargetingMeta,
  routingExtras?: Partial<Pick<InquiryRoutingMeta, 'intent_priority' | 'inquiry_surface_origin'>>,
): OperationalInquiryPayload {
  const providerName = targeting.primary_provider_name
  return {
    schema_version: 1,
    created_at_iso: new Date().toISOString(),
    summary_line: buildOperationalInquirySummary(draft, { providerName }),
    draft,
    routing: buildRoutingMeta(routingExtras),
    targeting,
  }
}

export function serializeInquiryPayloadJson(payload: OperationalInquiryPayload): string {
  return JSON.stringify(payload, null, 2)
}

/** Compact single-line JSON for mailto bodies (smaller than pretty-printed). */
export function serializeInquiryPayloadCompact(payload: OperationalInquiryPayload): string {
  return JSON.stringify(payload)
}
