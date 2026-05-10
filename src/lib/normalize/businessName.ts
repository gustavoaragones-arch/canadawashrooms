/** Normalize business name for duplicate *supporting* keys only — never sole dedupe key. */
export function normalizeBusinessName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(ltd|inc|corp|corporation|limited|co\.?)\b\.?/gi, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
