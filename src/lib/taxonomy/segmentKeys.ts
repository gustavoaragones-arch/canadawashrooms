/**
 * Canonical internal segment keys and their UI label mappings.
 * Internal keys are stable identifiers — UI labels may change without breaking data or routing.
 *
 * PrimarySegment in types/provider.ts is the authoritative runtime type; this module
 * provides helpers that bridge the two where needed (ingest hints, display copy).
 */
import type { PrimarySegment } from '../../types/provider'

/** Stable canonical key → human-readable UI label. */
export const SEGMENT_KEY_LABELS: Record<PrimarySegment, string> = {
  construction: 'Construction & Jobsites',
  event: 'Weddings & Events',
  oilfield: 'Remote & Oilfield Operations',
  general: 'General Portable Washrooms',
  site_services: 'Waste & Site Services',
}

/** Human-readable label → internal key (for ingest CSV headers, manual override files). */
export const LABEL_TO_SEGMENT_KEY: Record<string, PrimarySegment> = {
  'construction & jobsites': 'construction',
  'construction': 'construction',
  'jobsite': 'construction',
  'events & weddings': 'event',
  'weddings & events': 'event',
  'event': 'event',
  'events': 'event',
  'wedding': 'event',
  'remote & oilfield operations': 'oilfield',
  'oilfield & remote operations': 'oilfield',
  'remote oilfield': 'oilfield',
  'oilfield': 'oilfield',
  'remote': 'oilfield',
  'general portable washrooms': 'general',
  'general': 'general',
  'waste & site services': 'site_services',
  'waste and site services': 'site_services',
  'site services': 'site_services',
  'waste': 'site_services',
}

export function segmentKeyLabel(key: PrimarySegment): string {
  return SEGMENT_KEY_LABELS[key] ?? key
}

export function labelToSegmentKey(label: string): PrimarySegment | null {
  return LABEL_TO_SEGMENT_KEY[label.toLowerCase().trim()] ?? null
}

/** All stable internal keys in display order. */
export const ALL_SEGMENT_KEYS: PrimarySegment[] = [
  'construction',
  'event',
  'oilfield',
  'site_services',
  'general',
]
