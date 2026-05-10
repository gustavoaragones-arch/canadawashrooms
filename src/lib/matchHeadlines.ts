import type { PrimarySegment } from '../types/provider'

/** Segment + city headline for the matching dashboard (not SEO landing pages). */
export function matchHeadline(segment: PrimarySegment, city: string): string {
  switch (segment) {
    case 'construction':
      return `Construction-ready providers in ${city}`
    case 'oilfield':
      return `Remote-capable sanitation providers for ${city} operations`
    case 'event':
      return `Wedding and event restroom providers in ${city}`
    case 'general':
      return `Portable washroom operators serving ${city}`
  }
}
