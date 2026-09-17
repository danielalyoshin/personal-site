/* global document, window */
/**
 * Renders the share card, public/social-card.png, from the studio itself:
 * the real scene, at the browse camera, fitted to a 1200 × 630 frame on the
 * page's graphite ground. No copy is set on the image; the card's title and
 * description are the meta tags in index.html.
 *
 * Run `npm run render:card` after the studio's models, materials, lighting,
 * or idle screen change. It starts its own dev server, drives the installed
 * Chrome (as the e2e suite does), draws at twice the size, and averages down
 * so the low-poly edges are clean.
 */
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { createServer } from 'vite'

const WIDTH = 1200
const HEIGHT = 630
const SUPERSAMPLE = 2
const OUTPUT = fileURLToPath(
  new URL('../public/social-card.png', import.meta.url),
)

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
try {
  const url = server.resolvedUrls.local[0]
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: SUPERSAMPLE,
    reducedMotion: 'reduce',
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
  // A reload inside that wait once put the loading screen in the frame.
  // Check what is about to be captured instead of trusting the waits.
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
      'The studio was not ready and framed at capture; no card was written.',
    )
  const drawn = await page.screenshot({ type: 'png' })

  // Average the drawing down to the card's size: shown at half scale on a
  // page with one device pixel per CSS pixel, and captured opaque.
  const card = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  })
  await card.setContent(
    `<body style="margin:0;background:#0e0f12"><img width="${WIDTH}" height="${HEIGHT}" style="display:block" src="data:image/png;base64,${drawn.toString('base64')}"></body>`,
  )
  await card.waitForFunction(() => document.images[0].complete)
  await writeFile(OUTPUT, await card.screenshot({ type: 'png' }))
  console.log(`Rendered ${WIDTH} × ${HEIGHT} share card to ${OUTPUT}`)
} finally {
  await browser.close()
  await server.close()
}
