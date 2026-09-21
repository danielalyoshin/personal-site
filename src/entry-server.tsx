import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { AppRoutes } from './App'
import { playableTapes } from './content/projects'
import { pageTitle, site } from './content/site'

/**
 * The build's view of the site (scripts/prerender.mjs): every route that
 * exists, what to call it, and its markup as the browser will first render
 * it, so the page is readable, and unfurls under its own name, before any
 * script runs.
 */
export interface Page {
  path: string
  title: string
  /** A tape's own line; home and NO SIGNAL keep index.html's description. */
  description?: string
  /** The route that answers every address without a page of its own. */
  notFound?: boolean
}

export const homeTitle = site.title

export const pages: Page[] = [
  { path: '/', title: pageTitle(null) },
  ...playableTapes.map((tape) => ({
    path: `/project/${tape.slug}`,
    title: pageTitle(tape),
    description: tape.tagline,
  })),
  { path: '/404', title: pageTitle('nosignal'), notFound: true },
]

export function render(path: string) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={path}>
        <AppRoutes />
      </StaticRouter>
    </StrictMode>,
  )
}
