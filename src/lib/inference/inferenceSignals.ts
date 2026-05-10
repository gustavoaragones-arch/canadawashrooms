export interface InferenceSignals {
  winter_service?: boolean
  remote_logistics?: boolean
  luxury_trailers?: boolean
  flushing_units?: boolean
  septic_service?: boolean
  crane_liftable?: boolean
  /** Free-form operational tags from inference (slug-like phrases). */
  operational_tags: string[]
}

export function emptyInferenceSignals(): InferenceSignals {
  return { operational_tags: [] }
}

export function mergeInferenceSignals(
  layers: InferenceSignals[],
  overrides?: Partial<InferenceSignals> | null,
): InferenceSignals {
  const tags = new Set<string>()
  let winter_service = false
  let remote_logistics = false
  let luxury_trailers = false
  let flushing_units = false
  let septic_service = false
  let crane_liftable = false

  for (const layer of layers) {
    if (layer.winter_service) winter_service = true
    if (layer.remote_logistics) remote_logistics = true
    if (layer.luxury_trailers) luxury_trailers = true
    if (layer.flushing_units) flushing_units = true
    if (layer.septic_service) septic_service = true
    if (layer.crane_liftable) crane_liftable = true
    for (const t of layer.operational_tags) tags.add(t)
  }

  if (overrides) {
    if (overrides.winter_service !== undefined) winter_service = overrides.winter_service
    if (overrides.remote_logistics !== undefined)
      remote_logistics = overrides.remote_logistics
    if (overrides.luxury_trailers !== undefined)
      luxury_trailers = overrides.luxury_trailers
    if (overrides.flushing_units !== undefined) flushing_units = overrides.flushing_units
    if (overrides.septic_service !== undefined) septic_service = overrides.septic_service
    if (overrides.crane_liftable !== undefined) crane_liftable = overrides.crane_liftable
    if (overrides.operational_tags)
      for (const t of overrides.operational_tags) tags.add(t)
  }

  const out: InferenceSignals = {
    operational_tags: [...tags],
  }
  if (winter_service) out.winter_service = true
  if (remote_logistics) out.remote_logistics = true
  if (luxury_trailers) out.luxury_trailers = true
  if (flushing_units) out.flushing_units = true
  if (septic_service) out.septic_service = true
  if (crane_liftable) out.crane_liftable = true
  return out
}
