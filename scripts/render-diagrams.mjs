/* global document, getComputedStyle */
/**
 * Renders every diagram source in src/content/projects/media/ (an .html
 * file with a `#diagram` element) to a WebP of the same name beside it,
 * with the site's own fonts and palette: the sources import Archivo and
 * tokens.css through Vite, as the app does, so the image is set in the
 * page's type and takes the tube's colours from the one palette.
 *
 * Run `npm run render:diagrams` after editing a source, then copy the
 * printed size into the tape's `media` entry. It starts its own dev server
 * and drives the installed Chrome, as the e2e suite does. Diagrams are drawn
 * at 3.25×, so a 640px drawing is 2080px across and a 360px one (a phone's,
 * shown at up to about 1.5× in a column just under 640px) is 1170px: both sharp on
 * a high-density screen.
 *
 * Chrome's capture is a PNG about three times the size it needs to be, and
 * its own WebP encoder is either lossy or larger still, so the capture is
 * re-encoded losslessly with libwebp's `cwebp` (`brew install webp`): the
 * same pixels in about a third of the bytes.
 */
import { execFile } from 'node:child_process'
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { chromium } from '@playwright/test'
import { createServer } from 'vite'

const run = promisify(execFile)
const SCALE = 3.25
// Heights are rounded up to a multiple of this, so the drawing lands on
// whole device pixels at SCALE and the image is exactly the size printed.
const STEP = 4
const MEDIA = new URL('../src/content/projects/media/', import.meta.url)

const sources = (await readdir(MEDIA)).filter((f) => f.endsWith('.html'))
if (sources.length === 0) throw new Error('No diagram sources to render.')
await run('cwebp', ['-version']).catch(() => {
  throw new Error('cwebp encodes the diagrams: brew install webp')
})

const scratch = await mkdtemp(join(tmpdir(), 'diagrams-'))
const server = await createServer({
  root: fileURLToPath(new URL('..', import.meta.url)),
  logLevel: 'warn',
  server: { port: 5187, host: '127.0.0.1' },
})
await server.listen()
const browser = await chromium.launch({ channel: 'chrome' })
try {
  const base = server.resolvedUrls.local[0]
  const page = await browser.newPage({
    viewport: { width: 800, height: 800 },
    deviceScaleFactor: SCALE,
  })
  for (const source of sources) {
    await page.goto(new URL(`src/content/projects/media/${source}`, base).href)
    // The palette and fonts arrive as modules: wait until the tube's ground
    // is painted and Archivo is registered and loaded, then for every face
    // the drawing uses, before measuring it.
    await page.waitForFunction(async () => {
      const d = document.querySelector('#diagram')
      if (!d || getComputedStyle(d).backgroundColor === 'rgba(0, 0, 0, 0)')
        return false
      const faces = await document.fonts.load('600 17px "Archivo Variable"')
      return faces.length > 0
    })
    await page.evaluate(() => document.fonts.ready)
    const size = await page.evaluate((step) => {
      const d = document.querySelector('#diagram')
      d.style.height = ''
      const { width, height } = d.getBoundingClientRect()
      d.style.height = `${Math.ceil(height / step) * step}px`
      return { width, height: Math.ceil(height / step) * step }
    }, STEP)
    if (!Number.isInteger(size.width * SCALE))
      throw new Error(
        `${source}: ${size.width}px does not scale to whole pixels`,
      )
    const capture = join(scratch, 'capture.png')
    await writeFile(
      capture,
      await page.locator('#diagram').screenshot({ type: 'png' }),
    )
    const output = fileURLToPath(
      new URL(source.replace(/\.html$/, '.webp'), MEDIA),
    )
    await run('cwebp', [
      '-quiet',
      '-lossless',
      '-z',
      '9',
      capture,
      '-o',
      output,
    ])
    console.log(`${output} ${size.width * SCALE} × ${size.height * SCALE}`)
  }
} finally {
  await browser.close()
  await server.close()
  await rm(scratch, { recursive: true, force: true })
}
