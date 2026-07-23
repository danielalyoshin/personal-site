import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { findTape, shelfTapes } from '../content/projects'
import type { Project } from '../content/types'
import { useReducedMotion } from '../lib/useReducedMotion'
import { CassetteFace } from './Cassette'
import CRT, { type ScreenMode } from './CRT'
import Deck from './Deck'
import Shelf from './Shelf'
import styles from './Stage.module.css'

type Phase = 'shelf' | 'inserting' | 'playing' | 'ejecting'

const INSERT_MS = 760
const EJECT_BACK_MS = 460
const EJECT_FLY_MS = 520
const DOLLY_MS = 560
const FLY_W = 190
const FLY_H = 108

interface FlightSpec {
  dir: 'in' | 'out'
  from: DOMRect
  to: DOMRect
  tape: Project
}

const centerOf = (r: DOMRect) => ({
  x: r.left + r.width / 2,
  y: r.top + r.height / 2,
})
const flyAt = (c: { x: number; y: number }, s: number) =>
  `translate(${c.x - FLY_W / 2}px, ${c.y - FLY_H / 2}px) scale(${s})`
const isDesktop = () => window.matchMedia('(min-width: 720px)').matches

export default function Stage({ notFound = false }: { notFound?: boolean }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const tape = findTape(slug)
  const badSlug = notFound || (slug !== undefined && !tape)

  const [phase, setPhase] = useState<Phase>(() =>
    slug && findTape(slug) ? 'playing' : 'shelf',
  )
  const [preview, setPreview] = useState<Project | null>(null)
  const [flight, setFlight] = useState<FlightSpec | null>(null)
  /** The tape currently seated in the deck (drives the shelf gap). */
  const [playing, setPlaying] = useState<Project | null>(tape ?? null)
  // Route → seated-tape sync, done during render (React's adjust-state
  // pattern); on eject (no slug) the last tape stays for the return flight.
  if (tape && playing !== tape) setPlaying(tape)

  const cameraRef = useRef<HTMLDivElement>(null)
  const crtRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  const flyRef = useRef<HTMLDivElement>(null)
  const tapeEls = useRef(new Map<string, HTMLAnchorElement>())
  const titleEl = useRef<HTMLHeadingElement | null>(null)
  const prevSlug = useRef(slug)
  /** Finishes any running choreography instantly (skip / interruption). */
  const settle = useRef<(() => void) | null>(null)
  /** Tape to focus once the shelf phase has committed (post-eject). */
  const pendingFocus = useRef<string | null>(null)
  /** Focus the CRT title once the playing phase has committed. */
  const pendingTitle = useRef(false)

  const registerTapeEl = useCallback(
    (s: string, el: HTMLAnchorElement | null) => {
      if (el) tapeEls.current.set(s, el)
      else tapeEls.current.delete(s)
    },
    [],
  )
  const onTitleEl = useCallback((el: HTMLHeadingElement | null) => {
    titleEl.current = el
  }, [])

  /**
   * Camera dolly: scale the whole rack so the CRT center lands on the
   * viewport center. Measured with the transform stripped, applied as one
   * translate+scale (origin 0 0) so the math is exact.
   */
  const applyDolly = useCallback((instant: boolean) => {
    const cam = cameraRef.current
    const crt = crtRef.current
    if (!cam || !crt) return
    if (!isDesktop()) {
      cam.style.transform = ''
      return
    }
    cam.style.transition = 'none'
    cam.style.transform = 'none'
    const camRect = cam.getBoundingClientRect()
    const crtRect = crt.getBoundingClientRect()
    const cx = crtRect.left - camRect.left + crtRect.width / 2
    const cy = crtRect.top - camRect.top + crtRect.height / 2
    const s = Math.min(
      (window.innerWidth * 0.92) / crtRect.width,
      (window.innerHeight * 0.9) / crtRect.height,
      2.1,
    )
    const tx = window.innerWidth / 2 - camRect.left - s * cx
    const ty = window.innerHeight / 2 - camRect.top - s * cy
    void cam.offsetWidth
    cam.style.transition = instant
      ? 'none'
      : `transform ${DOLLY_MS}ms var(--ease-out)`
    cam.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`
  }, [])

  const clearDolly = useCallback((instant: boolean) => {
    const cam = cameraRef.current
    if (!cam) return
    cam.style.transition = instant
      ? 'none'
      : `transform ${DOLLY_MS}ms var(--ease-out)`
    cam.style.transform = ''
  }, [])

  /* Deep link: arrive with the tape already seated, camera already in. */
  const didInit = useRef(false)
  useLayoutEffect(() => {
    if (didInit.current) return
    didInit.current = true
    if (slug && findTape(slug)) applyDolly(true)
  }, [slug, applyDolly])

  /* Route changes drive the choreography. */
  useEffect(() => {
    const prev = prevSlug.current
    prevSlug.current = slug
    if (slug === prev) return
    settle.current?.()

    if (slug) {
      const next = findTape(slug)
      // Unknown tape: the CRT derives NO SIGNAL from the route; the shelf
      // stays browsable, so there is no state to change.
      if (!next) return
      const fromEl = tapeEls.current.get(slug)
      const slotEl = slotRef.current
      if (reduced || !fromEl || !slotEl) {
        pendingTitle.current = true
        setPhase('playing')
        applyDolly(true)
        return
      }
      setPhase('inserting')
      setFlight({
        dir: 'in',
        from: fromEl.getBoundingClientRect(),
        to: slotEl.getBoundingClientRect(),
        tape: next,
      })
      return
    }

    const owner = playing
    const finishEject = () => {
      setFlight(null)
      if (owner) pendingFocus.current = owner.slug
      setPhase('shelf')
      clearDolly(true)
      settle.current = null
    }
    if (reduced || !owner || !isDesktop()) {
      finishEject()
      return
    }
    setPhase('ejecting')
    clearDolly(false)
    const t = window.setTimeout(() => {
      const slotEl = slotRef.current
      const toEl = tapeEls.current.get(owner.slug)
      if (!slotEl || !toEl) {
        finishEject()
        return
      }
      setFlight({
        dir: 'out',
        from: slotEl.getBoundingClientRect(),
        to: toEl.getBoundingClientRect(),
        tape: owner,
      })
    }, EJECT_BACK_MS)
    settle.current = () => {
      clearTimeout(t)
      finishEject()
    }
  }, [slug, reduced, playing, applyDolly, clearDolly])

  /* The flying cassette (WAAPI, deterministic, finishable). */
  useLayoutEffect(() => {
    if (!flight) return
    const el = flyRef.current
    if (!el) return
    const { dir, tape: owner } = flight
    const a = centerOf(flight.from)
    const b = centerOf(flight.to)

    const frames =
      dir === 'in'
        ? [
            { transform: flyAt(a, 0.35), opacity: 0 },
            {
              transform: flyAt({ x: a.x, y: a.y - 46 }, 1),
              opacity: 1,
              offset: 0.32,
            },
            {
              transform: flyAt({ x: b.x, y: b.y - 34 }, 0.82),
              opacity: 1,
              offset: 0.72,
            },
            { transform: flyAt(b, 0.5), opacity: 0 },
          ]
        : [
            { transform: flyAt(a, 0.5), opacity: 0 },
            {
              transform: flyAt({ x: a.x, y: a.y - 44 }, 0.95),
              opacity: 1,
              offset: 0.3,
            },
            {
              transform: flyAt({ x: b.x, y: b.y - 44 }, 0.9),
              opacity: 1,
              offset: 0.75,
            },
            { transform: flyAt(b, 0.4), opacity: 0 },
          ]

    const done = (skipped: boolean) => {
      setFlight(null)
      if (dir === 'in') {
        setPhase('playing')
        applyDolly(skipped)
        if (skipped) {
          pendingTitle.current = true
          settle.current = null
        } else {
          const t = window.setTimeout(() => {
            titleEl.current?.focus({ preventScroll: true })
            settle.current = null
          }, DOLLY_MS + 40)
          settle.current = () => {
            clearTimeout(t)
            titleEl.current?.focus({ preventScroll: true })
            settle.current = null
          }
        }
      } else {
        pendingFocus.current = owner.slug
        setPhase('shelf')
        settle.current = null
      }
    }

    const anim = el.animate(frames, {
      duration: dir === 'in' ? INSERT_MS : EJECT_FLY_MS,
      easing: 'cubic-bezier(0.45, 0.05, 0.35, 1)',
      fill: 'forwards',
    })
    anim.onfinish = () => done(false)
    settle.current = () => {
      anim.onfinish = null
      anim.cancel()
      done(true)
    }
    return () => {
      anim.onfinish = null
      anim.cancel()
    }
  }, [flight, applyDolly])

  /* Focus hand-off runs post-commit, never from animation callbacks: the
     eject target is visible (and the CRT title mounted) only after React
     commits the phase change. */
  useEffect(() => {
    if (phase === 'shelf' && pendingFocus.current) {
      const s = pendingFocus.current
      pendingFocus.current = null
      tapeEls.current.get(s)?.focus()
    } else if (phase === 'playing' && pendingTitle.current) {
      pendingTitle.current = false
      titleEl.current?.focus({ preventScroll: true })
    }
  }, [phase, slug])

  /* Any input skips a running sequence — the timeline is yours, not ours. */
  useEffect(() => {
    if (phase !== 'inserting' && phase !== 'ejecting') return
    const skip = () => settle.current?.()
    window.addEventListener('pointerdown', skip, true)
    window.addEventListener('keydown', skip, true)
    return () => {
      window.removeEventListener('pointerdown', skip, true)
      window.removeEventListener('keydown', skip, true)
    }
  }, [phase])

  /* Esc ejects. */
  useEffect(() => {
    if (phase !== 'playing' || !tape) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate('/')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, tape, navigate])

  /* Keep the dolly framed on resize. */
  useEffect(() => {
    if (phase !== 'playing' || !tape) return
    const onResize = () => applyDolly(true)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [phase, tape, applyDolly])

  const vfd =
    phase === 'playing' && tape
      ? `▶ Play · ${tape.title}`
      : phase === 'inserting'
        ? 'Loading ▶'
        : phase === 'ejecting'
          ? 'Eject ▲'
          : badSlug
            ? 'No signal'
            : preview
              ? `● ${preview.title} · ${preview.year}`
              : 'Standby'

  const mode: ScreenMode = badSlug
    ? 'nosignal'
    : phase === 'playing' && tape
      ? 'playing'
      : phase === 'ejecting'
        ? 'ejecting'
        : 'idle'

  const transiting = phase === 'inserting' || phase === 'ejecting'
  const isPlaying = phase === 'playing' && !!tape
  const stageClass = [
    styles.stage,
    transiting ? styles.busy : '',
    phase !== 'shelf' ? styles.clipped : '',
    isPlaying ? 'playing-stage' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={stageClass}>
      <div className={styles.camera} ref={cameraRef}>
        {/* While a tape plays, everything off-screen behind the dolly/overlay
            is inert so keyboard focus can never land somewhere invisible. */}
        <header className={styles.header} inert={isPlaying || undefined}>
          <div>
            <h1 className={styles.nameplate}>Daniel Alyoshin</h1>
            <p className="silkLabel">Design Engineer</p>
          </div>
          <nav aria-label="Site">
            <Link className={`silkLabel ${styles.navLink}`} to="/project/about">
              About
            </Link>
          </nav>
        </header>

        <div className={styles.shelfSpot} inert={isPlaying || undefined}>
          <Shelf
            tapes={shelfTapes}
            playingSlug={
              phase !== 'shelf' && !badSlug && playing ? playing.slug : null
            }
            onPreview={setPreview}
            registerTapeEl={registerTapeEl}
          />
        </div>

        <div className={styles.crtSpot}>
          <CRT
            mode={mode}
            tape={tape ?? null}
            onTitleEl={onTitleEl}
            crtRef={crtRef}
          />
        </div>

        <div className={styles.deckWrap}>
          <Deck
            vfdText={vfd}
            canEject={isPlaying}
            onEject={() => navigate('/')}
            slotRef={slotRef}
            seatedAccent={isPlaying && playing ? playing.vhs.accent : null}
          />
        </div>

        <footer className={styles.footer} inert={isPlaying || undefined}>
          <span className="silkLabel">Alyoshin AV-01 · Hi-Fi Stereo</span>
          <a
            className={`silkLabel ${styles.navLink} ${styles.email}`}
            href="mailto:daniel.alyoshin@gmail.com"
          >
            daniel.alyoshin@gmail.com
          </a>
        </footer>
      </div>

      {flight && (
        <div className={styles.flightLayer} aria-hidden="true">
          <div ref={flyRef} className={styles.flying}>
            <CassetteFace tape={flight.tape} />
          </div>
        </div>
      )}
    </div>
  )
}
