import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import ghPagesFiles from './build/gh-pages-files.js'

export default defineConfig(({ command }) => ({
  // Same as the former vue.config.js: served from /VoyageVue/ on GitHub Pages, from / in development
  base: command === 'build' ? '/VoyageVue/' : '/',
  plugins: [
    vue(),
    tailwindcss(),
    ghPagesFiles({ siteURL: 'https://sylvainlano.github.io/VoyageVue/' }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 8080,
  },
  build: {
    // Keep the ~540 flag SVGs as separate files, as before, instead of inlining them all into the CSS
    assetsInlineLimit: (filePath) => (filePath.endsWith('.svg') ? false : undefined),
  },
}))
