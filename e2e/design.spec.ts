import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

// DESIGN.md's frontmatter is the design system's one source of truth.
// src/styles/tokens.css implements it under the same names, and the site
// renders it. These checks hold all three together: a value changed in one
// place and not the others fails here.

const root = fileURLToPath(new URL('..', import.meta.url))
const read = (path: string) => readFileSync(join(root, path), 'utf8')

type Tree = { [key: string]: string | number | Tree }

/**
 * The frontmatter's YAML: nested maps of scalars, two-space indents, single-
 * or double-quoted strings. Enough for DESIGN.md, and strict about it.
 */
function frontmatter(markdown: string): Tree {
  const block = markdown.match(/^---\n([\s\S]*?)\n---\n/)
  if (!block) throw new Error('DESIGN.md has no frontmatter')
  const top: Tree = {}
  const stack: { indent: number; node: Tree }[] = [{ indent: -1, node: top }]
  for (const line of block[1].split('\n')) {
    if (!line.trim()) continue
    const match = line.match(/^( *)([\w-]+):(?: (.*))?$/)
    if (!match) throw new Error(`Unreadable frontmatter line: ${line}`)
    const [, spaces, key, raw] = match
    while (stack.at(-1)!.indent >= spaces.length) stack.pop()
    const parent = stack.at(-1)!.node
    if (raw === undefined) {
      const node: Tree = {}
      parent[key] = node
      stack.push({ indent: spaces.length, node })
    } else if (raw.startsWith("'")) {
      parent[key] = raw.slice(1, -1).replaceAll("''", "'")
    } else if (raw.startsWith('"')) {
      parent[key] = JSON.parse(raw) as string
    } else {
      parent[key] = Number.isNaN(Number(raw)) ? raw : Number(raw)
    }
  }
  return top
}

const design = frontmatter(read('DESIGN.md'))
const colors = design.colors as Record<string, string>
const typography = design.typography as Record<
  string,
  Record<string, string | number>
>
const rounded = design.rounded as Record<string, string>
const spacing = design.spacing as Record<string, string>
const components = design.components as Record<string, Record<string, string>>

const tokensCss = read('src/styles/tokens.css')
const tokens = new Map(
  [...tokensCss.matchAll(/^\s*(--[a-z0-9-]+):\s*([^;]+);/gm)].map(
    ([, name, value]) => [name, value.replace(/\s+/g, ' ').trim()],
  ),
)
const same = (a: string, b: string) =>
  a.replace(/\s+/g, ' ').trim().toLowerCase() ===
  b.replace(/\s+/g, ' ').trim().toLowerCase()

/** A `{colors.x}`-style reference, or a literal. */
function resolve(value: string) {
  const reference = value.match(/^\{(\w+)\.([\w-]+)\}$/)
  if (!reference) return value
  const group = design[reference[1]] as Record<string, string>
  const resolved = group?.[reference[2]]
  if (resolved === undefined) throw new Error(`No token ${value}`)
  return resolved
}

/**
 * The size token each typography role is set from. Roles that share a size
 * name the token they share; every other role has its own `--type-<role>`.
 */
const sizeToken: Record<string, string> = {
  'functional-title': '--type-functional',
  control: '--type-caption',
  'screen-tagline': '--type-screen-body',
  'full-height-tagline': '--type-full-height-body',
}

function sourceFiles(dir: string): string[] {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(join(root, path)).isDirectory()) return sourceFiles(path)
    return /\.(css|tsx?)$/.test(name) ? [path] : []
  })
}

test.describe('the frontmatter and tokens.css say the same thing', () => {
  test('colors, radii, and spacing: one value, one name, in both', () => {
    for (const [name, value] of Object.entries(colors))
      expect(tokens.get(`--${name}`), `--${name}`).toBe(value)
    const hex = [...tokens].filter(([, value]) =>
      /^#[0-9a-f]{3,8}$/i.test(value),
    )
    for (const [name] of hex)
      expect(colors, `${name} is not in the frontmatter`).toHaveProperty(
        name.slice(2),
      )

    for (const [name, value] of Object.entries(rounded))
      expect(tokens.get(`--r-${name}`), `--r-${name}`).toBe(value)
    for (const [name, value] of Object.entries(spacing))
      expect(tokens.get(`--sp-${name}`), `--sp-${name}`).toBe(value)
    for (const name of tokens.keys()) {
      if (name.startsWith('--r-'))
        expect(rounded, `${name} is not in the frontmatter`).toHaveProperty(
          name.slice(4),
        )
      if (name.startsWith('--sp-'))
        expect(spacing, `${name} is not in the frontmatter`).toHaveProperty(
          name.slice(5),
        )
    }
  })

  test('every typography role is set from its token, in one of the two families', () => {
    const families = [tokens.get('--font-chassis')!, tokens.get('--font-osd')!]
    for (const [role, spec] of Object.entries(typography)) {
      const token = sizeToken[role] ?? `--type-${role}`
      expect(tokens.has(token), `${role} has no ${token}`).toBe(true)
      expect(
        same(String(spec.fontSize), tokens.get(token)!),
        `${role}: ${spec.fontSize} in DESIGN.md, ${tokens.get(token)} in ${token}`,
      ).toBe(true)
      expect(families, role).toContain(spec.fontFamily)
    }
    // No size token stands without a role to name it.
    for (const name of tokens.keys())
      if (name.startsWith('--type-'))
        expect(
          Object.keys(typography).some(
            (role) => (sizeToken[role] ?? `--type-${role}`) === name,
          ),
          `${name} names no typography role`,
        ).toBe(true)
  })

  test('components use only the properties the format defines, and tokens that exist', () => {
    const allowed = [
      'backgroundColor',
      'textColor',
      'typography',
      'rounded',
      'padding',
      'size',
      'height',
      'width',
    ]
    for (const [name, props] of Object.entries(components))
      for (const [prop, value] of Object.entries(props)) {
        expect(allowed, `${name}.${prop}`).toContain(prop)
        expect(() => resolve(value), `${name}.${prop}`).not.toThrow()
      }
  })

  test('every token is used, and every variable the site reads is a token or set on purpose', () => {
    const files = sourceFiles('src').filter(
      (path) => !path.endsWith('tokens.css'),
    )
    const source = files.map((path) => read(path)).join('\n')
    for (const name of tokens.keys())
      expect(
        new RegExp(`${name}(?![\\w-])`).test(
          source + tokensCss.replace(new RegExp(`${name}:`, 'g'), ''),
        ),
        `${name} is defined but nothing uses it`,
      ).toBe(true)
    for (const path of files) {
      const text = read(path)
      for (const [, name] of text.matchAll(/var\((--[\w-]+)/g)) {
        // A token, a variable the same file sets, or one the app sets at run
        // time (the stage's picture insets, a tape's accent).
        const setHere = new RegExp(`${name}:`).test(text)
        const setAtRunTime = /^--(picture-|tape-accent)/.test(name)
        expect(
          tokens.has(name) || setHere || setAtRunTime,
          `${path} reads ${name}, which no one defines`,
        ).toBe(true)
      }
    }
  })
})

test('the sidecar is generated from this frontmatter and prose, not beside them', () => {
  const sidecar = JSON.parse(read('.impeccable/design.json')) as {
    extensions: {
      colorMeta: Record<string, unknown>
      typographyMeta: Record<string, unknown>
    }
    components: { name: string; html: string; css: string }[]
    narrative: {
      rules: { name: string; body: string }[]
      dos: string[]
      donts: string[]
    }
  }
  const markdown = read('DESIGN.md')
  expect(Object.keys(sidecar.extensions.colorMeta).sort()).toEqual(
    Object.keys(colors).sort(),
  )
  expect(Object.keys(sidecar.extensions.typographyMeta).sort()).toEqual(
    Object.keys(typography).sort(),
  )
  // Every named rule, with its current words.
  const rules = new Map(
    [
      ...markdown.matchAll(
        /\*\*(The [^*]+ Rule)\.\*\* ([^\n]+(?:\n(?!\n)[^\n]+)*)/g,
      ),
    ].map(([, name, body]) => [name, body.replace(/\s+/g, ' ').trim()]),
  )
  expect(sidecar.narrative.rules.map((rule) => rule.name).sort()).toEqual(
    [...rules.keys()].sort(),
  )
  for (const rule of sidecar.narrative.rules)
    expect(rule.body.replace(/\s+/g, ' ').trim(), rule.name).toBe(
      rules.get(rule.name),
    )
  const list = (heading: string) =>
    markdown
      .split(`### ${heading}`)[1]
      .split(/\n#{2,3} /)[0]
      .split('\n')
      .filter((line) => line.startsWith('- '))
      .map((line) => line.slice(2))
  expect(sidecar.narrative.dos).toEqual(list('Do:'))
  expect(sidecar.narrative.donts).toEqual(list("Don't:"))
  // Component samples read only tokens that exist, or what they set
  // themselves (an archive entry's accent, inline, as on the page).
  for (const { name, html, css } of sidecar.components)
    for (const [, variable] of (html + css).matchAll(/var\((--[\w-]+)/g))
      expect(
        tokens.has(variable) || (html + css).includes(`${variable}:`),
        `${name} reads ${variable}`,
      ).toBe(true)
})

// The site as rendered. Each typography role and component is checked on an
// element that uses it, against a probe set from the frontmatter's own values
// beside it, so the browser resolves both the same way (rem, vw, cqi).

interface Probe {
  selector: string
  role?: string
  component?: string
  /**
   * Where a component's property is drawn when not on `selector` itself: a
   * screen's ground is the tube's, its text colour and type the prose's.
   */
  at?: Partial<
    Record<'backgroundColor' | 'textColor' | 'rounded' | 'typography', string>
  >
}

const TYPE_PROPS = [
  'fontFamily',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
] as const

async function measure(page: Page, probes: Probe[]) {
  for (const { role, component } of probes) {
    if (role && !typography[role]) throw new Error(`DESIGN.md has no ${role}`)
    if (component && !components[component])
      throw new Error(`DESIGN.md has no ${component}`)
  }
  const specs = probes.map((probe) => ({
    ...probe,
    type: probe.role ? typography[probe.role] : undefined,
    parts: probe.component
      ? Object.fromEntries(
          Object.entries(components[probe.component]).map(([prop, value]) => [
            prop,
            prop === 'typography' ? value : resolve(value),
          ]),
        )
      : undefined,
    componentType:
      probe.component && components[probe.component].typography
        ? typography[
            components[probe.component].typography.match(/\.([\w-]+)\}$/)![1]
          ]
        : undefined,
  }))
  return page.evaluate(
    ({ specs, TYPE_PROPS }) => {
      const results: string[] = []
      const kebab = (prop: string) =>
        prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
      /**
       * Reads `read` off an invisible probe standing beside `target` with
       * `declarations` set, so the browser resolves the frontmatter's
       * values where the rendered ones stand.
       */
      function beside<T>(
        target: Element,
        declarations: Record<string, string | number>,
        read: (style: CSSStyleDeclaration) => T,
      ) {
        const probe = document.createElement('div')
        probe.style.position = 'absolute'
        probe.style.visibility = 'hidden'
        for (const [prop, value] of Object.entries(declarations))
          probe.style.setProperty(kebab(prop), String(value))
        target.parentElement!.append(probe)
        const value = read(getComputedStyle(probe))
        probe.remove()
        return value
      }
      const box: Record<string, [string, (c: CSSStyleDeclaration) => string]> =
        {
          backgroundColor: ['backgroundColor', (c) => c.backgroundColor],
          textColor: ['color', (c) => c.color],
          rounded: ['borderTopLeftRadius', (c) => c.borderTopLeftRadius],
          padding: [
            'padding',
            (c) =>
              [
                c.paddingTop,
                c.paddingRight,
                c.paddingBottom,
                c.paddingLeft,
              ].join(' '),
          ],
        }
      for (const spec of specs) {
        const name = spec.role ?? spec.component
        const at = (prop: string) =>
          document.querySelector(
            spec.at?.[prop as keyof NonNullable<typeof spec.at>] ??
              spec.selector,
          )
        const typeSpec = spec.type ?? spec.componentType
        if (typeSpec) {
          const target = at('typography')
          if (!target) {
            results.push(`${name}: no element for its type`)
          } else {
            const rendered = getComputedStyle(target)
            for (const prop of TYPE_PROPS) {
              const expected = beside(target, typeSpec, (c) => c[prop])
              if (rendered[prop] !== expected)
                results.push(
                  `${name} ${prop}: renders ${rendered[prop]}, DESIGN.md gives ${expected}`,
                )
            }
          }
        }
        for (const [prop, [cssProp, read]] of Object.entries(box)) {
          const given = spec.parts?.[prop]
          if (given === undefined) continue
          const target = at(prop)
          if (!target) {
            results.push(`${name}: no element for its ${prop}`)
            continue
          }
          const expected = beside(target, { [cssProp]: given }, read)
          const rendered = read(getComputedStyle(target))
          if (rendered !== expected)
            results.push(
              `${name} ${prop}: renders ${rendered}, DESIGN.md gives ${expected}`,
            )
        }
      }
      return results
    },
    { specs, TYPE_PROPS },
  )
}

async function ready(page: Page) {
  await expect(page.getByTestId('studio-scene')).toHaveAttribute(
    'data-ready',
    'true',
  )
}

/** A tape on the modeled tube, the deep link's handoff finished. */
async function onTheTube(page: Page, path: string) {
  await page.goto(path)
  await ready(page)
  await expect(page.getByTestId('native-reader')).toHaveCount(0)
  await expect(
    page.getByTestId('project-reader').locator('article'),
  ).toBeVisible()
}

const cls = (name: string) => `[class*="_${name}_"]`

/**
 * Points at an element and lets a frame pass. Under reduced motion the gate
 * gives every property a 0.01ms transition, so a style read in the same
 * frame as the hover still returns the resting value.
 */
async function hover(page: Page, selector: string) {
  await page.locator(selector).first().hover()
  await page.evaluate(
    () =>
      new Promise((done) =>
        requestAnimationFrame(() => requestAnimationFrame(done)),
      ),
  )
}
const tube = (selector: string) => `[data-testid="project-reader"] ${selector}`
const native = (selector: string) => `[data-testid="native-reader"] ${selector}`

test.describe('the site renders what the frontmatter says', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the shell beside the studio', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await ready(page)
    const archiveEntry = '#projects a[href="/project/superset-d1"]'
    const entryName = `${archiveEntry} ${cls('tapeLabel')}`
    const blankName = `${cls('tapeComing')} ${cls('tapeLabel')}`
    const soundKey = '[data-testid="sound-toggle"]'
    expect(
      await measure(page, [
        { role: 'display', selector: '#intro-title' },
        { role: 'body', selector: 'body' },
        { role: 'functional-title', selector: `${cls('identity')} h1` },
        { role: 'functional', selector: `${cls('navigation')} a` },
        { role: 'caption', selector: cls('role') },
        { role: 'label', selector: cls('eyebrow') },
        { component: 'nav-link', selector: `${cls('navigation')} a` },
        { component: 'button-quiet', selector: soundKey },
        {
          component: 'tape-link',
          selector: archiveEntry,
          at: { textColor: entryName, typography: entryName },
        },
        {
          component: 'tape-link-coming',
          selector: cls('tapeComing'),
          at: { textColor: blankName, typography: blankName },
        },
      ]),
    ).toEqual([])
    // Hover states.
    await hover(page, `${cls('navigation')} a`)
    expect(
      await measure(page, [
        {
          component: 'nav-link-hover',
          selector: `${cls('navigation')} a:hover`,
        },
      ]),
    ).toEqual([])
    await hover(page, archiveEntry)
    expect(
      await measure(page, [
        { component: 'tape-link-preview', selector: archiveEntry },
      ]),
    ).toEqual([])
    await hover(page, soundKey)
    expect(
      await measure(page, [
        { component: 'button-quiet-hover', selector: `${soundKey}:hover` },
      ]),
    ).toEqual([])
  })

  for (const { role, width, height } of [
    { role: 'display', width: 1000, height: 900 },
    { role: 'display-short', width: 1280, height: 720 },
    { role: 'display-mobile', width: 390, height: 844 },
    { role: 'display-sideways', width: 844, height: 390 },
  ])
    test(`the display line at ${width} × ${height} is ${role}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height })
      await page.goto('/')
      await ready(page)
      expect(await measure(page, [{ role, selector: '#intro-title' }])).toEqual(
        [],
      )
    })

  test('the loading screen', async ({ page }) => {
    // Hold the studio's module so its loading screen stays up.
    await page.route(/StudioScene/, () => {})
    await page.goto('/')
    const mark = page.locator(cls('loadingMark')).locator('visible=true')
    await expect(mark).toBeVisible()
    await mark.evaluate((el) => el.setAttribute('data-probe', 'mark'))
    expect(
      await measure(page, [{ role: 'mark', selector: '[data-probe="mark"]' }]),
    ).toEqual([])
  })

  test('the tube', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await onTheTube(page, '/project/superset-d1')
    expect(
      await measure(page, [
        { role: 'screen-title', selector: tube(cls('title')) },
        { role: 'screen-body', selector: tube(cls('para')) },
        { role: 'screen-tagline', selector: tube(cls('tagline')) },
        { role: 'osd', selector: tube(cls('osdTop')) },
        { role: 'osd-meta', selector: tube(cls('meta')) },
        {
          component: 'crt-reader',
          selector: tube('article'),
          at: {
            backgroundColor: tube(cls('screen')),
            rounded: tube(cls('screen')),
            textColor: tube(cls('para')),
          },
        },
        { component: 'link-osd', selector: tube(`${cls('links')} a`) },
        { component: 'tag-osd', selector: tube(cls('tags')) },
      ]),
    ).toEqual([])
    await hover(page, tube(`${cls('links')} a`))
    expect(
      await measure(page, [
        {
          component: 'link-osd-hover',
          selector: tube(`${cls('links')} a:hover`),
        },
      ]),
    ).toEqual([])
  })

  test('NO SIGNAL', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/project/nope')
    await ready(page)
    await expect(page.locator(cls('bigOsd')).first()).toBeVisible()
    expect(
      await measure(page, [
        { role: 'osd-display', selector: `h2${cls('bigOsd')}` },
      ]),
    ).toEqual([])
  })

  test('the full-height reader and its deck', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/project/superset-d1')
    await ready(page)
    const key = native(cls('key'))
    expect(
      await measure(page, [
        { role: 'full-height-title', selector: native(cls('title')) },
        { role: 'full-height-body', selector: native(cls('para')) },
        { role: 'full-height-tagline', selector: native(cls('tagline')) },
        {
          component: 'crt-reader-full-height',
          selector: native('article'),
          at: {
            backgroundColor: native(cls('screen')),
            rounded: native(cls('screen')),
            textColor: native(cls('para')),
            typography: native(cls('para')),
          },
        },
        { role: 'control', selector: key },
        { component: 'button-transport', selector: key },
      ]),
    ).toEqual([])
    await hover(page, key)
    expect(
      await measure(page, [
        { component: 'button-transport-hover', selector: `${key}:hover` },
      ]),
    ).toEqual([])
  })
})
