import type { FilterCapability, PrimarySegment } from '../types/provider'
import { LIVE_CITIES } from './locations/canadaLocations'

/** All live cities derived from the national location model — auto-expands as provinces are added. */
export const PRIORITY_CITIES = LIVE_CITIES.map((c) => c.name) as unknown as readonly string[]

export type PriorityCity = string

export interface IntentCardDefinition {
  segment: PrimarySegment
  title: string
  microcopy: string
  badges: string[]
  /** Optional icon path under `public/` (e.g. `/1.svg`). */
  icon?: string
}

export const INTENT_CARDS: IntentCardDefinition[] = [
  {
    segment: 'construction',
    title: 'Construction & Jobsites',
    icon: '/1.svg',
    microcopy:
      'Reliable portable washrooms for crews, projects, and long-term worksites.',
    badges: ['Jobsite Ready', 'Long-Term Rental', 'Serviced Units'],
  },
  {
    segment: 'event',
    title: 'Weddings & Events',
    icon: '/2.svg',
    microcopy:
      'Clean, upscale restroom solutions for weddings, festivals, and private events.',
    badges: ['Luxury Trailers', 'Flush Toilets', 'Wedding Friendly'],
  },
  {
    segment: 'oilfield',
    title: 'Remote & Oilfield Operations',
    icon: '/4.svg',
    microcopy:
      'Rugged portable sanitation built for remote and industrial operations.',
    badges: ['Winterized', 'Remote Ready', 'Camp Support'],
  },
  {
    segment: 'site_services',
    title: 'Waste & Site Services',
    icon: '/3.svg',
    microcopy:
      'Integrated site servicing for construction projects, infrastructure work, waste handling, and temporary site support.',
    badges: ['Septic Services', 'Site Support', 'Roll-Off & Disposal'],
  },
  {
    segment: 'general',
    title: 'General Portable Washrooms',
    icon: '/5.svg',
    microcopy:
      'Simple short-term portable restroom rentals for everyday needs.',
    badges: ['ADA Accessible', 'Handwash Stations', 'Fast Rentals'],
  },
]

export interface SegmentFilterDefinition {
  id: string
  label: string
  capability: FilterCapability
}

export const SEGMENT_FILTERS: Record<PrimarySegment, SegmentFilterDefinition[]> =
  {
    construction: [
      { id: 'weekly_service', label: 'Weekly Service', capability: 'weekly_service' },
      { id: 'crane_liftable', label: 'Crane Liftable', capability: 'crane_liftable' },
      {
        id: 'handwash_available',
        label: 'Handwash Stations',
        capability: 'handwash_available',
      },
    ],
    event: [
      { id: 'luxury_units', label: 'Luxury Trailer', capability: 'luxury_units' },
      { id: 'flush_toilets', label: 'Flush Toilets', capability: 'flush_toilets' },
      {
        id: 'wedding_friendly',
        label: 'Wedding Friendly',
        capability: 'wedding_friendly',
      },
    ],
    oilfield: [
      { id: 'heated', label: 'Heated', capability: 'heated' },
      { id: 'winterized', label: 'Winterized', capability: 'winterized' },
      {
        id: 'remote_support',
        label: 'Remote Support',
        capability: 'remote_support',
      },
      { id: 'camp_support', label: 'Camp Support', capability: 'camp_support' },
    ],
    site_services: [
      { id: 'septic_service', label: 'Septic Services', capability: 'septic_service' },
      { id: 'site_support', label: 'Site Support', capability: 'site_support' },
      {
        id: 'roll_off_disposal',
        label: 'Roll-Off & Disposal',
        capability: 'roll_off_disposal',
      },
    ],
    general: [
      {
        id: 'ada_accessible',
        label: 'ADA Accessible',
        capability: 'ada_accessible',
      },
      {
        id: 'handwash_available',
        label: 'Handwash Stations',
        capability: 'handwash_available',
      },
      { id: 'septic_service', label: 'Septic Service', capability: 'septic_service' },
    ],
  }

export function segmentLabel(segment: PrimarySegment): string {
  const card = INTENT_CARDS.find((c) => c.segment === segment)
  return card?.title ?? segment
}
