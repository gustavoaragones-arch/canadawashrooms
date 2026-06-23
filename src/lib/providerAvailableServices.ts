import type { Provider } from '../types/provider'

/** Operational services a provider may offer — independent of primary project category. */
const AVAILABLE_SERVICE_DEFINITIONS: { label: string; test: (p: Provider) => boolean }[] = [
  { label: 'Septic Pumping', test: (p) => Boolean(p.septic_service) },
  {
    label: 'Waste Removal',
    test: (p) =>
      Boolean(p.roll_off_disposal) ||
      /waste removal|waste hauling|garbage collection|disposal service/i.test(
        listingBlob(p),
      ),
  },
  {
    label: 'Site Servicing',
    test: (p) =>
      Boolean(p.site_support) &&
      !p.septic_service &&
      !p.roll_off_disposal &&
      !/hydrovac/i.test(listingBlob(p)),
  },
  {
    label: 'Hydrovac Services',
    test: (p) => /hydrovac/i.test(listingBlob(p)),
  },
  { label: 'Roll-Off Disposal', test: (p) => Boolean(p.roll_off_disposal) },
  { label: 'Handwashing Stations', test: (p) => p.handwash_available },
  { label: 'Heated Units', test: (p) => Boolean(p.heated || p.winterized) },
  { label: 'Wheelchair Accessible Units', test: (p) => p.ada_accessible },
  {
    label: 'Restroom Trailers',
    test: (p) => Boolean(p.luxury_trailers || p.luxury_units),
  },
  {
    label: 'Remote Logistics',
    test: (p) =>
      Boolean(
        p.remote_logistics || p.remote_support || p.camp_support || p.oilfield_ready,
      ),
  },
  { label: 'Flush Toilets', test: (p) => Boolean(p.flush_toilets || p.flushing_units) },
  { label: 'Weekly Servicing', test: (p) => Boolean(p.weekly_service) },
  { label: 'Crane Liftable', test: (p) => Boolean(p.crane_liftable) },
]

function listingBlob(provider: Provider): string {
  return [
    provider.company_name,
    ...(provider.badges ?? []),
    ...(provider.google_categories ?? []),
  ]
    .join(' ')
    .toLowerCase()
}

export function activeProviderAvailableServices(provider: Provider): string[] {
  return AVAILABLE_SERVICE_DEFINITIONS.filter((s) => s.test(provider)).map((s) => s.label)
}

/** @deprecated Use activeProviderAvailableServices */
export const activeProviderFeatures = activeProviderAvailableServices
