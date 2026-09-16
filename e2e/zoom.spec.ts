import { expect, test, type Page } from '@playwright/test'

interface Sample {
  /** The screen's centre on the page, in viewport pixels. */
  x: number
  y: number
  zoom: number
  detached: boolean
  /** The canvas fills its layer: a stale drawing would paint at the wrong size. */
  canvasFillsLayer: boolean
  chromeOpacity: number
}

// Record every drawn frame from inside the render loop, whether the test
// stepped it or the renderer ran it after a commit, and step frames by hand
// with a yield between them so React can commit the box changes that the
// resize observer and the router deliver.
async function sampleFrames(page: Page, frames: number, act?: string) {
  return page.evaluate(
    async ({ frames, act }) => {
      const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
      const threeModule = '/node_modules/.vite/deps/three.js'
      const { _roots } = (await import(
        fiberModule
      )) as typeof import('@react-three/fiber')
      const { Vector3 } = (await import(threeModule)) as typeof import('three')
      const root = _roots.get(document.querySelector('canvas')!)!.store
      const recorder = window as Window & { __zoomSamples?: Sample[] }
      if (!recorder.__zoomSamples) {
        const samples: Sample[] = (recorder.__zoomSamples = [])
        const point = new Vector3()
        root.getState().internal.subscribers.push({
          ref: {
            current: (state) => {
              const canvas = state.gl.domElement
              const layer = canvas.parentElement!.parentElement!
              const rect = canvas.getBoundingClientRect()
              const layerRect = layer.getBoundingClientRect()
              state.scene
                .getObjectByName('crt-screen')!
                .getWorldPosition(point)
                .project(state.camera)
              samples.push({
                x: rect.x + ((point.x + 1) * rect.width) / 2,
                y: rect.y + ((1 - point.y) * rect.height) / 2,
                zoom: state.camera.zoom,
                detached: !!document
                  .querySelector('[data-testid="studio-scene"]')!
                  .getAttribute('data-detached'),
                canvasFillsLayer:
                  Math.abs(rect.width - layerRect.width) < 1 &&
                  Math.abs(rect.height - layerRect.height) < 1 &&
                  Math.abs(rect.x - layerRect.x) < 1 &&
                  Math.abs(rect.y - layerRect.y) < 1,
                chromeOpacity: Number(
                  getComputedStyle(document.querySelector('header')!).opacity,
                ),
              })
            },
          },
          priority: 0,
          store: root,
        })
      }
      recorder.__zoomSamples.length = 0
      if (act === 'select')
        document
          .querySelector<HTMLAnchorElement>(
            'a[href="/project/placeholder-alpha"]',
          )!
          .click()
      if (act === 'eject')
        document
          .querySelector<HTMLButtonElement>('button[aria-label="Eject tape"]')!
          .click()
      for (let frame = 0; frame < frames; frame++) {
        await new Promise((resolve) => setTimeout(resolve, 0))
        const state = root.getState()
        state.setFrameloop('never')
        state.advance(state.clock.elapsedTime + 1 / 60)
      }
      return recorder.__zoomSamples.splice(0)
    },
    { frames, act },
  )
}

// A snap moved the screen by hundreds of pixels and scaled it by half or
// double in one frame; a soft move steps a few pixels and a few percent,
// and even a long frame during the dolly stays well inside these bounds.
function expectContinuity(samples: Sample[], label: string) {
  for (let i = 1; i < samples.length; i++) {
    const from = samples[i - 1]
    const to = samples[i]
    const moved = Math.hypot(to.x - from.x, to.y - from.y)
    expect(
      moved,
      `${label}: frame ${i} moved ${moved.toFixed(1)}px`,
    ).toBeLessThan(60)
    const scaled = to.zoom / from.zoom
    expect(
      scaled,
      `${label}: frame ${i} scaled ${scaled.toFixed(3)}`,
    ).toBeLessThan(1.3)
    expect(
      scaled,
      `${label}: frame ${i} scaled ${scaled.toFixed(3)}`,
    ).toBeGreaterThan(0.75)
    expect(to.canvasFillsLayer, `${label}: frame ${i} canvas box`).toBe(true)
  }
}

test('selection and eject zoom the studio softly between its box and the viewport', async ({
  page,
}) => {
  test.setTimeout(90_000)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await expect(page.getByTestId('studio-scene')).toHaveAttribute(
    'data-ready',
    'true',
  )
  // Rest with the archive in view, as a visitor who scrolled to it would.
  await page.evaluate(() => window.scrollTo(0, 160))
  const rest = (await sampleFrames(page, 60)).at(-1)!
  expect(rest.detached).toBe(false)
  expect(rest.chromeOpacity).toBe(1)

  const insertion = await sampleFrames(page, 200, 'select')
  const detachedAt = insertion.findIndex((sample) => sample.detached)
  expect(detachedAt).toBeGreaterThanOrEqual(0)
  // The first frame over the viewport draws the studio exactly where the box
  // had it; then it grows and the page dissolves around it.
  const departure = insertion[detachedAt]
  expect(Math.hypot(departure.x - rest.x, departure.y - rest.y)).toBeLessThan(
    1.5,
  )
  expect(departure.zoom / rest.zoom).toBeCloseTo(1, 2)
  expectContinuity([rest, ...insertion], 'insertion')
  expect(insertion.at(-1)!.zoom).toBeGreaterThan(rest.zoom * 1.3)
  expect(insertion.at(-1)!.chromeOpacity).toBe(0)
  expect(insertion.slice(detachedAt).every((sample) => sample.detached)).toBe(
    true,
  )
  await expect(page.locator('article h2')).toBeFocused()
  // The dolly onto the screen eases as well.
  const dolly = await sampleFrames(page, 60)
  expectContinuity([insertion.at(-1)!, ...dolly], 'dolly')

  const ejection = await sampleFrames(page, 160, 'eject')
  await expect(page).toHaveURL('/')
  expectContinuity([dolly.at(-1)!, ...ejection], 'ejection')
  const returnedAt = ejection.findIndex((sample) => !sample.detached)
  expect(returnedAt).toBeGreaterThan(5)
  // Back in the box, drawn where it was before the tape was chosen, with the
  // page in place around it.
  const landing = ejection.at(-1)!
  expect(Math.hypot(landing.x - rest.x, landing.y - rest.y)).toBeLessThan(1.5)
  expect(landing.zoom / rest.zoom).toBeCloseTo(1, 2)
  expect(landing.chromeOpacity).toBe(1)
  expect(await page.evaluate(() => window.scrollY)).toBe(160)
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
})
