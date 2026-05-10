import { Helmet } from 'react-helmet-async'
import { SITE_NAME } from '../../config/site'
import type { LandingDocumentMeta } from '../../seo/metadata'

interface DocumentMetaProps {
  meta: LandingDocumentMeta
}

export function DocumentMeta({ meta }: DocumentMetaProps) {
  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={meta.canonicalUrl} />
      <meta property="og:title" content={meta.ogTitle} />
      <meta property="og:description" content={meta.ogDescription} />
      <meta property="og:url" content={meta.ogUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.ogTitle} />
      <meta name="twitter:description" content={meta.ogDescription} />
    </Helmet>
  )
}
