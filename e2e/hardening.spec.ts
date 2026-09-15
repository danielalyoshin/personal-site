import { expect, test } from '@playwright/test'
import type { CDPSession, Page } from '@playwright/test'

async function holdStudioModule(page: Page, fail = false) {
  let release!: () => void
  let markRequested!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  const requested = new Promise<void>((resolve) => {
    markRequested = resolve
  })
  await page.route(
    '**/src/components/studio/StudioScene.tsx*',
    async (route) => {
      markRequested()
      await gate
      if (fail) await route.abort('failed')
      else await route.continue()
    },
  )
  return { release, requested }
}

async function ready(page: Page) {
  await expect(page.getByTestId('studio-scene')).toHaveAttribute(
    'data-ready',
    'true',
  )
}

for (const fail of [false, true]) {
  test(`a deep link stays readable while the 3D module ${fail ? 'fails' : 'loads'}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const held = await holdStudioModule(page, fail)
    try {
      // DOMContentLoaded must not wait for the deliberately held dynamic import.
      await page.goto('/project/placeholder-alpha', {
        waitUntil: 'domcontentloaded',
      })
      await held.requested
      const reader = page.getByRole('article', {
        name: 'Placeholder: Alpha details',
      })
      await expect(reader).toBeVisible()
      await expect(page.getByTestId('studio-scene')).toHaveAttribute(
        'data-ready',
        'false',
      )
      await expect(page.getByTestId('project-reader')).toHaveCount(0)
      expect((await reader.boundingBox())!.height).toBeGreaterThan(
        page.viewportSize()!.height - 220,
      )
      const originalReader = (await reader.elementHandle())!
      await reader.focus()
      const scrolling = reader.evaluate(
        (el) =>
          new Promise<number>((resolve) => {
            el.addEventListener('scrollend', () => resolve(el.scrollTop), {
              once: true,
            })
          }),
      )
      await page.keyboard.press('PageDown')
      const scrollTop = await scrolling
      expect(scrollTop).toBeGreaterThan(0)

      held.release()
      await ready(page)
      await expect(page.getByRole('article')).toHaveCount(1)
      expect(
        await originalReader.evaluate(
          (el) => el.isConnected && el === document.querySelector('article'),
        ),
      ).toBe(true)
      await expect(reader).toBeFocused()
      expect(await reader.evaluate((el) => el.scrollTop)).toBe(scrollTop)
      await expect(page.getByTestId('project-reader')).toHaveCount(0)

      await page.keyboard.press('Escape')
      await expect(page).toHaveURL('/')
      if (!fail) {
        await expect(page.locator('canvas')).toBeVisible()
        await page
          .getByRole('link', { name: /Play tape: Placeholder: Beta/ })
          .click()
        await expect(page.getByTestId('project-reader')).toBeVisible()
        await expect(
          page.getByRole('heading', { name: /Placeholder: Beta/ }),
        ).toBeVisible()
      } else {
        await expect(page.locator('canvas')).toHaveCount(0)
        await expect(
          page.getByRole('link', { name: /^Play tape:/ }),
        ).toHaveCount(6)
      }
    } finally {
      held.release()
    }
  })
}

test('the HTML archive opens a reader before the graphics module is available', async ({
  page,
}) => {
  const held = await holdStudioModule(page)
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await held.requested
    await page
      .getByRole('link', { name: 'Play tape: Placeholder: Alpha (2026)' })
      .click()
    const reader = page.getByRole('article', {
      name: 'Placeholder: Alpha details',
    })
    await expect(reader).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Skip animation' }),
    ).toHaveCount(0)
    await expect(page.getByTestId('studio-scene')).toHaveAttribute(
      'data-ready',
      'false',
    )
    await page.keyboard.press('Escape')
    await expect(page).toHaveURL('/')
    await page.goBack()
    await expect(page).toHaveURL('/project/placeholder-alpha')
    await expect(reader).toBeVisible()
    await page.goBack()
    await expect(page).toHaveURL('/')
    await page.goForward()
    await expect(page).toHaveURL('/project/placeholder-alpha')
    await expect(reader).toBeVisible()
    const originalReader = (await reader.elementHandle())!
    held.release()
    await ready(page)
    expect(
      await originalReader.evaluate(
        (el) => el.isConnected && el === document.querySelector('article'),
      ),
    ).toBe(true)
    await expect(page.getByTestId('project-reader')).toHaveCount(0)
  } finally {
    held.release()
  }
})

test('About preserves modified-click navigation and animates an ordinary click', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await ready(page)
  const about = page.getByRole('link', { name: 'About me' })
  const [newTab] = await Promise.all([
    page.context().waitForEvent('page'),
    about.click({ modifiers: ['ControlOrMeta'] }),
  ])
  try {
    await expect(newTab).toHaveURL('/project/about')
    await expect(page).toHaveURL('/')
  } finally {
    await newTab.close()
  }
  await page.bringToFront()
  await about.click()
  await expect(page).toHaveURL('/project/about')
  const skip = page.getByRole('button', { name: 'Skip animation' })
  await expect(skip).toBeVisible()
  await skip.click()
  await expect(
    page.getByRole('article', { name: 'Daniel Alyoshin details' }),
  ).toBeVisible()
})

test('CRT contact links have separate touch targets at phone and desktop sizes', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/project/about')
  const reader = page.getByRole('article', { name: 'Daniel Alyoshin details' })
  await expect(reader).toBeVisible()
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport)
    const github = reader.getByRole('link', { name: 'GITHUB ↗', exact: true })
    const linkedin = reader.getByRole('link', {
      name: 'LINKEDIN ↗',
      exact: true,
    })
    await linkedin.scrollIntoViewIfNeeded()
    const first = (await github.boundingBox())!
    const second = (await linkedin.boundingBox())!
    for (const bounds of [first, second]) {
      expect(bounds.width).toBeGreaterThanOrEqual(44)
      expect(bounds.height).toBeGreaterThanOrEqual(44)
    }
    expect(
      first.x + first.width <= second.x ||
        second.x + second.width <= first.x ||
        first.y + first.height <= second.y ||
        second.y + second.height <= first.y,
    ).toBe(true)
  }
})

async function swipe(
  session: CDPSession,
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  const point = (x: number, y: number) => ({
    x,
    y,
    id: 0,
    radiusX: 4,
    radiusY: 4,
    force: 1,
  })
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [point(from.x, from.y)],
  })
  for (let step = 1; step <= 12; step++) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        point(
          from.x + ((to.x - from.x) * step) / 12,
          from.y + ((to.y - from.y) * step) / 12,
        ),
      ],
    })
    // Gesture duration matters to Chrome's native touch-scroll recognition.
    await page.waitForTimeout(20)
  }
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  })
}

async function cameraPosition(page: Page) {
  return page.evaluate(async () => {
    const module = '/node_modules/.vite/deps/@react-three_fiber.js'
    const { _roots } = (await import(
      module
    )) as typeof import('@react-three/fiber')
    return _roots
      .get(document.querySelector('canvas')!)!
      .store.getState()
      .camera.position.toArray()
  })
}

test.describe('touch input in the studio', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })

  test('vertical swipes scroll the page while horizontal drags orbit and tapes remain tappable', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await ready(page)
    const session = await page.context().newCDPSession(page)
    try {
      const canvas = page.locator('canvas')
      let bounds = (await canvas.boundingBox())!
      const originalCamera = await cameraPosition(page)
      const verticalScrolling = page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            document.addEventListener(
              'scrollend',
              () => resolve(window.scrollY),
              {
                once: true,
              },
            )
          }),
      )
      await swipe(
        session,
        page,
        { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height * 0.8 },
        { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height * 0.2 },
      )
      expect(await verticalScrolling).toBeGreaterThan(50)
      await expect(page).toHaveURL('/')
      await page.evaluate(() => window.scrollTo(0, 0))
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
      bounds = (await canvas.boundingBox())!
      const initialCamera = await cameraPosition(page)
      await swipe(
        session,
        page,
        {
          x: bounds.x + bounds.width * 0.75,
          y: bounds.y + bounds.height * 0.3,
        },
        { x: bounds.x + bounds.width * 0.3, y: bounds.y + bounds.height * 0.3 },
      )
      await expect
        .poll(async () => {
          const next = await cameraPosition(page)
          return Math.hypot(
            ...next.map((value, index) => value - initialCamera[index]),
          )
        })
        .toBeGreaterThan(0.05)
      await expect(page).toHaveURL('/')
      expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5)

      await page.getByRole('button', { name: 'Reset studio view' }).click()
      await expect
        .poll(async () => {
          const next = await cameraPosition(page)
          return Math.hypot(
            ...next.map((value, index) => value - originalCamera[index]),
          )
        })
        .toBeLessThan(0.01)
      const tapePoint = await page.evaluate(async () => {
        const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
        const threeModule = '/node_modules/.vite/deps/three.js'
        const { _roots } = (await import(
          fiberModule
        )) as typeof import('@react-three/fiber')
        const { Box3, Vector3 } = (await import(
          threeModule
        )) as typeof import('three')
        const canvas = document.querySelector('canvas')!
        const state = _roots.get(canvas)!.store.getState()
        const tape = state.scene.getObjectByName('tape-placeholder-alpha')!
        const center = new Box3().setFromObject(tape).getCenter(new Vector3())
        center.project(state.camera)
        const rect = canvas.getBoundingClientRect()
        return {
          x: rect.x + ((center.x + 1) / 2) * rect.width,
          y: rect.y + ((1 - center.y) / 2) * rect.height,
        }
      })
      await page.touchscreen.tap(tapePoint.x, tapePoint.y)
      await expect(page).toHaveURL('/project/placeholder-alpha')
      await expect(
        page.getByRole('article', { name: 'Placeholder: Alpha details' }),
      ).toBeVisible()
    } finally {
      await session.detach()
    }
  })
})
