import type { PrimarySegment, Provider } from '../../types/provider'

/**
 * Future free-text & capability search — index-shaped document only (no UI yet).
 */
export interface ProviderSearchDocument {
  id: string
  tokens: Set<string>
  capabilityKeys: string[]
  /** Normalized city token for future geo-scoped search. */
  cityToken: string
  primary_segment: PrimarySegment
  supported_segments: PrimarySegment[]
}

const SPLIT = /[^a-z0-9]+/i

export function tokenizePhrase(text: string): string[] {
  return text
    .toLowerCase()
    .split(SPLIT)
    .map((t) => t.trim())
    .filter((t) => t.length > 1)
}

export function buildProviderSearchDocument(provider: Provider): ProviderSearchDocument {
  const tokens = new Set<string>()
  for (const t of tokenizePhrase(provider.company_name)) tokens.add(t)
  for (const b of provider.badges) {
    for (const t of tokenizePhrase(b)) tokens.add(t)
  }
  for (const t of tokenizePhrase(provider.service_area)) tokens.add(t)
  for (const c of provider.capabilities) tokens.add(c)
  for (const tag of provider.operational_tags) {
    for (const t of tokenizePhrase(tag.replace(/:/g, ' '))) tokens.add(t)
  }
  const cityToken = provider.city.trim().toLowerCase().replace(/\s+/g, '-')
  tokens.add(cityToken)
  tokens.add(provider.primary_segment)
  for (const seg of provider.supported_segments) tokens.add(seg)
  return {
    id: provider.id,
    tokens,
    capabilityKeys: [...provider.capabilities],
    cityToken,
    primary_segment: provider.primary_segment,
    supported_segments: [...provider.supported_segments],
  }
}

/** Keyword-style probe for future search bar / API filters. */
export function matchesOperationalKeyword(
  doc: ProviderSearchDocument,
  query: string,
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (doc.capabilityKeys.some((k) => k.includes(q))) return true
  for (const t of doc.tokens) {
    if (t.includes(q) || q.includes(t)) return true
  }
  return false
}

function normalizeCitySlug(slug: string): string {
  return slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-')
}

/** Future city-scoped capability search — architecture only. */
export function matchesCityCapabilityProbe(
  doc: ProviderSearchDocument,
  citySlug: string,
  capabilityQuery: string,
): boolean {
  if (doc.cityToken !== normalizeCitySlug(citySlug)) return false
  return matchesOperationalKeyword(doc, capabilityQuery)
}

function segmentMatches(doc: ProviderSearchDocument, segment: PrimarySegment): boolean {
  return doc.primary_segment === segment || doc.supported_segments.includes(segment)
}

/**
 * City + optional segment gate + keyword/capability probe — retrieval-layer primitive (no UI).
 */
export function matchesCitySegmentCapabilityProbe(
  doc: ProviderSearchDocument,
  citySlug: string,
  segment: PrimarySegment | null,
  capabilityQuery: string,
): boolean {
  if (doc.cityToken !== normalizeCitySlug(citySlug)) return false
  if (segment != null && !segmentMatches(doc, segment)) return false
  return matchesOperationalKeyword(doc, capabilityQuery)
}

/** Batch helper for future worker/static indexes — pure filter over prebuilt docs. */
export function filterDocumentsByCapabilityProbe(
  docs: ProviderSearchDocument[],
  citySlug: string,
  segment: PrimarySegment | null,
  capabilityQuery: string,
): ProviderSearchDocument[] {
  return docs.filter((d) =>
    matchesCitySegmentCapabilityProbe(d, citySlug, segment, capabilityQuery),
  )
}
