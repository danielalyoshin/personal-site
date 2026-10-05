/* global document, window */
/**
 * Renders the studio's stills: the picture a browser without 3D graphics
 * shows in the studio's place (src/components/FlatStudio.tsx). They come
 * from the live scene, with its models, lighting, materials, browse camera
 * and fit, so the flat studio looks exactly like the modeled one at rest and
 * answers as it would, minus the motion. Like the scene's canvas, a still
 * is transparent where nothing is drawn and the table's shadow is a shade
 * of it, so the page's own graphite shows through and no edge can show.
 *
 * For each framing the site uses, it draws:
 * - the studio at rest, the tube reading INSERT TAPE;
 * - one still per tape that plays, lifted in preview with the tube naming
 *   it over SELECT THIS TAPE / TO PLAY;
 * - the deck's status window with sound off, a small patch laid over the
 *   others while the visitor has sound muted, so the readout stays true.
 *
 * The framings: the desktop browse camera fitted to the Studio First box
 * (1.82 wide to 1 tall, 24px around the equipment), and the phones' closer
 * camera fitted to the mobile look's box (72vw tall), drawn wider than that
 * box at the same zoom, so the table runs on past its sides as it does past
 * a phone's edges. Each is drawn at several times its size and averaged
 * down by cwebp (`brew install webp`) to the widths the page offers.
 *
 * It also writes src/content/studioStills.ts: every still's size, and each
 * rack slot's pointer target (its resting envelope, as the scene's own
 * invisible slot box) projected onto the picture, with what stands under the
 * words beside the studio. Run `npm run render:flat` after the models,
 * materials, lighting, tube screens, or tapes change. It starts its own dev
 * server and drives the installed Chrome, as the e2e suite does.
 */
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { chromium } from '@playwright/test'
import { format, resolveConfig } from 'prettier'
import { createServer } from 'vite'

const run = promisify(execFile)
const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT = join(ROOT, 'public/flat-studio')
const MODULE = join(ROOT, 'src/content/studioStills.ts')
const FIBER = '/node_modules/.vite/deps/@react-three_fiber.js'
/** Lossy quality: the matte planes compress well and print stays crisp. */
const QUALITY = 84

/**
 * `box` is the studio's box the camera is fitted to, in CSS px; `frame` the
 * still's own size, the box widened at the same zoom where the table runs
 * past the box's sides. `scale` is how many device px each CSS px is drawn
 * at, and every output width averages that drawing down.
 */
const FRAMINGS = [
  {
    name: 'desk',
    box: { width: 1440, height: 791 },
    frame: { width: 1440, height: 791 },
    scale: 4,
    widths: [1440, 2880],
  },
  {
    name: 'phone',
    box: { width: 390, height: 281 },
    frame: { width: 440, height: 281 },
    scale: 6,
    widths: [440, 880, 1320],
  },
]

// The studio's layer takes the whole window, transparent as it is on the
// page, and nothing else on the page is drawn; the rig fits the equipment
// to whatever box its canvas is given.
const FRAME_CSS = `
  html,
  body {
    background: transparent !important;
  }
  body * {
    visibility: hidden;
  }
  [data-testid='studio-scene'] > div,
  [data-testid='studio-scene'] > div * {
    visibility: visible;
  }
  [data-testid='studio-scene'] > div {
    position: fixed !important;
    inset: 0 !important;
    z-index: 1000;
  }
`

await run('cwebp', ['-version']).catch(() => {
  throw new Error('cwebp encodes the stills: brew install webp')
})
const scratch = await mkdtemp(join(tmpdir(), 'flat-studio-'))
const server = await createServer({
  root: ROOT,
  logLevel: 'warn',
  server: { port: 5191, host: '127.0.0.1', strictPort: true },
})
await server.listen()
const browser = await chromium.launch({ channel: 'chrome' })
const url = server.resolvedUrls.local[0]
const started = Date.now()

/**
 * Draws one still and measures it. `variant` is 'rest', 'muted', or a
 * tape's slug to preview. Returns the capture and what the camera shows,
 * in the frame's CSS px.
 */
async function draw(framing, variant) {
  const page = await browser.newPage({
    viewport: framing.box,
    deviceScaleFactor: framing.scale,
    // The lift and the camera settle at once.
    reducedMotion: 'reduce',
  })
  await page.addInitScript((css) => {
    const frame = () => {
      const style = document.createElement('style')
      style.textContent = css
      document.head.append(style)
    }
    if (document.head) frame()
    else document.addEventListener('DOMContentLoaded', frame)
  }, FRAME_CSS)
  await page.goto(url)
  // The page around the studio is hidden, so wait for it attached.
  await page.waitForSelector(
    "[data-testid='studio-scene'][data-ready='true']",
    {
      state: 'attached',
    },
  )
  await page.waitForFunction(() => document.fonts.status === 'loaded')
  await page.waitForTimeout(1500)
  if (variant === 'muted')
    await page.evaluate(() =>
      document.querySelector("[data-testid='sound-toggle']").click(),
    )
  else if (variant !== 'rest') {
    // The pointer previews a tape: over its slot's own face, the left of
    // its target, which the nearer slot beside it does not cover.
    const at = await page.evaluate(
      async ({ FIBER, slug }) => {
        const { _roots } = await import(FIBER)
        const { scene, camera, size } = _roots
          .get(document.querySelector('canvas'))
          .store.getState()
        const target = scene.getObjectByName(`pointer-target-${slug}`)
        target.geometry.computeBoundingBox()
        const { min, max } = target.geometry.boundingBox
        const xs = []
        const ys = []
        for (let i = 0; i < 8; i++) {
          const p = target.position.clone()
          p.set(
            i & 1 ? max.x : min.x,
            i & 2 ? max.y : min.y,
            i & 4 ? max.z : min.z,
          )
          p.applyMatrix4(target.matrixWorld).project(camera)
          xs.push(((p.x + 1) / 2) * size.width)
          ys.push(((1 - p.y) / 2) * size.height)
        }
        const left = Math.min(...xs)
        const right = Math.max(...xs)
        return {
          x: left + (right - left) * 0.2,
          y: (Math.min(...ys) + Math.max(...ys)) / 2,
        }
      },
      { FIBER, slug: variant },
    )
    await page.mouse.move(at.x, at.y)
    await page.waitForFunction(
      (slug) =>
        !!document.querySelector(`#projects a[href="/project/${slug}"][class]`)
          ?.className,
      variant,
    )
  }
  await page.waitForTimeout(800)

  // The zoom the live fit chose for the box; a wider frame keeps it.
  const zoom = await page.evaluate(async (FIBER) => {
    const { _roots } = await import(FIBER)
    return _roots.get(document.querySelector('canvas')).store.getState().camera
      .zoom
  }, FIBER)
  if (
    framing.frame.width !== framing.box.width ||
    framing.frame.height !== framing.box.height
  ) {
    await page.setViewportSize(framing.frame)
    await page.waitForTimeout(800)
  }

  const seen = await page.evaluate(
    async ({ FIBER, zoom, scale, frame }) => {
      const { _roots } = await import(FIBER)
      const state = _roots
        .get(document.querySelector('canvas'))
        .store.getState()
      const { scene, camera, gl, size } = state
      if (size.width !== frame.width || size.height !== frame.height)
        throw new Error(`canvas is ${size.width} × ${size.height}`)
      // Nothing redraws from here but this one frame, drawn at full density.
      state.setFrameloop('never')
      state.setDpr(scale)
      camera.zoom = zoom
      camera.updateProjectionMatrix()
      camera.updateMatrixWorld()
      scene.updateMatrixWorld(true)
      gl.render(scene, camera)

      // The scene's own Vector3, so nothing here needs a second three.js.
      const Vector3 = scene.position.constructor
      const point = new Vector3()
      const toFrame = (v) => {
        point.copy(v).project(camera)
        return [
          ((point.x + 1) / 2) * size.width,
          ((1 - point.y) / 2) * size.height,
        ]
      }
      const corners = (mesh) => {
        mesh.geometry.computeBoundingBox()
        const { min, max } = mesh.geometry.boundingBox
        return Array.from({ length: 8 }, (_, i) =>
          new Vector3(
            i & 1 ? max.x : min.x,
            i & 2 ? max.y : min.y,
            i & 4 ? max.z : min.z,
          ).applyMatrix4(mesh.matrixWorld),
        )
      }
      /** An object's drawn extent on the frame, from every visible mesh. */
      const extent = (name) => {
        const object = scene.getObjectByName(name)
        if (!object) throw new Error(`no object named ${name}`)
        const box = {
          left: Infinity,
          top: Infinity,
          right: -Infinity,
          bottom: -Infinity,
        }
        object.traverse((child) => {
          if (!child.isMesh || !child.visible) return
          for (const corner of corners(child)) {
            const [x, y] = toFrame(corner)
            box.left = Math.min(box.left, x)
            box.right = Math.max(box.right, x)
            box.top = Math.min(box.top, y)
            box.bottom = Math.max(box.bottom, y)
          }
        })
        return box
      }
      // The deck's status window prints the sound mark at its right end
      // (Player.tsx: the last 120 of its 1024 texture px): where muting
      // the site changes the picture.
      const soundMark = () => {
        const print = scene.getObjectByName('player-status')
        print.geometry.computeBoundingBox()
        const { min, max } = print.geometry.boundingBox
        const box = {
          left: Infinity,
          top: Infinity,
          right: -Infinity,
          bottom: -Infinity,
        }
        for (const u of [1 - 120 / 1024, 1])
          for (const y of [min.y, max.y]) {
            const local = new Vector3(min.x + u * (max.x - min.x), y, 0)
            const [px, py] = toFrame(local.applyMatrix4(print.matrixWorld))
            box.left = Math.min(box.left, px)
            box.right = Math.max(box.right, px)
            box.top = Math.min(box.top, py)
            box.bottom = Math.max(box.bottom, py)
          }
        return box
      }
      // Every slot's pointer target: the invisible box over its resting
      // envelope, which never moves (studio/transport.ts).
      const slots = []
      scene.traverse((object) => {
        if (!object.name.startsWith('pointer-target-')) return
        const points = corners(object)
        const center = new Vector3()
        for (const p of points) center.add(p)
        center.divideScalar(8)
        slots.push({
          id: object.name.slice('pointer-target-'.length),
          x: center.x,
          points: points.map(toFrame),
          // Its distance along the view: the live raycast hits the
          // nearest target first.
          depth: -center.applyMatrix4(camera.matrixWorldInverse).z,
        })
      })
      slots.sort((a, b) => a.x - b.x)
      const tapes = slots.map(({ id }) => extent(`tape-${id}`))
      return {
        // Every tape that plays: the ones the archive links to.
        playable: [
          ...document.querySelectorAll('#projects a[href^="/project/"]'),
        ].map((link) => link.getAttribute('href').split('/').pop()),
        slots,
        tapes,
        headphones: extent('headphones-and-stand'),
        sound: soundMark(),
      }
    },
    { FIBER, zoom, scale: framing.scale, frame: framing.frame },
  )
  await page.waitForTimeout(200)
  const framed = await page.evaluate(() => {
    const layer = document
      .querySelector("[data-testid='studio-scene']")
      ?.firstElementChild?.getBoundingClientRect()
    return (
      layer?.width === window.innerWidth && layer?.height === window.innerHeight
    )
  })
  if (!framed)
    throw new Error(`The studio was not framed for ${framing.name} ${variant}.`)
  const capture = join(scratch, `${framing.name}-${variant}.png`)
  await writeFile(
    capture,
    await page.screenshot({ type: 'png', omitBackground: true }),
  )
  await page.close()
  return { capture, seen }
}

/** The convex hull of a slot's projected corners: its target's outline. */
function hull(points) {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (o, a, b) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const half = (list) => {
    const out = []
    for (const p of list) {
      while (out.length >= 2 && cross(out.at(-2), out.at(-1), p) <= 0) out.pop()
      out.push(p)
    }
    out.pop()
    return out
  }
  return [...half(sorted), ...half([...sorted].reverse())]
}

const round = (value) => Math.round(value * 10000) / 10000

async function encode(capture, file, width, crop) {
  const args = ['-quiet', '-q', String(QUALITY), '-m', '6', '-sharp_yuv']
  if (crop) args.push('-crop', ...crop.map(String))
  await run('cwebp', [
    ...args,
    '-resize',
    String(width),
    '0',
    capture,
    '-o',
    file,
  ])
  return (await stat(file)).size
}

try {
  await rm(OUT, { recursive: true, force: true })
  await mkdir(OUT, { recursive: true })
  const stills = {}
  for (const framing of FRAMINGS) {
    const { frame, scale } = framing
    const rest = await draw(framing, 'rest')
    const { slots, playable } = rest.seen
    const variants = [['rest', rest]]
    for (const slug of playable)
      variants.push([slug, await draw(framing, slug)])
    const muted = await draw(framing, 'muted')

    const nx = (x) => round(x / frame.width)
    const ny = (y) => round(y / frame.height)
    const files = {}
    for (const [name, { capture }] of variants) {
      files[name] = []
      for (const width of framing.widths) {
        const file = `${framing.name}-${name}-${width}.webp`
        const bytes = await encode(capture, join(OUT, file), width)
        files[name].push(bytes)
        console.log(`${file} ${(bytes / 1024).toFixed(1)} KB`)
      }
    }

    // The sound mark's patch, in the status window's dark recess, on whole
    // CSS px so it lands on whole device px at every output width.
    const { sound } = muted.seen
    const left = Math.floor(sound.left - 1) * scale
    const top = Math.floor(sound.top - 1) * scale
    const right = Math.ceil(sound.right + 1) * scale
    const bottom = Math.ceil(sound.bottom + 1) * scale
    for (const width of framing.widths) {
      const file = `${framing.name}-muted-${width}.webp`
      const ratio = width / (frame.width * scale)
      const bytes = await encode(
        muted.capture,
        join(OUT, file),
        (right - left) * ratio,
        [left, top, right - left, bottom - top],
      )
      console.log(`${file} ${(bytes / 1024).toFixed(1)} KB`)
    }

    // What stands under the words beside the studio: the rack with any of
    // its tapes lifted in preview, and the headphones.
    const lifted = variants.slice(1).map(([slug, { seen }]) => {
      const index = seen.slots.findIndex((slot) => slot.id === slug)
      return seen.tapes[index]
    })
    const rack = [...rest.seen.tapes, ...lifted]
    const obstacles = [
      {
        left: Math.min(...rack.map((r) => r.left)),
        top: Math.min(...rack.map((r) => r.top)),
        right: Math.max(...rack.map((r) => r.right)),
      },
      rest.seen.headphones,
    ].map((r) => ({ left: nx(r.left), top: ny(r.top), right: nx(r.right) }))

    stills[framing.name] = {
      width: frame.width,
      height: frame.height,
      // The share of the still's width the live fit framed; the rest is
      // table running on past the box's sides.
      fitted: round(framing.box.width / frame.width),
      widths: framing.widths,
      previews: playable,
      slots: slots.map(({ id, points, depth }) => {
        const xs = points.map(([x]) => x)
        const ys = points.map(([, y]) => y)
        return {
          id,
          outline: hull(points).map(([x, y]) => [nx(x), ny(y)]),
          rect: [
            nx(Math.min(...xs)),
            ny(Math.min(...ys)),
            nx(Math.max(...xs)),
            ny(Math.max(...ys)),
          ],
          depth: round(depth),
        }
      }),
      obstacles,
      muted: {
        left: nx(left / scale),
        top: ny(top / scale),
        width: nx((right - left) / scale),
        height: ny((bottom - top) / scale),
      },
    }
  }

  const source = `// Written by scripts/render-flat-studio.mjs (npm run render:flat). Do not
// edit: re-render after the models, materials, lighting, tube screens, or
// tapes change.

/**
 * One framing of the studio's stills, in public/flat-studio/. Positions are
 * shares of the still's width and height.
 */
export interface StudioStill {
  /** The still's size in CSS px at its first width. */
  width: number
  height: number
  /** The share of its width the live fit framed, centred. */
  fitted: number
  /** The widths each still is offered at. */
  widths: number[]
  /** The tapes with a still of their own, lifted in preview. */
  previews: string[]
  /** Each rack slot's pointer target, in slot order: a tape's slug, or a blank slot's id. */
  slots: {
    id: string
    /** The target's outline, in order around it. */
    outline: [number, number][]
    /** Its bounding rectangle: left, top, right, bottom. */
    rect: [number, number, number, number]
    /** Its distance from the camera: a nearer target takes the pointer first. */
    depth: number
  }[]
  /** What stands under the words beside the studio, a tape lifted included. */
  obstacles: { left: number; top: number; right: number }[]
  /** The deck's status window, drawn again with sound off. */
  muted: { left: number; top: number; width: number; height: number }
}

export const studioStills: Record<'desk' | 'phone', StudioStill> = ${JSON.stringify(stills)}
`
  const options = await resolveConfig(MODULE)
  await writeFile(
    MODULE,
    await format(source, { ...options, filepath: MODULE }),
  )
  console.log(
    `Wrote ${MODULE} in ${((Date.now() - started) / 1000).toFixed(1)}s`,
  )
} finally {
  await browser.close()
  await server.close()
  await rm(scratch, { recursive: true, force: true })
}
