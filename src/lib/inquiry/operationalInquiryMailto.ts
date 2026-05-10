import { PLATFORM_QUOTE_EMAIL } from '../lead'
import type { OperationalInquiryPayload } from '../../types/inquiry'
import { serializeInquiryPayloadCompact } from './serializeInquiry'

export function operationalInquiryMailto(payload: OperationalInquiryPayload): string {
  const subjectParts = [
    'Operational inquiry',
    payload.targeting.segment_context,
    payload.targeting.city_context,
  ]
  if (payload.targeting.primary_provider_name) {
    subjectParts.push(`→ ${payload.targeting.primary_provider_name}`)
  }

  const subject = subjectParts.filter(Boolean).join(' · ')

  const bodyLines = [
    payload.summary_line,
    '',
    '--- Operator context ---',
    payload.targeting.primary_provider_name
      ? `Preferred operator: ${payload.targeting.primary_provider_name} (${payload.targeting.primary_provider_id ?? 'id n/a'})`
      : 'No single operator locked — platform routing.',
    `Segment: ${payload.targeting.segment_context}`,
    `Location focus: ${payload.targeting.city_context}`,
    '',
    '--- Structured payload (paste into CRM / routing later) ---',
    serializeInquiryPayloadCompact(payload),
    '',
    '--- Contact (if provided) ---',
    payload.draft.contactName ? `Name: ${payload.draft.contactName}` : 'Name: (not provided)',
    payload.draft.contactEmail ? `Email: ${payload.draft.contactEmail}` : 'Email: (not provided)',
    payload.draft.contactPhone ? `Phone: ${payload.draft.contactPhone}` : 'Phone: (not provided)',
    '',
    'Sent via canadawashrooms.ca operational inquiry flow (client-side; not stored on our servers).',
  ]

  const params = new URLSearchParams({
    subject,
    body: bodyLines.join('\n'),
  })

  return `mailto:${PLATFORM_QUOTE_EMAIL}?${params.toString()}`
}
