import type { InferenceOverrideShape } from '../../types/provider'
import type { InferenceSignals } from './inferenceSignals'
import { emptyInferenceSignals, mergeInferenceSignals } from './inferenceSignals'

const CATEGORY_RULES: { pattern: RegExp; signal: Partial<InferenceSignals> }[] = [
  {
    pattern: /portable\s*toilet|restroom\s*rental|sanitation/i,
    signal: { operational_tags: ['category:portable_sanitation'] },
  },
  {
    pattern: /septic|waste\s*management|fluid\s*haul/i,
    signal: { septic_service: true, operational_tags: ['category:fluid_services'] },
  },
  {
    pattern: /party\s*rental|event\s*rental|wedding/i,
    signal: { luxury_trailers: true, operational_tags: ['category:event_services'] },
  },
]

export function inferFromGoogleCategories(categories: string[]): InferenceSignals {
  const blob = categories.join(' ').toLowerCase()
  const layers: InferenceSignals[] = []
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(blob)) {
      layers.push({
        ...rule.signal,
        operational_tags: [...(rule.signal.operational_tags ?? [])],
      })
    }
  }
  if (!layers.length) return emptyInferenceSignals()
  return mergeInferenceSignals(layers)
}

export function inferFromBadges(badges: string[]): InferenceSignals {
  const blob = badges.join(' ').toLowerCase()
  const tags: string[] = ['source:badge_alignment']

  const winter_service = /\b(winter|winterized|heated|freeze|cold)\b/.test(blob)
  const remote_logistics = /\b(remote|oilfield|camp|rig|lease|industrial)\b/.test(blob)
  const luxury_trailers = /\b(luxury|wedding|trailer|vip|upscale)\b/.test(blob)
  const flushing_units = /\b(flush|flushing)\b/.test(blob)
  const septic_service = /\b(septic|pump|pumping)\b/.test(blob)
  const crane_liftable = /\b(crane|lift)\b/.test(blob)

  if (winter_service) tags.push('badge_signal:winter_posture')
  if (remote_logistics) tags.push('badge_signal:remote_posture')
  if (luxury_trailers) tags.push('badge_signal:event_posture')

  return mergeInferenceSignals([
    {
      winter_service,
      remote_logistics,
      luxury_trailers,
      flushing_units,
      septic_service,
      crane_liftable,
      operational_tags: tags,
    },
  ])
}

/** Apply explicit analyst overrides onto merged signals. */
export function applyManualInferenceOverrides(
  base: InferenceSignals,
  overrides?: Partial<InferenceOverrideShape>,
): InferenceSignals {
  if (!overrides) return base
  return mergeInferenceSignals([base], {
    winter_service: overrides.winter_service,
    remote_logistics: overrides.remote_logistics,
    luxury_trailers: overrides.luxury_trailers,
    flushing_units: overrides.flushing_units,
    septic_service: overrides.septic_service,
    crane_liftable: overrides.crane_liftable,
    operational_tags: [],
  })
}
