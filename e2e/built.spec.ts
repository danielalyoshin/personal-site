import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

// The built site, as a host will serve it: every route drawn ahead of time
// (scripts/prerender.mjs), then taken over by the app.

const tapes = [
  { path: '/project/superset-d1', title: 'Cloudflare D1 in Apache Superset' },
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
  // Every tape is linked, and nothing else on the page leads to a tape.
  expect(new Set(home.match(/(?<=href=")\/project\/[^"]*/g))).toEqual(
    new Set(tapes.map(({ path }) => path)),
  )

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
    // And a card of its own: this tape going into the deck, said twice.
    const meta = (key: string) =>
      html.match(
        new RegExp(`<meta\\s+(?:property|name)="${key}"\\s+content="([^"]*)"`),
      )?.[1]
    const card = meta('og:image')!
    expect(card).toMatch(
      new RegExp(`/social-cards/${path.split('/').pop()}\\.png$`),
    )
    expect(meta('twitter:image')).toBe(card)
    expect(meta('og:image:alt')).toContain('LOADING TAPE')
    expect(meta('twitter:image:alt')).toBe(meta('og:image:alt'))
    const image = await request.get(new URL(card, 'http://x').pathname)
    expect(image.headers()['content-type']).toBe('image/png')
    const png = await image.body()
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630])
  }
  // Every tape's card differs from the site's, and from every other tape's.
  const cards = await Promise.all(
    [
      '/social-card.png',
      ...tapes.map(({ path }) => `/social-cards/${path.split('/').pop()}.png`),
    ].map(async (url) =>
      (await (await request.get(url)).body()).toString('base64'),
    ),
  )
  expect(new Set(cards).size).toBe(cards.length)

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
    for (const path of ['/', '/project/superset-d1']) {
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
    await page.getByRole('link', { name: /Play tape: 06 ABOUT/ }).click()
    await expect(page).toHaveURL('/project/about')
    await expect(page).toHaveTitle('About · Daniel Alyoshin')
    expect(noise).toEqual([])
  })

test('the release build is addressed at alyoshin.dev, the address Pages serves it from', async ({
  request,
}) => {
  // .env.production: each page names itself there, share cards load from
  // there, and the sitemap lists every page the archive links to.
  const site = 'https://alyoshin.dev'
  const paths = ['/', ...tapes.map(({ path }) => path)]
  for (const path of paths) {
    const html = await (await request.get(path)).text()
    expect(html).toContain(`<link rel="canonical" href="${site}${path}" />`)
    expect(html).toContain(
      `<meta property="og:url" content="${site}${path}" />`,
    )
    for (const key of ['og:image', 'twitter:image'])
      expect(html).toMatch(
        new RegExp(`"${key}"\\s+content="${site}/social-card`),
      )
  }
  const missing = await (await request.get('/404.html')).text()
  expect(missing).not.toContain('rel="canonical"')
  expect(await (await request.get('/robots.txt')).text()).toContain(
    `\nSitemap: ${site}/sitemap.xml\n`,
  )
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap.match(/(?<=<loc>)[^<]*/g)).toEqual(
    paths.map((path) => site + path),
  )
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
  // The blank slots share one cell on a phone, by the stylesheet alone.
  await expect(page.locator('#projects').getByRole('listitem')).toHaveCount(3)
  await expect(page.getByText('Setting the scene…')).toBeVisible()
  // The archive works as plain links: the tape's page is a real page.
  await page.getByRole('link', { name: /Play tape: 01 SUPERSET D1/ }).click()
  await expect(page).toHaveURL('/project/superset-d1')
  await expect(
    page.getByRole('heading', {
      name: 'Cloudflare D1 in Apache Superset',
      exact: true,
    }),
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
