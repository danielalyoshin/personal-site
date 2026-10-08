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
/** The words beside the studio clear what stands under them by this much, */
const CLEARANCE = 14
/** and what rises beside them by this much. */
const BESIDE = 32
/**
 * A still that would be larger beside the words moves over in step with
 * what it gains there: all the way once that is this share of its full
 * size, and no further than the gain pays for, so it leaves the live
 * framing by degrees as a window narrows or flattens, never in a jump.
 */
const EARN = 0.15
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
 * the box's upper right, and the whole note on what the visitor is missing
 * closes that column: the still keeps the lifted tape and the headphones
 * clear of it, lower in a box grown to the fold for it, or else smaller.
 * Where it would be smaller under the words than beside them, it moves
 * over, toward the drawn studio's left corner on the column's edge, as far
 * as the size it gains there earns (EARN), and takes the largest size that
 * clears the note where it stands. Every step of that is continuous, so no
 * step in the window's size makes the still jump. `room` is the box height
 * that would hold the still at full size.
 */
function place(
  still: StudioStill,
  width: number,
  height: number,
  words: { left: number; bottom: number } | null,
) {
  const aspect = still.width / still.height
  const framed = aspect * still.fitted
  const full = Math.min(height, width / framed)
  const centred = (h: number) => (width - h * aspect) / 2
  if (!words)
    return {
      left: centred(full),
      top: (height - full) / 2,
      width: full * aspect,
      height: full,
      room: 0,
    }
  const clear = words.bottom + CLEARANCE
  const bands = still.skyline.length
  // How high a still h tall, its left edge at x, rises where the note must
  // clear it, as a share of its height down from its top: its standing
  // equipment (the rack, a tape lifted, the headphones) within BESIDE of the
  // column's edge, and anything drawn (the table, the monitor) within
  // CLEARANCE of it.
  const reach = (h: number, x: number) => {
    const w = h * aspect
    let top = 1
    for (const o of still.obstacles)
      if (x + o.right * w > words.left - BESIDE) top = Math.min(top, o.top)
    still.skyline.forEach((band, i) => {
      if (x + ((i + 1) / bands) * w > words.left - CLEARANCE)
        top = Math.min(top, band)
    })
    return top
  }
  // Standing on the box's floor, it clears the note.
  const fits = (h: number, x: number) => clear + (1 - reach(h, x)) * h <= height
  // The largest still that clears the note with its left edge where `at`
  // puts it. A smaller one only ever fits better, so the search halves the
  // gap.
  const largest = (at: (h: number) => number) => {
    if (fits(full, at(full))) return full
    let low = 0
    let high = full
    for (let step = 0; step < 20; step++) {
      const mid = (low + high) / 2
      if (fits(mid, at(mid))) low = mid
      else high = mid
    }
    return low
  }
  // Moved all the way over, the drawn studio's left corner stands on the
  // column's edge, as the nameplate does; the transparent margin left of it
  // is cut at the box, and nothing drawn is.
  const over = (h: number) => -still.left * h * aspect
  const gain = (largest(over) - largest(centred)) / full
  const moved = Math.min(1, gain / EARN)
  const at = (h: number) => centred(h) + (over(h) - centred(h)) * moved
  const h = largest(at)
  // At full size it stands where the live fit would: centred, or as low as
  // the note needs. Giving up size, it comes down by as much, to the box's
  // floor, so it never jumps up or down either.
  const settled = Math.max(
    (height - full) / 2,
    clear - reach(full, at(full)) * full,
  )
  const lift = Math.max(0, height - full - settled - (full - h))
  return {
    left: at(h),
    top: height - h - lift,
    width: h * aspect,
    height: h,
    room:
      clear +
      (1 - reach(width / framed, centred(width / framed))) * (width / framed),
  }
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
  /** The still fades up, or never will: the note may come up now. */
  onShown?: () => void
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
  onShown,
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
    // `pass` counts the layouts one measurement has asked for: a box grown
    // for the note is laid out and measured again at once, so the first
    // paint and the observer find it settled.
    const measure = (pass = 0) => {
      if (!live) return
      const words = note.current
      const bounds = el.getBoundingClientRect()
      if (!bounds.width || !bounds.height) return
      const framing = window.matchMedia(PHONE).matches ? 'phone' : 'desk'
      const still = studioStills[framing]
      // Beside the studio the whole note closes the column of words, over
      // the box's right half; in the other looks it is under the box or
      // beside it, and asks nothing of the still. Its box ends where its
      // last print does: Reload's hit area overhangs it by less than the
      // clearance the still keeps.
      const area = words?.getBoundingClientRect()
      const column =
        area &&
        area.width > 0 &&
        area.left > bounds.left + bounds.width / 2 &&
        area.left < bounds.right &&
        area.top < bounds.bottom
          ? { left: area.left - bounds.left, bottom: area.bottom - bounds.top }
          : null
      const { room, ...at } = place(still, bounds.width, bounds.height, column)
      // Grow the box toward the fold first (Stage.module.css caps it there).
      if (box) {
        const fold = parseFloat(getComputedStyle(box).maxHeight)
        if (column && room)
          box.style.setProperty(
            '--flat-room',
            `${Math.ceil(Number.isFinite(fold) ? Math.min(room, fold) : room)}px`,
          )
        else box.style.removeProperty('--flat-room')
        if (pass < 2 && el.getBoundingClientRect().height !== bounds.height) {
          measure(pass + 1)
          return
        }
      }
      // How far the box runs on under the drawn studio, so a note under the
      // box can stand a set distance under the table instead.
      const slack = Math.max(
        0,
        Math.floor(bounds.height - at.top - still.foot * at.height),
      )
      words?.style.setProperty('--still-slack', `${slack}px`)
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
    const observer = new ResizeObserver(() => measure())
    observer.observe(el)
    // The note follows the studio's box on the page, so its ref is set only
    // once this commit is done: the first measurement waits for it, and it
    // is watched from then. Laid out here, before the first paint, the box,
    // the note, and the still are already where they stay when the
    // observer first reports, so nothing changes size under it.
    let watched: HTMLElement | null = null
    queueMicrotask(() => {
      if (!live) return
      watched = note.current
      if (watched) observer.observe(watched)
      measure()
    })
    // Archivo arriving rewraps the words above the note.
    void document.fonts.ready.then(() => measure())
    return () => {
      live = false
      observer.disconnect()
      box?.style.removeProperty('--flat-room')
      watched?.style.removeProperty('--still-slack')
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
                // the picker matters more than a frame. The note comes up
                // with it, in the same commit.
                const show = () => {
                  setShown(true)
                  onShown?.()
                }
                event.currentTarget.decode().then(show, show)
                if ('requestIdleCallback' in window)
                  window.requestIdleCallback(warmUp, { timeout: 3000 })
                else setTimeout(warmUp, 1000)
              }}
              // A still that cannot load never shows; its note comes up
              // without it.
              onError={() => onShown?.()}
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
 * voice, with a Reload where one can bring the studio back. It stands
 * whole wherever the page sets it, read title, reason, Reload, and fades up
 * as it arrives, with the still when it waits for it.
 */
export function FlatNote({
  reason,
  touchOnly,
  className,
  ref,
  inert,
  waiting,
}: {
  reason: GraphicsFailure
  /** A phone or tablet, where some advice does not apply. */
  touchOnly: boolean
  className?: string
  ref?: Ref<HTMLDivElement>
  inert?: boolean
  /** Held clear until the studio's still fades up, to arrive with it. */
  waiting?: boolean
}) {
  const notice = flatNotice[reason]
  return (
    <div
      className={`${styles.note} ${waiting ? styles.waiting : ''} ${className ?? ''}`}
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
