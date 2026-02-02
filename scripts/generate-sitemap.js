import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const SITE_URL = 'https://stadtour.nl'
const TODAY = new Date().toISOString().split('T')[0]

// Read city data
const dataPath = resolve(ROOT, 'product/sections/landing-page/data.json')
const data = JSON.parse(readFileSync(dataPath, 'utf-8'))
const cities = data.cities || []

// Define static pages
const staticPages = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
]

// Generate dynamic city pages
const cityPages = cities.map(city => ({
  path: `/builder/${encodeURIComponent(city.name.toLowerCase())}`,
  changefreq: 'weekly',
  priority: '0.8',
}))

const allPages = [...staticPages, ...cityPages]

// Build XML
const urls = allPages.map(page => `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

// Write to dist/ (post-build) and public/ (for dev server)
const targets = [
  resolve(ROOT, 'dist/sitemap.xml'),
  resolve(ROOT, 'public/sitemap.xml'),
]

for (const target of targets) {
  try {
    writeFileSync(target, sitemap, 'utf-8')
    console.log(`Sitemap generated: ${target}`)
  } catch {
    // dist/ may not exist yet during dev
  }
}

console.log(`Sitemap contains ${allPages.length} URLs (${staticPages.length} static + ${cityPages.length} cities)`)
