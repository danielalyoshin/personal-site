import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { CSSProperties, ErrorInfo, ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { findTape, shelfTapes } from '../content/projects'
import type { Project } from '../content/types'
import { playSound, useSoundEnabled } from '../lib/sound'
import { useReducedMotion } from '../lib/useReducedMotion'
import { useMediaQuery } from '../lib/useMediaQuery'
import { supportsWebGL } from '../lib/supportsWebGL'
import CRT from './CRT'
import DeckControls from './DeckControls'
import styles from './Stage.module.css'

const StudioScene = lazy(() => import('./studio/StudioScene'))

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
  const soundOn = useSoundEnabled()
  const tape = findTape(slug) ?? null
  const invalid = notFound || (!!slug && !tape)
  const open = !!tape || invalid
  const [preview, setPreview] = useState<Project | null>(null)
  const [reset, setReset] = useState(0)
  const [ready, setReady] = useState(false)
  const [flat, setFlat] = useState(() => !supportsWebGL())
  // A direct link is readable before graphics load. Keep that reader mounted
  // for this playback visit so late graphics cannot move focus or scroll.
  const [nativePlayback, setNativePlayback] = useState(open)
  // History can reopen playback after eject while the scene is still pending.
  // Pin before committing that route, just as an early tape selection does.
  if (open && !ready && !nativePlayback) setNativePlayback(true)
  const useNativeReader = expandedReader || nativePlayback || flat
  const [insertingSlug, setInsertingSlug] = useState<string | null>(null)
  const loading = !!tape && insertingSlug === tape.slug && !flat
  const tapeEls = useRef(new Map<string, HTMLAnchorElement>())
  const lastTape = useRef<string | null>(null)
  const titleEl = useRef<HTMLHeadingElement | null>(null)
  const stageEl = useRef<HTMLDivElement>(null)
  const deckPortal = useRef<HTMLDivElement>(null)
  const wasOpen = useRef(open)
  const previewSlug = useRef<string | null>(null)
  const mode = invalid ? 'nosignal' : tape ? 'playing' : 'idle'

  const onTitleEl = useCallback((el: HTMLHeadingElement | null) => {
    titleEl.current = el
    if (!el) return
    // Drei mounts screen HTML through a separate React root. Focus after that
    // node is connected, including when reduced motion skips every timeout.
    const frame = window.requestAnimationFrame(() => {
      if (el.isConnected) el.focus({ preventScroll: true })
    })
    return () => {
      window.cancelAnimationFrame(frame)
      titleEl.current = null
    }
  }, [])
  const onReady = useCallback(() => setReady(true), [])
  const onUnavailable = useCallback(() => {
    setFlat(true)
    setInsertingSlug(null)
  }, [])
  const onInserted = useCallback(() => {
    setInsertingSlug(null)
    playSound('insert')
  }, [])
  const skipInsertion = useCallback(() => {
    onInserted()
    setReset((value) => value + 1)
  }, [onInserted])
  const previewTape = useCallback((next: Project | null) => {
    if (next && next.slug !== previewSlug.current) playSound('tick')
    previewSlug.current = next?.slug ?? null
    setPreview(next)
  }, [])
  const eject = useCallback(() => {
    setInsertingSlug(null)
    setNativePlayback(false)
    playSound('eject')
    navigate('/')
  }, [navigate])
  const select = useCallback(
    (next: Project) => {
      lastTape.current = next.slug
      previewTape(null)
      setNativePlayback(!ready)
      setInsertingSlug(!reduced && !flat && ready ? next.slug : null)
      if (reduced || flat || !ready) playSound('insert')
      navigate(`/project/${next.slug}`)
    },
    [flat, navigate, previewTape, ready, reduced],
  )

  useEffect(() => {
    if (tape) lastTape.current = tape.slug
    if (open) {
      const previous = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = previous
      }
    }
  }, [open, tape])
  useEffect(() => {
    if (!open && wasOpen.current && lastTape.current) {
      tapeEls.current.get(lastTape.current)?.focus({ preventScroll: true })
    }
    wasOpen.current = open
  }, [open])
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
      if (loading && event.key !== 'Tab') {
        onInserted()
        setReset((value) => value + 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, eject, loading, onInserted])

  function moveTape(
    event: React.KeyboardEvent<HTMLAnchorElement>,
    index: number,
  ) {
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
          ? shelfTapes.length - 1
          : (index + offset + shelfTapes.length) % shelfTapes.length
    if (offset || event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      tapeEls.current.get(shelfTapes[next].slug)?.focus()
    }
  }

  const reader = (
    <CRT
      mode={mode}
      tape={tape}
      noSignalReason={notFound ? 'channel' : 'tape'}
      onTitleEl={onTitleEl}
      crtRef={null}
      embedded
      fullHeight={open && useNativeReader}
    />
  )
  const skipControl = (
    <button
      type="button"
      className={styles.skipAnimation}
      onClick={skipInsertion}
    >
      Skip animation
    </button>
  )
  const fallback = (
    <div className={styles.fallback}>
      <div className={styles.fallbackMonitor}>{reader}</div>
      {!open && (
        <p className={styles.fallbackNote}>
          The archive is ready. Choose a tape below.
        </p>
      )}
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
        href="#archive"
        className={styles.skipLink}
        inert={open || undefined}
        aria-hidden={open || undefined}
      >
        Skip to tape archive
      </a>
      <header
        className={styles.header}
        inert={open || undefined}
        aria-hidden={open || undefined}
      >
        <Link
          to="/"
          className={styles.identity}
          aria-label="Daniel Alyoshin home"
        >
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
          <span>
            <h1>Daniel Alyoshin</h1>
            <span className={styles.role}>Design engineer</span>
          </span>
        </Link>
        <nav className={styles.navigation} aria-label="Site">
          <a href="#archive">The archive</a>
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
              select(shelfTapes[shelfTapes.length - 1])
            }}
          >
            About me <span aria-hidden="true">▶</span>
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
            <p className={styles.eyebrow}>Independent mind. Hands-on maker.</p>
            <h2 id="intro-title">
              Digital work.
              <br />
              <span>Physical feeling.</span>
            </h2>
          </div>
          <div className={styles.introAside}>
            <p>
              I design interfaces and build them.
              <br className={styles.desktopBreak} /> This is my little corner of
              the internet,
              <br className={styles.desktopBreak} /> one tape at a time.
            </p>
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
                <small>
                  {preview
                    ? preview.slug === 'about'
                      ? 'About Daniel · Select to play'
                      : 'Placeholder tape · Select to play'
                    : 'Select a cassette in the studio.'}
                </small>
              </span>
            </div>
            {!flat && (
              <div className={styles.sceneTools}>
                <span className={styles.dragHint}>↔ Drag to look around</span>
                <button
                  type="button"
                  onClick={() => setReset((value) => value + 1)}
                  aria-label="Reset studio view"
                  title="Reset view"
                >
                  ↺
                </button>
              </div>
            )}
          </div>
          <div
            className={styles.scene}
            data-testid="studio-scene"
            data-ready={ready || flat}
            inert={(open && useNativeReader) || undefined}
            aria-hidden={(open && useNativeReader) || undefined}
          >
            {flat ? (
              open && useNativeReader ? null : (
                fallback
              )
            ) : (
              <SceneBoundary
                fallback={open && useNativeReader ? null : fallback}
                onUnavailable={onUnavailable}
              >
                <Suspense
                  fallback={
                    <div className={styles.loading}>
                      <span className={styles.loadingMark}>AV–01</span>
                      <span>Setting the scene…</span>
                    </div>
                  }
                >
                  <StudioScene
                    tape={tape}
                    preview={preview}
                    open={open}
                    invalid={invalid}
                    reduced={reduced}
                    reset={reset}
                    inserting={loading}
                    playback={open && !useNativeReader}
                    deckPortal={deckPortal}
                    soundOn={soundOn}
                    onEject={eject}
                    onSelect={select}
                    onPreview={previewTape}
                    onInserted={onInserted}
                    onReady={onReady}
                    onUnavailable={onUnavailable}
                  >
                    {useNativeReader ? null : reader}
                  </StudioScene>
                </Suspense>
              </SceneBoundary>
            )}
            {/* Deck keys follow the screen in native tab order, even when the
                screen HTML mounts later at the end of the insertion. */}
            <div ref={deckPortal} className={styles.deckOverlay} />
          </div>
        </section>

        <section
          className={styles.archive}
          id="archive"
          aria-labelledby="archive-title"
          inert={open || undefined}
          aria-hidden={open || undefined}
        >
          <div className={styles.archiveHeading}>
            <h2 id="archive-title">
              The tape index <span>06</span>
            </h2>
            <p>Projects are being curated. Explore the placeholders.</p>
          </div>
          <ul className={styles.tapeIndex}>
            {shelfTapes.map((item, index) => (
              <li key={item.slug}>
                <Link
                  to={`/project/${item.slug}`}
                  style={{ '--tape-accent': item.vhs.accent } as CSSProperties}
                  className={
                    preview?.slug === item.slug ? styles.previewed : ''
                  }
                  aria-label={`Play tape: ${item.slug === 'about' ? 'About Daniel' : item.title} (${item.year})`}
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
                  onFocus={() => previewTape(item)}
                  onBlur={() => previewTape(null)}
                  onPointerEnter={() => previewTape(item)}
                  onPointerLeave={() => previewTape(null)}
                  onKeyDown={(event) => moveTape(event, index)}
                >
                  <span className={styles.tapeNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.tapeLabel}>
                    {item.slug === 'about'
                      ? 'About Daniel'
                      : item.vhs.spineLabel.split(' · ')[0]}
                    <small>
                      {item.slug === 'about' ? 'Meet the maker' : 'Placeholder'}
                    </small>
                  </span>
                  <span className={styles.playArrow} aria-hidden="true">
                    ▶
                  </span>
                </Link>
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
        <span>Made with intention. A little nostalgia, too.</span>
        <nav aria-label="Contact">
          <a
            href="https://github.com/danielalyoshin"
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>
          <a
            href="https://www.linkedin.com/in/danielalyoshin/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn ↗
          </a>
        </nav>
        <span className={styles.footerEdition}>DA / © 2026</span>
      </footer>

      {loading && !useNativeReader && (
        <div className={styles.transitionTools}>{skipControl}</div>
      )}
      {open && useNativeReader && (
        <div className={styles.expandedReader}>
          <div className={styles.nativeScreen}>
            {loading ? (
              <div className={styles.readerLoading}>
                <span>Loading tape</span>
                <span>{tape?.vhs.spineLabel}</span>
                {skipControl}
              </div>
            ) : (
              reader
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
            ? 'No signal. Eject or press Escape to return to the archive.'
            : `${loading ? 'Loading' : 'Playing'} ${tape?.title}`
          : 'Studio ready. Choose a tape from the archive.'}
      </p>
    </div>
  )
}
