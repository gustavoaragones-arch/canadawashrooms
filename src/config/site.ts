/** Production origin for canonical and absolute URLs. Override via Vite env for previews. */
export const SITE_ORIGIN =
  (typeof import.meta.env.VITE_SITE_ORIGIN === 'string' &&
    import.meta.env.VITE_SITE_ORIGIN.replace(/\/$/, '')) ||
  'https://canadawashrooms.ca'

export const SITE_NAME = 'Canada Washrooms'

/** Served from `public/logo.png`. */
export const SITE_LOGO = '/logo.png'
