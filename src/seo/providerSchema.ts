import { SITE_ORIGIN } from '../config/site'
import type { Provider } from '../types/provider'
import type { LandingDocumentMeta } from './metadata'

export function buildProviderLocalBusinessJsonLd(
  provider: Provider,
  meta: LandingDocumentMeta,
): Record<string, unknown> {
  const lb: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${meta.canonicalUrl}#business`,
    name: provider.company_name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: provider.city,
      addressRegion: provider.province_code ?? 'AB',
      addressCountry: 'CA',
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'Canada Washrooms',
      url: SITE_ORIGIN,
    },
  }

  if (provider.phone?.trim()) {
    lb.telephone = provider.phone.trim()
  }

  if (provider.website?.trim()) {
    lb.url = provider.website.trim()
  }

  if (provider.service_area?.trim()) {
    lb.areaServed = provider.service_area.trim()
  }

  const rating =
    typeof provider.rating === 'number' && Number.isFinite(provider.rating) ? provider.rating : 0
  const reviewCount =
    typeof provider.review_count === 'number' && Number.isFinite(provider.review_count)
      ? provider.review_count
      : 0

  if (rating > 0 && reviewCount > 0) {
    lb.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(rating),
      reviewCount: String(Math.round(reviewCount)),
      bestRating: '5',
      worstRating: '1',
    }
  }

  return lb
}
