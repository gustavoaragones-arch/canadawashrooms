/** Canonical display city title case for Alberta MVP cities. */
export function normalizeCity(value: string): string {
  const t = value.trim()
  if (!t) return t
  const lower = t.toLowerCase()
  const map: Record<string, string> = {
    calgary: 'Calgary',
    edmonton: 'Edmonton',
    'fort mcmurray': 'Fort McMurray',
    'fort-mcmurray': 'Fort McMurray',
    'red deer': 'Red Deer',
    canmore: 'Canmore',
  }
  return map[lower] ?? t.replace(/\b\w/g, (c) => c.toUpperCase())
}
