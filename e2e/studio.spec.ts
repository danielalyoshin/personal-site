import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function ready(page: Page) {
  await expect(page.getByTestId('studio-scene')).toHaveAttribute(
    'data-ready',
    'true',
  )
}

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
}

test('3D archive, keyboard navigation, playback and focus restoration', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await ready(page)
  await expect(page.locator('canvas')).toBeVisible()
  await expect(page.getByRole('link', { name: /^Play tape:/ })).toHaveCount(4)
  const alpha = page.getByRole('link', {
    name: 'Play tape: Placeholder: Alpha (2026)',
    exact: true,
  })
  await alpha.focus()
  await page.keyboard.press('ArrowRight')
  await expect(
    page.getByRole('link', { name: /Play tape: Placeholder: Beta/ }),
  ).toBeFocused()
  await page.keyboard.press('Home')
  await expect(alpha).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/project/placeholder-alpha')
  const title = page.getByRole('heading', {
    name: 'Placeholder: Alpha',
    exact: true,
  })
  await expect(title).toBeFocused()
  await expect(page.getByRole('button', { name: 'Eject tape' })).toBeVisible()
  await expect(page.locator('a[href*="example.com"]')).toHaveCount(0)
  const reader = page.getByRole('article', {
    name: 'Placeholder: Alpha details',
  })
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('button', { name: 'Sound effects', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(reader).toBeFocused()
  const initialScroll = await reader.evaluate((el) => el.scrollTop)
  await page.keyboard.press('PageDown')
  await expect
    .poll(() => reader.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(initialScroll)
  await page.getByRole('button', { name: 'Eject tape' }).focus()
  await page.keyboard.press('Tab')
  await expect(reader).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/')
  await expect(alpha).toBeFocused()
  await noOverflow(page)
  expect(errors).toEqual([])
})

test('deep links, browser history and both missing-route states', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/project/about')
  await ready(page)
  // A ready desktop scene takes over from the instant native reader.
  await expect(page.getByTestId('project-reader')).toBeVisible()
  await expect(
    page.getByRole('heading', {
      name: 'Daniel Alyoshin',
      exact: true,
      level: 2,
    }),
  ).toBeFocused()
  await page.getByRole('button', { name: 'Eject tape' }).click()
  await expect(page).toHaveURL('/')
  await page.goBack()
  await expect(page).toHaveURL('/project/about')
  await expect(
    page.getByRole('heading', {
      name: 'Daniel Alyoshin',
      exact: true,
      level: 2,
    }),
  ).toBeVisible()
  for (const route of ['/project/missing', '/missing-channel']) {
    await page.goto(route)
    await expect(page.getByRole('heading', { name: 'NO SIGNAL' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(page).toHaveURL('/')
  }
})

test('reduced motion skips the tape flight and confines keyboard focus', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await ready(page)
  await page.getByRole('link', { name: 'About me' }).click()
  await expect(
    page.getByRole('button', { name: 'Skip animation' }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('heading', {
      name: 'Daniel Alyoshin',
      exact: true,
      level: 2,
    }),
  ).toBeFocused()
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press('Tab')
    expect(
      await page.evaluate(
        () => document.activeElement?.closest('[inert]') === null,
      ),
    ).toBe(true)
  }
  await page.getByRole('button', { name: 'Eject tape' }).focus()
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('article', { name: 'Daniel Alyoshin details' }),
  ).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('link', { name: 'GITHUB', exact: true }),
  ).toBeFocused()
})

test('native reading covers narrow and short viewports and survives resize', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await ready(page)
  await noOverflow(page)
  await page.getByRole('link', { name: 'About me' }).click()
  const reader = page.locator('article')
  await expect(reader).toBeVisible()
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 600, height: 844 },
    { width: 768, height: 600 },
  ]) {
    await page.setViewportSize(viewport)
    await expect
      .poll(async () => (await reader.boundingBox())?.height ?? 0)
      .toBeGreaterThan(viewport.height - 220)
    const bounds = (await reader.boundingBox())!
    expect(bounds.x).toBeGreaterThanOrEqual(0)
    expect(bounds.y).toBeGreaterThanOrEqual(0)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width)
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height)
    expect(
      await reader
        .locator('p')
        .nth(2)
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ).toBeGreaterThanOrEqual(16)
    await noOverflow(page)
  }
  await reader.evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await expect(
    page.getByRole('link', { name: 'LINKEDIN', exact: true }),
  ).toBeVisible()
  await noOverflow(page)
  await page.setViewportSize({ width: 1280, height: 900 })
  await expect(page.getByTestId('project-reader')).toBeVisible()
  await expect(
    page.getByRole('heading', {
      name: 'Daniel Alyoshin',
      exact: true,
      level: 2,
    }),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 320, height: 740 })
  await noOverflow(page)
})

test('the first viewport exposes the studio and a clear way to choose a tape', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/')
  await ready(page)
  const guide = page.getByText('Choose a tape to play')
  await expect(guide).toBeInViewport({ ratio: 1 })
  await expect(guide).toContainText('Select a cassette in the studio.')
  await expect(page.locator('canvas')).toBeInViewport({ ratio: 1 })
  await page.setViewportSize({ width: 390, height: 844 })
  // The fitted rack is about 110px across on a phone: the guide points at
  // the index, whose entries are in reach.
  await expect(guide).toContainText('Pick one from the index below.')
  await expect(
    page.getByRole('link', {
      name: 'Play tape: Placeholder: Alpha (2026)',
      exact: true,
    }),
  ).toBeInViewport({ ratio: 1 })
  await noOverflow(page)
})

test('sound is opt-in, lives on the deck, and resets on a fresh visit', async ({
  page,
}) => {
  await page.goto('/')
  await ready(page)
  // Browse has no sound control of its own: the deck key is the only toggle.
  await expect(page.getByRole('button', { name: 'Sound effects' })).toHaveCount(
    0,
  )
  await page.goto('/project/placeholder-alpha')
  const sound = page.getByRole('button', { name: 'Sound effects', exact: true })
  await expect(sound).toHaveAttribute('aria-pressed', 'false')
  await sound.click()
  await expect(sound).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(sound).toHaveAttribute('aria-pressed', 'false')
})

test('archive works without WebGL and after a graphics context is lost', async ({
  page,
}) => {
  await page.goto('/')
  await ready(page)
  await page.locator('canvas').evaluate((el) => {
    const context = el.getContext('webgl2')
    context?.getExtension('WEBGL_lose_context')?.loseContext()
  })
  await expect(page.locator('canvas')).toHaveCount(0)
  await page.getByRole('link', { name: 'About me' }).click()
  await expect(
    page.getByRole('heading', {
      name: 'Daniel Alyoshin',
      exact: true,
      level: 2,
    }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/')
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (type.startsWith('webgl') || type === 'experimental-webgl') return null
      return original.apply(this, [type, ...args] as Parameters<
        typeof original
      >)
    } as typeof original
  })
  await page.reload()
  await ready(page)
  await expect(page.locator('canvas')).toHaveCount(0)
  await page.getByRole('link', { name: /Play tape: Placeholder: Beta/ }).click()
  await expect(
    page.getByRole('heading', { name: /Placeholder: Beta/ }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/')
})

test('a pointer can select a modeled cassette and dragging does not navigate', async ({
  page,
}) => {
  await page.goto('/')
  await ready(page)
  const canvas = page.locator('canvas')
  const bounds = (await canvas.boundingBox())!
  const x = bounds.x + bounds.width * 0.67
  const y = bounds.y + bounds.height * 0.57
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x - 120, y + 30, { steps: 12 })
  await page.mouse.up()
  await expect(page).toHaveURL('/')
  // Search the tape area using the actual raycast cursor, independent of GPU pixel colors.
  let found = false
  for (let row = 0.48; row <= 0.68 && !found; row += 0.04) {
    for (let col = 0.58; col <= 0.72; col += 0.025) {
      await page.mouse.move(
        bounds.x + bounds.width * col,
        bounds.y + bounds.height * row,
      )
      if (await page.evaluate(() => document.body.style.cursor === 'pointer')) {
        await page.mouse.down()
        await page.mouse.up()
        found = true
        break
      }
    }
  }
  expect(found).toBe(true)
  await expect(page).toHaveURL(/\/project\//)
})

test('the pointer preview hands over slot to slot without flicker while cassettes lift', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await ready(page)
  const camera = () =>
    page.evaluate(async () => {
      const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
      const { _roots } = (await import(
        fiberModule
      )) as typeof import('@react-three/fiber')
      const { camera } = _roots
        .get(document.querySelector('canvas')!)!
        .store.getState()
      return [camera.zoom, camera.position.x, camera.position.y]
        .map((value) => value.toFixed(3))
        .join()
    })
  // The opening camera eases on its own frames; project once it has settled.
  await expect
    .poll(async () => {
      const before = await camera()
      await page.waitForTimeout(150)
      return (await camera()) === before
    })
    .toBe(true)
  const geometry = await page.evaluate(async () => {
    const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
    const threeModule = '/node_modules/.vite/deps/three.js'
    const { _roots } = (await import(
      fiberModule
    )) as typeof import('@react-three/fiber')
    const { Box3, Vector3 } = (await import(
      threeModule
    )) as typeof import('three')
    const state = _roots
      .get(document.querySelector('canvas')!)!
      .store.getState()
    const rect = document.querySelector('canvas')!.getBoundingClientRect()
    const toScreen = (point: InstanceType<typeof Vector3>) => {
      point.project(state.camera)
      return {
        x: rect.x + ((point.x + 1) * rect.width) / 2,
        y: rect.y + ((1 - point.y) * rect.height) / 2,
      }
    }
    const rack = new Box3().setFromObject(
      state.scene.getObjectByName('archive-holder')!,
      true,
    )
    let left = Infinity
    let right = -Infinity
    for (let corner = 0; corner < 8; corner++) {
      const { x } = toScreen(
        new Vector3(
          corner & 1 ? rack.max.x : rack.min.x,
          corner & 2 ? rack.max.y : rack.min.y,
          corner & 4 ? rack.max.z : rack.min.z,
        ),
      )
      left = Math.min(left, x)
      right = Math.max(right, x)
    }
    const centre = toScreen(
      state.scene
        .getObjectByName('tape-placeholder-gamma')!
        .getWorldPosition(new Vector3()),
    )
    return {
      left: Math.floor(left) - 10,
      right: Math.ceil(right) + 10,
      y: Math.round(centre.y),
    }
  })
  // The selection guide names the previewed tape; read its first text node.
  const caption = () =>
    page.evaluate(
      () =>
        document
          .querySelector('[data-testid="studio-scene"]')!
          .previousElementSibling!.querySelector('span')!.firstChild!
          .textContent,
    )
  const sweep = async (from: number, to: number) => {
    await page.mouse.move(from, geometry.y)
    await page.waitForTimeout(250)
    const transitions: string[] = []
    let last = await caption()
    const step = 2 * Math.sign(to - from)
    for (let x = from; step > 0 ? x <= to : x >= to; x += step) {
      await page.mouse.move(x, geometry.y)
      // Cassettes lift and settle underneath: every step hit-tests the scene
      // mid-motion, which is where a moving target used to flicker.
      await page.waitForTimeout(16)
      const now = await caption()
      if (now !== last) {
        transitions.push(now!)
        last = now
      }
    }
    return transitions
  }
  const idle = 'Choose a tape to play'
  const forward = await sweep(geometry.left, geometry.right)
  const back = await sweep(geometry.right, geometry.left)
  // One handover at each shared edge, and never back to a tape already left.
  // The two blank slots after Gamma answer no pointer, so the guide reads
  // idle across them until About.
  const played = ['ALPHA', 'BETA · EXTENDED CUT', 'GAMMA']
  expect(forward).toEqual([...played, idle, 'ABOUT · DANIEL', idle])
  expect(back).toEqual(['ABOUT · DANIEL', idle, ...played.reverse(), idle])
})

test('slots without a project hold blank tapes that are coming soon', async ({
  page,
}) => {
  await page.goto('/')
  await ready(page)
  const entries = page.locator('#archive li')
  await expect(entries).toHaveCount(6)
  await expect(page.getByRole('link', { name: /^Play tape:/ })).toHaveCount(4)
  // Slots 04 and 05 are read, not played: no link, and outside the tab order.
  for (const slot of [3, 4]) {
    const entry = entries.nth(slot)
    await expect(entry).toContainText(`0${slot + 1}`)
    await expect(entry).toContainText('Coming soon…')
    await expect(entry.locator('a, button, [tabindex]')).toHaveCount(0)
  }
  const gamma = page.getByRole('link', {
    name: /^Play tape: Placeholder: Gamma/,
  })
  const about = page.getByRole('link', { name: /^Play tape: About Daniel/ })
  await gamma.focus()
  await page.keyboard.press('ArrowRight')
  await expect(about).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(gamma).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(about).toBeFocused()
  await page.keyboard.press('Home')
  await page.keyboard.press('End')
  await expect(about).toBeFocused()
  // In the studio a blank slot holds the same shell with nothing printed,
  // behind a slot target of its own that swallows the pointer.
  const studio = await page.evaluate(async () => {
    const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
    const { _roots } = (await import(
      fiberModule
    )) as typeof import('@react-three/fiber')
    const state = _roots
      .get(document.querySelector('canvas')!)!
      .store.getState()
    const prints = (name: string) => {
      let count = 0
      state.scene.getObjectByName(name)!.traverse((object) => {
        const { material } = object as { material?: { map?: unknown } }
        if (material?.map) count++
      })
      return count
    }
    const { Vector3 } =
      (await import('/node_modules/.vite/deps/three.js')) as typeof import('three')
    const rect = document.querySelector('canvas')!.getBoundingClientRect()
    const centre = state.scene
      .getObjectByName('tape-coming-1')!
      .getWorldPosition(new Vector3())
      .project(state.camera)
    return {
      blankPrints: prints('tape-coming-1'),
      printedPrints: prints('tape-placeholder-gamma'),
      targets: state.internal.interaction
        .map((object) => object.name)
        .filter((name) => name.startsWith('pointer-target-'))
        .sort(),
      blankCentre: {
        x: rect.x + ((centre.x + 1) * rect.width) / 2,
        y: rect.y + ((1 - centre.y) * rect.height) / 2,
      },
    }
  })
  expect(studio.blankPrints).toBe(0)
  expect(studio.printedPrints).toBe(2)
  expect(studio.targets).toEqual([
    'pointer-target-about',
    'pointer-target-coming-1',
    'pointer-target-coming-2',
    'pointer-target-placeholder-alpha',
    'pointer-target-placeholder-beta',
    'pointer-target-placeholder-gamma',
  ])
  // The three-quarter camera looks along the rack: a ray through a blank
  // slot's own centre reaches Gamma's envelope behind it. The blank slot's
  // target swallows it, so the guide stays idle and a click plays nothing.
  // The focused About link is itself a preview; clear it first.
  await about.blur()
  const caption = () =>
    page.evaluate(
      () =>
        document
          .querySelector('[data-testid="studio-scene"]')!
          .previousElementSibling!.querySelector('span')!.firstChild!
          .textContent,
    )
  await expect.poll(caption).toBe('Choose a tape to play')
  await page.mouse.move(studio.blankCentre.x, studio.blankCentre.y)
  await page.waitForTimeout(300)
  expect(await caption()).toBe('Choose a tape to play')
  expect(await page.evaluate(() => document.body.style.cursor)).not.toBe(
    'pointer',
  )
  await page.mouse.click(studio.blankCentre.x, studio.blankCentre.y)
  await page.waitForTimeout(300)
  await expect(page).toHaveURL('/')
  expect(await caption()).toBe('Choose a tape to play')
  // A blank slot has no route: a link to one reads NO SIGNAL like any dead tape.
  await page.goto('/project/coming-1')
  await expect(page.getByText('NO SIGNAL').first()).toBeVisible()
})
