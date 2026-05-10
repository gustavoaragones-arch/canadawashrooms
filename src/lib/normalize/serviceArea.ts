/** Light normalization for service area strings (future geo parsing hooks). */
export function normalizeServiceArea(area: string): string {
  return area.replace(/\s+/g, ' ').trim()
}
