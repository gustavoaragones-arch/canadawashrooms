import { useEffect, useId, useMemo, useState } from 'react'
import { emitProductionAnalytics } from '../lib/analytics/productionAnalytics'
import { PROVIDERS } from '../lib/providersDataset'
import type { PrimarySegment } from '../types/provider'
import {
  contextualOperationalSuggestions,
  DEFAULT_OPERATIONAL_SUGGESTIONS,
  runOperationalSearch,
  suggestionToQuery,
} from '../lib/search'

export type OperationalSearchVariant = 'hero' | 'page' | 'compact' | 'sticky'

interface OperationalSearchPanelProps {
  /** When set, restricts pool before query interpretation (landing / matcher). */
  segment?: PrimarySegment | null
  city?: string | null
  variant?: OperationalSearchVariant
  /** Extra chips after contextual/default merge — e.g. landing-specific wording. */
  extraSuggestions?: string[]
}

function scrollToProvider(providerId: string) {
  emitProductionAnalytics('provider_jump_to_listing', { provider_id: providerId })
  requestAnimationFrame(() => {
    const el = document.getElementById(`provider-anchor-${providerId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    document.getElementById('operator-matching')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  })
}

export function OperationalSearchPanel({
  segment = null,
  city = null,
  variant = 'page',
  extraSuggestions = [],
}: OperationalSearchPanelProps) {
  const inputId = useId()
  const listId = useId()
  const [query, setQuery] = useState('')

  const chips = useMemo(() => {
    const ctx = segment ? contextualOperationalSuggestions(segment) : [...DEFAULT_OPERATIONAL_SUGGESTIONS]
    const merged = [...extraSuggestions, ...ctx]
    return [...new Set(merged)].slice(0, 10)
  }, [segment, extraSuggestions])

  const hits = useMemo(() => {
    const q = query.trim()
    if (!q) return []
    try {
      return runOperationalSearch(PROVIDERS, q, { segment: segment ?? null, city: city ?? null })
    } catch {
      return []
    }
  }, [query, segment, city])

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) return
    const t = window.setTimeout(() => {
      emitProductionAnalytics('operational_search', {
        segment: segment ?? null,
        city: city ?? null,
        qlen: q.length,
      })
    }, 850)
    return () => window.clearTimeout(t)
  }, [query, segment, city])

  const isCompact = variant === 'compact' || variant === 'sticky'
  const isSticky = variant === 'sticky'

  return (
    <section
      className={
        isSticky
          ? 'border-b border-cwr-border bg-cwr-bg/90 px-3 py-2'
          : isCompact
            ? 'rounded-xl border border-cwr-border bg-cwr-bg/80 px-3 py-3'
            : 'rounded-2xl border border-cwr-border bg-cwr-surface px-4 py-5 shadow-card sm:px-6 sm:py-6'
      }
      aria-label="Operational provider retrieval"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <label
            htmlFor={inputId}
            className={`block font-semibold uppercase tracking-[0.18em] text-cwr-muted ${isSticky ? 'text-[9px]' : 'text-[10px]'}`}
          >
            Operational lookup
          </label>
          <input
            id={inputId}
            type="search"
            role="searchbox"
            enterKeyHint="search"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls={query.trim() ? listId : undefined}
            placeholder={
              variant === 'hero'
                ? 'Search heated units, weddings, remote support, ADA…'
                : 'Search operational capabilities, servicing context, city…'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`mt-2 w-full rounded-lg border border-cwr-border bg-cwr-bg px-3 font-medium text-cwr-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-cwr-muted/80 focus:border-cwr-steel/45 focus:ring-2 focus:ring-cwr-accent/25 ${isSticky ? 'py-2 text-xs' : 'py-2.5 text-sm sm:text-[15px]'}`}
          />
        </div>
        {query.trim() ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            className={`shrink-0 rounded-lg border border-cwr-border bg-cwr-surface font-semibold text-cwr-steel transition-colors duration-150 hover:border-cwr-steel/40 hover:bg-cwr-bg ${isSticky ? 'px-2 py-1.5 text-[11px]' : 'px-3 py-2 text-xs'}`}
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className={`flex flex-wrap gap-2 ${isSticky ? 'mt-2' : 'mt-4'}`} aria-label="Suggested operational queries">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setQuery(suggestionToQuery(chip))}
            className={`min-h-9 rounded-md border border-cwr-border bg-cwr-bg font-semibold uppercase tracking-wider text-cwr-steel transition-colors duration-150 hover:border-cwr-accent/35 hover:text-cwr-ink ${isSticky ? 'px-2 py-1.5 text-[9px]' : 'px-2.5 py-2 text-[10px]'}`}
          >
            {chip}
          </button>
        ))}
      </div>

      <div
        id={listId}
        role="region"
        aria-label="Operational search results"
        className={`mt-4 space-y-2 overflow-y-auto ${isSticky ? 'max-h-[9.5rem]' : 'max-h-[22rem]'}`}
      >
        {!query.trim() ? (
          <p className={`text-cwr-muted ${isSticky ? 'text-[11px] leading-snug' : 'text-xs leading-relaxed'}`}>
            Type operational language — capabilities, servicing, cities — or tap a suggestion chip.
            Retrieval stays local to this dataset; nothing leaves your browser.
          </p>
        ) : hits.length === 0 ? (
          <p className={`rounded-lg border border-dashed border-cwr-border bg-cwr-bg/60 px-3 py-3 text-cwr-muted ${isSticky ? 'text-[11px]' : 'text-sm'}`}>
            No operators in this scope matched that retrieval profile. Try broader capability terms,
            remove city tokens, or switch segment context — generic praise keywords alone rarely match.
          </p>
        ) : (
          hits.map((hit) => (
            <div
              key={hit.provider.id}
              className={`rounded-lg border border-cwr-border bg-cwr-bg/90 ${isSticky ? 'px-2.5 py-2' : 'px-3 py-3'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`font-semibold text-cwr-ink ${isSticky ? 'text-xs' : 'text-sm'}`}>
                    {hit.provider.company_name}
                  </p>
                  <p className={`mt-0.5 text-cwr-muted ${isSticky ? 'text-[10px]' : 'text-xs'}`}>
                    {hit.provider.city} · Primary {hit.provider.primary_segment}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => scrollToProvider(hit.provider.id)}
                  className={`shrink-0 rounded-md bg-cwr-ink font-semibold text-cwr-surface transition-colors duration-150 hover:bg-cwr-steel ${isSticky ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'}`}
                >
                  Jump to listing
                </button>
              </div>
              <ul className={`mt-2 space-y-1 text-cwr-muted ${isSticky ? 'text-[10px] leading-snug' : 'text-xs leading-relaxed'}`}>
                {hit.explanations.slice(0, 3).map((line) => (
                  <li key={line}>· {line}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
