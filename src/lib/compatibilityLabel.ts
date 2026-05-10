import {
  badgeOverlapCount,
  countCapabilityMatches,
} from './matching'
import type { FilterCapability, PrimarySegment, Provider } from '../types/provider'

/**
 * Utility-style compatibility label (no scores / percentages).
 * Priority: full filter alignment → segment operational signals → relaxed signals.
 */
export function getCompatibilityLabel(
  provider: Provider,
  segment: PrimarySegment,
  activeCapabilities: FilterCapability[],
  isRelaxedFallback: boolean,
): string {
  const matched = countCapabilityMatches(provider, activeCapabilities)
  const total = activeCapabilities.length
  const allMatched = total > 0 && matched === total
  const overlap = badgeOverlapCount(provider, segment)

  if (!isRelaxedFallback && total > 0 && allMatched) {
    if (total >= 2 && overlap >= 1) return 'Best Match'
    return 'Strong Match'
  }

  if (!isRelaxedFallback && total === 0) {
    if (overlap >= 2) return 'Strong Match'
    return 'Operational fit'
  }

  if (isRelaxedFallback) {
    if (total >= 2 && matched >= total - 1 && matched > 0) return 'Strong Match'

    if (segment === 'oilfield' && (provider.winterized || provider.winter_service))
      return 'Winter Ready'
    if (
      segment === 'event' &&
      (provider.luxury_units || provider.wedding_friendly)
    )
      return 'Event Optimized'
    if (segment === 'construction' && provider.construction_ready)
      return 'Jobsite Aligned'
    if (
      segment === 'oilfield' &&
      (provider.remote_support ||
        provider.camp_support ||
        provider.oilfield_ready)
    )
      return 'Remote Operations Fit'

    if (segment === 'general' && provider.ada_accessible)
      return 'Accessibility Ready'

    return 'Operational fit'
  }

  return 'Operational fit'
}
