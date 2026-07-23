import type { Ref } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '../content/types'
import styles from './CRT.module.css'

export type ScreenMode = 'idle' | 'playing' | 'nosignal' | 'ejecting'

interface CRTProps {
  mode: ScreenMode
  tape: Project | null
  /** Receives the playing title element so the stage can move focus into it. */
  onTitleEl: (el: HTMLHeadingElement | null) => void
  crtRef: Ref<HTMLDivElement>
}

export default function CRT({ mode, tape, onTitleEl, crtRef }: CRTProps) {
  return (
    <div className={styles.crtUnit} ref={crtRef}>
      <section aria-label="CRT display" className={styles.bezel}>
        <div className={`${styles.screen} ${styles[mode]}`}>
          {mode === 'playing' && tape ? (
            <div className={styles.trackIn} key={tape.slug}>
              <div className={styles.osdTop} aria-hidden="true">
                <span>▶ PLAY</span>
                <span>{tape.vhs.runtime}</span>
              </div>
              <article className={styles.reader}>
                <h2 tabIndex={-1} ref={onTitleEl} className={styles.title}>
                  {tape.title}
                </h2>
                <p className={styles.meta}>
                  {tape.year}
                  {tape.role ? ` · ${tape.role.toUpperCase()}` : ''}
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
                        {m.type === 'image' ? (
                          <img src={m.src} alt={m.alt} loading="lazy" />
                        ) : (
                          <video src={m.src} controls aria-label={m.alt} />
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
                {tape.links.length > 0 && (
                  <ul className={styles.links} aria-label="Project links">
                    {tape.links.map((l) => (
                      <li key={l.url}>
                        <a
                          href={l.url}
                          target={
                            l.url.startsWith('http') ? '_blank' : undefined
                          }
                          rel={
                            l.url.startsWith('http') ? 'noreferrer' : undefined
                          }
                        >
                          {l.label.toUpperCase()}
                          {l.url.startsWith('http') ? ' ↗' : ''}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                <p className={styles.osdEnd} aria-hidden="true">
                  REC <span className={styles.recDot}>●</span>{' '}
                  {tape.vhs.recorded}
                </p>
              </article>
            </div>
          ) : mode === 'nosignal' ? (
            <div className={styles.centerScreen}>
              <p className={styles.bigOsd}>NO SIGNAL</p>
              <p className={styles.subOsd}>THIS TAPE DOES NOT EXIST</p>
              <Link className={styles.osdLink} to="/">
                ⏏ BACK TO SHELF
              </Link>
            </div>
          ) : (
            <div className={styles.centerScreen}>
              <span className={styles.cornerTL} aria-hidden="true">
                SP · STANDBY
              </span>
              <p className={styles.bigOsd} aria-hidden="true">
                {mode === 'ejecting' ? (
                  'EJECT ▲'
                ) : (
                  <>
                    INSERT TAPE
                    <span className={styles.cursor}>▮</span>
                  </>
                )}
              </p>
              <p className="srOnly">
                No tape playing. Choose a tape from the shelf.
              </p>
              <span className={styles.cornerBR} aria-hidden="true">
                AV-01
              </span>
            </div>
          )}
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
