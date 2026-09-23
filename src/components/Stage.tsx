import {
  Component,
  lazy,
  startTransition,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import type { CSSProperties, ErrorInfo, ReactNode } from 'react'
import type { RootState } from '@react-three/fiber'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { findTape, playableTapes, shelfTapes } from '../content/projects'
import { aboutTape } from '../content/about'
import { pageTitle, site } from '../content/site'
import { isComing, shelfKey } from '../content/types'
import type { Project } from '../content/types'
import { playSound, useSoundEnabled } from '../lib/sound'
import { useReducedMotion } from '../lib/useReducedMotion'
import { useMediaQuery } from '../lib/useMediaQuery'
import { useSupportsWebGL } from '../lib/supportsWebGL'
import CRT from './CRT'
import DeckControls from './DeckControls'
import { ExternalIcon, PlayIcon, SkipIcon } from './Icons'
import keys from './DeckControls.module.css'
import styles from './Stage.module.css'

const StudioScene = lazy(() => import('./studio/StudioScene'))

/**
 * A desktop deep link's native reader hands over to the modeled screen:
 * 'pending' while the modeled reader mounts under the still-opaque native
 * frame, 'settled' once it is placed on the tube and has taken over reading,
 * 'fading' while the native frame dissolves.
 */
type Handoff = 'pending' | 'settled' | 'fading' | null
/** Advance anyway if the modeled reader never reports in. */
const HANDOFF_SETTLE_GUARD_MS = 1500
/** Unmount the faded native reader even if transitionend never arrives. */
const HANDOFF_FALLBACK_MS = 900

/**
 * Focus that arrives by script after an exit. A focus ring that shows must be
 * on screen, so a visible ring brings its element into view by the shortest
 * move; a pointer exit shows no ring and leaves the page where it was.
 */
function landFocus(el: HTMLElement) {
  el.focus({ preventScroll: true })
  if (el.matches(':focus-visible')) el.scrollIntoView({ block: 'nearest' })
}

/**
 * The line under a tape's name, the same words in the guide and the archive.
 * Project tapes say what they are until real projects replace them.
 */
function tapeCaption(tape: Project) {
  return tape.slug === aboutTape.slug ? site.owner : 'Placeholder tape'
}

/** Keys that only modify another key are never the "any key" that skips. */
const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta'])

class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onUnavailable: () => void },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(
      'Studio renderer unavailable:',
      error.message,
      info.componentStack,
    )
    this.props.onUnavailable()
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export default function Stage({ notFound = false }: { notFound?: boolean }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const expandedReader = useMediaQuery(
    '(max-width: 767px), (max-height: 699px)',
  )
  // Without hover, a first tap previews a modeled tape and a second plays it.
  const touchOnly = useMediaQuery('(hover: none)')
  const soundOn = useSoundEnabled()
  const tape = findTape(slug) ?? null
  const invalid = notFound || (!!slug && !tape)
  const open = !!tape || invalid
  const [preview, setPreview] = useState<Project | null>(null)
  const [skips, setSkips] = useState(0)
  const [ready, setReady] = useState(false)
  // No studio: the browser has no WebGL, or the renderer failed or lost its
  // context during the visit.
  const webgl = useSupportsWebGL()
  const [lost, setLost] = useState(false)
  const flat = !webgl || lost
  // The studio's module is the page's heaviest download and its boot the
  // longest task, so it waits for the page to paint and the main thread to
  // fall idle: the words and the archive are in use first.
  const [boot, setBoot] = useState(false)
  // A direct link is readable before graphics load: the native reader opens
  // at once and stays pinned until the scene is ready.
  const [nativePlayback, setNativePlayback] = useState(open)
  // Once ready on a desktop viewport, the modeled studio takes over from that
  // reader in one dissolve; see Handoff for the phases.
  const [handoff, setHandoff] = useState<Handoff>(null)
  // History can reopen playback after eject while the scene is still pending.
  // Pin before committing that route, just as an early tape selection does.
  if (open && !ready && !nativePlayback) setNativePlayback(true)
  // The pin only bridges the wait for graphics. Once the scene is ready the
  // viewport rule decides: a desktop deep link crosses onto the modeled
  // screen; narrow or short viewports keep the native reader, unchanged.
  if (ready && nativePlayback) {
    setNativePlayback(false)
    if (open && !expandedReader && !flat) setHandoff('pending')
  }
  const useNativeReader = expandedReader || nativePlayback || flat
  // The dissolve stops early if playback closes or the native reader is
  // needed again (a resize below the reading breakpoints, or lost graphics).
  if (handoff && (!open || useNativeReader)) setHandoff(null)
  const [insertingSlug, setInsertingSlug] = useState<string | null>(null)
  const loading = !!tape && insertingSlug === tape.slug && !flat
  // The tape in the deck, and the one running the mechanism back to its slot
  // once playback closes by eject, Escape, or history. Both are settled on
  // the closing render, so the route and the mechanism land together; the
  // router commits navigation in a transition, after any state set beside it.
  const [deckTape, setDeckTape] = useState<Project | null>(tape)
  const [ejecting, setEjecting] = useState<Project | null>(null)
  // After playback closes, the camera brings the studio back into its box on
  // the page before the canvas rejoins the page's layout; until then the
  // viewport layer stays detached over the page.
  const [returning, setReturning] = useState(false)
  const [wasOpenRender, setWasOpenRender] = useState(open)
  if (tape && tape.slug !== deckTape?.slug) setDeckTape(tape)
  if (invalid && deckTape) setDeckTape(null)
  if (open !== wasOpenRender) {
    setWasOpenRender(open)
    // Reduced motion and the fallback reader return the tape at once; the
    // scene finishes immediately for the former, and there is no scene for
    // the latter. Reopening mid-eject seats the tape again.
    setEjecting(!open && ready && !flat ? deckTape : null)
    // Only a canvas that left its box has a way back to ease along: under
    // the native reader it never left.
    setReturning(!open && ready && !flat && !useNativeReader)
    // An eject mid-insertion reverses from where the tape is; clearing the
    // insertion any earlier would seat it first.
    if (!open) setInsertingSlug(null)
  }
  // Without a scene to ease it back, the canvas rejoins the page at once.
  if (returning && (open || flat)) setReturning(false)
  // The canvas takes the viewport only for modeled playback. While the native
  // reader owns playback (phones, short windows, a pinned deep link) it
  // covers the studio completely, so the canvas stays the size of its box
  // rather than holding a viewport-sized drawing buffer nobody can see.
  const detached = (open && !useNativeReader) || returning
  const title = pageTitle(invalid ? 'nosignal' : tape)
  const tapeEls = useRef(new Map<string, HTMLAnchorElement>())
  const identityEl = useRef<HTMLAnchorElement>(null)
  const lastTape = useRef<string | null>(null)
  const titleEl = useRef<HTMLHeadingElement | null>(null)
  const stageEl = useRef<HTMLDivElement>(null)
  const sceneBox = useRef<HTMLDivElement>(null)
  const viewportEl = useRef<HTMLDivElement>(null)
  const studio = useRef<RootState | null>(null)
  const deckPortal = useRef<HTMLDivElement>(null)
  const nativeScreen = useRef<HTMLDivElement>(null)
  const wasOpen = useRef(open)
  // Focus returning to the ejected tape's link is not a preview: the tape
  // settles flat in its slot rather than lifting again.
  const restoringFocus = useRef(false)
  const previewSlug = useRef<string | null>(null)
  const mode = invalid ? 'nosignal' : tape ? 'playing' : 'idle'

  const onTitleEl = useCallback((el: HTMLHeadingElement | null) => {
    titleEl.current = el
    if (!el) return
    let frame = 0
    let waited = 0
    // Drei's transform container receives its matrix on a drawn frame.
    const placed = () => {
      for (let node = el.parentElement; node; node = node.parentElement)
        if (node.style.transform) return true
      return false
    }
    // Drei mounts screen HTML through a separate React root. Focus after that
    // node is connected, including when reduced motion skips every timeout.
    const settle = () => {
      // Playback can close while this waits on a frame (Escape during the
      // handoff), and Drei unmounts its root a commit after the page does: a
      // title still connected then must not take focus back from the exit.
      if (!el.isConnected || !wasOpen.current) return
      // The modeled screen is taking over from a native reader still on
      // stage: wait until this reader is placed on the tube, then continue
      // reading where it was, at the same scroll depth and with focus still
      // in the article if that is where it was.
      const native = nativeScreen.current
      const takingOver = !!native && !native.contains(el)
      if (takingOver && !placed() && waited++ < 12) {
        frame = window.requestAnimationFrame(settle)
        return
      }
      const source = takingOver ? native.querySelector('article') : null
      const target = el.closest('article')
      let focused = false
      if (source && target) {
        const range = source.scrollHeight - source.clientHeight
        if (range > 0)
          target.scrollTop =
            (source.scrollTop / range) *
            (target.scrollHeight - target.clientHeight)
        if (document.activeElement === source) {
          target.focus({ preventScroll: true })
          focused = true
        }
      }
      if (!focused) el.focus({ preventScroll: true })
      if (takingOver)
        setHandoff((phase) => (phase === 'pending' ? 'settled' : phase))
    }
    frame = window.requestAnimationFrame(settle)
    return () => {
      window.cancelAnimationFrame(frame)
      // Both readers share the stage during the handoff; the outgoing title
      // must not clear the incoming one.
      if (titleEl.current === el) titleEl.current = null
    }
  }, [])
  const onReady = useCallback(() => setReady(true), [])
  const onCreated = useCallback((state: RootState) => {
    studio.current = state
  }, [])
  const onUnavailable = useCallback(() => {
    setLost(true)
    setInsertingSlug(null)
    setEjecting(null)
    setReturning(false)
  }, [])
  const onInserted = useCallback(() => {
    setInsertingSlug(null)
    playSound('insert')
  }, [])
  const onEjected = useCallback(() => setEjecting(null), [])
  const onReturned = useCallback(() => setReturning(false), [])
  const skipInsertion = useCallback(() => {
    onInserted()
    setSkips((value) => value + 1)
  }, [onInserted])
  // Insertion offers one control, so focus waits on it: a keyboard visitor
  // sees the ring on Skip instead of losing focus to the page for the flight.
  const onSkipEl = useCallback((el: HTMLButtonElement | null) => {
    el?.focus({ preventScroll: true })
  }, [])
  const previewTape = useCallback((next: Project | null) => {
    if (next && next.slug !== previewSlug.current) playSound('tick')
    previewSlug.current = next?.slug ?? null
    setPreview(next)
  }, [])
  // The router commits navigation in a transition. State set beside it joins
  // that transition, so a selection or an eject lands in one render: the
  // cassette never starts settling from its preview, or seating, before the
  // mechanism takes it from exactly where it is.
  const eject = useCallback(() => {
    playSound('eject')
    startTransition(() => {
      setNativePlayback(false)
      navigate('/')
    })
  }, [navigate])
  const select = useCallback(
    (next: Project) => {
      lastTape.current = next.slug
      if (reduced || flat || !ready) playSound('insert')
      startTransition(() => {
        previewTape(null)
        setEjecting(null)
        setNativePlayback(!ready)
        setInsertingSlug(!reduced && !flat && ready ? next.slug : null)
        navigate(`/project/${next.slug}`)
      })
    },
    [flat, navigate, previewTape, ready, reduced],
  )

  // The modeled reader advances 'pending' itself once it is placed and has
  // taken over reading (see onTitleEl); this guard covers a reader that never
  // reports in, so the hidden native frame cannot stay on top indefinitely.
  useEffect(() => {
    if (handoff !== 'pending') return
    const timer = window.setTimeout(
      () => setHandoff((phase) => (phase === 'pending' ? 'settled' : phase)),
      HANDOFF_SETTLE_GUARD_MS,
    )
    return () => window.clearTimeout(timer)
  }, [handoff])
  // One more drawn frame with everything in place, then the native frame
  // dissolves. Reduced motion swaps at that same moment instead of fading.
  useEffect(() => {
    if (handoff !== 'settled') return
    const frame = window.requestAnimationFrame(() =>
      setHandoff((phase) =>
        phase === 'settled' ? (reduced ? null : 'fading') : phase,
      ),
    )
    return () => window.cancelAnimationFrame(frame)
  }, [handoff, reduced])
  useEffect(() => {
    if (handoff !== 'fading') return
    const timer = window.setTimeout(() => setHandoff(null), HANDOFF_FALLBACK_MS)
    return () => window.clearTimeout(timer)
  }, [handoff])
  useEffect(() => {
    document.title = title
  }, [title])
  useEffect(() => {
    if (flat) return
    if ('requestIdleCallback' in window) {
      const idle = window.requestIdleCallback(() => setBoot(true), {
        timeout: 2000,
      })
      return () => window.cancelIdleCallback(idle)
    }
    // Safari has no idle callback: a beat after the first frames will do.
    const timer = setTimeout(() => setBoot(true), 200)
    return () => clearTimeout(timer)
  }, [flat])
  // The way back lands focus where the visitor left the page: on the link of
  // the tape that played, or, after NO SIGNAL, where no tape did, on the
  // nameplate that opens the page. It runs in the closing commit, before
  // paint, while the page chrome is still fully dissolved: if a showing ring
  // has to bring its link into view, the page has already moved when the
  // first frame of the return is drawn, and the studio eases back into its
  // box wherever that now is. Declared ahead of the sizing below so the
  // renderer measures the layer after any such move.
  useLayoutEffect(() => {
    if (!open && wasOpen.current) {
      const target =
        (lastTape.current && tapeEls.current.get(lastTape.current)) ||
        identityEl.current
      if (target) {
        restoringFocus.current = true
        landFocus(target)
        restoringFocus.current = false
      }
    }
    wasOpen.current = open
  }, [open])
  // The viewport layer changes box in this commit: it leaves the studio's box
  // on the page for the whole viewport, or comes back. Size the renderer in
  // the same commit, so the frame that paints the new box is drawn for it;
  // measured through the resize observer, the old drawing would paint once
  // at the new box's origin first.
  useLayoutEffect(() => {
    const state = studio.current
    const layer = viewportEl.current
    if (!state || !layer) return
    const rect = layer.getBoundingClientRect()
    state.setSize(rect.width, rect.height, rect.top, rect.left)
    state.invalidate()
  }, [detached])
  useEffect(() => {
    if (tape) lastTape.current = tape.slug
    // A dead link played no tape, so its exit has no link to return to.
    else if (invalid) lastTape.current = null
  }, [tape, invalid])
  // The page holds still under any reader, and until the studio is back in
  // its box.
  const locked = open || returning
  useEffect(() => {
    if (locked) {
      const previous = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = previous
      }
    }
  }, [locked])
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        eject()
        return
      }
      // Keep focus inside the visible reader and its transport controls.
      if (event.key === 'Tab') {
        const focusable = Array.from(
          stageEl.current?.querySelectorAll<HTMLElement>(
            'a[href], button:not(:disabled), video[controls], article[tabindex="0"]',
          ) ?? [],
        ).filter(
          (el) => !el.closest('[inert]') && el.getClientRects().length > 0,
        )
        const first = focusable[0]
        const last = focusable.at(-1)
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === titleEl.current)
        ) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
      // Any key skips the insertion, except the ones that mean something
      // else: Tab moves focus, a bare modifier is the start of a chord (Shift
      // before Tab), and Enter or Space on a focused key is that key's own.
      const activates =
        (event.key === 'Enter' || event.key === ' ') &&
        event.target instanceof Element &&
        !!event.target.closest('button, a[href]')
      if (
        loading &&
        event.key !== 'Tab' &&
        !MODIFIER_KEYS.has(event.key) &&
        !activates
      )
        skipInsertion()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, eject, loading, skipInsertion])

  // Arrows and Home/End move between the tapes that play; a blank slot has
  // no link to land on and is passed over.
  function moveTape(
    event: React.KeyboardEvent<HTMLAnchorElement>,
    from: Project,
  ) {
    const index = playableTapes.indexOf(from)
    const count = playableTapes.length
    const offset =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? count - 1
          : (index + offset + count) % count
    if (offset || event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      tapeEls.current.get(playableTapes[next].slug)?.focus()
    }
  }

  // The native frame keeps its full-height layout for as long as it is on
  // stage, including while it hands over; the modeled screen never uses it.
  const readerFor = (native: boolean) => (
    <CRT
      mode={mode}
      tape={tape}
      noSignalReason={notFound ? 'channel' : 'tape'}
      onTitleEl={onTitleEl}
      crtRef={null}
      embedded
      fullHeight={native}
    />
  )
  // The same hardware key as the native deck panel, so the one control
  // offered during insertion belongs to the same family as sound and eject.
  const skipControl = (
    <button
      type="button"
      className={keys.key}
      onClick={skipInsertion}
      ref={onSkipEl}
    >
      <SkipIcon />
      Skip animation
    </button>
  )
  // The studio's place while its module waits, downloads, and boots.
  const settingTheScene = (
    <div className={styles.loading}>
      <span className={styles.loadingMark}>AV–01</span>
      <span>Setting the scene…</span>
    </div>
  )
  const fallback = (
    <div className={styles.fallback}>
      <div className={styles.fallbackMonitor}>{readerFor(false)}</div>
    </div>
  )

  return (
    <div
      className={`${styles.stage} ${open ? styles.playing : ''}`}
      ref={stageEl}
      role={open ? 'dialog' : undefined}
      aria-modal={open || undefined}
      aria-label={open ? 'Tape playback' : undefined}
    >
      <a
        href="#projects"
        className={styles.skipLink}
        inert={open || undefined}
        aria-hidden={open || undefined}
      >
        Skip to projects
      </a>
      <header
        className={styles.header}
        inert={open || undefined}
        aria-hidden={open || undefined}
      >
        <Link to="/" className={styles.identity} ref={identityEl}>
          <svg viewBox="0 0 32 24" width="32" height="24" aria-hidden="true">
            <rect
              x="1"
              y="1"
              width="30"
              height="22"
              rx="3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx="10"
              cy="12"
              r="4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx="22"
              cy="12"
              r="4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path d="M10 8h12M10 16h12" stroke="currentColor" />
          </svg>
          {/* The link is named by the words it shows, then where it goes:
              a name a visitor can read off the page and say. */}
          <span>
            <h1>Daniel Alyoshin</h1>
            <span className={styles.role}>Forward deployed engineer</span>
            <span className="srOnly">home</span>
          </span>
        </Link>
        <nav className={styles.navigation} aria-label="Site">
          <a href="#projects">Projects</a>
          <Link
            to="/project/about"
            onClick={(event) => {
              if (
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return
              event.preventDefault()
              select(aboutTape)
            }}
          >
            About
            <PlayIcon className={styles.arrow} />
          </Link>
        </nav>
      </header>

      <main>
        <section
          className={styles.intro}
          inert={open || undefined}
          aria-hidden={open || undefined}
          aria-labelledby="intro-title"
        >
          <div>
            <p className={styles.eyebrow}>
              Bridging the gap <br className={styles.kickerBreak} />
              between client and codebase
            </p>
            <h2 id="intro-title">
              Real experience.
              <br />
              <span>Real solutions.</span>
            </h2>
          </div>
        </section>

        <section
          className={styles.exhibit}
          aria-label={open ? 'Tape playback' : 'Interactive 3D studio'}
        >
          <div
            className={styles.sceneCaption}
            inert={open || undefined}
            aria-hidden={open || undefined}
          >
            <div className={styles.objectCaption}>
              <span>
                {preview ? preview.vhs.spineLabel : 'Choose a tape to play'}
                {/* At phone widths the fitted rack is about 110px across, so
                    the guide sends the visitor to the archive's entries (the
                    studio still answers taps). The stylesheet picks the line,
                    so a page drawn ahead of time is right at any width. */}
                <small>
                  {preview ? (
                    `${tapeCaption(preview)} · ${touchOnly ? 'Tap again to play' : 'Select to play'}`
                  ) : flat ? (
                    'Pick one from the projects below.'
                  ) : (
                    <>
                      <span className={styles.guideStudio}>
                        Pick one in the studio.
                      </span>
                      <span className={styles.guideArchive}>
                        Pick one from the projects below.
                      </span>
                    </>
                  )}
                </small>
              </span>
            </div>
          </div>
          <div
            className={`${styles.scene} ${detached ? styles.detached : ''} ${returning ? styles.returning : ''}`}
            data-testid="studio-scene"
            data-ready={ready || flat}
            data-detached={detached || undefined}
            ref={sceneBox}
            inert={(open && useNativeReader) || undefined}
            aria-hidden={(open && useNativeReader) || undefined}
          >
            {/* A press in the studio takes focus with it, as a press on a
                link does. Left on the page body, the browser would count the
                focus that follows by script (Skip, then the title) as a
                keyboard's and ring it for a mouse. */}
            <div className={styles.viewport} ref={viewportEl} tabIndex={-1}>
              {flat ? (
                open && useNativeReader ? null : (
                  fallback
                )
              ) : (
                <SceneBoundary
                  fallback={open && useNativeReader ? null : fallback}
                  onUnavailable={onUnavailable}
                >
                  <Suspense fallback={settingTheScene}>
                    {boot ? (
                      <StudioScene
                        tape={tape}
                        preview={preview}
                        open={open}
                        invalid={invalid}
                        reduced={reduced}
                        skips={skips}
                        inserting={loading}
                        ejecting={ejecting}
                        returning={returning}
                        playback={open && !useNativeReader}
                        box={sceneBox}
                        deckPortal={deckPortal}
                        soundOn={soundOn}
                        onEject={eject}
                        onSelect={select}
                        onPreview={previewTape}
                        onInserted={onInserted}
                        onEjected={onEjected}
                        onReturned={onReturned}
                        onReady={onReady}
                        onCreated={onCreated}
                        onUnavailable={onUnavailable}
                      >
                        {useNativeReader ? null : readerFor(false)}
                      </StudioScene>
                    ) : (
                      settingTheScene
                    )}
                  </Suspense>
                </SceneBoundary>
              )}
              {/* Deck keys follow the screen in native tab order, even when
                  the screen HTML mounts later at the end of the insertion. */}
              <div ref={deckPortal} className={styles.deckOverlay} />
            </div>
          </div>
        </section>

        <section
          className={styles.archive}
          id="projects"
          aria-labelledby="projects-title"
          inert={open || undefined}
          aria-hidden={open || undefined}
        >
          <div className={styles.archiveHeading}>
            <h2 id="projects-title">Projects</h2>
            <p>Check out my works.</p>
          </div>
          <ul className={styles.tapeIndex}>
            {shelfTapes.map((item, index) => (
              <li key={shelfKey(item)}>
                {isComing(item) ? (
                  // A slot still waiting for its project: read, not played.
                  <div className={styles.tapeComing}>
                    <span className={styles.tapeNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.tapeLabel}>
                      Coming soon…
                      <small>Blank tape</small>
                    </span>
                  </div>
                ) : (
                  <Link
                    to={`/project/${item.slug}`}
                    style={
                      { '--tape-accent': item.vhs.accent } as CSSProperties
                    }
                    className={
                      preview?.slug === item.slug ? styles.previewed : ''
                    }
                    ref={(el) => {
                      if (el) tapeEls.current.set(item.slug, el)
                      else tapeEls.current.delete(item.slug)
                    }}
                    onClick={(event) => {
                      if (
                        event.metaKey ||
                        event.ctrlKey ||
                        event.shiftKey ||
                        event.altKey
                      )
                        return
                      event.preventDefault()
                      select(item)
                    }}
                    onFocus={() => {
                      if (!restoringFocus.current) previewTape(item)
                    }}
                    onBlur={() => previewTape(null)}
                    onPointerEnter={() => previewTape(item)}
                    onPointerLeave={() => previewTape(null)}
                    onKeyDown={(event) => moveTape(event, item)}
                  >
                    {/* Named by what the entry shows, between what it does
                        and its year: "Play tape: 01 ALPHA Placeholder tape
                        (2026)". */}
                    <span className="srOnly">Play tape: </span>
                    <span className={styles.tapeNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.tapeLabel}>
                      {item.vhs.spineLabel}
                      <small>{tapeCaption(item)}</small>
                    </span>
                    <span className="srOnly"> ({item.year})</span>
                    <PlayIcon className={styles.playArrow} />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer
        className={styles.footer}
        inert={open || undefined}
        aria-hidden={open || undefined}
      >
        <span>Want to chat?</span>
        <span className={styles.footerEdition}>DA / © 2026</span>
        <nav aria-label="Contact">
          <a
            href="https://github.com/danielalyoshin"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
            <ExternalIcon className={styles.arrow} />
          </a>
          <a
            href="https://www.linkedin.com/in/danielalyoshin/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
            <ExternalIcon className={styles.arrow} />
          </a>
        </nav>
      </footer>

      {loading && !useNativeReader && (
        <div className={styles.transitionTools}>{skipControl}</div>
      )}
      {open && (useNativeReader || handoff) && (
        <div
          className={`${styles.expandedReader} ${handoff === 'fading' ? styles.handoff : ''}`}
          data-testid="native-reader"
          data-handoff={handoff ?? undefined}
          inert={handoff === 'fading' || undefined}
          // Hidden only once the modeled reader has taken focus ('settled'):
          // while it is still mounting, focus lives here, and focus must
          // never sit inside hidden content.
          aria-hidden={
            handoff === 'settled' || handoff === 'fading' || undefined
          }
          onTransitionEnd={(event) => {
            if (
              event.target === event.currentTarget &&
              event.propertyName === 'opacity'
            )
              setHandoff(null)
          }}
        >
          <div className={styles.nativeScreen} ref={nativeScreen}>
            {loading ? (
              <div className={styles.readerLoading}>
                <span>Loading tape</span>
                <span>{tape?.vhs.spineLabel}</span>
                {skipControl}
              </div>
            ) : (
              readerFor(true)
            )}
          </div>
          <div className={styles.readerDeck}>
            <span className={styles.readerDeckLabel}>
              AV–01 <span>/ VHS</span>
            </span>
            <DeckControls soundOn={soundOn} onEject={eject} />
          </div>
        </div>
      )}
      <p className="srOnly" role="status" aria-live="polite">
        {open
          ? invalid
            ? 'No signal. Eject or press Escape to return to the projects.'
            : `${loading ? 'Loading' : 'Playing'} ${tape?.title}`
          : 'Studio ready. Choose a tape from the projects below.'}
      </p>
    </div>
  )
}
