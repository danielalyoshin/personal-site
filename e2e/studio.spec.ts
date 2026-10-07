import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function ready(page: Page) {
  await expect(page.getByTestId('studio-scene')).toHaveAttribute(
    'data-ready',
    'true',
  )
}

/**
 * A desktop deep link opens on the native reader and hands over to the tube.
 * Until the handoff ends both readers, with their titles and deck keys, are
 * on the page, so wait for the native one to leave before asking for either.
 */
async function onTheTube(page: Page) {
  await ready(page)
  await expect(page.getByTestId('native-reader')).toHaveCount(0)
}

/**
 * The page never runs wider than the window once laid out. Chrome lays out
 * the first frame after a resize with viewport units part way updated (the
 * full-bleed studio box stood 4px past a 320px window), so the check waits
 * for the settled layout rather than reading that frame.
 */
async function noOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true)
}

test('3D archive, keyboard navigation, playback and focus restoration', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await ready(page)
  await expect(page.locator('canvas')).toBeVisible()
  await expect(page.getByRole('link', { name: /^Play tape:/ })).toHaveCount(2)
  const d1 = page.getByRole('link', {
    name: 'Play tape: 01 SUPERSET D1 Cloudflare D1 in Apache Superset (2025)',
    exact: true,
  })
  await d1.focus()
  // The next tape that plays is About, past the blank slots between them.
  await page.keyboard.press('ArrowRight')
  await expect(
    page.getByRole('link', { name: /^Play tape: 06 ABOUT/ }),
  ).toBeFocused()
  await page.keyboard.press('Home')
  await expect(d1).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/project/superset-d1')
  const title = page.getByRole('heading', {
    name: 'Cloudflare D1 in Apache Superset',
    exact: true,
  })
  await expect(title).toBeFocused()
  await expect(page.getByRole('button', { name: 'Eject tape' })).toBeVisible()
  const reader = page.getByRole('article', {
    name: 'Cloudflare D1 in Apache Superset details',
  })
  // The closer look stands where the write-up's media would, and the tape's
  // own links follow it in the reading order.
  const closerLook = reader.getByRole('button', { name: /^Take a closer look/ })
  const links = reader.getByRole('list', { name: 'Project links' })
  await expect(links.getByRole('link')).toHaveText([
    'PYPI',
    'SOURCE',
    'SUPERSET PR',
  ])
  await page.keyboard.press('Tab')
  await expect(closerLook).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(links.getByRole('link', { name: 'PYPI' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(closerLook).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(reader).toBeFocused()
  // Reaching the links scrolled the reader to its end; read from the top.
  await reader.evaluate((el) => el.scrollTo({ top: 0, behavior: 'instant' }))
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
  await expect(d1).toBeFocused()
  await noOverflow(page)
  expect(errors).toEqual([])
})

test('deep links, browser history and both missing-route states', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/project/about')
  // A ready desktop scene takes over from the instant native reader.
  await onTheTube(page)
  await expect(page.getByTestId('project-reader')).toBeVisible()
  await expect(
    page.getByRole('heading', {
      name: 'About',
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
      name: 'About',
      exact: true,
      level: 2,
    }),
  ).toBeVisible()
  for (const route of ['/project/missing', '/missing-channel']) {
    await page.goto(route)
    await onTheTube(page)
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
  await page.getByRole('link', { name: 'About', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Skip animation' }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('heading', {
      name: 'About',
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
    page.getByRole('article', { name: 'About details' }),
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
  await page.getByRole('link', { name: 'About', exact: true }).click()
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
      name: 'About',
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
  // The stylesheet picks the line, so it is right from the first paint.
  const inStudio = guide.getByText('Pick one in the studio.')
  const fromArchive = guide.getByText('Pick one from the projects below.')
  await expect(inStudio).toBeVisible()
  await expect(fromArchive).toBeHidden()
  await expect(page.locator('canvas')).toBeInViewport({ ratio: 1 })
  await page.setViewportSize({ width: 390, height: 844 })
  // The fitted rack is about 110px across on a phone: the guide points at
  // the archive's entries, which are in reach.
  await expect(fromArchive).toBeVisible()
  await expect(inStudio).toBeHidden()
  await expect(
    page.getByRole('link', {
      name: 'Play tape: 01 SUPERSET D1 Cloudflare D1 in Apache Superset (2025)',
      exact: true,
    }),
  ).toBeInViewport({ ratio: 1 })
  await noOverflow(page)
})

test('sound is on from the start, silent until the first gesture, and a mute is remembered', async ({
  page,
}) => {
  // Count every audio context and every cue started on one.
  await page.addInitScript(() => {
    const log = { contexts: 0, cues: 0 }
    Object.assign(window, { audioLog: log })
    const Native = window.AudioContext
    const counted = <T extends AudioScheduledSourceNode>(node: T) => {
      const start = node.start.bind(node)
      node.start = (...args: Parameters<T['start']>) => {
        log.cues++
        start(...args)
      }
      return node
    }
    window.AudioContext = class extends Native {
      constructor(options?: AudioContextOptions) {
        super(options)
        log.contexts++
      }
      createBufferSource() {
        return counted(super.createBufferSource())
      }
      createOscillator() {
        return counted(super.createOscillator())
      }
    }
  })
  const audio = () =>
    page.evaluate(() => {
      const { audioLog } = window as unknown as {
        audioLog: { contexts: number; cues: number }
      }
      return { ...audioLog }
    })
  await page.goto('/')
  await ready(page)
  const sound = page.getByTestId('sound-toggle')
  await expect(sound).toHaveAccessibleName('Sound effects')
  await expect(sound).toHaveAttribute('aria-pressed', 'true')
  // Pointing at tapes is no gesture: nothing starts, and nothing is held to
  // play all at once later (the loud pop of cues queued on a frozen clock).
  const tapes = page.locator('#projects a[href^="/project/"]')
  await tapes.first().hover()
  await tapes.last().hover()
  await page.mouse.move(4, 4)
  expect(await audio()).toEqual({ contexts: 0, cues: 0 })
  // The first press, on bare page, starts audio and releases nothing.
  await page.mouse.click(4, 400)
  await expect.poll(async () => (await audio()).contexts).toBe(1)
  await page.waitForTimeout(300)
  expect((await audio()).cues).toBe(0)
  // From then on a tape answers the pointer with one tick.
  await tapes.first().hover()
  await expect.poll(async () => (await audio()).cues).toBe(1)
  // Off is silent; turning it back on confirms with the tick.
  await sound.click()
  await expect(sound).toHaveAttribute('aria-pressed', 'false')
  await tapes.last().hover()
  await page.waitForTimeout(300)
  expect((await audio()).cues).toBe(1)
  await sound.click()
  await expect(sound).toHaveAttribute('aria-pressed', 'true')
  await expect.poll(async () => (await audio()).cues).toBe(2)
  // Off is remembered on the next visit, and stays silent through its
  // gestures; on again is the default, so it is simply forgotten.
  await sound.click()
  await expect(sound).toHaveAttribute('aria-pressed', 'false')
  await page.reload()
  await ready(page)
  await expect(sound).toHaveAttribute('aria-pressed', 'false')
  await page.mouse.click(4, 400)
  await tapes.first().hover()
  await page.waitForTimeout(300)
  expect(await audio()).toEqual({ contexts: 0, cues: 0 })
  await sound.click()
  await expect(sound).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await ready(page)
  await expect(sound).toHaveAttribute('aria-pressed', 'true')
})

test('one sound key is live at a time, and all show one state', async ({
  page,
}) => {
  await page.goto('/')
  await ready(page)
  const corner = page.getByTestId('sound-toggle')
  const deck = page
    .getByTestId('studio-scene')
    .getByRole('button', { name: 'Sound effects', exact: true })
  await expect(corner).toBeInViewport({ ratio: 1 })
  // The page's key stands over the tape going in, beside Skip.
  await page.locator('#projects a[href="/project/superset-d1"]').click()
  const skip = page.getByRole('button', { name: 'Skip animation' })
  await expect(skip).toBeVisible()
  await expect(corner).toBeVisible()
  // Once the tape is in, the deck's key takes over and the page's is away:
  // hidden, and out of the focus loop.
  await skip.click()
  await expect(page.locator('article h2')).toBeFocused()
  await expect(corner).toBeHidden()
  await expect(corner).toHaveAttribute('inert', '')
  await deck.click()
  await expect(deck).toHaveAttribute('aria-pressed', 'false')
  // It comes back with the page, showing what the deck set.
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/')
  await expect(corner).toBeVisible()
  await expect(corner).toHaveAttribute('aria-pressed', 'false')
})

test('Tab wraps inside the full-height reader, past the hidden sound key', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/project/superset-d1')
  const reader = page.getByTestId('native-reader')
  await expect(reader).toBeVisible()
  const keys = reader.getByRole('group', { name: 'VHS player controls' })
  await keys.getByRole('button', { name: 'Eject tape' }).focus()
  await page.keyboard.press('Tab')
  await expect(reader.locator('article')).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(keys.getByRole('button', { name: 'Eject tape' })).toBeFocused()
})

test('the sound key ends the header row at every width', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  for (const [width, height] of [
    [1440, 900],
    [1280, 800],
    [1024, 768],
    [390, 844],
    [320, 640],
  ]) {
    await page.setViewportSize({ width, height })
    await noOverflow(page)
    // Chrome's first frame after an emulated resize can hold a rule of the
    // old width (the links' margin), so measure the frame after.
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    )
    const row = await page.evaluate(() => {
      const box = (el: Element) => el.getBoundingClientRect()
      const key = box(document.querySelector('[data-testid="sound-toggle"]')!)
      const mark = box(
        document.querySelector('[data-testid="sound-toggle"] svg')!,
      )
      const about = box(document.querySelector('header nav a:last-child')!)
      const header = box(document.querySelector('header')!)
      const cassette = box(document.querySelector('header a svg')!)
      return {
        keyMiddle: (key.top + key.bottom) / 2,
        aboutMiddle: (about.top + about.bottom) / 2,
        keyLeft: key.left,
        aboutRight: about.right,
        markRight: mark.right,
        markMiddle: (mark.left + mark.right) / 2,
        column: { left: header.left, right: header.right },
        cassetteMiddle: cassette.width
          ? (cassette.left + cassette.right) / 2
          : null,
        keyRight: key.right,
        viewport: document.documentElement.clientWidth,
      }
    })
    const at = `${width} × ${height}`
    expect(Math.abs(row.keyMiddle - row.aboutMiddle), at).toBeLessThan(1)
    expect(row.keyLeft, at).toBeGreaterThanOrEqual(row.aboutRight)
    expect(row.keyRight, at).toBeLessThanOrEqual(row.viewport)
    if (row.cassetteMiddle === null)
      // The mark ends on the column, after the links.
      expect(Math.abs(row.markRight - row.column.right), at).toBeLessThan(1)
    else
      // The mark mirrors the nameplate's cassette across the page.
      expect(
        Math.abs(
          row.markMiddle -
            row.column.right -
            (row.column.left - row.cassetteMiddle),
        ),
        at,
      ).toBeLessThan(1)
  }
})

/** The caption over the studio, which names the tape previewed. */
function caption(page: Page) {
  return page.locator('[class*="objectCaption"]')
}

/**
 * A point where a slot of the studio's still takes the pointer. Nearer
 * slots overlap a farther one's target, as in the scene's raycast, so the
 * point is where this slot's own target is on top.
 */
function slotPoint(page: Page, slot: string) {
  return page.locator(`[data-slot="${slot}"]`).evaluate((el) => {
    const box = el.getBoundingClientRect()
    for (let x = 0.05; x < 1; x += 0.05)
      for (let y = 0.2; y < 1; y += 0.1) {
        const at = {
          x: box.left + box.width * x,
          y: box.top + box.height * y,
        }
        if (document.elementFromPoint(at.x, at.y) === el) return at
      }
    return null
  })
}

/** No WebGL at all: the page shows the studio's still. */
function withoutWebGL(page: Page) {
  return page.addInitScript(() => {
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
}

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
  // The studio's still takes its place, and a note says what is missing,
  // why, and that a reload can bring it back.
  await expect(page.locator('[data-flat="lost"]')).toBeVisible()
  const note = page.getByRole('note')
  await expect(note).toContainText('You’re seeing a still of the studio.')
  await expect(note).toContainText(
    'This browser stopped drawing the live studio.',
  )
  await expect(note.getByRole('button', { name: 'Reload' })).toBeVisible()
  await page.getByRole('link', { name: 'About', exact: true }).click()
  await expect(
    page.getByRole('heading', {
      name: 'About',
      exact: true,
      level: 2,
    }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/')
  await withoutWebGL(page)
  await page.reload()
  await ready(page)
  await expect(page.locator('canvas')).toHaveCount(0)
  // No WebGL at all: the note says why, and a reload would not help.
  await expect(page.locator('[data-flat="unavailable"]')).toBeVisible()
  await expect(page.getByRole('note')).toContainText('(WebGL)')
  await expect(
    page.getByRole('note').getByRole('button', { name: 'Reload' }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('img', { name: /^A picture of the 3D studio/ }),
  ).toBeVisible()
  // The still's rack is the picker: pointing at a tape previews it, as the
  // studio does, and choosing it plays it.
  const point = await slotPoint(page, 'superset-d1')
  expect(point).not.toBeNull()
  await page.mouse.move(point!.x, point!.y)
  await expect(caption(page)).toContainText('SUPERSET D1')
  await page.mouse.click(point!.x, point!.y)
  await expect(
    page.getByRole('heading', {
      name: 'Cloudflare D1 in Apache Superset',
      exact: true,
    }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/')
  await page.getByRole('link', { name: /^Play tape: 01 SUPERSET D1/ }).click()
  await expect(
    page.getByRole('heading', {
      name: 'Cloudflare D1 in Apache Superset',
      exact: true,
    }),
  ).toBeVisible()
  // A project's own links read in the fallback reader as they do on the tube.
  await expect(
    page.getByRole('list', { name: 'Project links' }).getByRole('link').first(),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/')
})

test('the still lifts a tape only once decoded, and its dissolve never dims', async ({
  page,
}) => {
  type Probe = {
    release: () => void
    frames: { sum: number; d1: number }[]
  }
  await withoutWebGL(page)
  // D1's still decodes only when the test lets it. Every frame records the
  // stills' opacities: they add, so their sum must stay one, and how far
  // D1's still has come up.
  await page.addInitScript(() => {
    const probe = window as unknown as Probe
    const decode = HTMLImageElement.prototype.decode
    const held: (() => void)[] = []
    HTMLImageElement.prototype.decode = function () {
      if (!this.currentSrc.includes('-superset-d1-')) return decode.call(this)
      return new Promise<void>((resolve, reject) => {
        held.push(() => void decode.call(this).then(resolve, reject))
      })
    }
    probe.release = () => held.splice(0).forEach((go) => go())
    probe.frames = []
    const frame = () => {
      const stills = [
        ...document.querySelectorAll<HTMLImageElement>('img[data-still]'),
      ]
      const opacity = (img?: HTMLImageElement) =>
        img ? Number(getComputedStyle(img).opacity) : 0
      if (stills.length)
        probe.frames.push({
          sum: stills.reduce((sum, img) => sum + opacity(img), 0),
          d1: opacity(
            stills.find((img) => img.dataset.still === 'superset-d1'),
          ),
        })
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  })
  await page.goto('/')
  await ready(page)
  await expect(page.locator('[data-flat="unavailable"]')).toBeVisible()
  const d1 = await slotPoint(page, 'superset-d1')
  const blank = await slotPoint(page, 'coming-2')
  const about = await slotPoint(page, 'about')
  expect(d1 && blank && about).toBeTruthy()

  // Loaded is not decoded: until it is, the studio at rest stays on show,
  // however long the pointer waits.
  await page.mouse.move(d1!.x, d1!.y)
  await expect(caption(page)).toContainText('SUPERSET D1')
  const still = page.locator('img[data-still="superset-d1"]')
  await expect
    .poll(() => still.evaluate((img: HTMLImageElement) => img.complete))
    .toBe(true)
  await page.waitForTimeout(400)
  const held = await page.evaluate(() => (window as unknown as Probe).frames)
  expect(Math.max(...held.map((frame) => frame.d1))).toBe(0)
  await page.evaluate(() => (window as unknown as Probe).release())
  await expect
    .poll(() => still.evaluate((img) => getComputedStyle(img).opacity))
    .toBe('1')

  // The pointer runs along the rack and back without waiting, so every
  // dissolve is overtaken by the next: the picture never dims.
  await page.evaluate(() => ((window as unknown as Probe).frames.length = 0))
  for (const point of [blank, about, d1, blank, about, d1, blank])
    await page.mouse.move(point!.x, point!.y, { steps: 2 })
  await page.mouse.move(10, 500)
  await page.waitForTimeout(400)
  const sums = await page.evaluate(() =>
    (window as unknown as Probe).frames.map((frame) => frame.sum),
  )
  expect(sums.length).toBeGreaterThan(10)
  expect(Math.min(...sums)).toBeGreaterThan(0.99)
  expect(Math.max(...sums)).toBeLessThan(1.01)
})

test('the note on what is missing fades up with the still', async ({
  page,
}) => {
  type Probe = { arrival: { note: number; still: number }[] }
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await withoutWebGL(page)
  // Every frame from the note's first records its opacity and the still's.
  await page.addInitScript(() => {
    const probe = window as unknown as Probe
    probe.arrival = []
    const frame = () => {
      const note = document.querySelector('[data-testid="flat-note"]')
      const picture = document.querySelector(
        'img[data-still="rest"]',
      )?.parentElement
      if (note)
        probe.arrival.push({
          note: Number(getComputedStyle(note).opacity),
          still: picture ? Number(getComputedStyle(picture).opacity) : 0,
        })
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  })
  await page.goto('/')
  await ready(page)
  const note = page.getByTestId('flat-note')
  const opacity = () => note.evaluate((el) => getComputedStyle(el).opacity)
  await expect.poll(opacity).toBe('1')
  // It waits for the still and rises with it, frame for frame.
  const frames = await page.evaluate(() => (window as unknown as Probe).arrival)
  expect(frames.some(({ note }) => note > 0 && note < 1)).toBe(true)
  for (const { note, still } of frames)
    expect(Math.abs(note - still)).toBeLessThan(0.05)

  // A tape played and ejected brings it back with the page chrome.
  await page.getByRole('link', { name: /^Play tape: 01 SUPERSET D1/ }).click()
  await expect(
    page.getByRole('heading', {
      name: 'Cloudflare D1 in Apache Superset',
      exact: true,
    }),
  ).toBeVisible()
  await expect.poll(opacity).toBe('0')
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/')
  await expect.poll(opacity).toBe('1')

  // Under reduced motion it is simply there, from its first frame.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await ready(page)
  const recorded = () =>
    page.evaluate(() => (window as unknown as Probe).arrival)
  await expect.poll(async () => (await recorded()).length).toBeGreaterThan(2)
  expect((await recorded()).every(({ note }) => note === 1)).toBe(true)
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
    // Sweep along the middle of the rack, through slot 03's centre.
    const centre = toScreen(
      state.scene
        .getObjectByName('tape-coming-2')!
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
  // The four blank slots between SUPERSET D1 and About answer no pointer, so
  // the guide reads idle across them; a lifting tape that flickered at its
  // edge would name itself again.
  expect(forward).toEqual(['SUPERSET D1', idle, 'ABOUT', idle])
  expect(back).toEqual(['ABOUT', idle, 'SUPERSET D1', idle])
})

test('in the mobile look the blank slots share one cell, met once', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await ready(page)
  const list = page.locator('#projects ul')
  // The larger look keeps a cell for every slot, as the rack does.
  const onePerSlot = `
    - list:
      - listitem:
        - link /^Play tape. 01 SUPERSET D1/
      - listitem: 02 Coming soon… Blank tape
      - listitem: 03 Coming soon… Blank tape
      - listitem: 04 Coming soon… Blank tape
      - listitem: 05 Coming soon… Blank tape
      - listitem:
        - link /^Play tape. 06 ABOUT/
  `
  await expect(list).toMatchAriaSnapshot(onePerSlot)
  const d1 = page.getByRole('link', { name: /^Play tape: 01 SUPERSET D1/ })
  const about = page.getByRole('link', { name: /^Play tape: 06 ABOUT/ })
  // Phones, narrow windows, and small phones on their side: the stylesheet
  // folds the run into its first cell, so a screen reader meets it once, as
  // "02 to 05", and nothing of the other three is left in the list.
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 740 },
    { width: 767, height: 1024 },
    { width: 739, height: 390 },
  ]) {
    await page.setViewportSize(viewport)
    await expect(list).toMatchAriaSnapshot(`
      - list:
        - listitem:
          - link /^Play tape. 01 SUPERSET D1/
        - listitem: 02 to 05 Coming soon… Blank tapes
        - listitem:
          - link /^Play tape. 06 ABOUT/
    `)
    const cells = list.locator('> li').filter({ visible: true })
    await expect(cells).toHaveCount(3)
    const run = cells.nth(1)
    // On the page it reads as the spine numbers do: 02–05.
    expect(
      await run
        .locator('span')
        .first()
        .evaluate((el) => {
          const shown = el.cloneNode(true) as HTMLElement
          shown.querySelectorAll('.srOnly').forEach((node) => node.remove())
          return shown.textContent
        }),
    ).toBe('02–05')
    await expect(run.locator('a, button, [tabindex]')).toHaveCount(0)
    // From the right-hand column the run spans both rows, beside SUPERSET D1
    // and About, so the grid closes without a hole. The cells are measured
    // together, in one layout: in the first frame after a resize the
    // headline above still sets its first line at the old size, then moves
    // the list, and boxes taken one call at a time could straddle it.
    const [first, blank, last] = await cells.evaluateAll((items) =>
      items
        .map((item) => item.getBoundingClientRect())
        .map(({ x, y, width, height }) => ({ x, y, width, height })),
    )
    expect(blank.x).toBeGreaterThan(first.x + first.width)
    expect(last.x).toBeCloseTo(first.x, 0)
    expect(last.y).toBeGreaterThan(first.y + first.height)
    expect(blank.y).toBeCloseTo(first.y, 0)
    expect(blank.y + blank.height).toBeCloseTo(last.y + last.height, 0)
    await noOverflow(page)
    // The arrows and Home/End still move between the tapes that play.
    await d1.focus()
    await page.keyboard.press('ArrowRight')
    await expect(about).toBeFocused()
    await page.keyboard.press('ArrowLeft')
    await expect(d1).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(about).toBeFocused()
    await page.keyboard.press('Home')
    await expect(d1).toBeFocused()
    await page.keyboard.press('End')
    await expect(about).toBeFocused()
    await about.blur()
  }
  // Back at the larger look, with no reload: a cell for every slot again,
  // on a phone on its side as on a desktop.
  for (const viewport of [
    { width: 844, height: 390 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport)
    await expect(list).toMatchAriaSnapshot(onePerSlot)
  }
})

test('slots without a project hold blank tapes that are coming soon', async ({
  page,
}) => {
  await page.goto('/')
  await ready(page)
  const entries = page.locator('#projects li')
  await expect(entries).toHaveCount(6)
  await expect(page.getByRole('link', { name: /^Play tape:/ })).toHaveCount(2)
  // Slots 02 to 05 are read, not played: no link, and outside the tab order.
  for (const slot of [1, 2, 3, 4]) {
    const entry = entries.nth(slot)
    await expect(entry).toContainText(`0${slot + 1}`)
    await expect(entry).toContainText('Coming soon…')
    await expect(entry.locator('a, button, [tabindex]')).toHaveCount(0)
  }
  const d1 = page.getByRole('link', {
    name: /^Play tape: 01 SUPERSET D1/,
  })
  const about = page.getByRole('link', { name: /^Play tape: 06 ABOUT/ })
  await d1.focus()
  await page.keyboard.press('ArrowRight')
  await expect(about).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(d1).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(about).toBeFocused()
  await page.keyboard.press('Home')
  await expect(d1).toBeFocused()
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
    const { Raycaster, Vector2, Vector3 } =
      (await import('/node_modules/.vite/deps/three.js')) as typeof import('three')
    const rect = document.querySelector('canvas')!.getBoundingClientRect()
    const centre = state.scene
      .getObjectByName('tape-coming-1')!
      .getWorldPosition(new Vector3())
      .project(state.camera)
    // Every slot envelope the pointer's ray meets there, nearest first.
    const ray = new Raycaster()
    ray.setFromCamera(new Vector2(centre.x, centre.y), state.camera)
    return {
      blankPrints: prints('tape-coming-1'),
      printedPrints: prints('tape-superset-d1'),
      targets: state.internal.interaction
        .map((object) => object.name)
        .filter((name) => name.startsWith('pointer-target-'))
        .sort(),
      throughBlank: ray
        .intersectObjects(state.internal.interaction, false)
        .map((hit) => hit.object.name)
        .filter((name) => name.startsWith('pointer-target-')),
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
    'pointer-target-coming-3',
    'pointer-target-coming-4',
    'pointer-target-superset-d1',
  ])
  // The three-quarter camera looks along the rack: a ray through slot 02's
  // blank tape runs on into SUPERSET D1's envelope behind it in slot 01,
  // meeting only blank slots on the way, its own among them. They swallow
  // it, so the guide stays idle and a click plays nothing.
  const reachesD1 = studio.throughBlank.indexOf('pointer-target-superset-d1')
  expect(reachesD1).toBeGreaterThan(0)
  const before = studio.throughBlank.slice(0, reachesD1)
  expect(before).toContain('pointer-target-coming-1')
  expect(
    before.filter((name) => !name.startsWith('pointer-target-coming-')),
  ).toEqual([])
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

test('the REC dot stands centred on the capitals it closes', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 600, height: 800 })
  await page.goto('/project/superset-d1')
  const line = page.getByTestId('native-reader').getByText(/^REC/)
  await line.scrollIntoViewIfNeeded()
  const offset = await line.evaluate(async (el) => {
    await document.fonts.ready
    const dot = el.querySelector('span')!.getBoundingClientRect()
    // The line's baseline, from an empty box set on it, and VT323's
    // capitals, measured as drawn.
    const probe = document.createElement('span')
    probe.style.cssText = 'display: inline-block; vertical-align: baseline'
    el.prepend(probe)
    const baseline = probe.getBoundingClientRect().bottom
    probe.remove()
    const style = getComputedStyle(el)
    const context = document.createElement('canvas').getContext('2d')!
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    const cap = context.measureText('REC').actualBoundingBoxAscent
    return (dot.top + dot.bottom) / 2 - (baseline - cap / 2)
  })
  expect(Math.abs(offset)).toBeLessThan(0.5)
})
