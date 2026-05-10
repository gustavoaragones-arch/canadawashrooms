import type { NormalizedReview } from '../../types/reviews'
import { classifyReviewSignal } from './reviewSignalQuality'
import {
  emptyInferenceSignals,
  mergeInferenceSignals,
  type InferenceSignals,
} from './inferenceSignals'

const STOP = new Set([
  'the',
  'and',
  'for',
  'was',
  'with',
  'that',
  'this',
  'from',
  'they',
  'have',
  'had',
  'our',
  'are',
  'not',
])

/** Map arbitrary ingest payloads into the normalized contract. */
export function normalizeReviewRecord(input: Partial<NormalizedReview>): NormalizedReview {
  return {
    source: input.source ?? 'unknown',
    text: (input.text ?? '').replace(/\s+/g, ' ').trim(),
    rating: input.rating,
    published_at: input.published_at,
    external_id: input.external_id,
  }
}

/** Tokenize for keyword pipelines (future embeddings plug in behind this interface). */
export function extractKeywordTokens(text: string): string[] {
  const raw = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ')
  return raw
    .split(/\s+/)
    .map((t) => t.replace(/^-+|-+$/g, ''))
    .filter((t) => t.length > 2 && !STOP.has(t))
}

export function reviewsTextBlob(reviews: NormalizedReview[]): string {
  return reviews
    .map((r) => r.text)
    .join(' ')
    .toLowerCase()
}

const WINTER_HINTS =
  /\b(heated|heating|insulated|insulation|winter|winterized|freeze|freezing|sub[- ]?zero|cold\s*weather|frost)\b/

const REMOTE_HINTS =
  /\b(oilfield|oil\s*sands|lease\s*road|remote\s*camp|work\s*camp|man\s*camp|industrial\s*camp|rig|pipeline|fly[\s-]?in)\b/

const LUXURY_HINTS =
  /\b(wedding|weddings|luxury|trailer|vip|black\s*tie|guest\s*comfort|upscale)\b/

const FLUSH_HINTS = /\b(flush|flushing|trailer\s*restroom|restroom\s*trailer)\b/

const SEPTIC_HINTS = /\b(septic|pump\s*out|pumping|holding\s*tank|fluid\s*haul)\b/

const CRANE_HINTS = /\b(crane|liftable|lift\s*frame|high\s*rise)\b/

function inferSignalsFromTextBlob(blob: string): Omit<InferenceSignals, 'operational_tags'> & {
  operational_tags: string[]
} {
  const operational_tags: string[] = []
  const winter_service = WINTER_HINTS.test(blob)
  const remote_logistics = REMOTE_HINTS.test(blob)
  const luxury_trailers = LUXURY_HINTS.test(blob)
  const flushing_units = FLUSH_HINTS.test(blob)
  const septic_service = SEPTIC_HINTS.test(blob)
  const crane_liftable = CRANE_HINTS.test(blob)

  if (winter_service) operational_tags.push('review_signal:winter_ops')
  if (remote_logistics) operational_tags.push('review_signal:remote_industrial')
  if (luxury_trailers) operational_tags.push('review_signal:event_upscale')
  if (flushing_units) operational_tags.push('review_signal:flush_systems')
  if (septic_service) operational_tags.push('review_signal:fluid_service')
  if (crane_liftable) operational_tags.push('review_signal:lift_access')

  return {
    winter_service,
    remote_logistics,
    luxury_trailers,
    flushing_units,
    septic_service,
    crane_liftable,
    operational_tags,
  }
}

/**
 * Weighted review inference — generic praise contributes little unless paired with operational cues.
 */
export function inferSignalsFromReviewCorpus(reviews: NormalizedReview[]): InferenceSignals {
  if (reviews.length === 0) return emptyInferenceSignals()

  let accWinter = 0
  let accRemote = 0
  let accLux = 0
  let accFlush = 0
  let accSeptic = 0
  let accCrane = 0
  const tags = new Set<string>()

  const SIGNAL_THRESHOLD = 0.44

  for (const r of reviews) {
    const w = classifyReviewSignal(r.text).inferenceWeight
    if (w < 0.08) continue

    const blob = r.text.toLowerCase()
    const single = inferSignalsFromTextBlob(blob)

    if (single.winter_service) accWinter += w
    if (single.remote_logistics) accRemote += w
    if (single.luxury_trailers) accLux += w
    if (single.flushing_units) accFlush += w
    if (single.septic_service) accSeptic += w
    if (single.crane_liftable) accCrane += w

    for (const t of single.operational_tags) tags.add(t)
  }

  const layer: InferenceSignals = {
    operational_tags: [...tags],
  }

  if (accWinter >= SIGNAL_THRESHOLD) layer.winter_service = true
  if (accRemote >= SIGNAL_THRESHOLD) layer.remote_logistics = true
  if (accLux >= SIGNAL_THRESHOLD) layer.luxury_trailers = true
  if (accFlush >= SIGNAL_THRESHOLD) layer.flushing_units = true
  if (accSeptic >= SIGNAL_THRESHOLD) layer.septic_service = true
  if (accCrane >= SIGNAL_THRESHOLD) layer.crane_liftable = true

  return mergeInferenceSignals([layer])
}
