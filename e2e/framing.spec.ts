import { expect, test, type Page } from '@playwright/test'

// Project real vertices through the live camera, including intermediate frames.
// A visible canvas or readable article alone cannot detect a cropped 3D chassis.
async function inspectFrames(
  page: Page,
  frames: number,
  orbit?: { azimuth: number; polar: number },
) {
  return page.evaluate(
    async ({ frames, orbit }) => {
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
      const controls = state.controls as import('three-stdlib').OrbitControls
      state.setFrameloop('never')
      if (orbit) {
        controls.dispatchEvent({ type: 'start' })
        camera.position
          .setFromSphericalCoords(14, orbit.polar, orbit.azimuth)
          .add(controls.target)
        controls.update()
      }
      const point = new Vector3()
      const bounds = (name: string) => {
        const result = {
          left: Infinity,
          top: Infinity,
          right: -Infinity,
          bottom: -Infinity,
        }
        scene.getObjectByName(name)!.traverse((object) => {
          if (!(object instanceof Mesh)) return
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
      const screen = bounds('crt-screen')
      return {
        monitorMargin,
        studioMargin: Math.min(studio.top, size.height - studio.bottom),
        screenWidth: screen.right - screen.left,
      }
    },
    { frames, orbit },
  )
}

test('the opening studio is closer and preserves headroom throughout its orbit', async ({
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
    expect(initial.screenWidth).toBeGreaterThan(
      viewport.width > 600 ? 145 : 100,
    )
    expect(initial.studioMargin).toBeGreaterThanOrEqual(15)
    for (const azimuth of [-0.45, 0.85]) {
      for (const polar of [0.87, 1.42]) {
        const rotated = await inspectFrames(page, 2, { azimuth, polar })
        expect(rotated.monitorMargin).toBeGreaterThanOrEqual(15)
        expect(rotated.studioMargin).toBeGreaterThanOrEqual(15)
      }
    }
    await page.getByRole('button', { name: 'Reset studio view' }).click()
    const reset = await inspectFrames(page, 2)
    expect(reset.screenWidth).toBeCloseTo(initial.screenWidth, 0)
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
  await page.getByRole('link', { name: 'About me' }).click()
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
  await page.getByRole('link', { name: 'About me' }).click()
  await page.getByRole('button', { name: 'Skip animation' }).click()
  expect((await inspectFrames(page, 2)).monitorMargin).toBeGreaterThanOrEqual(
    15,
  )
  expect(errors).toEqual([])
})
