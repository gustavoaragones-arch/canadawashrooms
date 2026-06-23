import { SITE_NAME, SITE_ORIGIN } from '../config/site'
import type { ResolvedLanding } from './landingRoutes'
import { listingPath } from './landingRoutes'
import { formatSynonymList } from '../lib/seo/canadianTerminology'
import { fillCity, SEGMENT_SEO } from './segmentSeo'

export interface LandingDocumentMeta {
  title: string
  description: string
  canonicalUrl: string
  canonicalPath: string
  ogTitle: string
  ogDescription: string
  ogUrl: string
}

export function buildLandingDocumentMeta(
  resolved: ResolvedLanding,
): LandingDocumentMeta {
  const seo = SEGMENT_SEO[resolved.segment]
  const { city } = resolved

  const title = `${fillCity(seo.titleTemplate, city)} | ${SITE_NAME}`
  const description = fillCity(seo.metaDescriptionTemplate, city)
  const canonicalPath = listingPath(resolved)
  const canonicalUrl = `${SITE_ORIGIN}${canonicalPath}`

  return {
    title,
    description,
    canonicalUrl,
    canonicalPath,
    ogTitle: `${fillCity(seo.h1Template, city)} | ${SITE_NAME}`,
    ogDescription: description,
    ogUrl: canonicalUrl,
  }
}

export function buildStaticDocumentMeta(opts: {
  title: string
  description: string
  /** Absolute path including leading slash; trailing slash normalized. */
  canonicalPath: string
}): LandingDocumentMeta {
  const path =
    opts.canonicalPath === '/'
      ? '/'
      : opts.canonicalPath.endsWith('/')
        ? opts.canonicalPath
        : `${opts.canonicalPath}/`
  const canonicalUrl = `${SITE_ORIGIN}${path === '/' ? '/' : path}`
  const fullTitle = `${opts.title} | ${SITE_NAME}`
  return {
    title: fullTitle,
    description: opts.description,
    canonicalUrl,
    canonicalPath: path,
    ogTitle: fullTitle,
    ogDescription: opts.description,
    ogUrl: canonicalUrl,
  }
}

export function defaultSiteMeta(): LandingDocumentMeta {
  const canonicalUrl = `${SITE_ORIGIN}/`
  const title = 'Portable Washroom Rentals Across Canada | CanadaWashrooms.ca'
  const description =
    `Find ${formatSynonymList()}, restroom trailer, construction site, and sanitation service providers across Alberta, Saskatchewan, Ontario, and British Columbia.`
  return {
    title,
    description,
    canonicalUrl,
    canonicalPath: '/',
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonicalUrl,
  }
}
