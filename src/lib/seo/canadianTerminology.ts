/**
 * Canadian portable sanitation lexicon — naming variations, not categories.
 * Single source for SEO copy, FAQ schema, and search query normalization.
 */

export const PRIMARY_TERM = 'portable washroom'

export const SYNONYMS = [
  'portable toilet',
  'porta potty',
  'porta-potty',
  'portable restroom',
] as const

export const RELATED_TERMS = [
  'construction toilet',
  'jobsite toilet',
  'event restroom',
  'temporary washroom',
  'portable sanitation',
] as const

export interface TerminologyFaqItem {
  question: string
  answer: string
}

export const TERMINOLOGY_FAQ: TerminologyFaqItem = {
  question:
    'What is the difference between a portable washroom, portable toilet, porta-potty, and portable restroom?',
  answer:
    'In Canada these terms are often used interchangeably. Portable toilet is the most neutral term, porta-potty is the most common casual name, portable washroom is frequently used by Canadian rental companies, and portable restroom is often used in event and hospitality settings.',
}

/** Canonical retrieval tokens added when any portable-sanitation synonym is detected. */
export const PORTABLE_SANITATION_CANONICAL_TOKENS = [
  'portable',
  'toilet',
  'washroom',
  'restroom',
  'sanitation',
  'rental',
  'portable_sanitation',
] as const

/** Phrase-level normalization applied to raw query strings before tokenization. */
export const PORTABLE_SANITATION_PHRASE_PATTERNS: ReadonlyArray<[RegExp, string]> = [
  [/porta[\s-]?pott(y|ies)/gi, ' portable toilet washroom restroom porta sanitation rental '],
  [/portable[\s-]?(toilet|washroom|restroom)s?/gi, ' portable toilet washroom restroom sanitation rental '],
  [/portapotty/gi, ' portable toilet washroom restroom porta sanitation rental '],
  [/jobsite[\s-]?toilet(s)?/gi, ' construction jobsite portable toilet washroom sanitation '],
  [/construction[\s-]?toilet(s)?/gi, ' construction portable toilet washroom sanitation '],
  [/temporary[\s-]?washroom(s)?/gi, ' temporary portable washroom toilet sanitation rental '],
  [/event[\s-]?restroom(s)?/gi, ' event portable restroom washroom toilet rental '],
]

export function applyPortableSanitationPhraseNormalization(raw: string): string {
  let out = raw
  for (const [re, replacement] of PORTABLE_SANITATION_PHRASE_PATTERNS) {
    out = out.replace(re, replacement)
  }
  return out
}

/** Expand token set when portable sanitation vocabulary is present. */
export function expandPortableSanitationTokens(tokens: Set<string>): void {
  const blob = ` ${[...tokens].join(' ')} `
  const hasPortableIntent =
    tokens.has('portable') ||
    tokens.has('toilet') ||
    tokens.has('washroom') ||
    tokens.has('restroom') ||
    tokens.has('porta') ||
    tokens.has('portapotty') ||
    tokens.has('sanitation') ||
    tokens.has('portable_sanitation') ||
    /\bporta[\s-]?pott/i.test(blob) ||
    /\bportable[\s-]?(toilet|washroom|restroom)/i.test(blob)

  if (!hasPortableIntent) return

  for (const t of PORTABLE_SANITATION_CANONICAL_TOKENS) {
    tokens.add(t)
  }
}

function joinWithConjunction(items: readonly string[], conjunction: 'and' | 'or'): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items[items.length - 1]}`
}

/** Comma-separated list for natural prose — e.g. "portable washroom, portable toilet, porta-potty, and portable restroom". */
export function formatSynonymList(options?: {
  includePrimary?: boolean
  conjunction?: 'and' | 'or'
}): string {
  const includePrimary = options?.includePrimary ?? true
  const conjunction = options?.conjunction ?? 'and'
  const terms = includePrimary ? [PRIMARY_TERM, ...SYNONYMS] : [...SYNONYMS]
  return joinWithConjunction(terms, conjunction)
}

export function compareProvidersCopy(): string {
  return `Compare ${formatSynonymList()} providers across Canada.`
}

export function providerLexiconNote(): string {
  return `This provider offers ${PRIMARY_TERM} services. Depending on the project type, these units may also be described as portable toilets, porta-potties, or portable restrooms.`
}

export function landingLexiconNote(segment: 'construction' | 'event' | 'oilfield' | 'general' | 'site_services'): string {
  switch (segment) {
    case 'construction':
      return 'Construction sites often require portable toilets, portable washrooms, handwashing stations, and temporary sanitation facilities.'
    case 'event':
      return 'Event planners may search for portable restrooms, portable washrooms, or porta-potties depending on the type of gathering.'
    case 'oilfield':
      return 'Remote projects frequently require portable toilets and winter-ready sanitation equipment.'
    case 'site_services':
      return 'Integrated site programs may combine portable toilets, septic service, and broader temporary sanitation support.'
    case 'general':
      return 'Everyday projects often start with a search for portable toilets, porta-potties, or portable washrooms — the equipment is the same category of rental.'
  }
}

export function cityLandingTitleSuffix(city: string): string {
  return `Portable washroom & portable toilet rentals in ${city}`
}

export function cityLandingDescription(city: string): string {
  return `Compare ${formatSynonymList({ conjunction: 'and' })} providers serving ${city} construction projects, events, and temporary worksites.`
}
