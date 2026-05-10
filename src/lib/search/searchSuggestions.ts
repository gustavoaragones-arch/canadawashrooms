import type { PrimarySegment } from '../../types/provider'

/** Chip labels map to operational query strings (deterministic retrieval bias). */
export const DEFAULT_OPERATIONAL_SUGGESTIONS = [
  'Heated units',
  'Winter servicing',
  'Wedding trailers',
  'Remote camp support',
  'Flush toilets',
  'Crane liftable',
  'ADA accessible',
  'Weekly jobsite service',
] as const

export function contextualOperationalSuggestions(segment: PrimarySegment): string[] {
  switch (segment) {
    case 'construction':
      return ['Weekly service', 'Crane liftable', 'Handwash stations', 'Cold weather servicing']
    case 'event':
      return ['Luxury trailers', 'Flush toilets', 'Wedding friendly', 'Guest throughput']
    case 'oilfield':
      return ['Heated units', 'Camp support', 'Remote logistics', 'Winter operations']
    case 'general':
      return ['ADA accessible', 'Septic pumping', 'Short-term rental', 'Handwash add-ons']
    default:
      return [...DEFAULT_OPERATIONAL_SUGGESTIONS]
  }
}

/** Convert chip label → query string for the search box. */
export function suggestionToQuery(label: string): string {
  const map: Record<string, string> = {
    'Heated units': 'heated winterized',
    'Winter servicing': 'winter servicing heated',
    'Wedding trailers': 'wedding luxury trailer flush',
    'Remote camp support': 'remote camp oilfield',
    'Flush toilets': 'flush toilets trailer',
    'Crane liftable': 'crane liftable construction',
    'ADA accessible': 'ADA accessible',
    'Weekly jobsite service': 'weekly service jobsite',
    'Weekly service': 'weekly serviced jobsite',
    'Handwash stations': 'handwash hygiene',
    'Cold weather servicing': 'winter cold heated servicing',
    'Luxury trailers': 'luxury restroom trailer',
    'Guest throughput': 'guest event trailer',
    'Wedding friendly': 'wedding event luxury',
    'Camp support': 'camp remote support',
    'Remote logistics': 'remote lease road logistics',
    'Winter operations': 'winterized heated industrial',
    'Septic pumping': 'septic pump fluid',
    'Short-term rental': 'portable rental residential',
    'Handwash add-ons': 'handwash station',
  }
  return map[label] ?? label.toLowerCase()
}
