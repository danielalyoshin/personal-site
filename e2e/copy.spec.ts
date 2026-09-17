import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

declare global {
  interface Window {
    printed: string[]
  }
}

async function ready(page: Page) {
  await expect(page.getByTestId('studio-scene')).toHaveAttribute(
    'data-ready',
    'true',
  )
}

test('the archive has one name: the link, the heading it leads to, the skip link and the tube', async ({
  page,
}) => {
  // Canvas maps cannot be read back as text: record what they are painted with.
  await page.addInitScript(() => {
    window.printed = []
    const { fillText } = CanvasRenderingContext2D.prototype
    CanvasRenderingContext2D.prototype.fillText = function (...args) {
      window.printed.push(args[0])
      return fillText.apply(this, args)
    }
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await ready(page)
  const link = page
    .getByRole('navigation', { name: 'Site' })
    .getByRole('link', {
      name: 'The archive',
      exact: true,
    })
  await expect(link).toHaveAttribute('href', '#archive')
  // A link's words are the heading it lands on.
  await expect(
    page.locator('#archive').getByRole('heading', { level: 2 }),
  ).toHaveText('The archive')
  await expect(page.getByRole('region', { name: 'The archive' })).toBeVisible()
  await expect(page.locator('a[href="#archive"]').first()).toHaveText(
    'Skip to the archive',
  )
  await expect(page.getByRole('status')).toHaveText(
    'Studio ready. Choose a tape from the archive.',
  )
  await expect(page.getByText(/tape index|the shelf/i)).toHaveCount(0)

  // The models print the same name, and only what is true of the machine:
  // no tape speed, no head count, no stereo claim.
  const printed = await page.evaluate(() => window.printed)
  expect(printed).toEqual(
    expect.arrayContaining([
      'ALYOSHIN ARCHIVE',
      'STANDBY',
      'AV–01',
      'AV–01  /  VHS',
    ]),
  )
  for (const print of printed)
    expect(print).not.toMatch(/\b(SP|LP)\b|4 HEAD|STEREO/)
})

test('the About tape has one name wherever it is named', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await ready(page)
  const nav = page
    .getByRole('navigation', { name: 'Site' })
    .getByRole('link', { name: 'About', exact: true })
  await expect(nav).toBeVisible()
  // Its entry follows every tape's rule: spine name over caption, and the
  // tape's own title in the accessible name.
  const entry = page.getByRole('link', {
    name: 'Play tape: About (2026)',
    exact: true,
  })
  await expect(entry).toHaveText('06ABOUTMeet the maker')
  // The guide names it as the entry does, with the same caption.
  await entry.focus()
  const guide = page.getByText('Meet the maker · Select to play')
  await expect(guide).toBeVisible()
  await expect(guide.locator('..')).toHaveText(
    'ABOUTMeet the maker · Select to play',
  )
  await nav.click()
  await expect(
    page.getByRole('heading', { name: 'About', exact: true, level: 2 }),
  ).toBeFocused()
  await expect(page).toHaveTitle('About — Daniel Alyoshin')
  await expect(page.getByRole('status')).toHaveText('Playing About')
  // The owner's name is on the tube once, in the ident.
  await expect(
    page
      .getByTestId('project-reader')
      .getByText('Daniel Alyoshin', { exact: true }),
  ).toHaveCount(1)
})

test('the counter is the reading time of the copy on the tube, and a screen reader is told it too', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const slug of ['placeholder-alpha', 'placeholder-beta', 'about']) {
    await page.goto(`/project/${slug}`)
    await ready(page)
    const tube = page.getByTestId('project-reader')
    const counter = tube.getByText(/MIN READ$/)
    await expect(counter).toBeVisible()
    // Counted from what the tube shows, at 230 words a minute.
    const minutes = await tube.getByRole('article').evaluate((article) => {
      const words = Array.from(
        article.querySelectorAll('h2, p:not([aria-hidden]), figcaption'),
      )
        // The meta line (year, role) is not part of the write-up.
        .filter((el) => !el.querySelector('.srOnly'))
        .map((el) => el.textContent ?? '')
        .join(' ')
        .split(/\s+/)
        .filter(Boolean).length
      return Math.max(1, Math.round(words / 230))
    })
    await expect(counter).toHaveText(`${minutes} MIN READ`)
    // The bar is decorative to assistive technology; the meta line says it.
    await expect(counter.locator('..')).toHaveAttribute('aria-hidden', 'true')
    await expect(tube.getByRole('article').locator('.srOnly')).toHaveText(
      ` · ${minutes} minute read`,
    )
    await expect(counter.locator('..')).not.toHaveText(/\b(SP|LP)\b|\d:\d\d/)
  }
  // On the narrowest phone the counter's word gives way so the number keeps
  // clear of the name: at least two characters of air.
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto('/project/placeholder-beta')
  const bar = page
    .getByTestId('native-reader')
    .getByText('Daniel Alyoshin', { exact: true })
    .locator('..')
  const counter = bar.locator('> span').nth(2)
  await expect(counter).toBeVisible()
  await expect(counter).toHaveText(/^\d+ MIN$/, { useInnerText: true })
  const air = await bar.evaluate((el) => {
    const [, ident, counter] = Array.from(el.children, (child) =>
      child.getBoundingClientRect(),
    )
    return counter.left - ident.right
  })
  expect(air).toBeGreaterThanOrEqual(14)
})

test('the native Eject key is named for what it does; ESC is its shortcut, not its name', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  // A short desktop viewport reads in the native reader, legend showing.
  await page.setViewportSize({ width: 1024, height: 640 })
  await page.goto('/project/placeholder-alpha')
  const key = page
    .getByRole('group', { name: 'VHS player controls' })
    .getByRole('button', { name: 'Eject tape', exact: true })
  await expect(key).toBeVisible()
  await expect(key).toHaveAccessibleName('Eject tape')
  await expect(key).toHaveAttribute('aria-keyshortcuts', 'Escape')
  await expect(key.locator('kbd')).toBeVisible()
  await expect(key.locator('kbd')).toHaveAttribute('aria-hidden', 'true')
  // The modeled key carries the same name and shortcut.
  await page.setViewportSize({ width: 1440, height: 900 })
  await ready(page)
  const modeled = page.getByRole('button', { name: 'Eject tape', exact: true })
  await expect(modeled).toHaveAttribute('aria-keyshortcuts', 'Escape')
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/')
})

test('the footer names the two places it links to', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const footer = page.getByRole('contentinfo')
  await expect(footer).toContainText(
    'Want to talk shop? I’m on GitHub and LinkedIn.',
  )
  // The sentence is a promise: both links it names are beside it.
  const contact = footer.getByRole('navigation', { name: 'Contact' })
  await expect(contact.getByRole('link')).toHaveCount(2)
  await expect(contact.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/danielalyoshin',
  )
  await expect(contact.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/danielalyoshin/',
  )
  await expect(
    page.getByText('One person, both sides of the seam'),
  ).toBeVisible()
})
