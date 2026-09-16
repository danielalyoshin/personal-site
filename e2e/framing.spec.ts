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
