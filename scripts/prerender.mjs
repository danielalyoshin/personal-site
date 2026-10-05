// Renders every route to static HTML after `vite build`, so the page is
// readable before any script runs and each route unfurls, and is indexed,
// under its own name, a tape's with its own card. Also writes 404.html (the
// NO SIGNAL page, which static hosts serve for unknown addresses),
// robots.txt, and, once the site has an address, sitemap.xml and canonical
// URLs. Run by `npm run build`.
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build, loadEnv } from 'vite'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const server = resolve(root, 'dist-ssr')
// The site's address, from .env.production (see vite.config.ts).
const origin = (loadEnv('production', root, 'SITE_').SITE_URL ?? '').replace(
  /\/+$/,
  '',
)

const escape = (text) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

/** Replace exactly one match, or stop the build: a silent miss ships a wrong page. */
function swap(html, pattern, replacement, what) {
  const matches = html.match(new RegExp(pattern.source, pattern.flags + 'g'))
  if (matches?.length !== 1)
    throw new Error(
      `prerender: expected one ${what} in index.html, found ${matches?.length ?? 0}`,
    )
  return html.replace(pattern, replacement)
}

const meta = (key) =>
  new RegExp(`(<meta\\s+(?:name|property)="${key}"\\s+content=")[^"]*(")`)

await build({
  root,
  logLevel: 'warn',
  build: {
    ssr: 'src/entry-server.tsx',
    outDir: server,
    emptyOutDir: true,
    copyPublicDir: false,
  },
})

try {
  const { pages, render, homeTitle, studioStillFiles } = await import(
    pathToFileURL(resolve(server, 'entry-server.js')).href
  )
  // The studio's still stands in for the studio without 3D graphics; one
  // drawn before the rack changed would show the wrong tapes and answer for
  // none of the new ones.
  const stills = studioStillFiles()
  for (const file of stills.files)
    try {
      await access(resolve(dist, file.slice(1)))
    } catch {
      stills.stale.push(`${file} is not in public/`)
    }
  if (stills.stale.length)
    throw new Error(
      `prerender: the studio's stills are out of date (${stills.stale.join('; ')}). Run npm run render:flat.`,
    )
  const template = await readFile(resolve(dist, 'index.html'), 'utf8')
  const served = template.match(/<title>([^<]*)<\/title>/)?.[1]
  if (served !== escape(homeTitle))
    throw new Error(
      `prerender: index.html is titled "${served}" but site.title is "${homeTitle}"`,
    )

  for (const page of pages) {
    let html = swap(
      template,
      /<div id="root"><\/div>/,
      `<div id="root" data-prerendered="${page.path}">${render(page.path)}</div>`,
      'empty #root',
    )
    html = swap(
      html,
      /<title>[^<]*<\/title>/,
      `<title>${escape(page.title)}</title>`,
      '<title>',
    )
    for (const key of ['og:title', 'twitter:title'])
      html = swap(html, meta(key), `$1${escape(page.title)}$2`, key)
    if (page.description)
      for (const key of [
        'description',
        'og:description',
        'twitter:description',
      ])
        html = swap(html, meta(key), `$1${escape(page.description)}$2`, key)
    if (page.card) {
      // A card the build would link to but not ship unfurls as a broken image.
      try {
        await access(resolve(dist, page.card.image.slice(1)))
      } catch {
        throw new Error(
          `prerender: ${page.path} unfurls with ${page.card.image}, which is not in public/. Run npm run render:card.`,
        )
      }
      for (const key of ['og:image', 'twitter:image'])
        html = swap(html, meta(key), `$1${origin}${page.card.image}$2`, key)
      for (const key of ['og:image:alt', 'twitter:image:alt'])
        html = swap(html, meta(key), `$1${escape(page.card.alt)}$2`, key)
    }
    const head = []
    // A dead link should not be indexed under whatever address it was given.
    if (page.notFound) head.push('<meta name="robots" content="noindex" />')
    else if (origin) {
      head.push(`<link rel="canonical" href="${origin}${page.path}" />`)
      head.push(`<meta property="og:url" content="${origin}${page.path}" />`)
    }
    if (head.length)
      html = swap(
        html,
        /<\/head>/,
        `  ${head.join('\n    ')}\n  </head>`,
        '</head>',
      )
    // A flat project/<slug>.html answers at /project/<slug>, the address
    // the app itself uses, without the redirect to a trailing slash that a
    // <slug>/index.html costs on most static hosts.
    const file = resolve(
      dist,
      page.notFound
        ? '404.html'
        : page.path === '/'
          ? 'index.html'
          : `${page.path.slice(1)}.html`,
    )
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, html)
  }

  const indexed = pages.filter((page) => !page.notFound)
  await writeFile(
    resolve(dist, 'robots.txt'),
    `User-agent: *\nAllow: /\n${origin ? `\nSitemap: ${origin}/sitemap.xml\n` : ''}`,
  )
  if (origin)
    await writeFile(
      resolve(dist, 'sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexed
        .map((page) => `  <url><loc>${escape(origin + page.path)}</loc></url>`)
        .join('\n')}\n</urlset>\n`,
    )
  console.log(
    `prerendered ${indexed.length} routes, 404.html, robots.txt${origin ? ', sitemap.xml' : ' (no sitemap or canonical URLs: SITE_URL is not set)'}`,
  )
} finally {
  await rm(server, { recursive: true, force: true })
}
