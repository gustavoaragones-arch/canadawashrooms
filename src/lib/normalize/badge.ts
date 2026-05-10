/** Trim + collapse inner whitespace for dedupe pipelines. */
export function normalizeBadge(label: string): string {
  return label.replace(/\s+/g, ' ').trim()
}
