import {
  applyPortableSanitationPhraseNormalization,
  expandPortableSanitationTokens,
} from '../seo/canadianTerminology'
import { CANADA_PROVINCES, LIVE_CITIES } from '../locations/canadaLocations'
import type { FilterCapability, PrimarySegment } from '../../types/provider'

/** National city lookup — built from the location model, longest names first. */
const CITY_LOOKUP: { slug: string; names: string[] }[] = [
  // Aliases for common shortforms (must come before auto-generated entries)
  { slug: 'fort-mcmurray', names: ['fort mcmurray', 'fortmac', 'ymm'] },
  { slug: 'red-deer', names: ['red deer'] },
  { slug: 'calgary', names: ['calgary', 'yyc'] },
  { slug: 'edmonton', names: ['edmonton', 'yeg'] },
  { slug: 'toronto', names: ['toronto', 'yyz', 'the six'] },
  { slug: 'mississauga', names: ['mississauga'] },
  { slug: 'brampton', names: ['brampton'] },
  { slug: 'hamilton', names: ['hamilton', 'the hammer'] },
  { slug: 'ottawa', names: ['ottawa', 'yow'] },
  { slug: 'vancouver', names: ['vancouver', 'yvr'] },
  { slug: 'kelowna', names: ['kelowna'] },
  { slug: 'kamloops', names: ['kamloops'] },
  ...CANADA_PROVINCES.flatMap((p) =>
    p.cities.map((c) => ({ slug: c.slug, names: [c.name.toLowerCase()] })),
  ),
]

const SPLIT = /[^a-z0-9]+/i

/** Lightweight typo / shorthand fixes before tokenization. */
const TOKEN_CORRECTIONS: Record<string, string> = {
  winterised: 'winterized',
  winterise: 'winterize',
  weddng: 'wedding',
  weddding: 'wedding',
  portapotty: 'portapotty',
  oilfeild: 'oilfield',
  remorte: 'remote',
  acccessible: 'accessible',
}

/** Multi-token phrases → normalized expansion (added as synthetic tokens). */
const PHRASE_EXPANSIONS: [RegExp, string][] = [
  [/wash\s*room/gi, ' washroom '],
  [/rest\s*room/gi, ' restroom '],
  [/flush\s*toilet(s)?/gi, ' flush toilets flushing '],
  [/black\s*water/gi, ' septic tank '],
]

export interface InterpretedOperationalQuery {
  /** Tokens after normalization + synonym expansion (no city tokens). */
  tokens: string[]
  /** City slug if detected in query or forced by context. */
  citySlug: string | null
  /** Segment hints from operational vocabulary (soft retrieval bias). */
  segmentHints: PrimarySegment[]
  /** Declared FilterCapability keys implied by language. */
  impliedCapabilities: FilterCapability[]
  /** Synthetic retrieval facets (winter_service, remote_logistics, etc.). */
  impliedInferenceKeys: Array<'winter_service' | 'remote_logistics' | 'luxury_trailers' | 'flushing_units'>
  /** Original trimmed input for display. */
  raw: string
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(SPLIT)
    .map((t) => TOKEN_CORRECTIONS[t] ?? t)
    .filter((t) => t.length > 1)
}

/** Fold operational synonyms into canonical search tokens. */
function expandOperationalTokens(tokens: string[]): string[] {
  const out = new Set<string>(tokens)

  const blob = ` ${tokens.join(' ')} `

  const synonymAdds: [RegExp | string, string[]][] = [
    [/\bheated\b|\bwinterized\b|\bwinterisation\b|\bwinterization\b|\bcold\b|\bfreeze\b|\bfrost\b|\bsubzero\b/, ['winter', 'winter_service', 'heated', 'winterized']],
    [/\bwedding\b|\bweddings\b|\bluxury\b|\bguest\b|\bplanner\b|\bevent\b|\bgala\b/, ['wedding', 'luxury', 'event', 'luxury_trailers', 'flush']],
    [/\boilfield\b|\bindustrial\b|\bcamp\b|\blease\b|\bremote\b|\bpipeline\b|\brig\b/, ['remote', 'oilfield', 'camp', 'remote_logistics']],
    [/\bcrane\b|\blift\b|\bliftable\b/, ['crane', 'crane_liftable']],
    [/\bada\b|\baccessible\b|\baccessibility\b/, ['ada', 'ada_accessible']],
    [/\bseptic\b|\bpump\b|\bfluid\b/, ['septic', 'septic_service']],
    [/\bweekly\b|\bservice\b|\bservicing\b|\broute\b/, ['weekly', 'weekly_service']],
    [/\bhand\s*wash\b|\bhygiene\b/, ['handwash', 'handwash_available']],
  ]

  for (const [pattern, adds] of synonymAdds) {
    const ok = typeof pattern === 'string' ? blob.includes(pattern) : pattern.test(blob)
    if (ok) for (const a of adds) out.add(a)
  }

  return [...out]
}

function detectCitySlug(text: string): string | null {
  const lower = text.toLowerCase()
  for (const c of CITY_LOOKUP) {
    for (const n of c.names) {
      if (lower.includes(n)) return c.slug
    }
  }
  return null
}

function stripCityTokens(tokens: string[]): string[] {
  const cityWordSets = CITY_LOOKUP.flatMap((c) => c.names.map((n) => n.split(/\s+/)))
  const flat = new Set(cityWordSets.flat())
  flat.add('fort')
  flat.add('mcmurray')
  for (const c of LIVE_CITIES) flat.add(c.name.toLowerCase())
  flat.add('yyc')
  flat.add('yeg')
  flat.add('ymm')
  flat.add('fortmac')
  return tokens.filter((t) => !flat.has(t))
}

function inferSegmentsAndCapabilities(tokens: Set<string>): {
  segmentHints: PrimarySegment[]
  impliedCapabilities: FilterCapability[]
  impliedInferenceKeys: InterpretedOperationalQuery['impliedInferenceKeys']
} {
  const segmentHints = new Set<PrimarySegment>()
  const impliedCapabilities = new Set<FilterCapability>()
  const impliedInferenceKeys = new Set<InterpretedOperationalQuery['impliedInferenceKeys'][number]>()

  const has = (...needle: string[]) => needle.some((n) => tokens.has(n))

  if (has('heated', 'winterized', 'winter', 'freeze', 'cold', 'winter_service')) {
    impliedCapabilities.add('heated')
    impliedCapabilities.add('winterized')
    impliedInferenceKeys.add('winter_service')
    segmentHints.add('oilfield')
    segmentHints.add('construction')
  }

  if (has('wedding', 'luxury', 'event', 'guest', 'planner', 'gala', 'luxury_trailers')) {
    impliedCapabilities.add('luxury_units')
    impliedCapabilities.add('flush_toilets')
    impliedCapabilities.add('wedding_friendly')
    impliedInferenceKeys.add('luxury_trailers')
    impliedInferenceKeys.add('flushing_units')
    segmentHints.add('event')
  }

  if (has('remote', 'camp', 'oilfield', 'lease', 'pipeline', 'rig', 'remote_logistics')) {
    impliedCapabilities.add('remote_support')
    impliedCapabilities.add('camp_support')
    impliedInferenceKeys.add('remote_logistics')
    segmentHints.add('oilfield')
  }

  if (has('flush', 'flushing', 'flushing_units', 'trailer')) {
    impliedCapabilities.add('flush_toilets')
    impliedInferenceKeys.add('flushing_units')
    segmentHints.add('event')
  }

  if (has('crane', 'lift', 'liftable', 'crane_liftable')) {
    impliedCapabilities.add('crane_liftable')
    segmentHints.add('construction')
  }

  if (has('ada', 'accessible', 'ada_accessible')) {
    impliedCapabilities.add('ada_accessible')
    segmentHints.add('general')
  }

  if (has('septic', 'pump', 'septic_service')) {
    impliedCapabilities.add('septic_service')
    segmentHints.add('site_services')
    segmentHints.add('general')
  }

  if (has('roll', 'rolloff', 'roll_off', 'dumpster', 'disposal', 'roll_off_disposal')) {
    impliedCapabilities.add('roll_off_disposal')
    segmentHints.add('site_services')
  }

  if (has('waste', 'site_support', 'sanitation')) {
    impliedCapabilities.add('site_support')
    segmentHints.add('site_services')
  }

  if (has('weekly', 'weekly_service', 'servicing')) {
    impliedCapabilities.add('weekly_service')
    segmentHints.add('construction')
  }

  if (has('handwash', 'hygiene', 'handwash_available')) {
    impliedCapabilities.add('handwash_available')
  }

  if (
    has(
      'portable',
      'washroom',
      'toilet',
      'restroom',
      'porta',
      'portapotty',
      'sanitation',
      'portable_sanitation',
      'rental',
    )
  ) {
    segmentHints.add('general')
    segmentHints.add('construction')
  }

  return {
    segmentHints: [...segmentHints],
    impliedCapabilities: [...impliedCapabilities],
    impliedInferenceKeys: [...impliedInferenceKeys],
  }
}

/**
 * Deterministic operational query interpretation — not generative / not chat.
 */
export function interpretOperationalQuery(rawInput: string): InterpretedOperationalQuery {
  let raw = rawInput.trim()
  if (!raw) {
    return {
      tokens: [],
      citySlug: null,
      segmentHints: [],
      impliedCapabilities: [],
      impliedInferenceKeys: [],
      raw: '',
    }
  }

  raw = applyPortableSanitationPhraseNormalization(raw)

  for (const [re, replacement] of PHRASE_EXPANSIONS) {
    raw = raw.replace(re, replacement)
  }

  const cityFromQuery = detectCitySlug(raw)
  let tokens = tokenize(raw)
  tokens = stripCityTokens(tokens)
  tokens = relaxOperationalTypos(tokens)
  tokens = expandOperationalTokens(tokens)

  const tokenSet = new Set(tokens)
  expandPortableSanitationTokens(tokenSet)
  tokens = [...tokenSet]
  const { segmentHints, impliedCapabilities, impliedInferenceKeys } =
    inferSegmentsAndCapabilities(tokenSet)

  return {
    tokens,
    citySlug: cityFromQuery,
    segmentHints,
    impliedCapabilities,
    impliedInferenceKeys,
    raw: rawInput.trim(),
  }
}

/**
 * Fuzzy fix: if token is close to a dictionary word, replace (single edit).
 * Exported for tests; applied automatically inside `interpretOperationalQuery`.
 */
export function relaxOperationalTypos(tokens: string[]): string[] {
  const dictionary = [
    'winterized',
    'heated',
    'wedding',
    'remote',
    'oilfield',
    'crane',
    'liftable',
    'accessible',
    'flush',
    'luxury',
    'weekly',
    'camp',
    'septic',
    'handwash',
    'washroom',
    'restroom',
    'toilet',
    'portable',
    'porta',
    'sanitation',
  ]

  function lev(a: string, b: string): number {
    if (Math.abs(a.length - b.length) > 1) return 99
    const m = a.length
    const n = b.length
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
    for (let i = 0; i <= m; i++) dp[i][0] = i
    for (let j = 0; j <= n; j++) dp[0][j] = j
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
      }
    }
    return dp[m][n]
  }

  return tokens.map((t) => {
    if (t.length < 4) return t
    let best = t
    let bestDist = 99
    for (const d of dictionary) {
      const dist = lev(t, d)
      if (dist < bestDist && dist <= 1) {
        bestDist = dist
        best = d
      }
    }
    return best
  })
}

export function priorityCityFromSlug(slug: string | null): string | null {
  if (!slug) return null
  for (const p of CANADA_PROVINCES) {
    const city = p.cities.find((c) => c.slug === slug)
    if (city) return city.name
  }
  return null
}
