import { segmentLabel } from './segments'
import type { PrimarySegment, Provider } from '../types/provider'

export interface ProviderCapabilityChip {
  key: string
  label: string
  active: boolean
}

const CAPABILITY_DISPLAY: { key: string; label: string; test: (p: Provider) => boolean }[] = [
  { key: 'winterized', label: 'Winterized', test: (p) => p.winterized || p.winter_service },
  { key: 'luxury_trailers', label: 'Luxury trailers', test: (p) => p.luxury_trailers || p.luxury_units },
  { key: 'remote_support', label: 'Remote support', test: (p) => p.remote_support || p.remote_logistics },
  { key: 'crane_liftable', label: 'Crane liftable', test: (p) => Boolean(p.crane_liftable) },
  { key: 'camp_support', label: 'Camp support', test: (p) => Boolean(p.camp_support) },
  { key: 'ada_accessible', label: 'ADA', test: (p) => p.ada_accessible },
  { key: 'handwash_available', label: 'Handwash', test: (p) => p.handwash_available },
  { key: 'septic_service', label: 'Septic services', test: (p) => Boolean(p.septic_service) },
  { key: 'site_support', label: 'Site support', test: (p) => Boolean(p.site_support) },
  { key: 'roll_off_disposal', label: 'Roll-off & disposal', test: (p) => Boolean(p.roll_off_disposal) },
  { key: 'flush_toilets', label: 'Flush toilets', test: (p) => p.flush_toilets || p.flushing_units },
  { key: 'weekly_service', label: 'Weekly service', test: (p) => Boolean(p.weekly_service) },
]

export function providerCapabilityChips(provider: Provider): ProviderCapabilityChip[] {
  return CAPABILITY_DISPLAY.map(({ key, label, test }) => ({
    key,
    label,
    active: test(provider),
  }))
}

export function bestSuitedForLines(provider: Provider): string[] {
  const lines: string[] = []

  if (provider.supported_segments.includes('construction') || provider.construction_ready) {
    lines.push('Construction projects and long-term jobsite servicing')
  }
  if (provider.supported_segments.includes('event') || provider.luxury_units || provider.wedding_friendly) {
    lines.push('Weddings, festivals, and guest-facing events')
  }
  if (
    provider.supported_segments.includes('oilfield') ||
    provider.remote_logistics ||
    provider.oilfield_ready
  ) {
    lines.push('Remote logistics, camps, and industrial corridors')
  }
  if (
    provider.supported_segments.includes('site_services') ||
    provider.septic_service ||
    provider.site_support ||
    provider.roll_off_disposal
  ) {
    lines.push('Waste handling, septic, roll-off, and integrated site support')
  }
  if (provider.supported_segments.includes('general')) {
    lines.push('Short-term portable washroom rentals')
  }
  if (provider.winter_service || provider.winterized) {
    lines.push('Cold-weather and winterized operations')
  }

  return [...new Set(lines)].slice(0, 6)
}

export function segmentDisplayLabel(segment: PrimarySegment): string {
  return segmentLabel(segment)
}
