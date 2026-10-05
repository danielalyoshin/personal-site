import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { AppRoutes } from './App'
import { playableTapes, shelfTapes } from './content/projects'
import { pageTitle, site } from './content/site'
import { studioStills } from './content/studioStills'
import { shelfKey } from './content/types'

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
  /**
   * A tape's own share card, drawn by `npm run render:card` as the tape goes
   * into the deck; home and NO SIGNAL keep the site's card in index.html.
   */
  card?: { image: string; alt: string }
}

export const homeTitle = site.title

export const pages: Page[] = [
  { path: '/', title: pageTitle(null) },
  ...playableTapes.map((tape) => ({
    path: `/project/${tape.slug}`,
    title: pageTitle(tape),
    description: tape.tagline,
    card: {
      image: `/social-cards/${tape.slug}.png`,
      alt: `A low-poly studio on a graphite table: a CRT monitor reading LOADING TAPE, ${tape.vhs.spineLabel}, over a VHS deck with the ${tape.vhs.spineLabel} tape halfway in, beside a rack of cassettes, a speaker, and headphones.`,
    },
  })),
  { path: '/404', title: pageTitle('nosignal'), notFound: true },
]

/**
 * The studio's stills, which a browser without 3D graphics shows in the
 * studio's place (`npm run render:flat`): every file the page can ask for,
 * and what the stills no longer match. A tape added since they were drawn
 * would sit in the rack with no still and no target, so the build stops.
 */
export function studioStillFiles() {
  const stale: string[] = []
  const files: string[] = []
  const rack = shelfTapes.map(shelfKey).join(', ')
  for (const [framing, still] of Object.entries(studioStills)) {
    const drawn = still.slots.map((slot) => slot.id).join(', ')
    if (drawn !== rack)
      stale.push(
        `the ${framing} still's rack holds ${drawn}, the site's ${rack}`,
      )
    for (const tape of playableTapes)
      if (!still.previews.includes(tape.slug))
        stale.push(`${tape.slug} has no ${framing} still of its own`)
    for (const name of ['rest', 'muted', ...still.previews])
      for (const width of still.widths)
        files.push(`/flat-studio/${framing}-${name}-${width}.webp`)
  }
  return { stale, files }
}

export function render(path: string) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={path}>
        <AppRoutes />
      </StaticRouter>
    </StrictMode>,
  )
}
