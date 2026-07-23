import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '../content/types'
import { CassetteSpine } from './Cassette'
import styles from './Shelf.module.css'

interface ShelfProps {
  tapes: Project[]
  /** Slug of the tape currently in the deck (hidden from the rack). */
  playingSlug: string | null
  onPreview: (tape: Project | null) => void
  registerTapeEl: (slug: string, el: HTMLAnchorElement | null) => void
}

export default function Shelf({
  tapes,
  playingSlug,
  onPreview,
  registerTapeEl,
}: ShelfProps) {
  const [cursor, setCursor] = useState(0)
  const linkEls = useRef<(HTMLAnchorElement | null)[]>([])

  function moveFocus(next: number) {
    const i = (next + tapes.length) % tapes.length
    setCursor(i)
    linkEls.current[i]?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      moveFocus(cursor + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      moveFocus(cursor - 1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      moveFocus(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      moveFocus(tapes.length - 1)
    }
  }

  return (
    <section className={styles.shelf} aria-label="Tape shelf: projects">
      <ul className={styles.rack} onKeyDown={onKeyDown}>
        {tapes.map((tape, i) => {
          const inDeck = tape.slug === playingSlug
          return (
            <li key={tape.slug} className={inDeck ? styles.slotGap : undefined}>
              <Link
                to={`/project/${tape.slug}`}
                className={styles.tape}
                aria-label={`Play tape: ${tape.title} (${tape.year})`}
                tabIndex={inDeck ? -1 : i === cursor ? 0 : -1}
                ref={(el) => {
                  linkEls.current[i] = el
                  registerTapeEl(tape.slug, el)
                }}
                onFocus={() => {
                  setCursor(i)
                  onPreview(tape)
                }}
                onBlur={() => onPreview(null)}
                onPointerEnter={() => onPreview(tape)}
                onPointerLeave={() => onPreview(null)}
              >
                <CassetteSpine tape={tape} />
              </Link>
            </li>
          )
        })}
      </ul>
      <div className={styles.board} aria-hidden="true" />
    </section>
  )
}
