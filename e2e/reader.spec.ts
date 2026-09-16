import { expect, test, type Page } from '@playwright/test'

/**
 * The modeled reader is authored on a 560px plane and drawn at the camera's
 * zoom, so its computed CSS sizes are not what the eye gets. Read the real
 * size: the CSS size times the scale the tube draws it at.
 */
async function measure(page: Page) {
  return page.locator('[data-testid="project-reader"]').evaluate((content) => {
    const article = content.querySelector('article')!
    const prose = article.querySelectorAll('p')[2]
    const scale =
      content.getBoundingClientRect().width /
      parseFloat((content as HTMLElement).style.width || '560')
    return {
      width: parseFloat((content as HTMLElement).style.width || '560'),
      scale: Math.round(scale * 1000) / 1000,
      prose:
        Math.round(parseFloat(getComputedStyle(prose).fontSize) * scale * 10) /
        10,
      continues: article.hasAttribute('data-more'),
      fade: getComputedStyle(content.querySelector('article + div')!).opacity,
      scrollbar: getComputedStyle(article).scrollbarColor,
    }
  })
}

test('the modeled reader keeps a real 16px prose floor on common laptops and shows that the article continues', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/project/placeholder-alpha')
  await expect(page.getByTestId('project-reader')).toBeVisible()
  await expect(page.getByTestId('native-reader')).toHaveCount(0)
  // Above the reference zoom the reader is its 560px plane, scaled up.
  await expect
    .poll(async () => (await measure(page)).scale)
    .toBeGreaterThan(1.1)
  const large = await measure(page)
  expect(large.width).toBe(560)
  expect(large.prose).toBeGreaterThan(19)
  // Below it, the plane grows and the content shrinks to match, so one CSS
  // pixel is one screen pixel and the 16px floor is real (The Tube-Scale
  // Rule). The reader follows a resize during playback the same way.
  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1280, height: 720 },
    { width: 1024, height: 768 },
  ]) {
    await page.setViewportSize(viewport)
    await expect.poll(async () => (await measure(page)).scale).toBeCloseTo(1, 1)
    const reader = await measure(page)
    expect(reader.width).toBeLessThan(560)
    expect(reader.prose).toBeGreaterThanOrEqual(15.9)
    expect(reader.prose).toBeLessThanOrEqual(17.1)
    // The modeled screen still holds the whole reader.
    const content = page.getByTestId('project-reader')
    const screen = (await content.boundingBox())!
    expect(screen.width).toBeGreaterThan(reader.width - 2)
    expect(screen.width).toBeLessThan(reader.width + 2)
  }
  // The scrollbar reads at 3:1 or better on the tube, and a fade at the
  // tube's foot marks the article's continuation until its end is in view.
  const reader = await measure(page)
  expect(reader.scrollbar).toBe('rgb(92, 102, 131) rgba(0, 0, 0, 0)')
  expect(reader.continues).toBe(true)
  expect(reader.fade).toBe('1')
  const article = page.getByTestId('project-reader').locator('article')
  await article.evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await expect.poll(async () => (await measure(page)).continues).toBe(false)
  await expect.poll(async () => (await measure(page)).fade).toBe('0')
  await article.evaluate((el) => {
    el.scrollTop = 0
  })
  await expect.poll(async () => (await measure(page)).continues).toBe(true)
  // A tape chosen from the studio mounts the reader by the selection path
  // rather than the handoff, and sizes it the same way.
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/')
  await page.getByRole('link', { name: /Play tape: Placeholder: Beta/ }).click()
  await expect(page).toHaveURL('/project/placeholder-beta')
  await expect(page.getByTestId('project-reader')).toBeVisible()
  await expect.poll(async () => (await measure(page)).scale).toBeCloseTo(1, 1)
  const chosen = await measure(page)
  expect(chosen.width).toBeLessThan(560)
  expect(chosen.prose).toBeGreaterThanOrEqual(15.9)
  // The same cue serves the native reader.
  await page.setViewportSize({ width: 390, height: 844 })
  const native = page.getByTestId('native-reader').locator('article')
  await expect(native).toBeVisible()
  await expect(native).toHaveAttribute('data-more', '')
  await native.evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await expect(native).not.toHaveAttribute('data-more', '')
})
