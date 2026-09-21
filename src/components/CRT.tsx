import type { Ref } from 'react'
import { readingMinutes } from '../content/readingTime'
import type { Project, ProjectLink } from '../content/types'
import { site } from '../content/site'
import styles from './CRT.module.css'
import { EjectIcon, ExternalIcon, PlayIcon } from './Icons'

export type ScreenMode = 'idle' | 'playing' | 'nosignal'

/**
 * Marks the article while more of it lies below the fold, so the fade at
 * the tube's foot shows only when there is something to scroll to. Kept on
 * the element itself: it is a reading cue, not reader state.
 */
function watchContinuation(article: HTMLElement | null) {
  if (!article) return
  const update = () => {
    const remaining =
      article.scrollHeight - article.clientHeight - article.scrollTop
    if (remaining > 1) article.dataset.more = ''
    else delete article.dataset.more
  }
  update()
  article.addEventListener('scroll', update, { passive: true })
  const resized = new ResizeObserver(update)
  resized.observe(article)
  if (article.firstElementChild) resized.observe(article.firstElementChild)
  return () => {
    article.removeEventListener('scroll', update)
    resized.disconnect()
  }
}

/**
 * Placeholder tapes link to example.com until real projects arrive; those
 * links are never shown. Relative URLs resolve against a stand-in origin, so
 * the check needs no window and runs wherever the page is rendered.
 */
const isReal = (link: ProjectLink) =>
  new URL(link.url, 'https://site.invalid').hostname !== 'example.com'

interface CRTProps {
  /** Screen plane inside the modeled CRT, or the non-WebGL reader. */
  embedded?: boolean
  fullHeight?: boolean
  mode: ScreenMode
  tape: Project | null
  /** NO SIGNAL flavor: a dead tape slug, or an unknown channel (any other path). */
  noSignalReason?: 'tape' | 'channel'
  /** Receives the playing title element so the stage can move focus into it. */
  onTitleEl: (el: HTMLHeadingElement | null) => void
  crtRef: Ref<HTMLDivElement>
}

export default function CRT({
  mode,
  tape,
  noSignalReason = 'tape',
  onTitleEl,
  crtRef,
  embedded = false,
  fullHeight = false,
}: CRTProps) {
  return (
    <div
      className={`${styles.crtUnit} ${embedded ? styles.embedded : ''} ${fullHeight ? styles.fullHeight : ''}`}
      ref={crtRef}
    >
      <section aria-label="CRT display" className={styles.bezel}>
        <div className={`${styles.screen} ${styles[mode]}`}>
          {mode === 'playing' && tape ? (
            <div className={styles.trackIn} key={tape.slug}>
              <div className={styles.osdTop} aria-hidden="true">
                <span className={styles.osdPlay}>
                  <PlayIcon className={styles.osdIcon} />
                  PLAY
                </span>
                <span className={styles.osdIdent}>{site.owner}</span>
                <span className={styles.osdReadTime}>
                  {readingMinutes(tape)} MIN
                  <span className={styles.osdReadWord}> READ</span>
                </span>
              </div>
              <article
                className={styles.reader}
                tabIndex={0}
                aria-label={`${tape.title} details`}
                ref={watchContinuation}
              >
                <div className={styles.readerContent}>
                  <h2 tabIndex={-1} ref={onTitleEl} className={styles.title}>
                    {tape.title}
                  </h2>
                  <p className={styles.meta}>
                    {tape.year}
                    {tape.role ? ` · ${tape.role.toUpperCase()}` : ''}
                    {/* The OSD bar is decorative to assistive technology;
                        its one fact that is not said elsewhere is said here. */}
                    <span className="srOnly">
                      {` · ${readingMinutes(tape)} minute read`}
                    </span>
                  </p>
                  <p className={styles.tagline}>{tape.tagline}</p>
                  {tape.description.map((para) => (
                    <p key={para.slice(0, 24)} className={styles.para}>
                      {para}
                    </p>
                  ))}
                  {tape.media.length > 0 && (
                    <div className={styles.gallery}>
                      {tape.media.map((m, i) => (
                        <figure key={`${m.src}-${i}`}>
                          {/* The first piece of media is often the tape's
                              largest paint: it loads at once, the rest as
                              they are scrolled to. */}
                          {m.type === 'image' ? (
                            <img
                              src={m.src}
                              width={m.width}
                              height={m.height}
                              alt={m.alt}
                              loading={i === 0 ? 'eager' : 'lazy'}
                              fetchPriority={i === 0 ? 'high' : 'auto'}
                            />
                          ) : (
                            <video
                              src={m.src}
                              width={m.width}
                              height={m.height}
                              controls
                              preload={i === 0 ? 'metadata' : 'none'}
                              aria-label={m.alt}
                            />
                          )}
                          {m.caption && <figcaption>{m.caption}</figcaption>}
                        </figure>
                      ))}
                    </div>
                  )}
                  {tape.tags.length > 0 && (
                    <ul className={styles.tags} aria-label="Tags">
                      {tape.tags.map((t) => (
                        <li key={t}>[{t.toUpperCase()}]</li>
                      ))}
                    </ul>
                  )}
                  {tape.links.some(isReal) && (
                    <ul className={styles.links} aria-label="Project links">
                      {tape.links.filter(isReal).map((l) => (
                        <li key={l.url}>
                          <a
                            href={l.url}
                            target={
                              l.url.startsWith('http') ? '_blank' : undefined
                            }
                            rel={
                              l.url.startsWith('http')
                                ? 'noreferrer'
                                : undefined
                            }
                          >
                            {l.label.toUpperCase()}
                            {l.url.startsWith('http') && (
                              <ExternalIcon className={styles.linkIcon} />
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className={styles.osdEnd} aria-hidden="true">
                    REC <span className={styles.recDot} /> {tape.vhs.recorded}
                  </p>
                </div>
              </article>
              <div className={styles.osdBottom} aria-hidden="true" />
            </div>
          ) : mode === 'nosignal' ? (
            <>
              {/* A dead link is often a first visit: the tube still says
                  whose machine this is, where a playing tape says it. */}
              <div className={styles.osdTop} aria-hidden="true">
                <span />
                <span className={styles.osdIdent}>{site.owner}</span>
                <span />
              </div>
              <div className={styles.centerScreen}>
                <h2 tabIndex={-1} ref={onTitleEl} className={styles.bigOsd}>
                  NO SIGNAL
                </h2>
                <p className={styles.subOsd}>
                  {noSignalReason === 'channel'
                    ? 'CHANNEL NOT FOUND'
                    : 'THIS TAPE DOES NOT EXIST'}
                </p>
                {/* The way out, in sight: the same two exits the deck offers. */}
                <p className={styles.exitHint} aria-hidden="true">
                  PRESS <span className={styles.exitKey}>ESC OR </span>
                  <span className={styles.osdPlay}>
                    <EjectIcon className={styles.osdIcon} />
                    EJECT
                  </span>{' '}
                  TO RETURN
                </p>
                <p className="srOnly">
                  Press the deck's Eject button or Escape to return to the
                  archive.
                </p>
              </div>
            </>
          ) : (
            <div className={styles.centerScreen}>
              <span className={styles.cornerTL} aria-hidden="true">
                STANDBY
              </span>
              <p className={styles.bigOsd} aria-hidden="true">
                INSERT TAPE
                <span className={styles.cursor} />
              </p>
              <p className="srOnly">
                No tape playing. Choose a tape from the archive.
              </p>
              <span className={styles.cornerBR} aria-hidden="true">
                AV–01
              </span>
            </div>
          )}
          <div className={styles.grain} aria-hidden="true" />
          <div className={styles.scanlines} aria-hidden="true" />
          <div className={styles.vignette} aria-hidden="true" />
        </div>
      </section>
      <p className={`silkLabel ${styles.chin}`} aria-hidden="true">
        CR-14 · Color Monitor
      </p>
      <div
        className={`${styles.cast} ${mode === 'playing' || mode === 'nosignal' ? styles.castPlay : ''}`}
        aria-hidden="true"
      />
    </div>
  )
}
