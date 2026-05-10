/** Normalize Google Business categories for inference matching. */
export function normalizeCategory(cat: string): string {
  return cat.replace(/\s+/g, ' ').trim().toLowerCase()
}
