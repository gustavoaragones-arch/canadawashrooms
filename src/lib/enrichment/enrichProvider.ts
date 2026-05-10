import { deriveOperationalTrustCues } from '../intelligence/operationalTrustCues'
import {
  normalizeBadge,
  normalizeCategory,
  normalizeCity,
  normalizePhone,
  normalizeServiceArea,
  normalizeWebsite,
} from '../normalize'
import { runInferredCapabilityPipeline } from '../inference/inferredCapabilityPipeline'
import { normalizeReviewRecord } from '../inference/reviewPipeline'
import type {
  FilterCapability,
  InferenceOverrideShape,
  ManualEnrichmentOverrides,
  OperatorScale,
  PrimarySegment,
  Provider,
  ProviderRaw,
  ResponsePriority,
} from '../../types/provider'

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

function deriveSupportedSegments(
  raw: ProviderRaw,
  flags: {
    winter_service: boolean
    remote_logistics: boolean
    luxury_trailers: boolean
  },
): PrimarySegment[] {
  const s = new Set<PrimarySegment>([raw.primary_segment])

  if (raw.primary_segment !== 'event') {
    if (raw.luxury_units || raw.wedding_friendly || flags.luxury_trailers) {
      s.add('event')
    }
  }

  if (raw.primary_segment !== 'oilfield') {
    if (
      raw.oilfield_ready ||
      raw.remote_support ||
      raw.camp_support ||
      flags.remote_logistics
    ) {
      s.add('oilfield')
    }
  }

  if (raw.primary_segment !== 'construction') {
    if (raw.construction_ready || raw.weekly_service || raw.crane_liftable) {
      s.add('construction')
    }
  }

  if (raw.primary_segment !== 'general') {
    if (
      raw.handwash_available &&
      !raw.luxury_units &&
      (raw.septic_service || raw.ada_accessible)
    ) {
      s.add('general')
    }
  }

  return [...s]
}

function buildCapabilityTokens(p: {
  weekly_service?: boolean
  crane_liftable?: boolean
  handwash_available: boolean
  luxury_units: boolean
  flush_toilets?: boolean
  wedding_friendly?: boolean
  heated?: boolean
  winterized: boolean
  remote_support?: boolean
  camp_support?: boolean
  ada_accessible: boolean
  septic_service?: boolean
  winter_service: boolean
  remote_logistics: boolean
  luxury_trailers: boolean
  flushing_units: boolean
}): string[] {
  const out = new Set<string>()
  const add = (k: string, ok: boolean | undefined) => {
    if (ok) out.add(k)
  }

  add('weekly_service', p.weekly_service)
  add('crane_liftable', p.crane_liftable)
  add('handwash_available', p.handwash_available)
  add('luxury_units', p.luxury_units)
  add('flush_toilets', p.flush_toilets)
  add('wedding_friendly', p.wedding_friendly)
  add('heated', p.heated)
  add('winterized', p.winterized)
  add('remote_support', p.remote_support)
  add('camp_support', p.camp_support)
  add('ada_accessible', p.ada_accessible)
  add('septic_service', p.septic_service)
  add('winter_service', p.winter_service)
  add('remote_logistics', p.remote_logistics)
  add('luxury_trailers', p.luxury_trailers)
  add('flushing_units', p.flushing_units)

  return [...out].sort()
}

function deriveServiceTypes(raw: ProviderRaw): string[] {
  const t = new Set<string>()
  if (raw.weekly_service) t.add('scheduled_servicing')
  if (raw.remote_support || raw.camp_support) t.add('remote_field_servicing')
  if (raw.luxury_units || raw.wedding_friendly) t.add('event_trailer_operations')
  if (raw.construction_ready) t.add('jobsite_programs')
  if (raw.septic_service) t.add('fluid_handling_partnership')
  return [...t]
}

function deriveSpecialties(
  raw: ProviderRaw,
  tags: string[],
): string[] {
  const spec = new Set<string>()
  if (raw.oilfield_ready || tags.some((x) => x.includes('remote')))
    spec.add('Industrial remote corridors')
  if (raw.luxury_units || raw.wedding_friendly)
    spec.add('Guest-density event layouts')
  if (raw.winterized || raw.heated) spec.add('Cold-weather equipment posture')
  if (raw.crane_liftable) spec.add('Vertical / lift-coordinated drops')
  if (raw.septic_service) spec.add('Tank servicing & fluid partners')
  return [...spec]
}

function buildTrustSignals(
  raw: ProviderRaw,
  hasWebsite: boolean,
): string[] {
  const s: string[] = ['alberta_mvp_dataset']
  if (raw.review_count >= 180) s.push('review_volume_signal')
  if (raw.review_count >= 120 && raw.rating >= 4.5) s.push('rating_consistency_signal')
  if (hasWebsite) s.push('listed_web_presence')
  else s.push('phone_forward_operations')
  if (raw.badges.length >= 4) s.push('positioning_rich_listing')
  return s
}

function deriveResponsePriority(raw: ProviderRaw): ResponsePriority {
  if (raw.review_count >= 240 && raw.rating >= 4.55) return 'priority_field'
  if (raw.review_count >= 95 && raw.rating >= 4.35) return 'elevated'
  return 'standard'
}

function deriveOperatorScale(raw: ProviderRaw): OperatorScale {
  if (raw.review_count >= 320 || raw.badges.length >= 5) return 'multi_route'
  if (raw.review_count >= 130) return 'regional'
  if (raw.review_count >= 45) return 'small'
  return 'solo'
}

function derivePrimaryConfidence(
  raw: ProviderRaw,
  supportedCount: number,
): number {
  let c = raw.primary_segment_confidence ?? 0.84
  if (supportedCount >= 4) c -= 0.06
  if (raw.review_count < 40) c -= 0.04
  return clamp(c, 0.58, 0.96)
}

function mergeOperationalTags(
  inferredTags: string[],
  raw: ProviderRaw,
): string[] {
  const t = new Set(inferredTags)
  if (raw.construction_ready) t.add('declared:jobsite_ready')
  if (raw.oilfield_ready) t.add('declared:industrial_remote')
  return [...t].sort()
}

function mergeInferenceLocks(raw: ProviderRaw): Partial<InferenceOverrideShape> | undefined {
  const out: Partial<InferenceOverrideShape> = { ...raw.inference_overrides }
  const man = raw.manual_enrichment_overrides
  if (man) {
    const keys: (keyof InferenceOverrideShape)[] = [
      'winter_service',
      'remote_logistics',
      'luxury_trailers',
      'flushing_units',
      'septic_service',
      'crane_liftable',
    ]
    for (const k of keys) {
      if (man[k] !== undefined) out[k] = man[k]
    }
  }
  return Object.keys(out).length ? out : undefined
}

function pickManualBoolean(
  manual: ManualEnrichmentOverrides | undefined,
  key: keyof InferenceOverrideShape,
  inferredFallback: boolean,
): boolean {
  const v = manual?.[key]
  if (v !== undefined) return v
  return inferredFallback
}

type InferenceFlags = Required<InferenceOverrideShape>

function applyBlockedInference(
  manual: ManualEnrichmentOverrides | undefined,
  flags: InferenceFlags,
): InferenceFlags {
  const out: InferenceFlags = { ...flags }
  if (!manual?.blocked_inference?.length) return out
  for (const k of manual.blocked_inference) {
    out[k] = false
  }
  return out
}

/** Force declared capability fields off — runs after manual confirms + inference. */
function applyBlockedFilterCapabilities(
  manual: ManualEnrichmentOverrides | undefined,
  core: ProviderRaw & InferenceOverrideShape,
): void {
  if (!manual?.blocked_capabilities?.length) return
  const blocked = new Set<FilterCapability>(manual.blocked_capabilities)
  const off = (k: FilterCapability) => {
    if (!blocked.has(k)) return
    switch (k) {
      case 'weekly_service':
        core.weekly_service = false
        break
      case 'crane_liftable':
        core.crane_liftable = false
        break
      case 'handwash_available':
        core.handwash_available = false
        break
      case 'luxury_units':
        core.luxury_units = false
        break
      case 'flush_toilets':
        core.flush_toilets = false
        break
      case 'wedding_friendly':
        core.wedding_friendly = false
        break
      case 'heated':
        core.heated = false
        break
      case 'winterized':
        core.winterized = false
        break
      case 'remote_support':
        core.remote_support = false
        break
      case 'camp_support':
        core.camp_support = false
        break
      case 'ada_accessible':
        core.ada_accessible = false
        break
      case 'septic_service':
        core.septic_service = false
        break
      default:
        break
    }
  }
  for (const k of blocked) off(k)
}

export function enrichProvider(raw: ProviderRaw): Provider {
  const rawCore: ProviderRaw = { ...raw }
  delete rawCore.address_full
  const manual = raw.manual_enrichment_overrides
  const effectivePrimary: PrimarySegment =
    manual?.primary_segment ?? raw.primary_segment

  const workingRaw: ProviderRaw = {
    ...rawCore,
    primary_segment: effectivePrimary,
  }

  const badges = workingRaw.badges.map(normalizeBadge)
  const city = normalizeCity(workingRaw.city)
  const phone = normalizePhone(workingRaw.phone)
  const website = normalizeWebsite(workingRaw.website)
  const service_area = normalizeServiceArea(workingRaw.service_area)
  const google_categories = (workingRaw.google_categories ?? []).map(normalizeCategory)
  const reviews_normalized = (workingRaw.reviews_normalized ?? []).map((r) =>
    normalizeReviewRecord(r),
  )

  const inferred = runInferredCapabilityPipeline({
    badges,
    google_categories,
    reviews_normalized,
    inference_overrides: mergeInferenceLocks(raw),
  })

  let winter_service = pickManualBoolean(
    manual,
    'winter_service',
    Boolean(
      workingRaw.winterized ||
        workingRaw.heated ||
        Boolean(inferred.winter_service),
    ),
  )

  let remote_logistics = pickManualBoolean(
    manual,
    'remote_logistics',
    Boolean(
      workingRaw.oilfield_ready ||
        workingRaw.remote_support ||
        workingRaw.camp_support ||
        Boolean(inferred.remote_logistics),
    ),
  )

  let luxury_trailers = pickManualBoolean(
    manual,
    'luxury_trailers',
    Boolean(
      workingRaw.luxury_units ||
        workingRaw.wedding_friendly ||
        Boolean(inferred.luxury_trailers),
    ),
  )

  let flushing_units = pickManualBoolean(
    manual,
    'flushing_units',
    Boolean(workingRaw.flush_toilets || Boolean(inferred.flushing_units)),
  )

  let crane_liftable = pickManualBoolean(
    manual,
    'crane_liftable',
    Boolean(workingRaw.crane_liftable || Boolean(inferred.crane_liftable)),
  )

  let septic_service = pickManualBoolean(
    manual,
    'septic_service',
    Boolean(workingRaw.septic_service || Boolean(inferred.septic_service)),
  )

  const infMerged = applyBlockedInference(manual, {
    winter_service,
    remote_logistics,
    luxury_trailers,
    flushing_units,
    septic_service,
    crane_liftable,
  })
  winter_service = infMerged.winter_service
  remote_logistics = infMerged.remote_logistics
  luxury_trailers = infMerged.luxury_trailers
  flushing_units = infMerged.flushing_units
  septic_service = infMerged.septic_service
  crane_liftable = infMerged.crane_liftable

  const capCore: ProviderRaw & InferenceOverrideShape = {
    ...workingRaw,
    winter_service,
    remote_logistics,
    luxury_trailers,
    flushing_units,
    septic_service,
    crane_liftable,
  }
  applyBlockedFilterCapabilities(manual, capCore)

  let supported_segments = deriveSupportedSegments(capCore, {
    winter_service: Boolean(capCore.winter_service),
    remote_logistics: Boolean(capCore.remote_logistics),
    luxury_trailers: Boolean(capCore.luxury_trailers),
  })

  if (manual?.supported_segments?.length) {
    supported_segments = [
      ...new Set([effectivePrimary, ...manual.supported_segments]),
    ]
  }

  const capabilities = buildCapabilityTokens({
    ...capCore,
    winter_service: Boolean(capCore.winter_service),
    remote_logistics: Boolean(capCore.remote_logistics),
    luxury_trailers: Boolean(capCore.luxury_trailers),
    flushing_units: Boolean(capCore.flushing_units),
    crane_liftable: Boolean(capCore.crane_liftable),
    septic_service: Boolean(capCore.septic_service),
  })

  const operational_tags = mergeOperationalTags(
    inferred.operational_tags,
    capCore,
  )
  const service_types = deriveServiceTypes({ ...capCore, septic_service: capCore.septic_service })
  const inferred_specialties =
    manual?.curated_specialties != null && manual.curated_specialties.length > 0
      ? [...new Set(manual.curated_specialties)].sort()
      : deriveSpecialties(capCore, operational_tags)
  let trust_signals = buildTrustSignals(capCore, Boolean(website))
  if (manual?.trust_signals_replace != null && manual.trust_signals_replace.length > 0) {
    trust_signals = [...manual.trust_signals_replace]
  } else if (manual?.trust_signals_append != null && manual.trust_signals_append.length > 0) {
    trust_signals = [...new Set([...trust_signals, ...manual.trust_signals_append])].sort()
  }
  const response_priority = deriveResponsePriority(capCore)
  const operator_scale = deriveOperatorScale(capCore)

  let primary_segment_confidence = derivePrimaryConfidence(
    capCore,
    supported_segments.length,
  )
  if (manual?.primary_segment_confidence != null) {
    primary_segment_confidence = clamp(
      manual.primary_segment_confidence,
      0.58,
      0.99,
    )
  }

  const sansTrustCues: Omit<Provider, 'operational_trust_cues'> = {
    ...capCore,
    city,
    phone,
    website,
    service_area,
    badges,
    primary_segment: effectivePrimary,
    crane_liftable: capCore.crane_liftable,
    septic_service: capCore.septic_service,
    google_categories: workingRaw.google_categories,
    reviews_normalized,
    operational_notes: workingRaw.operational_notes,
    inference_overrides: workingRaw.inference_overrides,
    manual_enrichment_overrides: workingRaw.manual_enrichment_overrides,
    primary_segment_confidence,
    supported_segments,
    capabilities,
    operational_tags,
    service_types,
    inferred_specialties,
    trust_signals,
    response_priority,
    winter_service,
    remote_logistics,
    luxury_trailers,
    flushing_units,
    operator_scale,
    years_in_business_estimate: workingRaw.years_in_business_estimate ?? null,
  }

  const operational_trust_cues = deriveOperationalTrustCues(sansTrustCues)

  return {
    ...sansTrustCues,
    operational_trust_cues,
  } satisfies Provider
}
