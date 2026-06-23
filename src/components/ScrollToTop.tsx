import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Reset viewport to top on every client-side route change. */
export function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useLayoutEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, search, hash])

  return null
}
