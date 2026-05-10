/** Platform lead inbox for MVP quote routing (mailto). */
export const PLATFORM_QUOTE_EMAIL = 'quotes@canadawashrooms.ca'

export function quoteMailto(companyName: string, city: string, segmentTitle: string): string {
  const subject = `Quote request: ${companyName} (${city})`
  const body = [
    `Project type: ${segmentTitle}`,
    `Preferred provider: ${companyName}`,
    '',
    'Describe your site, dates, headcount, and service cadence:',
    '',
  ].join('\n')

  const params = new URLSearchParams({
    subject,
    body,
  })

  return `mailto:${PLATFORM_QUOTE_EMAIL}?${params.toString()}`
}
