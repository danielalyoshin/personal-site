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

interface FocusSamples {
  samples: number
  hidden: string[]
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
        await page.getByRole('link', { name: /Play tape: 02 BETA/ }).click()
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
  // Focus must never sit inside hidden content, even for a beat: sample it
  // through the whole handoff.
  await page.addInitScript(() => {
    const seen = { samples: 0, hidden: [] as string[] }
    Object.assign(window, { focusInHidden: seen })
    setInterval(() => {
      const el = document.activeElement
      seen.samples++
      if (el && el !== document.body && el.closest('[aria-hidden="true"]'))
        seen.hidden.push(
          `${el.tagName} in ${el.closest('[data-handoff]')?.getAttribute('data-handoff')}`,
        )
    }, 16)
  })
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
    // The outgoing frame stays on stage for one dissolve. It is hidden from
    // assistive tech only once the modeled screen behind it holds focus.
    await expect(native).toHaveAttribute(
      'data-handoff',
      /pending|settled|fading/,
    )
    const modeled = page.getByTestId('project-reader')
    await expect(modeled).toBeVisible()
    await expect(modeled.locator('h2')).toBeFocused()
    await expect(native).toHaveAttribute('data-handoff', 'fading')
    await expect(native).toHaveAttribute('aria-hidden', 'true')
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
    const focus = await page.evaluate(
      () =>
        (window as unknown as { focusInHidden: FocusSamples }).focusInHidden,
    )
    expect(focus.samples).toBeGreaterThan(20)
    expect(focus.hidden).toEqual([])
    await expect(
      page.getByRole('button', { name: 'Eject tape', exact: true }),
    ).toHaveCount(1)
    await page.keyboard.press('Escape')
    await expect(page).toHaveURL('/')
    await expect(
      page.getByRole('link', {
        name: 'Play tape: 01 ALPHA Placeholder tape (2026)',
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
      .getByRole('link', {
        name: 'Play tape: 01 ALPHA Placeholder tape (2026)',
      })
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
  const about = page.getByRole('link', { name: 'About', exact: true })
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
    page.getByRole('article', { name: 'About details' }),
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
      name: 'About details',
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
          // The line on show: the other width's line is in the markup too.
          return [
            span.firstChild!.textContent,
            span.querySelector('small')!.innerText,
          ]
        })
      const idle = [
        'Choose a tape to play',
        'Pick one from the projects below.',
      ]
      // At phone widths the fitted rack is about 110px across, so the guide
      // sends the visitor to the archive's entries. The studio still answers
      // taps.
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
        .toEqual(['ABOUT', 'Daniel Alyoshin · Tap again to play'])
      await expect(page).toHaveURL('/')
      // A blank slot swallows its tap, and a tap clear of the rack cancels.
      const blank = centre(slots['coming-1'])
      await page.touchscreen.tap(blank.x, blank.y)
      await page.waitForTimeout(300)
      expect(await guide()).toEqual([
        'ABOUT',
        'Daniel Alyoshin · Tap again to play',
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

test('every screen state has a class of its own: nothing on stage is classed "undefined"', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const screen = (frame: string) =>
    page.getByTestId(frame).locator('section[aria-label="CRT display"] > div')
  const bloom = (frame: string) =>
    screen(frame).evaluate((el) => getComputedStyle(el).boxShadow)
  const strays = () =>
    page.evaluate(
      () =>
        [...document.querySelectorAll('[class]')].filter((el) =>
          /(^|\s)(undefined|null)(\s|$)/.test(el.getAttribute('class') ?? ''),
        ).length,
    )
  await page.goto('/')
  await ready(page)
  expect(await strays()).toBe(0)
  await page.goto('/project/placeholder-alpha')
  await ready(page)
  await expect(screen('project-reader')).toBeVisible()
  expect(await strays()).toBe(0)
  const playing = await bloom('project-reader')
  // NO SIGNAL is a lit tube, as its cast on the deck already says: the dead
  // tape and the dead channel both take playback's bloom, in both readers.
  for (const path of ['/project/not-a-tape', '/not-a-channel']) {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto(path)
    await ready(page)
    await expect(screen('project-reader')).toBeVisible()
    expect(await strays()).toBe(0)
    expect(await bloom('project-reader')).toBe(playing)
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(screen('native-reader')).toBeVisible()
    expect(await strays()).toBe(0)
    expect(await bloom('native-reader')).toBe(playing)
  }
})

test('the nameplate and every shell link meet the 44px floor', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 1280, height: 720 },
    { width: 390, height: 844 },
    { width: 320, height: 640 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await ready(page)
    const links = await page.evaluate(() =>
      [...document.querySelectorAll('header a, footer a')].map((el) => {
        const rect = el.getBoundingClientRect()
        return {
          name: el.getAttribute('aria-label') ?? el.textContent,
          width: rect.width,
          height: rect.height,
        }
      }),
    )
    expect(links).toHaveLength(5)
    for (const link of links) {
      expect(link.width, link.name!).toBeGreaterThanOrEqual(44)
      expect(link.height, link.name!).toBeGreaterThanOrEqual(44)
    }
  }
})

test('the studio loads without a console warning or error', async ({
  page,
}) => {
  const noise: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error')
      noise.push(`${message.type()}: ${message.text()}`)
  })
  page.on('pageerror', (error) => noise.push(`pageerror: ${error.message}`))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await ready(page)
  await page
    .getByRole('link', { name: 'Play tape: 01 ALPHA Placeholder tape (2026)' })
    .click()
  await expect(page.getByTestId('project-reader')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/')
  expect(noise).toEqual([])
})

test('every link on the page is named by the words it shows', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await ready(page)
  // What a sighted visitor reads on each link: its text without the parts
  // set aside for assistive technology, and without drawn marks.
  const shown = await page.evaluate(() =>
    [...document.querySelectorAll('a[href]')].map((link) => {
      const copy = link.cloneNode(true) as HTMLElement
      copy.querySelectorAll('.srOnly, svg').forEach((el) => el.remove())
      const words: string[] = []
      const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT)
      while (walker.nextNode())
        if (walker.currentNode.textContent?.trim())
          words.push(walker.currentNode.textContent.trim())
      return { href: link.getAttribute('href')!, label: words.join(' ') }
    }),
  )
  expect(shown.length).toBeGreaterThanOrEqual(9)
  for (const { href, label } of shown) {
    // Playwright matches a name as a case-insensitive substring: exactly
    // the label-in-name relation (WCAG 2.5.3).
    await expect(
      page
        .locator(`a[href="${href}"]`)
        .and(page.getByRole('link', { name: label })),
      `${href} is named by "${label}"`,
    ).not.toHaveCount(0)
  }
})

test('the canvas keeps its box while the native reader owns playback', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await ready(page)
  const scene = page.getByTestId('studio-scene')
  const sizes = async () => {
    const box = (await scene.boundingBox())!
    const canvas = (await page.locator('canvas').boundingBox())!
    return {
      box: [Math.round(box.width), Math.round(box.height)],
      canvas: [Math.round(canvas.width), Math.round(canvas.height)],
    }
  }
  const atRest = await sizes()
  expect(atRest.canvas).toEqual(atRest.box)
  await page.getByRole('link', { name: /Play tape: 01 ALPHA/ }).click()
  // The reader covers the studio from the first frame of the insertion to
  // the eject: a viewport-sized drawing buffer under it would serve nobody.
  await expect(page.getByTestId('native-reader')).toBeVisible()
  expect(await sizes()).toEqual(atRest)
  await expect(scene).not.toHaveAttribute('data-detached', 'true')
  await page.getByRole('button', { name: 'Skip animation' }).click()
  await expect(
    page.getByRole('article', { name: 'Placeholder: Alpha details' }),
  ).toBeVisible()
  expect(await sizes()).toEqual(atRest)
  // The page holds still under the reader all the same.
  expect(
    await page.evaluate(() => getComputedStyle(document.body).overflow),
  ).toBe('hidden')
  await page.getByRole('button', { name: 'Eject tape' }).click()
  await expect(page).toHaveURL('/')
  await expect(scene).not.toHaveAttribute('data-detached', 'true')
  expect(await sizes()).toEqual(atRest)
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.body).overflow))
    .not.toBe('hidden')
})
