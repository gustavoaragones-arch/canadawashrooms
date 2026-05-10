import type { PrimarySegment } from './provider'

/** Structured intelligence surfaced selectively in UI (detail panel + subtle cues). */
export interface ProviderIntelligence {
  compatibilityTraits: string[]
  inferredStrengths: string[]
  operationalFitNotes: string[]
  trustTierLabels: string[]
  /** Short operational cues for card chrome (max few lines). */
  subtleUiCues: string[]
}

export interface SegmentAlignmentContext {
  activeSegment: PrimarySegment
}
