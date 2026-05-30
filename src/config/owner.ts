/**
 * Ownership and legal entity constants for CanadaWashrooms.ca.
 * Single source of truth — update here to propagate across legal pages,
 * schema markup, footer, and metadata.
 */

export const OWNER = {
  /** Trade name / public-facing business name. */
  name: 'Albor Digital',

  /** Legal structure. */
  legalStructure: 'Sole Proprietorship',

  /** Operating jurisdiction. */
  province: 'Alberta',
  country: 'Canada',

  /** Short combined label for footer / copyright. */
  shortLabel: 'Albor Digital (Canada)',

  /** Full one-sentence ownership statement for About / legal pages. */
  ownershipStatement:
    'CanadaWashrooms.ca is independently owned and operated by Albor Digital, an Alberta-based sole proprietorship.',

  /** Business description for Organization schema and About page. */
  businessDescription:
    'Albor Digital is an Alberta-based independent digital studio specializing in website development, SEO, digital product development, graphic design, business software solutions, online directories, information resources, calculators, B2B applications, and micro-SaaS products.',

  /** Platform disclaimer for About and legal pages. */
  platformDisclaimer:
    'CanadaWashrooms.ca is an informational provider discovery platform and does not directly rent portable washrooms or restroom trailers.',

  /** Contact jurisdiction for legal / privacy pages. */
  jurisdictionStatement:
    'This platform operates under the laws of Alberta, Canada.',
} as const
