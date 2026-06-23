import { segmentLabel } from './segments'
import type { PrimarySegment, Provider } from '../types/provider'

export interface ProviderCapabilityChip {
  key: string
  label: string
  active: boolean
}

const CAPABILITY_DISPLAY: { key: string; label: string; test: (p: Provider) => boolean }[] = [
  { key: 'heated',             label: 'Heated Restrooms',       test: (p) => Boolean(p.heated) || p.winterized || p.winter_service },
  { key: 'handwash_available', label: 'Handwashing Stations',   test: (p) => p.handwash_available },
  { key: 'ada_accessible',     label: 'Wheelchair Accessible',  test: (p) => p.ada_accessible },
  { key: 'luxury_trailers',    label: 'Luxury Trailer Units',   test: (p) => p.luxury_trailers || p.luxury_units },
  { key: 'flush_toilets',      label: 'Flush Toilets',          test: (p) => Boolean(p.flush_toilets) || p.flushing_units },
  { key: 'crane_liftable',     label: 'Crane Liftable',         test: (p) => Boolean(p.crane_liftable) },
  { key: 'weekly_service',     label: 'Weekly Servicing',       test: (p) => Boolean(p.weekly_service) },
  { key: 'remote_support',     label: 'Remote Site Support',    test: (p) => Boolean(p.remote_support) || p.remote_logistics },
  { key: 'camp_support',       label: 'Camp Support',           test: (p) => Boolean(p.camp_support) },
  { key: 'septic_service',     label: 'Septic Services',        test: (p) => Boolean(p.septic_service) },
  { key: 'roll_off_disposal',  label: 'Roll-Off & Disposal',    test: (p) => Boolean(p.roll_off_disposal) },
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
  if (provider.septic_service || provider.site_support || provider.roll_off_disposal) {
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
