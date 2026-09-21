import { expect, test } from '@playwright/test'
import type { CanvasTexture, WebGLRenderer } from 'three'

interface TextureSample {
  texture: CanvasTexture
  pixels: string
  version: number
}

declare global {
  interface Window {
    studioFontProbe: {
      active: TextureSample[]
      oldScreen: TextureSample
      disposed: boolean
      renderer: WebGLRenderer
      frame: number
    }
  }
}

test('cold-cache fonts redraw live labels and the current preview without reviving disposed maps', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let releaseFonts!: () => void
  const fontGate = new Promise<void>((resolve) => {
    releaseFonts = resolve
  })
  const requests: string[] = []
  // Routing disables the HTTP cache; fonts remain pending while the real
  // studio mounts and the visitor changes the CRT preview twice.
  await page.route(/\.woff2?(?:\?|$)/, async (route) => {
    requests.push(route.request().url())
    await fontGate
    await route.continue()
  })

  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByTestId('studio-scene')).toHaveAttribute(
      'data-ready',
      'true',
    )
    await expect
      .poll(() => requests.some((url) => url.includes('vt323')))
      .toBe(true)
    expect(requests.some((url) => url.includes('archivo'))).toBe(true)
    expect(
      await page.evaluate(() => document.fonts.check('16px "VT323"')),
    ).toBe(false)

    await page.evaluate(async () => {
      const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
      const { _roots } = (await import(
        fiberModule
      )) as typeof import('@react-three/fiber')
      const state = _roots
        .get(document.querySelector('canvas')!)!
        .store.getState()
      let screen: CanvasTexture | undefined
      state.scene.traverse((node) => {
        const mesh = node as import('three').Mesh
        if (!mesh.isMesh) return
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material]
        for (const material of materials) {
          const map = (material as import('three').MeshBasicMaterial).map
          if (
            map?.image instanceof HTMLCanvasElement &&
            map.image.width === 1024 &&
            map.image.height === 768
          )
            screen = map as CanvasTexture
        }
      })
      if (!screen) throw new Error('The idle CRT canvas map was not mounted')
      window.studioFontProbe = {
        active: [],
        oldScreen: {
          texture: screen,
          pixels: (screen.image as HTMLCanvasElement).toDataURL(),
          version: screen.version,
        },
        disposed: false,
        renderer: state.gl,
        frame: state.gl.info.render.frame,
      }
      screen.addEventListener('dispose', () => {
        window.studioFontProbe.disposed = true
      })
    })

    await page.getByRole('link', { name: /Play tape: 01 ALPHA/ }).focus()
    await page.getByRole('link', { name: /Play tape: 02 BETA/ }).focus()
    await expect
      .poll(() => page.evaluate(() => window.studioFontProbe.disposed))
      .toBe(true)

    const sizes = await page.evaluate(async () => {
      const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
      const { _roots } = (await import(
        fiberModule
      )) as typeof import('@react-three/fiber')
      const state = _roots
        .get(document.querySelector('canvas')!)!
        .store.getState()
      const textures = new Map<CanvasTexture, string>()
      state.scene.traverse((node) => {
        const mesh = node as import('three').Mesh<import('three').PlaneGeometry>
        if (!mesh.isMesh) return
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material]
        for (const material of materials) {
          const map = (material as import('three').MeshBasicMaterial).map
          if (!(map?.image instanceof HTMLCanvasElement)) continue
          // Every canvas print lies on a plane cut to the same proportions.
          const { width, height } = mesh.geometry.parameters
          const stretch =
            map.image.width / map.image.height / (width / height) - 1
          textures.set(
            map as CanvasTexture,
            `${map.image.width}×${map.image.height}${
              Math.abs(stretch) > 0.03 ? ` stretched ${stretch.toFixed(2)}` : ''
            }`,
          )
        }
      })
      window.studioFontProbe.active = [...textures.keys()].map((texture) => ({
        texture,
        pixels: (texture.image as HTMLCanvasElement).toDataURL(),
        version: texture.version,
      }))
      return [...textures.values()]
    })
    expect(sizes).toEqual(expect.arrayContaining(['192×966', '1024×768']))
    expect(sizes.filter((size) => size.includes('stretched'))).toEqual([])
    // The deck's status window, model line, and two cap labels are prints too.
    expect(sizes.length).toBeGreaterThanOrEqual(6)
    // Let the reduced-motion preview frame finish before font release, so
    // the next frame must be requested by the font-driven texture update.
    await page.waitForTimeout(150)
    await page.evaluate(() => {
      const probe = window.studioFontProbe
      probe.frame = probe.renderer.info.render.frame
    })
    releaseFonts()
    await page.evaluate(() => document.fonts.ready)

    await expect
      .poll(() =>
        page.evaluate(() =>
          window.studioFontProbe.active.every(
            ({ texture, version, pixels }) =>
              texture.version > version &&
              (texture.image as HTMLCanvasElement).toDataURL() !== pixels,
          ),
        ),
      )
      .toBe(true)
    await expect
      .poll(() =>
        page.evaluate(() => {
          const probe = window.studioFontProbe
          return probe.renderer.info.render.frame > probe.frame
        }),
      )
      .toBe(true)
    expect(
      await page.evaluate(() => {
        const { oldScreen } = window.studioFontProbe
        return {
          versionUnchanged: oldScreen.texture.version === oldScreen.version,
          pixelsUnchanged:
            (oldScreen.texture.image as HTMLCanvasElement).toDataURL() ===
            oldScreen.pixels,
          fontsLoaded:
            document.fonts.check('500 16px "Archivo Variable"') &&
            document.fonts.check('16px "VT323"'),
        }
      }),
    ).toEqual({
      versionUnchanged: true,
      pixelsUnchanged: true,
      fontsLoaded: true,
    })
    expect(errors).toEqual([])
  } finally {
    releaseFonts()
  }
})
