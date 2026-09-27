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
          .querySelector<HTMLAnchorElement>('a[href="/project/superset-d1"]')!
          .click()
      if (act === 'eject')
        document
          .querySelector<HTMLButtonElement>('button[aria-label="Eject tape"]')!
          .click()
      if (act === 'escape')
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }),
        )
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
  // The studio fills the first screen, so the page runs only a little
  // further: keep whatever scroll the page allows, as long as it moved.
  const scrolled = await page.evaluate(() => {
    window.scrollTo(0, 160)
    return window.scrollY
  })
  expect(scrolled).toBeGreaterThan(0)
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
  expect(await page.evaluate(() => window.scrollY)).toBe(scrolled)
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
})

test('a keyboard eject that brings the tape link into view still lands the studio softly in its box', async ({
  page,
}) => {
  test.setTimeout(90_000)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  // The index runs past the foot of this viewport, so the restored link is
  // not wholly on screen.
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await expect(page.getByTestId('studio-scene')).toHaveAttribute(
    'data-ready',
    'true',
  )
  const rest = (await sampleFrames(page, 60)).at(-1)!
  await sampleFrames(page, 200, 'select')
  await expect(page.locator('article h2')).toBeFocused()
  const dolly = await sampleFrames(page, 60)

  const ejection = await sampleFrames(page, 200, 'escape')
  await expect(page).toHaveURL('/')
  // The page moved under the dissolved chrome to show the focused link...
  const moved = await page.evaluate(() => window.scrollY)
  expect(moved).toBeGreaterThan(0)
  const link = page.getByRole('link', {
    name: 'Play tape: 01 SUPERSET D1 Cloudflare D1 in Apache Superset (2026)',
    exact: true,
  })
  await expect(link).toBeFocused()
  expect(
    await link.evaluate((el) => {
      const rect = el.getBoundingClientRect()
      return rect.top >= 0 && rect.bottom <= window.innerHeight
    }),
  ).toBe(true)
  // ...and the studio never jumped: it eased from the screen into its box,
  // which now sits that much higher on the viewport.
  expectContinuity([dolly.at(-1)!, ...ejection], 'ejection')
  const landing = ejection.at(-1)!
  expect(landing.detached).toBe(false)
  expect(landing.chromeOpacity).toBe(1)
  expect(Math.abs(landing.x - rest.x)).toBeLessThan(1.5)
  expect(Math.abs(landing.y - (rest.y - moved))).toBeLessThan(1.5)
  expect(landing.zoom / rest.zoom).toBeCloseTo(1, 2)
})

test('a hover as the studio lands back on the page keeps the renderer in its box', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await expect(page.getByTestId('studio-scene')).toHaveAttribute(
    'data-ready',
    'true',
  )
  await page.locator('a[href="/project/superset-d1"]').click()
  await expect(
    page.getByRole('button', { name: 'Eject tape', exact: true }),
  ).toBeVisible()
  // Record every frame's renderer size against the layer it draws in. The
  // moment the layer rejoins the page, hover the other tape's index entry:
  // the page renders, and with it the canvas, which applies its own
  // measurement of the box again. Still the viewport's, that measurement
  // put the old box back for a frame or two, a jump and a jump back.
  await page.evaluate(async () => {
    const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
    const { _roots } = (await import(
      fiberModule
    )) as typeof import('@react-three/fiber')
    const root = _roots.get(document.querySelector('canvas')!)!.store
    const scene = document.querySelector('[data-testid="studio-scene"]')!
    const recorder = window as Window & {
      __landing?: { rejoined: boolean; size: number[]; box: number[] }[]
    }
    const frames: NonNullable<typeof recorder.__landing> = []
    recorder.__landing = frames
    let rejoined = false
    root.getState().internal.subscribers.push({
      ref: {
        current: (state) => {
          const box = state.gl.domElement.parentElement!.getBoundingClientRect()
          frames.push({
            rejoined,
            size: [state.size.width, state.size.height],
            box: [box.width, box.height],
          })
        },
      },
      priority: 0,
      store: root,
    })
    new MutationObserver((_, watch) => {
      if (scene.hasAttribute('data-detached')) return
      watch.disconnect()
      rejoined = true
      document
        .querySelector('#projects a[href="/project/about"]')!
        .dispatchEvent(new PointerEvent('pointerover', { bubbles: true }))
    }).observe(scene, { attributes: true, attributeFilter: ['data-detached'] })
  })
  await page.getByRole('button', { name: 'Eject tape', exact: true }).click()
  await expect(page.getByTestId('studio-scene')).not.toHaveAttribute(
    'data-detached',
  )
  // The hover landed: the entry is previewed, so the page did render.
  await expect(page.locator('#projects a[href="/project/about"]')).toHaveClass(
    /previewed/,
  )
  await page.waitForTimeout(400)
  const landing = await page.evaluate(() =>
    (
      window as Window & {
        __landing?: { rejoined: boolean; size: number[]; box: number[] }[]
      }
    ).__landing!.filter((frame) => frame.rejoined),
  )
  expect(landing.length).toBeGreaterThan(3)
  for (const [i, frame] of landing.entries())
    expect(frame.size, `frame ${i} after the rejoin`).toEqual(frame.box)
})
