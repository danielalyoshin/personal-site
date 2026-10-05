import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { Ref, RefObject } from 'react'
import { flatNotice } from '../content/graphics'
import type { GraphicsFailure } from '../content/graphics'
import { shelfTapes } from '../content/projects'
import { studioStills } from '../content/studioStills'
import type { StudioStill } from '../content/studioStills'
import { isComing } from '../content/types'
import type { Project } from '../content/types'
import { useSoundEnabled } from '../lib/sound'
import { useReducedMotion } from '../lib/useReducedMotion'
import { ReloadIcon } from './Icons'
import { token } from './studio/tokens'
import styles from './FlatStudio.module.css'

/** Where the camera takes the phones' closer view (studio/framing.ts). */
const PHONE = '(max-width: 600px)'
/** The words beside the studio clear what stands under them by this much. */
const CLEARANCE = 14
/** A fingertip's catch around a slot too narrow for one (The Touch Rule). */
const TOUCH_TARGET = 44
/** A press that travels this far is a drag, not a choice. */
const DRAG = 5

const ALT =
  'A picture of the 3D studio: the monitor reads Insert tape over the tape deck, beside the rack of tapes.'

/**
 * A pointer that cannot hover: a tap previews before a second tap plays.
 * Chrome and Safari deliver clicks as pointer events; a plain mouse event
 * falls back to the device's own pointer.
 */
function isTouch(event: object, touchOnly: boolean) {
  const type = (event as { pointerType?: string }).pointerType
  return type ? type !== 'mouse' : touchOnly
}

/** A rack slot's target, and the tape it plays (none for a blank slot). */
interface Target {
  slot: StudioStill['slots'][number]
  tape: Project | null
}

interface Plate {
  framing: 'desk' | 'phone'
  left: number
  top: number
  width: number
  height: number
}

/**
 * Where the still stands in the studio's box. Like the live fit, it is
 * centred and as large as the box allows for the part of it the camera
 * framed. Beside the studio (The Studio First Rule), the words stand over
 * the box's upper right, and the note on what the visitor is missing closes
 * that column: the still keeps the lifted tape and the headphones clear of
 * it, lower in a box grown to the fold for it, or else a little smaller.
 * `room` is the box height that would hold the still at full size.
 */
function place(
  still: StudioStill,
  width: number,
  height: number,
  words: { left: number; bottom: number } | null,
) {
  const aspect = still.width / still.height
  const framed = aspect * still.fitted
  let h = Math.min(height, width / framed)
  let top = (height - h) / 2
  let room = 0
  if (words) {
    // The highest point under the column for a still this tall.
    const under = (h: number) => {
      const w = h * aspect
      const left = (width - w) / 2
      let reach = 1
      for (const o of still.obstacles)
        if (left + o.right * w > words.left) reach = Math.min(reach, o.top)
      return reach
    }
    const clear = words.bottom + CLEARANCE
    const full = width / framed
    room = clear + (1 - under(full)) * full
    top = Math.max(top, clear - under(h) * h)
    if (top + h > height) {
      // Shrinking moves the rack inboard of the column, so settle twice.
      for (let pass = 0; pass < 2; pass++)
        h = Math.max(h * 0.5, (height - clear) / (1 - under(h)))
      h = Math.min(h, Math.min(height, width / framed))
      top = height - h
    }
  }
  const w = h * aspect
  return { left: (width - w) / 2, top, width: w, height: h, room }
}

function sources(framing: string, name: string, widths: number[]) {
  return widths
    .map((width) => `/flat-studio/${framing}-${name}-${width}.webp ${width}w`)
    .join(', ')
}

/**
 * Cross-dissolves the stills to the one named `showing`. The stills add
 * (plus-lighter), so the picture is exact only while their opacities sum
 * to one. Every still therefore restarts together, from where it stands,
 * on one duration and one ease: a sum of one stays one at every frame,
 * however often the pointer changes its mind. Separate transitions would
 * not: one reversed mid-way is shortened, and the picture dims while the
 * others catch up.
 */
function dissolve(picture: HTMLElement, showing: string, reduced: boolean) {
  const stills = [
    ...picture.querySelectorAll<HTMLImageElement>('img[data-still]'),
  ]
  const target = (el: HTMLImageElement) =>
    el.dataset.still === showing ? 1 : 0
  if (stills.every((el) => el.style.opacity === String(target(el)))) return
  // Where each still stands, read before any of them changes.
  const from = stills.map((el) => Number(getComputedStyle(el).opacity))
  const duration = token('--t-med')
  const timing: KeyframeAnimationOptions = {
    duration: parseFloat(duration) * (duration.endsWith('ms') ? 1 : 1000),
    easing: token('--ease-out'),
    fill: 'backwards',
  }
  stills.forEach((el, index) => {
    const to = target(el)
    for (const running of el.getAnimations()) running.cancel()
    el.style.opacity = String(to)
    if (!reduced && from[index] !== to)
      el.animate({ opacity: [from[index], to] }, timing)
  })
}

interface FlatStudioProps {
  /** The tape previewed here or from the projects list (hover or focus). */
  preview: Project | null
  /** No hover: a first tap previews, a second plays (The Touch Rule). */
  touchOnly: boolean
  onPreview: (tape: Project | null) => void
  onSelect: (tape: Project, fromKeyboard?: boolean) => void
  /** The note on what is missing, which the still keeps clear of. */
  note: RefObject<HTMLElement | null>
}

/**
 * The studio without 3D graphics: the real studio, drawn ahead of time from
 * the live scene (`npm run render:flat`), in the studio's box. Its rack
 * still works as the picker: each slot's pointer target is laid over the
 * picture where the scene's own target projects, and a tape previewed here
 * or from the list swaps in its own still, lifted, with the tube naming it.
 * The answer is the live studio's, minus the motion. The targets are the
 * pointer's alone, as the modeled studio's canvas is: the projects list
 * carries keyboard and assistive access.
 */
export default function FlatStudio({
  preview,
  touchOnly,
  onPreview,
  onSelect,
  note,
}: FlatStudioProps) {
  const root = useRef<HTMLDivElement>(null)
  const picture = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  // Where a press began, and whether it has travelled far enough since to
  // be a drag. Judged by the pointer's own moves: a browser may move a
  // tap's click onto the nearest target, which is no drag.
  const pressed = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const soundOn = useSoundEnabled()
  const [plate, setPlate] = useState<Plate | null>(null)
  const [shown, setShown] = useState(false)
  // The preview stills load once a visitor shows intent, or once the page
  // falls idle after the studio's own still.
  const [warm, setWarm] = useState(false)
  // The preview stills ready to paint: decoded, not merely loaded. `load`
  // comes first, and a still shown between the two is painted without its
  // pixels for the frames its decode takes (some 30ms) while the still it
  // replaces fades out, so the picture blinks dark.
  const [decoded, setDecoded] = useState<ReadonlySet<string>>(new Set())
  const warmUp = useCallback(() => setWarm(true), [])

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const box = el.closest<HTMLElement>('[data-flat]')
    let live = true
    const measure = () => {
      if (!live) return
      const bounds = el.getBoundingClientRect()
      if (!bounds.width || !bounds.height) return
      const framing = window.matchMedia(PHONE).matches ? 'phone' : 'desk'
      const words = note.current?.getBoundingClientRect()
      // The note stands over the box beside the studio; in the other looks
      // it is under the box or beside it, and asks nothing of the still.
      const over =
        !!words &&
        words.width > 0 &&
        words.left < bounds.right &&
        words.top < bounds.bottom
      const { room, ...at } = place(
        studioStills[framing],
        bounds.width,
        bounds.height,
        over
          ? {
              left: words.left - bounds.left,
              bottom: words.bottom - bounds.top,
            }
          : null,
      )
      // Grow the box toward the fold first (Stage.module.css caps it there).
      if (box) {
        const fold = parseFloat(getComputedStyle(box).maxHeight)
        if (over && room)
          box.style.setProperty(
            '--flat-room',
            `${Math.ceil(Number.isFinite(fold) ? Math.min(room, fold) : room)}px`,
          )
        else box.style.removeProperty('--flat-room')
      }
      setPlate((current) =>
        current &&
        current.framing === framing &&
        Math.abs(current.left - at.left) < 0.5 &&
        Math.abs(current.top - at.top) < 0.5 &&
        Math.abs(current.width - at.width) < 0.5
          ? current
          : { framing, ...at },
      )
    }
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    if (note.current) observer.observe(note.current)
    // Archivo arriving rewraps the words above the note.
    void document.fonts.ready.then(measure)
    return () => {
      live = false
      observer.disconnect()
      box?.style.removeProperty('--flat-room')
    }
  }, [note])

  const still = plate ? studioStills[plate.framing] : null
  // A slot answers only if the still was drawn with the tape the rack now
  // holds there; a tape added since has no target until the stills are
  // drawn again (npm run render:flat).
  const slots: Target[] =
    still?.slots.flatMap((slot, index): Target[] => {
      const tape = shelfTapes[index]
      if (!tape) return []
      if (isComing(tape))
        return tape.id === slot.id ? [{ slot, tape: null }] : []
      return tape.slug === slot.id ? [{ slot, tape }] : []
    }) ?? []

  const choose = (tape: Project, event: object) => {
    if (isTouch(event, touchOnly) && preview?.slug !== tape.slug)
      onPreview(tape)
    else onSelect(tape)
  }
  const dragged = () => !!pressed.current?.moved

  const sizes = plate ? `${Math.round(plate.width)}px` : undefined
  // The still on show: a previewed tape's own, once it is ready to paint,
  // else the studio at rest.
  const showing =
    plate &&
    preview &&
    still?.previews.includes(preview.slug) &&
    decoded.has(`${plate.framing}-${preview.slug}`)
      ? preview.slug
      : 'rest'
  // After every commit, before paint: a still just mounted joins the
  // dissolve at its stylesheet opacity, and only a change of still moves.
  useLayoutEffect(() => {
    if (picture.current) dissolve(picture.current, showing, reduced)
  })

  return (
    <div
      className={styles.studio}
      ref={root}
      onPointerEnter={warmUp}
      onPointerDown={(event) => {
        pressed.current = { x: event.clientX, y: event.clientY, moved: false }
        setWarm(true)
      }}
      onPointerMove={(event) => {
        const press = pressed.current
        if (
          press &&
          Math.hypot(event.clientX - press.x, event.clientY - press.y) >= DRAG
        )
          press.moved = true
      }}
      onClick={(event) => {
        // A press clear of every slot: a fingertip may still mean the one
        // whose catch holds it, nearest centre first; anything else drops
        // the preview, as a tap clear of the rack does in the studio.
        if (dragged() || !plate) return
        if (isTouch(event.nativeEvent, touchOnly)) {
          const area = event.currentTarget.getBoundingClientRect()
          const x = event.clientX - area.left - plate.left
          const y = event.clientY - area.top - plate.top
          let caught: Target | null = null
          let best = Infinity
          for (const entry of slots) {
            const [l, t, r, b] = entry.slot.rect
            const cx = ((l + r) / 2) * plate.width
            const cy = ((t + b) / 2) * plate.height
            const halfW = Math.max((r - l) * plate.width, TOUCH_TARGET) / 2
            const halfH = Math.max((b - t) * plate.height, TOUCH_TARGET) / 2
            if (Math.abs(x - cx) > halfW || Math.abs(y - cy) > halfH) continue
            const distance = Math.hypot(x - cx, y - cy)
            if (distance < best) {
              best = distance
              caught = entry
            }
          }
          if (caught) {
            // A blank slot swallows its tap.
            if (caught.tape) choose(caught.tape, event.nativeEvent)
            return
          }
        }
        onPreview(null)
      }}
    >
      {plate && still && (
        <div
          className={styles.plate}
          style={{
            left: plate.left,
            top: plate.top,
            width: plate.width,
            height: plate.height,
          }}
        >
          <div
            className={`${styles.picture} ${shown ? styles.shown : ''}`}
            ref={picture}
          >
            <img
              key={plate.framing}
              className={`${styles.still} ${styles.rest}`}
              data-still="rest"
              srcSet={sources(plate.framing, 'rest', still.widths)}
              sizes={sizes}
              width={still.width}
              height={still.height}
              alt={ALT}
              decoding="async"
              fetchPriority="high"
              onLoad={(event) => {
                // It fades up once decoded, or regardless if it cannot be:
                // the picker matters more than a frame.
                const show = () => setShown(true)
                event.currentTarget.decode().then(show, show)
                if ('requestIdleCallback' in window)
                  window.requestIdleCallback(warmUp, { timeout: 3000 })
                else setTimeout(warmUp, 1000)
              }}
            />
            {(warm || preview) &&
              still.previews.map((slug) => (
                <img
                  key={`${plate.framing}-${slug}`}
                  className={styles.still}
                  data-still={slug}
                  srcSet={sources(plate.framing, slug, still.widths)}
                  sizes={sizes}
                  width={still.width}
                  height={still.height}
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                  onLoad={(event) => {
                    // A still that cannot decode is never shown: the
                    // studio at rest stays, and the caption names the tape.
                    event.currentTarget.decode().then(
                      () =>
                        setDecoded((current) =>
                          new Set(current).add(`${plate.framing}-${slug}`),
                        ),
                      () => {},
                    )
                  }}
                />
              ))}
            {/* The deck's readout is true: with sound off, its sound mark
                carries the red slash, as the modeled deck's does. */}
            <img
              key={`${plate.framing}-muted`}
              className={`${styles.muted} ${soundOn ? '' : styles.slashed}`}
              style={{
                left: `${still.muted.left * 100}%`,
                top: `${still.muted.top * 100}%`,
                width: `${still.muted.width * 100}%`,
                height: `${still.muted.height * 100}%`,
              }}
              srcSet={sources(plate.framing, 'muted', still.widths).replace(
                /(\d+)w/g,
                (_, width) => `${Math.round(width * still.muted.width)}w`,
              )}
              sizes={`${Math.round(plate.width * still.muted.width)}px`}
              alt=""
              aria-hidden="true"
              decoding="async"
            />
          </div>
          <div className={styles.targets} aria-hidden="true">
            {slots.map(({ slot, tape }) => {
              const [l, t, r, b] = slot.rect
              const outline = slot.outline
                .map(
                  ([x, y]) =>
                    `${(((x - l) / (r - l)) * 100).toFixed(2)}% ${(((y - t) / (b - t)) * 100).toFixed(2)}%`,
                )
                .join(', ')
              return (
                <div
                  key={slot.id}
                  className={tape ? styles.slot : styles.blank}
                  data-slot={slot.id}
                  style={{
                    left: `${l * 100}%`,
                    top: `${t * 100}%`,
                    width: `${(r - l) * 100}%`,
                    height: `${(b - t) * 100}%`,
                    clipPath: `polygon(${outline})`,
                    // The nearest target takes the pointer, as the scene's
                    // raycast does where the rack's slots overlap.
                    zIndex: slots.filter(
                      (other) => other.slot.depth > slot.depth,
                    ).length,
                  }}
                  onPointerEnter={(event) => {
                    // A finger over a slot is a tap in progress, not a hover.
                    if (tape && !isTouch(event, touchOnly)) onPreview(tape)
                  }}
                  onPointerLeave={(event) => {
                    if (tape && !isTouch(event, touchOnly)) onPreview(null)
                  }}
                  onClick={(event) => {
                    event.stopPropagation()
                    // A blank slot swallows the press.
                    if (!tape || dragged()) return
                    choose(tape, event.nativeEvent)
                  }}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * The plain note on what the visitor is missing and why, in the page's own
 * voice, with a Reload where one can bring the studio back.
 */
export function FlatNote({
  reason,
  touchOnly,
  className,
  ref,
  inert,
}: {
  reason: GraphicsFailure
  /** A phone or tablet, where some advice does not apply. */
  touchOnly: boolean
  className?: string
  ref?: Ref<HTMLDivElement>
  inert?: boolean
}) {
  const notice = flatNotice[reason]
  return (
    <div
      className={className}
      role="note"
      ref={ref}
      inert={inert || undefined}
      aria-hidden={inert || undefined}
      data-testid="flat-note"
    >
      <p className={styles.noteTitle}>{notice.title}</p>
      <p className={styles.noteDetail}>
        {(touchOnly && notice.detailTouch) || notice.detail}
      </p>
      {notice.reload && (
        <button
          type="button"
          className={styles.reload}
          onClick={() => window.location.reload()}
        >
          <ReloadIcon />
          Reload
        </button>
      )}
    </div>
  )
}
