import { SITE_NAME, SITE_ORIGIN } from '../config/site'
import { segmentLabel } from '../lib/segments'
import { formatSynonymList } from '../lib/seo/canadianTerminology'
import type { Provider } from '../types/provider'
import type { LandingDocumentMeta } from './metadata'

export function buildProviderDocumentMeta(provider: Provider): LandingDocumentMeta {
  const segmentTitle = segmentLabel(provider.primary_segment)
  const title = `${provider.company_name} | ${segmentTitle} in ${provider.city}`
  const description = [
    `${provider.company_name} — ${segmentTitle.toLowerCase()} and portable washroom services in ${provider.city}.`,
    `Units may also be described as ${formatSynonymList({ includePrimary: false, conjunction: 'or' })}.`,
    provider.service_area ? `Service area: ${provider.service_area}.` : null,
    provider.review_count > 0
      ? `Google rating ${provider.rating.toFixed(1)} (${provider.review_count} reviews).`
      : null,
    'Compare capabilities and contact details — confirm availability with the operator.',
  ]
    .filter(Boolean)
    .join(' ')

  const canonicalPath = `/provider/${provider.id}/`
  const canonicalUrl = `${SITE_ORIGIN}${canonicalPath}`

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    canonicalUrl,
    canonicalPath,
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonicalUrl,
  }
}
