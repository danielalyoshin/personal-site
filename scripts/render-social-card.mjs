/* global document, window */
/**
 * Renders the share cards from the studio itself: the real scene, at the
 * browse camera, fitted to a 1200 × 630 frame on the page's graphite ground.
 *
 * - public/social-card.png: the studio at rest, the tube reading INSERT
 *   TAPE. Home and the NO SIGNAL page unfurl with it.
 * - public/social-cards/<slug>.png, one per tape: the same studio caught as
 *   that tape plays, the shell half through the deck's mouth, its slot in
 *   the rack empty, and the tube reading LOADING TAPE over its name. A
 *   shared tape's link unfurls with it (scripts/prerender.mjs).
 *
 * No copy is set on an image beyond what the tube and the labels print; the
 * card's words are the page's title and description tags.
 *
 * Run `npm run render:card` after the studio's models, materials, lighting,
 * tube screens, or tapes change. It starts its own dev server, drives the
 * installed Chrome (as the e2e suite does), draws at twice the size, and
 * averages down so the low-poly edges are clean.
 */
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { createServer } from 'vite'

const WIDTH = 1200
const HEIGHT = 630
const SUPERSAMPLE = 2
const PUBLIC = new URL('../public/', import.meta.url)
const HOME_CARD = fileURLToPath(new URL('social-card.png', PUBLIC))
const TAPE_CARDS = new URL('social-cards/', PUBLIC)
/** How much of the shell's depth is through the deck's mouth at capture. */
const THROUGH = 0.5
const FIBER = '/node_modules/.vite/deps/@react-three_fiber.js'

// The studio's layer takes the whole frame, over everything else on the
// page; the rig fits the equipment to whatever box its canvas is given.
const FRAME_CSS = `
  [data-testid='studio-scene'] > div {
    position: fixed !important;
    inset: 0 !important;
    z-index: 1000;
    background: #0e0f12;
  }
`

const server = await createServer({
  root: fileURLToPath(new URL('..', import.meta.url)),
  logLevel: 'warn',
  server: { port: 5188, host: '127.0.0.1' },
})
await server.listen()
const browser = await chromium.launch({ channel: 'chrome' })
const url = server.resolvedUrls.local[0]

/** The studio, framed and ready, with the fonts its prints are set in. */
async function openStudio(reduced) {
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: SUPERSAMPLE,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  })
  // Added on every load, so a dev-server reload mid-run cannot drop it.
  await page.addInitScript((css) => {
    const frame = () => {
      const style = document.createElement('style')
      style.textContent = css
      document.head.append(style)
    }
    if (document.head) frame()
    else document.addEventListener('DOMContentLoaded', frame)
  }, FRAME_CSS)
  await page.goto(url)
  await page.waitForSelector("[data-testid='studio-scene'][data-ready='true']")
  // Prints paint at once and redraw when Archivo and VT323 have loaded; the
  // refit to the frame and that redraw both land within a few frames.
  await page.waitForFunction(() => document.fonts.status === 'loaded')
  await page.waitForTimeout(1500)
  return page
}

/**
 * Check what is about to be captured instead of trusting the waits: a
 * reload inside them once put the loading screen in the frame.
 */
async function assertFramed(page, what) {
  const framed = await page.evaluate(() => {
    const scene = document.querySelector("[data-testid='studio-scene']")
    const layer = scene?.firstElementChild?.getBoundingClientRect()
    return (
      scene?.getAttribute('data-ready') === 'true' &&
      !!scene.querySelector('canvas') &&
      layer?.width === window.innerWidth &&
      layer?.height === window.innerHeight
    )
  })
  if (!framed)
    throw new Error(
      `The studio was not ready and framed for ${what}; no card was written.`,
    )
}

/**
 * Plays a tape from its archive link and holds the frame where the shell is
 * `THROUGH` of the way into the deck. The scene is stepped one frame at a
 * time, yielding between frames so React commits what the scene reports.
 */
async function catchInserting(page, slug) {
  const link = page.locator(`#projects a[href="/project/${slug}"]`)
  await link.focus()
  await link.press('Enter')
  const caught = await page.evaluate(
    async ({ slug, through, FIBER }) => {
      const { _roots } = await import(FIBER)
      const { Box3 } = await import('/node_modules/.vite/deps/three.js')
      const state = _roots
        .get(document.querySelector('canvas'))
        .store.getState()
      const { scene } = state
      const bounds = (name) =>
        new Box3().setFromObject(scene.getObjectByName(name), true)
      // The deck's opening: between its jambs, and its face's front plane.
      const left = bounds('slot-left').max.x
      const right = bounds('slot-right').min.x
      const mouth = bounds('player-fascia').max.z
      for (let frame = 0; frame < 600; frame++) {
        // A Canvas render resets the frame loop to its prop; set it each time.
        state.setFrameloop('never')
        state.advance(state.clock.elapsedTime + 1 / 60)
        await new Promise((resolve) => setTimeout(resolve, 0))
        const shell = bounds(`tape-${slug}`)
        // The rack stands behind the deck's face too: count depth only once
        // the shell is lined up with the opening.
        if (shell.min.x < left || shell.max.x > right) continue
        const inside = (mouth - shell.min.z) / (shell.max.z - shell.min.z)
        if (inside >= through) return true
      }
      return false
    },
    { slug, through: THROUGH, FIBER },
  )
  if (!caught)
    throw new Error(`The ${slug} tape never reached the deck; no card written.`)
}

/** Averages a drawing down to the card's size, captured opaque. */
async function writeCard(drawn, file) {
  const card = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  })
  await card.setContent(
    `<body style="margin:0;background:#0e0f12"><img width="${WIDTH}" height="${HEIGHT}" style="display:block" src="data:image/png;base64,${drawn.toString('base64')}"></body>`,
  )
  await card.waitForFunction(() => document.images[0].complete)
  await writeFile(file, await card.screenshot({ type: 'png' }))
  await card.close()
  console.log(`Rendered ${WIDTH} × ${HEIGHT} share card to ${file}`)
}

try {
  const home = await openStudio(true)
  await assertFramed(home, 'the home card')
  await writeCard(await home.screenshot({ type: 'png' }), HOME_CARD)
  // Every tape the archive links to, the same set the build draws pages for.
  const slugs = await home
    .locator('#projects a[href^="/project/"]')
    .evaluateAll((links) =>
      links.map((link) => link.getAttribute('href').split('/').pop()),
    )
  await home.close()

  // Cards of tapes no longer on the shelf go with them.
  await rm(TAPE_CARDS, { recursive: true, force: true })
  await mkdir(TAPE_CARDS, { recursive: true })
  for (const slug of slugs) {
    // A fresh page for each tape, so every other tape is home in the rack.
    const page = await openStudio(false)
    await assertFramed(page, `the ${slug} card`)
    await catchInserting(page, slug)
    await writeCard(
      await page.screenshot({ type: 'png' }),
      fileURLToPath(new URL(`${slug}.png`, TAPE_CARDS)),
    )
    await page.close()
  }
} finally {
  await browser.close()
  await server.close()
}
