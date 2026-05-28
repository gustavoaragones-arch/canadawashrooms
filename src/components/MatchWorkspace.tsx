import { useMemo, useState } from 'react'
import { PROVIDERS } from '../lib/providersDataset'
import { FilterBar } from './FilterBar'
import { MobileMatchStickyBar } from './MobileMatchStickyBar'
import { OperationalSearchPanel } from './OperationalSearchPanel'
import { ProviderResults } from './ProviderResults'
import { filterLabelsActive, resolveMatches } from '../lib/matching'
import { matchHeadline } from '../lib/matchHeadlines'
import type { PriorityCity } from '../lib/segments'
import type { FilterCapability, PrimarySegment } from '../types/provider'

interface MatchWorkspaceProps {
  segment: PrimarySegment
  city: PriorityCity
  /** Override operational summary headline (defaults to segment match headline). */
  summaryHeadline?: string
}

export function MatchWorkspace({ segment, city, summaryHeadline }: MatchWorkspaceProps) {
  const [activeFilters, setActiveFilters] = useState<FilterCapability[]>([])
  const activeSet = useMemo(() => new Set(activeFilters), [activeFilters])

  const { providers: matched, isRelaxed, isCityFallback } = useMemo(() => {
    return resolveMatches(PROVIDERS, segment, city, activeSet)
  }, [segment, city, activeSet])

  const activeFilterLabels = useMemo(() => {
    return filterLabelsActive(segment, activeSet)
  }, [segment, activeSet])

  const stickyHeadline = summaryHeadline ?? matchHeadline(segment, city)

  function toggleFilter(capability: FilterCapability) {
    setActiveFilters((prev) =>
      prev.includes(capability) ? prev.filter((c) => c !== capability) : [...prev, capability],
    )
  }

  function clearFilters() {
    setActiveFilters([])
  }

  return (
    <>
      <FilterBar
        segment={segment}
        city={city}
        active={activeSet}
        onToggle={toggleFilter}
        onClear={clearFilters}
      />
      <ProviderResults
        segment={segment}
        city={city}
        activeCapabilities={activeFilters}
        activeFilterLabels={activeFilterLabels}
        isRelaxed={isRelaxed}
        isCityFallback={isCityFallback}
        providers={matched}
        summaryHeadline={summaryHeadline}
      />
      <MobileMatchStickyBar
        segment={segment}
        headline={stickyHeadline}
        city={city}
        activeFilterCount={activeFilters.length}
        providerCount={matched.length}
        isRelaxed={isRelaxed}
        activeCapabilityLabels={activeFilterLabels}
        topSlot={<OperationalSearchPanel segment={segment} city={city} variant="sticky" />}
      />
    </>
  )
}
