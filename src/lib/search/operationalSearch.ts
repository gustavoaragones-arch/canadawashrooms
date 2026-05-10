import type { PrimarySegment, Provider } from '../../types/provider'
import { capabilityMet, providersInScope } from '../matching'
import {
  interpretOperationalQuery,
  priorityCityFromSlug,
  type InterpretedOperationalQuery,
} from './interpretOperationalQuery'
import { tokenizePhrase } from './providerSearchModel'

export interface OperationalSearchHit {
  provider: Provider
  /** Internal ranking key — never displayed. */
  score: number
  explanations: string[]
}

const CAP_KEYS: Array<
  | 'weekly_service'
  | 'crane_liftable'
  | 'handwash_available'
  | 'luxury_units'
  | 'flush_toilets'
  | 'wedding_friendly'
  | 'heated'
  | 'winterized'
  | 'remote_support'
  | 'camp_support'
  | 'ada_accessible'
  | 'septic_service'
> = [
  'weekly_service',
  'crane_liftable',
  'handwash_available',
  'luxury_units',
  'flush_toilets',
  'wedding_friendly',
  'heated',
  'winterized',
  'remote_support',
  'camp_support',
  'ada_accessible',
  'septic_service',
]

function blobForProvider(p: Provider): Set<string> {
  try {
    const s = new Set<string>()
    const addText = (txt: string) => {
      for (const t of tokenizePhrase(txt)) s.add(t)
    }

    addText(p.company_name ?? '')
    for (const b of p.badges ?? []) addText(b)
    addText(p.service_area ?? '')
    for (const c of p.capabilities ?? []) s.add(c)
    for (const sp of p.inferred_specialties ?? []) addText(sp)
    for (const tag of p.operational_tags ?? []) addText(tag.replace(/:/g, ' '))
    for (const ts of p.trust_signals ?? []) addText(ts.replace(/_/g, ' '))
    for (const cat of p.google_categories ?? []) addText(cat)

    if (p.winter_service) {
      s.add('winter_service')
      s.add('winter')
    }
    if (p.remote_logistics) {
      s.add('remote_logistics')
      s.add('remote')
    }
    if (p.luxury_trailers) {
      s.add('luxury_trailers')
      s.add('luxury')
    }
    if (p.flushing_units) {
      s.add('flushing_units')
      s.add('flush')
    }

    for (const cap of CAP_KEYS) {
      if (capabilityMet(p, cap)) s.add(cap)
    }

    s.add(p.primary_segment)
    for (const seg of p.supported_segments ?? []) s.add(seg)

    return s
  } catch {
    return new Set()
  }
}

export type OperationalSearchContext = {
  segment?: PrimarySegment | null
  city?: string | null
}

function selectPool(
  providers: Provider[],
  interpreted: InterpretedOperationalQuery,
  context: OperationalSearchContext,
): Provider[] {
  let pool: Provider[]

  if (context.segment != null && context.city != null) {
    pool = providersInScope(providers, context.segment, context.city)
  } else if (context.city) {
    pool = providers.filter((p) => p.city === context.city)
  } else if (context.segment != null) {
    const seg = context.segment
    pool = providers.filter(
      (p) => p.primary_segment === seg || p.supported_segments.includes(seg),
    )
  } else {
    pool = [...providers]
  }

  const cityName = priorityCityFromSlug(interpreted.citySlug)
  if (cityName) {
    pool = pool.filter((p) => p.city === cityName)
  }

  return pool
}

function resolvedContextCity(
  context: OperationalSearchContext,
  interpreted: InterpretedOperationalQuery,
): string | null {
  return context.city ?? priorityCityFromSlug(interpreted.citySlug)
}

function scoreProvider(
  p: Provider,
  interpreted: InterpretedOperationalQuery,
  context: OperationalSearchContext,
): OperationalSearchHit {
  try {
  const explanations: string[] = []
  let score = 0
  const blob = blobForProvider(p)
  const tokenSet = new Set(interpreted.tokens.map((t) => t.toLowerCase()))

  const queryHasOperationalTerms =
    interpreted.tokens.length > 0 ||
    interpreted.impliedCapabilities.length > 0 ||
    interpreted.impliedInferenceKeys.length > 0

  for (const tok of tokenSet) {
    if (!tok) continue
    if (blob.has(tok)) {
      score += 44
      if ((p.capabilities ?? []).includes(tok)) {
        explanations.push(`Matched capability token “${tok.replace(/_/g, ' ')}”.`)
      } else if ((p.operational_tags ?? []).some((x) => x.toLowerCase().includes(tok))) {
        explanations.push('Operational tags reference language similar to your query.')
      } else if ((p.inferred_specialties ?? []).some((x) => x.toLowerCase().includes(tok))) {
        explanations.push('Inferred specialties overlap with your operational terms.')
      }
    } else {
      for (const cap of p.capabilities ?? []) {
        if (cap.includes(tok) || tok.includes(cap)) {
          score += 36
          explanations.push(`Loosely aligned with capability “${cap.replace(/_/g, ' ')}”.`)
          break
        }
      }
    }
  }

  for (const cap of interpreted.impliedCapabilities) {
    if (capabilityMet(p, cap)) {
      score += 74
      explanations.push(`Structured capability match: ${cap.replace(/_/g, ' ')}.`)
    }
  }

  for (const inf of interpreted.impliedInferenceKeys) {
    if (p[inf]) {
      score += 66
      if (inf === 'winter_service')
        explanations.push('Winter servicing signals surfaced from reviews or listing enrichment.')
      if (inf === 'remote_logistics')
        explanations.push('Remote logistics posture consistent with industrial / camp language.')
      if (inf === 'luxury_trailers')
        explanations.push('Upscale trailer positioning matches event-oriented wording.')
      if (inf === 'flushing_units')
        explanations.push('Flush restroom posture corroborated against query.')
    }
  }

  if (context.segment != null) {
    const seg = context.segment
    if (p.primary_segment === seg) {
      score += 92
      explanations.push('Primary segment aligns with the active guide context.')
    } else if ((p.supported_segments ?? []).includes(seg)) {
      score += 56
      explanations.push('Appears as a supported secondary segment — confirm workload fit.')
    }
  }

  const rc = resolvedContextCity(context, interpreted)
  if (rc && p.city === rc) {
    score += 54
    explanations.push(`Geography matches scoped city (${p.city}).`)
  }

  score += (p.primary_segment_confidence ?? 0) * 21
  score += Math.min(p.review_count ?? 0, 420) * 0.051
  score += (p.rating ?? 0) * 10

  if ((p.operational_tags ?? []).some((t) => t.includes('review_signal'))) {
    score += 24
    explanations.push('Review-derived operational markers strengthen retrieval confidence.')
  }

  if ((p.trust_signals ?? []).includes('review_volume_signal')) {
    score += 16
    explanations.push('Higher review volume improves operational language density.')
  }

  if (!queryHasOperationalTerms && interpreted.citySlug) {
    score += 26 + Math.min(p.review_count, 220) * 0.038
    explanations.push('City-only retrieval — ranked using corroborated signals, not keywords.')
  }

  const dedupedExpl = [...new Set(explanations)].slice(0, 5)

  return { provider: p, score, explanations: dedupedExpl }
  } catch {
    return { provider: p, score: 0, explanations: [] }
  }
}

/**
 * Local operational retrieval — deterministic ranking, explainable hits.
 */
export function runOperationalSearch(
  providers: Provider[],
  rawQuery: string,
  context: OperationalSearchContext,
): OperationalSearchHit[] {
  let interpreted: InterpretedOperationalQuery
  try {
    interpreted = interpretOperationalQuery(rawQuery)
  } catch {
    return []
  }
  if (!interpreted.raw.trim()) return []

  const pool = selectPool(providers, interpreted, context)
  if (pool.length === 0) return []

  const hits = pool.map((p) => scoreProvider(p, interpreted, context))
  const maxS = Math.max(...hits.map((h) => h.score), 0)
  const cutoff = maxS > 0 ? Math.max(22, maxS * 0.26) : 999

  const filtered =
    interpreted.tokens.length === 0 &&
    interpreted.impliedCapabilities.length === 0 &&
    interpreted.impliedInferenceKeys.length === 0 &&
    interpreted.citySlug
      ? hits
      : hits.filter((h) => h.score >= cutoff)

  return [...filtered].sort((a, b) => b.score - a.score)
}
