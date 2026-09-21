// Rasterizes the touch icon from the favicon's own drawing, so the two
// cannot drift: `npm run render:icons` after editing public/favicon.svg.
// iOS masks the corners itself and paints transparency black, so the PNG is
// the mark on a full-bleed graphite square with no radius of its own.
import { readFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const SIZE = 180
const svg = await readFile(
  new URL('../public/favicon.svg', import.meta.url),
  'utf8',
)
const ground = svg.match(/<rect width="32" height="32"[^>]*fill="([^"]+)"/)?.[1]
if (!ground)
  throw new Error('favicon.svg: no ground rect to read the colour from')
const mark = svg.replace(/(<rect width="32" height="32")[^>]*\/>/, '')

const browser = await chromium.launch({ channel: 'chrome' })
try {
  const page = await browser.newPage({
    viewport: { width: SIZE, height: SIZE },
    deviceScaleFactor: 1,
  })
  // The mark keeps the favicon's proportions inside iOS's safe area.
  await page.setContent(
    `<style>html,body{margin:0;background:${ground}}svg{display:block;width:${SIZE}px;height:${SIZE}px;padding:${SIZE * 0.09}px;box-sizing:border-box}</style>${mark}`,
  )
  await page.screenshot({
    path: new URL('../public/apple-touch-icon.png', import.meta.url).pathname,
    omitBackground: false,
  })
} finally {
  await browser.close()
}
console.log(`public/apple-touch-icon.png ${SIZE}x${SIZE}`)
