import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

// A common laptop, where the tube shows a few lines of a tape at a time.
test.use({ viewport: { width: 1440, height: 900 } })

async function ready(page: Page) {
  await expect(page.getByTestId('studio-scene')).toHaveAttribute(
    'data-ready',
    'true',
  )
}

const sizeBar = (page: Page) =>
  page.getByRole('button', { name: 'Full screen', exact: true })
const exitKey = (page: Page) =>
  page.getByRole('button', { name: 'Exit full screen', exact: true })
const tubeArticle = (page: Page) =>
  page.getByTestId('project-reader').locator('article')
const fullArticle = (page: Page) =>
  page.getByTestId('native-reader').locator('article')

/** A tape on the modeled tube, the deep link's handoff finished. */
async function playOnTube(page: Page) {
  await page.goto('/project/superset-d1')
  await ready(page)
  await expect(page.getByTestId('native-reader')).toHaveCount(0)
  await expect(tubeArticle(page)).toBeVisible()
  await expect(sizeBar(page)).toBeVisible()
}

/** How far down its scroll range an article reads, from 0 to 1. */
function depth(article: ReturnType<typeof tubeArticle>) {
  return article.evaluate(
    (el) => el.scrollTop / (el.scrollHeight - el.clientHeight),
  )
}

/**
 * The size bar's lit steps and the full-screen phase, each time either
 * changes, for asserting the order of the turn and the growth.
 */
async function recordTurn(page: Page) {
  await page.addInitScript(() => {
    const log: { lit: number; phase: string | null }[] = []
    Object.assign(window, { turnLog: log })
    let last = ''
    new MutationObserver(() => {
      const lit = document.querySelectorAll(
        '[data-testid="project-reader"] [data-lit]',
      ).length
      const phase =
        document
          .querySelector('[data-testid="native-reader"]')
          ?.getAttribute('data-full-screen') ?? null
      const key = `${lit}:${phase}`
      if (key !== last) log.push({ lit, phase })
      last = key
    }).observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-lit', 'data-full-screen'],
    })
  })
}

test('the size bar reads the picture’s true share of the window, and turns it up to a full-screen reader that keeps the reading place', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await playOnTube(page)
  const share = await page
    .getByTestId('project-reader')
    .evaluate(
      (el) =>
        el.getBoundingClientRect().width / document.documentElement.clientWidth,
    )
  await expect(sizeBar(page).locator('[data-lit]')).toHaveCount(
    Math.min(9, Math.max(1, Math.round(share * 10))),
  )

  await tubeArticle(page).evaluate((el) => {
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2
  })
  const read = await depth(tubeArticle(page))
  await sizeBar(page).click()
  const reader = page.getByTestId('native-reader')
  await expect(reader).toHaveAttribute('data-full-screen', 'on')
  await expect(page.getByTestId('project-reader')).toHaveCount(0)
  // The canvas went back to its box under the reader.
  await expect(page.getByTestId('studio-scene')).not.toHaveAttribute(
    'data-detached',
    'true',
  )
  await expect(reader.getByRole('heading', { level: 2 })).toBeFocused()
  expect(Math.abs((await depth(fullArticle(page))) - read)).toBeLessThan(0.05)
  // The deck in the reader's frame carries the way back.
  await expect(exitKey(page)).toHaveAttribute('aria-keyshortcuts', 'F')

  await fullArticle(page).evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await exitKey(page).click()
  await expect(page.getByTestId('native-reader')).toHaveCount(0)
  await expect(tubeArticle(page)).toBeVisible()
  await expect(
    page.getByTestId('project-reader').getByRole('heading', { level: 2 }),
  ).toBeFocused()
  expect(await depth(tubeArticle(page))).toBeGreaterThan(0.95)
  await expect(sizeBar(page)).toBeVisible()
})

test('the bar lights to full before the picture grows, and the way back closes onto the tube', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await recordTurn(page)
  await playOnTube(page)
  await sizeBar(page).click()
  await expect(page.getByTestId('native-reader')).toHaveAttribute(
    'data-full-screen',
    'on',
  )
  const log = (await page.evaluate(
    () => (window as unknown as { turnLog: unknown[] }).turnLog,
  )) as { lit: number; phase: string | null }[]
  const grows = log.findIndex((entry) => entry.phase === 'growing')
  expect(grows).toBeGreaterThan(0)
  expect(log.slice(0, grows).some((entry) => entry.lit === 10)).toBe(true)

  await page.keyboard.press('f')
  await expect(page.getByTestId('native-reader')).toHaveAttribute(
    'data-handoff',
    /pending|settled|fading/,
  )
  await expect(page.getByTestId('native-reader')).toHaveCount(0)
  await expect(tubeArticle(page)).toBeVisible()
})

test('F turns the picture up and back, and never with a modifier', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await playOnTube(page)
  await page.keyboard.press('Control+f')
  await page.keyboard.press('Meta+f')
  await expect(page.getByTestId('native-reader')).toHaveCount(0)
  await page.keyboard.press('f')
  await expect(page.getByTestId('native-reader')).toHaveAttribute(
    'data-full-screen',
    'on',
  )
  await page.keyboard.press('F')
  await expect(page.getByTestId('native-reader')).toHaveCount(0)
  await expect(tubeArticle(page)).toBeVisible()
})

test('reading on the tube nudges the dial once, and the dial turns the picture up too', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await recordTurn(page)
  await playOnTube(page)
  const base = await sizeBar(page).locator('[data-lit]').count()
  await tubeArticle(page).evaluate((el) => el.scrollBy(0, 120))
  await expect
    .poll(async () =>
      Math.max(
        ...(
          (await page.evaluate(
            () => (window as unknown as { turnLog: { lit: number }[] }).turnLog,
          )) as { lit: number }[]
        ).map((entry) => entry.lit),
      ),
    )
    .toBe(base + 2)
  // It settles back where the picture stands.
  await expect(sizeBar(page).locator('[data-lit]')).toHaveCount(base)

  // The knob answers a pointer; keyboards have the bar and F.
  const knob = page.locator('button[title="Full screen (F)"]')
  await expect(knob).toHaveAttribute('aria-hidden', 'true')
  await expect(knob).toHaveAttribute('tabindex', '-1')
  await knob.click()
  await expect(page.getByTestId('native-reader')).toHaveAttribute(
    'data-full-screen',
    'on',
  )
})

test('full screen is offered only where the tube is the reader', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  // A short window reads in the full-height reader already.
  await page.setViewportSize({ width: 1440, height: 680 })
  await page.goto('/project/superset-d1')
  await ready(page)
  await expect(fullArticle(page)).toBeVisible()
  await expect(sizeBar(page)).toHaveCount(0)
  await expect(exitKey(page)).toHaveCount(0)
  await page.keyboard.press('f')
  await expect(page.getByTestId('native-reader')).not.toHaveAttribute(
    'data-full-screen',
    /.*/,
  )
  await expect(exitKey(page)).toHaveCount(0)
})

test('full screen holds for the visit: eject lands on the tape link, and the next tape opens full screen until Exit hands the visit back', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await playOnTube(page)
  await sizeBar(page).click()
  await expect(page.getByTestId('native-reader')).toHaveAttribute(
    'data-full-screen',
    'on',
  )
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/')
  const d1 = page.locator('#projects a[href="/project/superset-d1"]')
  await expect(d1).toBeFocused()
  await expect(page.getByTestId('native-reader')).toHaveCount(0)

  // Reduced motion has no flight: the next tape opens full screen at once.
  await d1.press('Enter')
  await expect(page.getByTestId('native-reader')).toHaveAttribute(
    'data-full-screen',
    'on',
  )
  await expect(exitKey(page)).toBeVisible()

  // Exit gives the visit back to the tube, for this tape and the next.
  await exitKey(page).click()
  await expect(page.getByTestId('native-reader')).toHaveCount(0)
  await expect(tubeArticle(page)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(d1).toBeFocused()
  await d1.press('Enter')
  await expect(tubeArticle(page)).toBeVisible()
  await expect(page.getByTestId('native-reader')).toHaveCount(0)
  await expect(sizeBar(page)).toBeVisible()
})

test('with motion, a later tape still flies into the deck, then the set turns its picture up once the tube is at rest', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await recordTurn(page)
  await playOnTube(page)
  await sizeBar(page).click()
  await expect(page.getByTestId('native-reader')).toHaveAttribute(
    'data-full-screen',
    'on',
  )
  await page.keyboard.press('Escape')
  const d1 = page.locator('#projects a[href="/project/superset-d1"]')
  await expect(d1).toBeFocused()
  // Wait for the tape to be back in its slot before choosing it again.
  await expect(page.getByTestId('studio-scene')).not.toHaveAttribute(
    'data-detached',
    'true',
  )
  await page.evaluate(() => {
    ;(window as unknown as { turnLog: unknown[] }).turnLog.length = 0
  })
  await d1.click()
  // The insertion runs on the modeled studio, with Skip on stage and no
  // full-screen reader over it.
  await expect(
    page.getByRole('button', { name: 'Skip animation' }),
  ).toBeVisible()
  await expect(page.getByTestId('native-reader')).toHaveCount(0)
  // Then the tube's picture shows, the bar lights to full, and it grows.
  await expect(page.getByTestId('native-reader')).toHaveAttribute(
    'data-full-screen',
    'on',
    { timeout: 10_000 },
  )
  const log = (await page.evaluate(
    () => (window as unknown as { turnLog: unknown[] }).turnLog,
  )) as { lit: number; phase: string | null }[]
  const grows = log.findIndex((entry) => entry.phase === 'growing')
  expect(grows).toBeGreaterThan(0)
  const before = log.slice(0, grows)
  expect(before.some((entry) => entry.lit > 0 && entry.lit < 10)).toBe(true)
  expect(before.some((entry) => entry.lit === 10)).toBe(true)
})

test('Tab keeps its loop on the tube, with the dial’s pointer target out of it', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await playOnTube(page)
  await expect(page.locator('button[title="Full screen (F)"]')).toHaveCount(1)
  const inPlayback = () =>
    page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))
  // Around the loop from the last key: focus never leaves playback, and
  // the size bar is one of its stops.
  await page.getByRole('button', { name: 'Eject tape', exact: true }).focus()
  const stops = new Set<string>()
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    expect(await inPlayback()).toBe(true)
    stops.add(
      await page.evaluate(
        () =>
          document.activeElement?.getAttribute('aria-label') ??
          document.activeElement?.textContent?.trim().slice(0, 24) ??
          '',
      ),
    )
  }
  expect([...stops].some((stop) => /full screen/i.test(stop))).toBe(true)
  expect(stops.has('')).toBe(false)
})
