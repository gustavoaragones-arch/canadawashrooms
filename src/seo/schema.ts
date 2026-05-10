import { SITE_NAME, SITE_ORIGIN } from '../config/site'
import type { Provider } from '../types/provider'
import type { ResolvedLanding } from './landingRoutes'
import type { FaqItem } from './faqs'
import type { LandingDocumentMeta } from './metadata'
import { fillCity, SEGMENT_SEO } from './segmentSeo'

function localBusinessFromProvider(p: Provider): Record<string, unknown> | null {
  const name = p.company_name?.trim()
  const city = p.city?.trim()
  if (!name || !city) return null

  const lb: Record<string, unknown> = {
    '@type': 'LocalBusiness',
    name,
    telephone: typeof p.phone === 'string' ? p.phone : '',
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: 'AB',
      addressCountry: 'CA',
    },
    areaServed: p.service_area ?? '',
  }

  if (p.website) {
    lb.url = p.website
  }

  const rating = typeof p.rating === 'number' && Number.isFinite(p.rating) ? p.rating : 0
  const reviewCount = typeof p.review_count === 'number' && Number.isFinite(p.review_count) ? p.review_count : 0
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

export function buildLandingJsonLd(params: {
  resolved: ResolvedLanding
  providers: Provider[]
  faqs: FaqItem[]
  meta: LandingDocumentMeta
}): Record<string, unknown> {
  const { resolved, providers, faqs, meta } = params
  const seo = SEGMENT_SEO[resolved.segment]
  const pageName = fillCity(seo.h1Template, resolved.city)

  const itemListElements = providers
    .map((p) => localBusinessFromProvider(p))
    .filter((item): item is Record<string, unknown> => item != null)
    .map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item,
    }))

  const breadcrumb: Record<string, unknown> = {
    '@type': 'BreadcrumbList',
    '@id': `${meta.canonicalUrl}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_ORIGIN}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: pageName,
        item: meta.canonicalUrl,
      },
    ],
  }

  const faqPage: Record<string, unknown> = {
    '@type': 'FAQPage',
    '@id': `${meta.canonicalUrl}#faq`,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }

  const itemList: Record<string, unknown> = {
    '@type': 'ItemList',
    '@id': `${meta.canonicalUrl}#operators`,
    name: `${pageName} — matched operators`,
    description:
      'Portable sanitation operators compatible with this project context (Alberta MVP dataset).',
    numberOfItems: providers.length,
    itemListElement: itemListElements,
  }

  const webpage: Record<string, unknown> = {
    '@type': 'WebPage',
    '@id': `${meta.canonicalUrl}#webpage`,
    url: meta.canonicalUrl,
    name: meta.title,
    description: meta.description,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_ORIGIN,
    },
    breadcrumb: { '@id': `${meta.canonicalUrl}#breadcrumb` },
    mainEntity: { '@id': `${meta.canonicalUrl}#operators` },
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [webpage, breadcrumb, itemList, faqPage],
  }
}

/** JSON-LD for homepage — minimal WebSite + WebPage (no ItemList). */
export function buildHomeJsonLd(meta: LandingDocumentMeta): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_ORIGIN}/#website`,
        name: SITE_NAME,
        url: SITE_ORIGIN,
      },
      {
        '@type': 'WebPage',
        '@id': `${meta.canonicalUrl}#webpage`,
        url: meta.canonicalUrl,
        name: meta.title,
        description: meta.description,
        isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
      },
    ],
  }
}
