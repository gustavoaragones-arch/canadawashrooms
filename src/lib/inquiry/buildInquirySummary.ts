import type { OperationalInquiryDraft } from '../../types/inquiry'
import type { PrimarySegment } from '../../types/provider'

function segmentOpener(segment: PrimarySegment, loc: string): string {
  switch (segment) {
    case 'construction':
      return `Construction-site sanitation in ${loc}`
    case 'event':
      return `Event and guest restroom coverage in ${loc}`
    case 'oilfield':
      return `Remote or industrial-site sanitation in ${loc}`
    case 'general':
      return `Portable washroom coverage in ${loc}`
    default:
      return `Operational sanitation inquiry in ${loc}`
  }
}

function winterPhrase(w?: string): string | null {
  if (!w || w === 'none') return null
  if (w === 'shoulder') return 'with shoulder-season cold exposure'
  if (w === 'full') return 'requiring winter-ready equipment and servicing posture'
  return `with winter notes: ${w}`
}

function headcountPhrase(segment: PrimarySegment, band?: string): string | null {
  if (!band) return null
  if (segment === 'event') return `for approximately ${band} guests`
  return `for roughly ${band} people on site`
}

/**
 * Single readable operational request line — mailto preview + future CRM subject helper.
 */
export function buildOperationalInquirySummary(
  draft: OperationalInquiryDraft,
  opts?: { providerName?: string },
): string {
  const loc = draft.cityOrLocation.trim() || 'Alberta (location TBD)'

  const parts: string[] = []

  parts.push(segmentOpener(draft.segment, loc))

  const hc = headcountPhrase(draft.segment, draft.headcountBand)
  if (hc) parts.push(hc)

  if (draft.projectDuration) {
    parts.push(`over approximately ${draft.projectDuration}`)
  }

  const w = winterPhrase(draft.winterRequirements)
  if (w) parts.push(w)

  if (draft.segment === 'oilfield' && draft.campSupportNeeded === true) {
    parts.push('with camp support expectations')
  }

  if (draft.segment === 'oilfield' && draft.remoteAccessNotes?.trim()) {
    parts.push(`access: ${draft.remoteAccessNotes.trim()}`)
  }

  if (draft.segment === 'event' && draft.trailerExpectations) {
    parts.push(`trailer / comfort expectation: ${draft.trailerExpectations}`)
  }

  if (draft.segment === 'event' && draft.eventContext?.trim()) {
    parts.push(`${draft.eventContext.trim()} context`)
  }

  if (draft.segment === 'construction' && draft.servicingFrequency) {
    parts.push(`servicing cadence: ${draft.servicingFrequency}`)
  }

  if (draft.segment === 'general' && draft.rentalPattern?.trim()) {
    parts.push(`engagement: ${draft.rentalPattern.trim()}`)
  }

  if (draft.segment === 'general' && draft.adaNeeded === true) {
    parts.push('ADA-accessible units needed')
  }

  if (draft.segment === 'general' && draft.handwashStationsNeeded === true) {
    parts.push('handwash stations expected')
  }

  if (draft.specialConditions?.trim()) {
    parts.push(`notes: ${draft.specialConditions.trim()}`)
  }

  if (opts?.providerName) {
    parts.push(`target operator: ${opts.providerName}`)
  }

  let s = parts.join(' — ')
  s = s.charAt(0).toUpperCase() + s.slice(1)
  if (!s.endsWith('.')) s += '.'
  return s
}
