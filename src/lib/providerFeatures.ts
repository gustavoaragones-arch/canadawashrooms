import type { Provider } from '../types/provider'

/** Customer-facing feature labels — plain English only. */
const FEATURE_DEFINITIONS: { label: string; test: (p: Provider) => boolean }[] = [
  { label: 'Heated Restrooms', test: (p) => Boolean(p.heated || p.winterized) },
  { label: 'Handwashing Stations', test: (p) => p.handwash_available },
  { label: 'Wheelchair Accessible Units', test: (p) => p.ada_accessible },
  { label: 'Winter Service Available', test: (p) => Boolean(p.winter_service) },
  { label: 'Restroom Trailers', test: (p) => Boolean(p.luxury_trailers || p.luxury_units) },
  { label: 'Flush Toilets', test: (p) => Boolean(p.flush_toilets || p.flushing_units) },
  { label: 'Remote Site Support', test: (p) =>
    Boolean(p.remote_logistics || p.remote_support || p.camp_support || p.oilfield_ready) },
  { label: 'Weekly Servicing', test: (p) => Boolean(p.weekly_service) },
  { label: 'Crane Liftable', test: (p) => Boolean(p.crane_liftable) },
  { label: 'Septic Services', test: (p) => Boolean(p.septic_service) },
  { label: 'Roll-Off & Disposal', test: (p) => Boolean(p.roll_off_disposal) },
]

export function activeProviderFeatures(provider: Provider): string[] {
  return FEATURE_DEFINITIONS.filter((f) => f.test(provider)).map((f) => f.label)
}
