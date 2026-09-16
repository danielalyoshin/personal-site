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
      const depth = await reader.evaluate(
        (el) => el.scrollTop / (el.scrollHeight - el.clientHeight),
      )

      held.release()
      await ready(page)
      if (fail) {
        // Without graphics the same native article stays, focus and scroll
        // untouched.
        await expect(page.getByRole('article')).toHaveCount(1)
        expect(
          await originalReader.evaluate(
            (el) => el.isConnected && el === document.querySelector('article'),
          ),
        ).toBe(true)
        await expect(reader).toBeFocused()
        expect(await reader.evaluate((el) => el.scrollTop)).toBe(scrollTop)
        await expect(page.getByTestId('project-reader')).toHaveCount(0)
      } else {
        // A ready desktop scene takes over: reading continues on the modeled
        // screen at the same depth, with focus still in the article.
        const modeled = page
          .getByTestId('project-reader')
          .getByRole('article', { name: 'Placeholder: Alpha details' })
        await expect(modeled).toBeVisible()
        await expect(page.getByTestId('native-reader')).toHaveCount(0)
        expect(await originalReader.evaluate((el) => el.isConnected)).toBe(
          false,
        )
        await expect(modeled).toBeFocused()
        expect(
          await modeled.evaluate(
            (el) => el.scrollTop / (el.scrollHeight - el.clientHeight),
          ),
        ).toBeCloseTo(depth, 1)
      }

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
        ).toHaveCount(4)
      }
    } finally {
      held.release()
    }
  })
}

test('a desktop deep link dissolves onto the modeled screen once the scene is ready', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const held = await holdStudioModule(page)
  try {
    await page.goto('/project/placeholder-alpha', {
      waitUntil: 'domcontentloaded',
    })
    await held.requested
    const native = page.getByTestId('native-reader')
    await expect(
      native.getByRole('article', { name: 'Placeholder: Alpha details' }),
    ).toBeVisible()
    await expect(native.locator('h2').first()).toBeFocused()

    held.release()
    await ready(page)
    // The outgoing frame stays on stage for one dissolve, hidden from
    // assistive tech; the modeled screen behind it already holds focus.
    await expect(native).toHaveAttribute(
      'data-handoff',
      /pending|settled|fading/,
    )
    await expect(native).toHaveAttribute('aria-hidden', 'true')
    const modeled = page.getByTestId('project-reader')
    await expect(modeled).toBeVisible()
    await expect(modeled.locator('h2')).toBeFocused()
    await expect(native).toHaveAttribute('data-handoff', 'fading')
    expect(
      await native.evaluate((el) => ({
        inert: (el as HTMLElement).inert,
        transition: getComputedStyle(el).transitionDuration,
        dissolving: el
          .getAnimations()
          .some(
            (animation) =>
              animation instanceof CSSTransition &&
              animation.transitionProperty === 'opacity',
          ),
      })),
    ).toEqual({ inert: true, transition: '0.56s', dissolving: true })
    // The tape was seated and the flap closed before the reveal: no mechanism
    // plays for a link that arrives already inserted.
    expect(
      await page.evaluate(async () => {
        const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
        const threeModule = '/node_modules/.vite/deps/three.js'
        const { _roots } = (await import(
          fiberModule
        )) as typeof import('@react-three/fiber')
        const { Box3 } = (await import(threeModule)) as typeof import('three')
        const { scene } = _roots
          .get(document.querySelector('canvas')!)!
          .store.getState()
        const tape = scene.getObjectByName('tape-placeholder-alpha')!
        const player = scene.getObjectByName('vhs-player')!
        const flap = scene.getObjectByName('player-flap')!
        return {
          seatedInside: new Box3()
            .setFromObject(player, true)
            .containsBox(new Box3().setFromObject(tape, true)),
          flapClosed: flap.rotation.x === 0,
        }
      }),
    ).toEqual({ seatedInside: true, flapClosed: true })
    await expect(native).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: 'Eject tape', exact: true }),
    ).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expect(page).toHaveURL('/')
    await expect(
      page.getByRole('link', {
        name: 'Play tape: Placeholder: Alpha (2026)',
        exact: true,
      }),
    ).toBeFocused()
  } finally {
    held.release()
  }
})

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
    // An early selection is pinned like a deep link: once the desktop scene
    // is ready, the modeled screen takes over and the native frame leaves.
    await expect(page.getByTestId('project-reader')).toBeVisible()
    await expect(page.getByTestId('native-reader')).toHaveCount(0)
    expect(await originalReader.evaluate((el) => el.isConnected)).toBe(false)
    await expect(page.locator('article h2')).toBeFocused()
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
  await ready(page)
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport)
    // The reader follows the viewport rule: native on the phone, modeled on
    // the desktop. Measure the one on stage; the other is still unmounting
    // for a tick after a resize.
    const frame = page.getByTestId(
      viewport.width < 768 ? 'native-reader' : 'project-reader',
    )
    await expect(frame).toBeVisible()
    const reader = frame.getByRole('article', {
      name: 'Daniel Alyoshin details',
    })
    await expect(reader).toBeVisible()
    const github = reader.getByRole('link', { name: 'GITHUB', exact: true })
    const linkedin = reader.getByRole('link', {
      name: 'LINKEDIN',
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

  test('vertical swipes scroll the page, horizontal drags leave the view alone, and tapes remain tappable', async ({
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
      // The studio has no drag-to-orbit: the authored view stays put and the
      // gesture neither scrolls nor selects.
      await page.waitForTimeout(300)
      const afterDrag = await cameraPosition(page)
      expect(
        Math.hypot(
          ...afterDrag.map((value, index) => value - initialCamera[index]),
        ),
      ).toBeLessThan(0.01)
      expect(
        Math.hypot(
          ...afterDrag.map((value, index) => value - originalCamera[index]),
        ),
      ).toBeLessThan(0.01)
      await expect(page).toHaveURL('/')
      expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5)
      // The selection guide: its title line and the instruction beneath.
      const guide = () =>
        page.evaluate(() => {
          const span = document
            .querySelector('[data-testid="studio-scene"]')!
            .previousElementSibling!.querySelector('span')!
          return [
            span.firstChild!.textContent,
            span.querySelector('small')!.textContent,
          ]
        })
      const idle = ['Choose a tape to play', 'Pick one from the index below.']
      // At phone widths the fitted rack is about 110px across, so the guide
      // sends the visitor to the index. The studio still answers taps.
      expect(await guide()).toEqual(idle)
      // Where each slot target lands on screen.
      const slots = await page.evaluate(async () => {
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
        const rect = canvas.getBoundingClientRect()
        const slots: Record<
          string,
          { left: number; right: number; top: number; bottom: number }
        > = {}
        for (const target of state.internal.interaction) {
          if (!target.name.startsWith('pointer-target-')) continue
          const box = new Box3().setFromObject(target, true)
          const slot = {
            left: Infinity,
            right: -Infinity,
            top: Infinity,
            bottom: -Infinity,
          }
          for (let corner = 0; corner < 8; corner++) {
            const point = new Vector3(
              corner & 1 ? box.max.x : box.min.x,
              corner & 2 ? box.max.y : box.min.y,
              corner & 4 ? box.max.z : box.min.z,
            ).project(state.camera)
            const x = rect.x + ((point.x + 1) / 2) * rect.width
            const y = rect.y + ((1 - point.y) / 2) * rect.height
            slot.left = Math.min(slot.left, x)
            slot.right = Math.max(slot.right, x)
            slot.top = Math.min(slot.top, y)
            slot.bottom = Math.max(slot.bottom, y)
          }
          slots[target.name.replace('pointer-target-', '')] = slot
        }
        return slots
      })
      const centre = (slot: {
        left: number
        right: number
        top: number
        bottom: number
      }) => ({
        x: (slot.left + slot.right) / 2,
        y: (slot.top + slot.bottom) / 2,
      })
      // Each slot is far narrower than a fingertip here.
      expect(slots.about.right - slots.about.left).toBeLessThan(44)
      // A touch has no hover to confirm with: the first tap on a cassette
      // previews it and the second plays it (The Touch Rule).
      const alpha = centre(slots['placeholder-alpha'])
      await page.touchscreen.tap(alpha.x, alpha.y)
      await expect
        .poll(guide)
        .toEqual(['ALPHA', 'Placeholder tape · Tap again to play'])
      await expect(page).toHaveURL('/')
      // Every slot answers within a 44px catch about its centre: a tap 5px
      // clear of About's target still means About, and the nearest slot
      // wins, so the preview moves rather than the page.
      const about = centre(slots.about)
      await page.touchscreen.tap(slots.about.right + 5, about.y)
      await expect
        .poll(guide)
        .toEqual(['ABOUT · DANIEL', 'About Daniel · Tap again to play'])
      await expect(page).toHaveURL('/')
      // A blank slot swallows its tap, and a tap clear of the rack cancels.
      const blank = centre(slots['coming-1'])
      await page.touchscreen.tap(blank.x, blank.y)
      await page.waitForTimeout(300)
      expect(await guide()).toEqual([
        'ABOUT · DANIEL',
        'About Daniel · Tap again to play',
      ])
      await page.touchscreen.tap(bounds.x + 24, bounds.y + 24)
      await expect.poll(guide).toEqual(idle)
      await expect(page).toHaveURL('/')
      // The tape already previewed is the one a tap plays.
      await page.touchscreen.tap(alpha.x, alpha.y)
      await expect
        .poll(guide)
        .toEqual(['ALPHA', 'Placeholder tape · Tap again to play'])
      await page.touchscreen.tap(alpha.x, alpha.y)
      await expect(page).toHaveURL('/project/placeholder-alpha')
      await expect(
        page.getByRole('article', { name: 'Placeholder: Alpha details' }),
      ).toBeVisible()
    } finally {
      await session.detach()
    }
  })
})
