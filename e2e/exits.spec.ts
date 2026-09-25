import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

// A common laptop: the tape index starts below the first viewport, so a link
// that takes focus there is off screen until the page moves.
test.use({ viewport: { width: 1440, height: 900 } })

const HOME_TITLE = 'Daniel Alyoshin · Forward Deployed Engineer'

async function ready(page: Page) {
  await expect(page.getByTestId('studio-scene')).toHaveAttribute(
    'data-ready',
    'true',
  )
}

/** How much of the element lies outside the viewport, in pixels. */
async function clipped(target: Locator) {
  return target.evaluate((el) => {
    const rect = el.getBoundingClientRect()
    return Math.max(0, -rect.top, rect.bottom - window.innerHeight)
  })
}

const d1Link = (page: Page) =>
  page.getByRole('link', {
    name: 'Play tape: 01 SUPERSET D1 Cloudflare D1 in Apache Superset (2026)',
    exact: true,
  })

test('a keyboard exit lands focus on the tape link, in sight; a pointer exit leaves the page where it was', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/project/superset-d1')
  await ready(page)
  await expect(page.getByTestId('project-reader')).toBeVisible()
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/')
  const d1 = d1Link(page)
  await expect(d1).toBeFocused()
  // The ring shows, so the link it is on came into view, clear of the edge.
  expect(await d1.evaluate((el) => el.matches(':focus-visible'))).toBe(true)
  expect(await clipped(d1)).toBe(0)
  expect(
    await d1.evaluate(
      (el) => window.innerHeight - el.getBoundingClientRect().bottom,
    ),
  ).toBeGreaterThanOrEqual(23)
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

  // By pointer no ring shows, so nothing moves: the studio stays in view.
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.getByRole('link', { name: 'About', exact: true }).click()
  await expect(page.getByTestId('project-reader')).toBeVisible()
  await page.getByRole('button', { name: 'Eject tape', exact: true }).click()
  await expect(page).toHaveURL('/')
  const about = page.getByRole('link', { name: /^Play tape: 06 ABOUT/ })
  await expect(about).toBeFocused()
  expect(await about.evaluate((el) => el.matches(':focus-visible'))).toBe(false)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})

test('an exit during the handoff keeps the focus it landed', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  // Escape the moment the modeled reader mounts under the native one: its
  // title is still waiting on a frame to take focus, and Drei unmounts its
  // root a commit after the page closes playback.
  await page.addInitScript(() => {
    const watch = new MutationObserver(() => {
      if (!document.querySelector('[data-testid="project-reader"] h2')) return
      watch.disconnect()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    watch.observe(document, { subtree: true, childList: true })
  })
  await page.goto('/project/superset-d1')
  await expect(page).toHaveURL('/')
  await expect(page.getByTestId('project-reader')).toHaveCount(0)
  // The late title must not take focus back and drop it on the page body.
  await expect(d1Link(page)).toBeFocused()
})

test('the exit from NO SIGNAL is printed on the tube and lands on the nameplate', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const route of ['/project/missing', '/missing-channel']) {
    await page.goto(route)
    await ready(page)
    const tube = page.getByTestId('project-reader')
    await expect(tube.getByRole('heading', { name: 'NO SIGNAL' })).toBeFocused()
    // Sighted visitors read the way out; assistive tech keeps its sentence.
    const hint = tube.getByText('PRESS ESC OR')
    await expect(hint).toBeVisible()
    await expect(hint).toHaveText('PRESS ESC OR EJECT TO RETURN')
    await expect(hint).toHaveAttribute('aria-hidden', 'true')
    await expect(
      tube.getByText('Daniel Alyoshin', { exact: true }),
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page).toHaveURL('/')
    // No tape played, so there is no link to return to: focus opens the page.
    await expect(
      page.getByRole('link', {
        name: 'Daniel Alyoshin Forward deployed engineer home',
      }),
    ).toBeFocused()
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  }
  // The native reader prints the hint above its own Eject key. A phone has
  // no Escape key, so there it names the deck's key alone, as that key does.
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/project/missing')
  const phoneHint = page
    .getByTestId('native-reader')
    .locator('p[aria-hidden="true"]', { hasText: 'TO RETURN' })
  await expect(phoneHint).toBeVisible()
  await expect(phoneHint.getByText('ESC OR')).toBeHidden()
  await expect(phoneHint.getByText('EJECT', { exact: true })).toBeVisible()
})

test('Skip takes focus for the insertion, and only a real key press skips', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await ready(page)
  await d1Link(page).focus()
  await page.keyboard.press('Enter')
  const skip = page.getByRole('button', { name: 'Skip animation' })
  await expect(skip).toBeFocused()
  // Shift on its way to Shift+Tab is not "any key": the flight carries on,
  // and the focus loop holds on the one control there is.
  await page.keyboard.press('Shift+Tab')
  await expect(skip).toBeFocused()
  // Enter on the focused key is the key's own press.
  await page.keyboard.press('Enter')
  await expect(skip).toHaveCount(0)
  await expect(page.locator('article h2')).toBeFocused()
})

test('a pointer selection in the studio carries no focus ring onto Skip or the title', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await ready(page)
  // About stands nearest the camera, so its slot target is unobstructed.
  const spot = await page.evaluate(async () => {
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
    const target = state.internal.interaction.find(
      (object) => object.name === 'pointer-target-about',
    )!
    const centre = new Box3()
      .setFromObject(target, true)
      .getCenter(new Vector3())
      .project(state.camera)
    return {
      x: rect.x + ((centre.x + 1) / 2) * rect.width,
      y: rect.y + ((1 - centre.y) / 2) * rect.height,
    }
  })
  await page.mouse.move(spot.x, spot.y)
  await page.mouse.click(spot.x, spot.y)
  await expect(page).toHaveURL('/project/about')
  // Focus is still managed, so a screen reader follows; a mouse sees no ring.
  const skip = page.getByRole('button', { name: 'Skip animation' })
  await expect(skip).toBeFocused()
  expect(await skip.evaluate((el) => el.matches(':focus-visible'))).toBe(false)
  await skip.click()
  const title = page.locator('article h2')
  await expect(title).toBeFocused()
  expect(await title.evaluate((el) => el.matches(':focus-visible'))).toBe(false)
})

test('every route names itself in the document title', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page).toHaveTitle(HOME_TITLE)
  await ready(page)
  await d1Link(page).click()
  await expect(page).toHaveTitle(
    'Cloudflare D1 in Apache Superset · Daniel Alyoshin',
  )
  await page.keyboard.press('Escape')
  await expect(page).toHaveTitle(HOME_TITLE)
  await page.goBack()
  await expect(page).toHaveTitle(
    'Cloudflare D1 in Apache Superset · Daniel Alyoshin',
  )
  await page.goto('/project/about')
  await expect(page).toHaveTitle('About · Daniel Alyoshin')
  for (const route of ['/project/missing', '/missing-channel']) {
    await page.goto(route)
    await expect(page).toHaveTitle('No signal · Daniel Alyoshin')
  }
  await page.keyboard.press('Escape')
  await expect(page).toHaveTitle(HOME_TITLE)
})

test('the tube carries the name through a deep link, from its first second', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route(
    '**/src/components/studio/StudioScene.tsx*',
    async (route) => {
      await gate
      await route.continue()
    },
  )
  try {
    await page.goto('/project/superset-d1', {
      waitUntil: 'domcontentloaded',
    })
    // Before any graphics: the native reader already says whose tape this is.
    const native = page.getByTestId('native-reader')
    await expect(
      native.getByText('Daniel Alyoshin', { exact: true }),
    ).toBeVisible()
    release()
    await ready(page)
    // After the dissolve the modeled tube prints it in the same place.
    const modeled = page.getByTestId('project-reader')
    const ident = modeled.getByText('Daniel Alyoshin', { exact: true })
    await expect(ident).toBeVisible()
    await expect(native).toHaveCount(0)
    const offCentre = await ident.evaluate((el) => {
      const screen = el.closest('section')!.getBoundingClientRect()
      const rect = el.getBoundingClientRect()
      return Math.abs(
        rect.left + rect.width / 2 - (screen.left + screen.width / 2),
      )
    })
    expect(offCentre).toBeLessThan(1.5)
  } finally {
    release()
  }
})

test('the OSD bar keeps its three fields apart on the narrowest phone', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto('/project/superset-d1')
  const bar = page
    .getByTestId('native-reader')
    .getByText('Daniel Alyoshin', { exact: true })
    .locator('..')
  await expect(bar).toBeVisible()
  const fields = await bar.evaluate((el) => {
    const tube = el.getBoundingClientRect()
    return {
      left: tube.left,
      right: tube.right,
      spans: Array.from(el.children, (child) => {
        const rect = child.getBoundingClientRect()
        return { left: rect.left, right: rect.right }
      }),
    }
  })
  expect(fields.spans).toHaveLength(3)
  const [play, ident, readTime] = fields.spans
  expect(play.left).toBeGreaterThanOrEqual(fields.left)
  expect(ident.left - play.right).toBeGreaterThanOrEqual(6)
  expect(readTime.left - ident.right).toBeGreaterThanOrEqual(6)
  expect(readTime.right).toBeLessThanOrEqual(fields.right)
})

test('the page ships a share card: Open Graph and Twitter tags over a rendered studio still', async ({
  page,
  baseURL,
}) => {
  // Crawlers read the HTML as served and run no script.
  const html = await (await page.request.get('/')).text()
  const meta = (key: string) =>
    html.match(
      new RegExp(
        `<meta\\s+(?:property|name)="${key}"\\s+content="([^"]*)"`,
        's',
      ),
    )?.[1]
  expect(html).not.toContain('%SITE_URL%')
  expect(meta('og:title')).toBe(HOME_TITLE)
  expect(meta('og:type')).toBe('website')
  expect(meta('og:description')).toBe(meta('description'))
  expect(meta('twitter:card')).toBe('summary_large_image')
  expect(meta('og:image:alt')).toBeTruthy()
  expect(meta('twitter:image:alt')).toBe(meta('og:image:alt'))
  const image = meta('og:image')!
  expect(meta('twitter:image')).toBe(image)
  // Root-relative until the release build supplies SITE_URL.
  expect(image).toMatch(/\/social-card\.png$/)
  const card = await page.request.get(new URL(image, baseURL).pathname)
  expect(card.ok()).toBe(true)
  expect(card.headers()['content-type']).toBe('image/png')
  const png = await card.body()
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([
    Number(meta('og:image:width')),
    Number(meta('og:image:height')),
  ])
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630])
})
