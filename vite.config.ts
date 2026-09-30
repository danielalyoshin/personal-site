import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Share-card crawlers want an absolute image URL. `%SITE_URL%` in index.html
 * is filled from SITE_URL when the page is built: `.env.production` holds the
 * site's address, and the environment variable overrides it. The dev server
 * leaves it empty and the URLs root-relative, which is right for local work
 * and wrong for a release, so a build without it says so.
 */
function siteUrl(): Plugin {
  let origin = ''
  return {
    name: 'site-url',
    configResolved(config) {
      origin = (
        loadEnv(config.mode, config.envDir || config.root, 'SITE_').SITE_URL ??
        ''
      ).replace(/\/+$/, '')
      if (config.command === 'build' && !origin)
        config.logger.warn(
          'SITE_URL is not set: share-card image URLs are root-relative. Set it for a release build.',
        )
    },
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replaceAll('%SITE_URL%', origin),
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), siteUrl()],
})
