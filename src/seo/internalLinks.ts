import type { ResolvedLanding } from './landingRoutes'
import { LANDING_ROUTE_GROUPS, listingPath } from './landingRoutes'
import { SEGMENT_SEO } from './segmentSeo'

const S = SEGMENT_SEO

export interface InternalEditorialLink {
  to: string
  label: string
}

/** Curated, low-volume internal links — sister cities first, then contextual cross-links. */
export function editorialInternalLinks(current: ResolvedLanding): InternalEditorialLink[] {
  const links: InternalEditorialLink[] = []

  const group = LANDING_ROUTE_GROUPS.find((g) => g.segment === current.segment)
  if (group) {
    for (const c of group.cities) {
      if (c.city === current.city) continue
      const r: ResolvedLanding = {
        segment: current.segment,
        segmentSlug: group.segmentSlug,
        city: c.city,
        citySlug: c.citySlug,
      }
      links.push({
        to: listingPath(r),
        label: `${SEGMENT_SEO[current.segment].breadcrumbLabel} — ${c.city}`,
      })
    }
  }

  if (current.segment === 'event' && current.city === 'Canmore') {
    links.push({
      to: listingPath({
        segment: 'construction',
        segmentSlug: S.construction.slug,
        city: 'Calgary',
        citySlug: 'calgary',
      }),
      label: 'Corridor construction hygiene — Calgary jobsites',
    })
  }

  if (current.segment === 'construction' && current.city === 'Calgary') {
    links.push({
      to: listingPath({
        segment: 'event',
        segmentSlug: S.event.slug,
        city: 'Calgary',
        citySlug: 'calgary',
      }),
      label: 'Guest-grade restrooms — Calgary event trailers',
    })
  }

  if (current.segment === 'construction' && current.city === 'Edmonton') {
    links.push({
      to: listingPath({
        segment: 'oilfield',
        segmentSlug: S.oilfield.slug,
        city: 'Fort McMurray',
        citySlug: 'fort-mcmurray',
      }),
      label: 'Remote industrial sanitation — Fort McMurray operations',
    })
  }

  if (current.segment === 'oilfield') {
    links.push({
      to: listingPath({
        segment: 'construction',
        segmentSlug: S.construction.slug,
        city: 'Edmonton',
        citySlug: 'edmonton',
      }),
      label: 'Urban industrial builds — construction washrooms in Edmonton',
    })
  }

  if (current.segment === 'general') {
    links.push({
      to: listingPath({
        segment: 'construction',
        segmentSlug: S.construction.slug,
        city: 'Calgary',
        citySlug: 'calgary',
      }),
      label: 'Long-term jobsite programs — Calgary construction washrooms',
    })
  }

  const seen = new Set<string>()
  const deduped: InternalEditorialLink[] = []
  for (const l of links) {
    if (seen.has(l.to)) continue
    seen.add(l.to)
    deduped.push(l)
  }

  return deduped.slice(0, 10)
}
