import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

// The built site, as a host will serve it: every route drawn ahead of time
// (scripts/prerender.mjs), then taken over by the app.

const tapes = [
  { path: '/project/placeholder-alpha', title: 'Placeholder: Alpha' },
  {
    path: '/project/placeholder-beta',
    title: 'Placeholder: Beta, a Project With a Much Longer Working Title',
  },
  { path: '/project/placeholder-gamma', title: 'Placeholder: Gamma' },
  { path: '/project/about', title: 'About' },
]

async function ready(page: Page) {
  await expect(page.getByTestId('studio-scene')).toHaveAttribute(
    'data-ready',
    'true',
  )
}

test('every route is readable, and named, before any script runs', async ({
  request,
}) => {
  const home = await (await request.get('/')).text()
  expect(home).toContain(
    '<title>Daniel Alyoshin · Forward Deployed Engineer</title>',
  )
  expect(home).toContain('Real experience.')
  expect(home).toContain('Choose a tape to play')
  // The archive is links to pages that exist, not handlers waiting for script.
  for (const { path } of tapes) expect(home).toContain(`href="${path}"`)

  for (const { path, title } of tapes) {
    const response = await request.get(path)
    expect(response.status(), path).toBe(200)
    const html = await response.text()
    expect(html).toContain(`data-prerendered="${path}"`)
    expect(html).toContain(`<title>${title} · Daniel Alyoshin</title>`)
    // The tape itself is in the page, and the page unfurls under its name.
    expect(html).toMatch(/<article[^>]*aria-label="[^"]* details"/)
    expect(html).toContain(`>${title}</h2>`)
    for (const tag of ['og:title', 'twitter:title'])
      expect(html).toMatch(
        new RegExp(`"${tag}"\\s+content="${title} · Daniel Alyoshin"`),
      )
    // One line of its own, said three times: search, Open Graph, Twitter.
    const described = html.match(/name="description"\s+content="([^"]*)"/)?.[1]
    expect(described, path).toBeTruthy()
    expect(described).not.toContain('Portfolio of Daniel Alyoshin')
    expect(html.split(`content="${described}"`)).toHaveLength(4)
  }

  // The page a static host serves for any address it has no file for.
  const missing = await (await request.get('/404.html')).text()
  expect(missing).toContain('<title>No signal · Daniel Alyoshin</title>')
  expect(missing).toContain('NO SIGNAL')
  expect(missing).toContain('<meta name="robots" content="noindex" />')

  const robots = await request.get('/robots.txt')
  expect(robots.headers()['content-type']).toContain('text/plain')
  expect(await robots.text()).toMatch(/^User-agent: \*\nAllow: \/\n/)
})

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
])
  test(`the app takes a drawn page over where it stands, without a word in the console (${viewport.width}px)`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    const noise: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'warning' || message.type() === 'error')
        noise.push(`${message.type()}: ${message.text()}`)
    })
    page.on('pageerror', (error) => noise.push(`pageerror: ${error.message}`))
    // Hydration keeps the nodes the host sent; a mismatch, or a fresh render,
    // would replace them.
    await page.addInitScript(() => {
      const state = { replaced: false }
      Object.assign(window, { served: state })
      const watch = () => {
        const root = document.getElementById('root')
        const first = root?.firstElementChild
        if (!root || !first) return void requestAnimationFrame(watch)
        new MutationObserver(() => {
          if (!first.isConnected) state.replaced = true
        }).observe(root, { childList: true })
      }
      watch()
    })
    for (const path of ['/', '/project/placeholder-alpha']) {
      await page.goto(path)
      await ready(page)
      expect(
        await page.evaluate(
          () => (window as unknown as { served: { replaced: boolean } }).served,
        ),
        path,
      ).toEqual({ replaced: false })
    }
    // Taken over, it plays: eject the tape the link arrived on, pick another.
    await page.keyboard.press('Escape')
    await expect(page).toHaveURL('/')
    await page.getByRole('link', { name: /Play tape: 02 BETA/ }).click()
    await expect(page).toHaveURL('/project/placeholder-beta')
    await expect(page).toHaveTitle(/^Placeholder: Beta, .* · Daniel Alyoshin$/)
    expect(noise).toEqual([])
  })

test('the page is drawn for the width it is served at, before the app arrives', async ({
  browser,
}) => {
  // No script at all: what a crawler, or a slow phone's first second, sees.
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Real experience. Real solutions.' }),
  ).toBeVisible()
  await expect(
    page.getByText('Pick one from the projects below.'),
  ).toBeVisible()
  await expect(page.getByText('Pick one in the studio.')).toBeHidden()
  await expect(page.getByText('Setting the scene…')).toBeVisible()
  // The archive works as plain links: the tape's page is a real page.
  await page.getByRole('link', { name: /Play tape: 01 ALPHA/ }).click()
  await expect(page).toHaveURL('/project/placeholder-alpha')
  await expect(
    page.getByRole('heading', { name: 'Placeholder: Alpha', exact: true }),
  ).toBeVisible()
  await context.close()
})

test('the studio waits for the page: its module is requested after first paint', async ({
  page,
}) => {
  await page.goto('/')
  await ready(page)
  const timing = await page.evaluate(() => ({
    painted: performance
      .getEntriesByType('paint')
      .find((entry) => entry.name === 'first-contentful-paint')!.startTime,
    studio: performance
      .getEntriesByType('resource')
      .find((entry) => /StudioScene-[^/]*\.js$/.test(entry.name))!.startTime,
  }))
  expect(timing.studio).toBeGreaterThan(timing.painted)
})

test('a dead link served the 404 page reads NO SIGNAL for its own address', async ({
  page,
}) => {
  // Drawn for no address in particular, so the app renders it afresh for the
  // one it was asked for: a dead tape and a dead channel say different things.
  await page.route('**/project/not-a-tape', async (route) => {
    const response = await route.fetch({
      url: new URL('/404.html', route.request().url()).href,
    })
    await route.fulfill({ response, status: 404 })
  })
  await page.goto('/project/not-a-tape')
  await expect(page.getByText('THIS TAPE DOES NOT EXIST')).toBeVisible()
  await expect(page).toHaveTitle('No signal · Daniel Alyoshin')
  await ready(page)
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/')
  await expect(
    page.getByRole('link', {
      name: 'Daniel Alyoshin Forward deployed engineer home',
    }),
  ).toBeFocused()
})
