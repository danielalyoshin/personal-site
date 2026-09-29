import { expect, test, type Page } from '@playwright/test'

// Project real vertices through the live camera, including intermediate frames.
// A visible canvas or readable article alone cannot detect a cropped 3D chassis.
async function inspectFrames(page: Page, frames: number) {
  return page.evaluate(
    async ({ frames }) => {
      const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
      const threeModule = '/node_modules/.vite/deps/three.js'
      const { _roots } = (await import(
        fiberModule
      )) as typeof import('@react-three/fiber')
      const { Mesh, Vector3 } = (await import(
        threeModule
      )) as typeof import('three')
      const state = _roots
        .get(document.querySelector('canvas')!)!
        .store.getState()
      const { camera, scene, size } = state
      state.setFrameloop('never')
      const point = new Vector3()
      const bounds = (name: string, except?: string) => {
        const result = {
          left: Infinity,
          top: Infinity,
          right: -Infinity,
          bottom: -Infinity,
        }
        scene.getObjectByName(name)!.traverse((object) => {
          // Pointer targets are invisible slot boxes; the framing skips them too.
          if (!(object instanceof Mesh) || !object.visible) return
          for (let parent = object.parent; parent; parent = parent.parent)
            if (parent.name === except) return
          const positions = object.geometry.attributes.position
          for (let i = 0; i < positions.count; i++) {
            point
              .fromBufferAttribute(positions, i)
              .applyMatrix4(object.matrixWorld)
              .project(camera)
            const x = ((point.x + 1) * size.width) / 2
            const y = ((1 - point.y) * size.height) / 2
            result.left = Math.min(result.left, x)
            result.right = Math.max(result.right, x)
            result.top = Math.min(result.top, y)
            result.bottom = Math.max(result.bottom, y)
          }
        })
        return result
      }
      let monitorMargin = Infinity
      for (let frame = 0; frame < frames; frame++) {
        state.advance(state.clock.elapsedTime + 1 / 60)
        const monitor = bounds('crt-monitor')
        monitorMargin = Math.min(
          monitorMargin,
          monitor.left,
          monitor.top,
          size.width - monitor.right,
          size.height - monitor.bottom,
        )
      }
      const studio = bounds('studio-model')
      // Every object except the table, which may run out of a phone frame.
      const equipment = bounds('studio-model', 'studio-table')
      const screen = bounds('crt-screen')
      return {
        monitorMargin,
        studioMargin: Math.min(studio.top, size.height - studio.bottom),
        equipmentMargin: Math.min(equipment.left, size.width - equipment.right),
        screenWidth: screen.right - screen.left,
      }
    },
    { frames },
  )
}

test('the opening studio keeps every object in frame with headroom at every width', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await expect(page.getByTestId('studio-scene')).toHaveAttribute(
      'data-ready',
      'true',
    )
    const initial = await inspectFrames(page, 2)
    // Phones fit the speaker and headphones too, so the screen is smaller
    // there; the floor still keeps the idle message legible.
    expect(initial.screenWidth).toBeGreaterThan(
      viewport.width > 600 ? 145 : viewport.width > 360 ? 100 : 80,
    )
    expect(initial.studioMargin).toBeGreaterThanOrEqual(15)
    expect(initial.equipmentMargin).toBeGreaterThanOrEqual(15)
    expect(initial.monitorMargin).toBeGreaterThanOrEqual(15)
    // The view is authored, not orbited: later frames hold the same fit.
    const settled = await inspectFrames(page, 6)
    expect(settled.screenWidth).toBeCloseTo(initial.screenWidth, 0)
  }
})

test('the CRT stays inside the canvas during insertion, playback zoom, resize and eject', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByTestId('studio-scene')).toHaveAttribute(
    'data-ready',
    'true',
  )
  await inspectFrames(page, 80, { azimuth: 0.85, polar: 0.87 })
  await page.getByRole('link', { name: 'About', exact: true }).click()
  expect((await inspectFrames(page, 150)).monitorMargin).toBeGreaterThanOrEqual(
    15,
  )
  await expect(page.locator('article h2')).toBeFocused()
  expect((await inspectFrames(page, 100)).monitorMargin).toBeGreaterThanOrEqual(
    15,
  )
  await page.setViewportSize({ width: 1024, height: 720 })
  await expect(page.locator('canvas')).toHaveCSS('width', '1024px')
  expect((await inspectFrames(page, 80)).monitorMargin).toBeGreaterThanOrEqual(
    15,
  )
  await page.keyboard.press('Escape')
  await expect(page.locator('canvas')).not.toHaveCSS('width', '1024px')
  expect((await inspectFrames(page, 100)).monitorMargin).toBeGreaterThanOrEqual(
    15,
  )
  await page.getByRole('link', { name: 'About', exact: true }).click()
  await page.getByRole('button', { name: 'Skip animation' }).click()
  expect((await inspectFrames(page, 2)).monitorMargin).toBeGreaterThanOrEqual(
    15,
  )
  expect(errors).toEqual([])
})

/**
 * How far the words stand from the equipment, in page pixels: the boxes of
 * the introduction and the guide against the projected monitor, tapes and
 * headphones. Negative when they overlap.
 */
async function wordsClearance(page: Page) {
  return page.evaluate(async () => {
    const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
    const threeModule = '/node_modules/.vite/deps/three.js'
    const { _roots } = (await import(
      fiberModule
    )) as typeof import('@react-three/fiber')
    const { Mesh, Vector3 } = (await import(
      threeModule
    )) as typeof import('three')
    const canvas = document.querySelector('canvas')!
    const state = _roots.get(canvas)!.store.getState()
    state.setFrameloop('never')
    state.advance(state.clock.elapsedTime + 1 / 60)
    const { camera, scene, size } = state
    const origin = canvas.getBoundingClientRect()
    const point = new Vector3()
    const project = (named: (name: string) => boolean) => {
      const box = {
        left: Infinity,
        top: Infinity,
        right: -Infinity,
        bottom: -Infinity,
      }
      scene.traverse((group) => {
        if (!named(group.name)) return
        group.traverse((object) => {
          if (!(object instanceof Mesh) || !object.visible) return
          const positions = object.geometry.attributes.position
          for (let i = 0; i < positions.count; i++) {
            point
              .fromBufferAttribute(positions, i)
              .applyMatrix4(object.matrixWorld)
              .project(camera)
            const x = origin.left + ((point.x + 1) * size.width) / 2
            const y = origin.top + ((1 - point.y) * size.height) / 2
            box.left = Math.min(box.left, x)
            box.right = Math.max(box.right, x)
            box.top = Math.min(box.top, y)
            box.bottom = Math.max(box.bottom, y)
          }
        })
      })
      return box
    }
    const equipment = [
      project((name) => name === 'crt-monitor'),
      project((name) => name === 'headphones-and-stand'),
      project((name) => /^tape-/.test(name)),
    ]
    const studio = document.querySelector('[data-testid="studio-scene"]')!
    const words = [
      document.getElementById('intro-title')!.closest('section')!,
      studio.previousElementSibling!,
    ].map((el) => el.getBoundingClientRect())
    // The gap between two boxes: the larger of the horizontal and vertical
    // gaps, negative only when the boxes overlap.
    let clearance = Infinity
    for (const a of words)
      for (const b of equipment)
        clearance = Math.min(
          clearance,
          Math.max(
            b.left - a.right,
            a.left - b.right,
            b.top - a.bottom,
            a.top - b.bottom,
          ),
        )
    return {
      clearance,
      beside: words[0].top >= origin.top,
      above: words[1].bottom <= origin.top,
      // The studio's box ends at or above the fold.
      inFirstScreen: origin.bottom <= window.innerHeight + 0.5,
    }
  })
}

test('beside the studio, the words never stand over the equipment', async ({
  page,
}) => {
  test.setTimeout(90_000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  // The rule covers every window at least 768px wide and 540px tall, and
  // windows under 540px tall but at least 740px wide (phones on their side),
  // where the words stand beside the studio. The tightest fits: wide windows
  // with the tall display size and with the short one, wide and short ones
  // where the fold sets the fit, narrow ones where the box grows taller than
  // the studio's proportion, narrow and short ones where the words close up,
  // down to the corner of the mobile breakpoint, and phones on their side
  // down to the narrowest.
  for (const viewport of [
    { width: 1920, height: 700 },
    { width: 1440, height: 1000 },
    { width: 1366, height: 657 },
    { width: 1280, height: 1024 },
    { width: 1280, height: 700 },
    { width: 1280, height: 600 },
    { width: 1280, height: 540 },
    { width: 1024, height: 1366 },
    { width: 1024, height: 768 },
    { width: 940, height: 700 },
    { width: 939, height: 700 },
    { width: 900, height: 700 },
    { width: 939, height: 599 },
    { width: 939, height: 540 },
    { width: 900, height: 540 },
    { width: 768, height: 1024 },
    { width: 768, height: 600 },
    { width: 768, height: 540 },
    { width: 1280, height: 539 },
    { width: 1280, height: 500 },
    { width: 932, height: 430 },
    { width: 844, height: 390 },
    { width: 740, height: 360 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await expect(page.getByTestId('studio-scene')).toHaveAttribute(
      'data-ready',
      'true',
    )
    const idle = await wordsClearance(page)
    expect(idle.beside, `${viewport.width}×${viewport.height}`).toBe(true)
    expect(idle.clearance).toBeGreaterThanOrEqual(12)
    // The studio takes the first screen at every size: a window both narrow
    // and short closes up its words rather than run the box past the fold.
    expect(idle.inFirstScreen, `${viewport.width}×${viewport.height}`).toBe(
      true,
    )
    // A preview lifts a tape toward the words and gives the guide its
    // longest line: SUPERSET D1 rises nearest the words, About beside them.
    for (const slot of ['01', '06']) {
      await page
        .getByRole('link', { name: new RegExp(`^Play tape: ${slot} `) })
        .evaluate((el) => (el as HTMLElement).focus({ preventScroll: true }))
      await expect(page.getByText(/· Select to play$/)).toBeVisible()
      expect(
        (await wordsClearance(page)).clearance,
        `${viewport.width}×${viewport.height}, tape ${slot} lifted`,
      ).toBeGreaterThanOrEqual(12)
    }
  }
  // Below 768px wide, or below 740px wide on a short window, the mobile look
  // stands the words above the studio instead; there is no stacked version
  // of the look above.
  for (const viewport of [
    { width: 767, height: 1024 },
    { width: 739, height: 390 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await expect(page.getByTestId('studio-scene')).toHaveAttribute(
      'data-ready',
      'true',
    )
    const mobile = await wordsClearance(page)
    expect(mobile.above).toBe(true)
    expect(mobile.clearance).toBeGreaterThanOrEqual(12)
  }
})
