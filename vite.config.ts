import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { allResolvedLandings, listingPath } from './src/seo/landingRoutes.ts'
import { EDITORIAL_STATIC_PATHS } from './src/seo/publishedRoutes.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function toAbsoluteUrls(origin: string, paths: readonly string[]): string[] {
  return paths.map((p) => (p === '/' ? `${origin}/` : `${origin}${p.startsWith('/') ? p : `/${p}`}`))
}

function writeSeoFiles(outDir: string, siteOrigin: string) {
  mkdirSync(outDir, { recursive: true })

  const landingPaths = allResolvedLandings().map((r) => listingPath(r))
  const allPaths = [...new Set([...EDITORIAL_STATIC_PATHS, ...landingPaths])].sort((a, b) => {
    if (a === '/') return -1
    if (b === '/') return 1
    return a.localeCompare(b)
  })

  const urls = toAbsoluteUrls(siteOrigin, allPaths)
  const homeUrl = `${siteOrigin}/`

  const body = urls
    .map((loc) => {
      const priority = loc === homeUrl ? '1.0' : '0.7'
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    })
    .join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
  writeFileSync(resolve(outDir, 'sitemap.xml'), sitemap, 'utf8')

  const robots = ['User-agent: *', 'Allow: /', '', `Sitemap: ${homeUrl}sitemap.xml`, '',].join('\n')
  writeFileSync(resolve(outDir, 'robots.txt'), robots, 'utf8')
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteOrigin = env.VITE_SITE_ORIGIN?.replace(/\/$/, '') || 'https://canadawashrooms.ca'

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'cwr-seo-files',
        closeBundle() {
          writeSeoFiles(resolve(__dirname, 'dist'), siteOrigin)
        },
      },
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
              return 'react-vendor'
            }
            if (id.includes('node_modules/react-router')) {
              return 'router'
            }
            if (id.includes('node_modules/react-helmet-async')) {
              return 'helmet'
            }
          },
        },
      },
    },
  }
})
