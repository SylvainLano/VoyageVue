// Generates the extra files GitHub Pages needs next to the build:
// - 404.html: a copy of index.html, so direct links to /VoyageVue/<country>/<location> boot the app and its router
// - sitemap.xml: one URL per destination, built from destinations.json with the same paths as the router
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { destinationPath } from '../src/utils/slug.js'

export default function ghPagesFiles({ siteURL }) {
  let outDir

  return {
    name: 'gh-pages-files',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      copyFileSync(join(outDir, 'index.html'), join(outDir, '404.html'))

      const destinations = JSON.parse(
        readFileSync(new URL('../src/assets/destinations.json', import.meta.url), 'utf8')
      )
      const urls = destinations
        .map((destination) => `  <url>\n    <loc>${siteURL}${destinationPath(destination).slice(1)}</loc>\n  </url>\n`)
        .join('')
      const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
        + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + urls
        + '</urlset>'
      writeFileSync(join(outDir, 'sitemap.xml'), sitemap)
    },
  }
}
