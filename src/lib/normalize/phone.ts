/** Normalize to E.164-style when digits present; keeps leading + for CA. */
export function normalizePhone(raw: string): string {
  const d = raw.replace(/[^\d+]/g, '')
  if (!d) return raw.trim()
  if (d.startsWith('+')) return d
  if (d.length === 10) return `+1${d}`
  if (d.length === 11 && d.startsWith('1')) return `+${d}`
  return `+${d}`
}
