import type { Ref } from 'react'
import styles from './Deck.module.css'

interface DeckProps {
  vfdText: string
  canEject: boolean
  onEject: () => void
  /** The slot mouth — flight-animation target. */
  slotRef: Ref<HTMLDivElement>
  /** Accent of the seated cassette, visible in the slot while playing. */
  seatedAccent: string | null
}

export default function Deck({
  vfdText,
  canEject,
  onEject,
  slotRef,
  seatedAccent,
}: DeckProps) {
  return (
    <section className={styles.deck} aria-label="Tape deck">
      <div className={styles.brand}>
        <span className={styles.power} aria-hidden="true" />
        <span className={styles.brandText}>
          <span className={`silkLabel ${styles.brandName}`}>
            Alyoshin AV-01
          </span>
          <span className="silkLabel">4-Head · HQ · Stereo</span>
        </span>
      </div>
      <div ref={slotRef} className={styles.slot} aria-hidden="true">
        <span className={styles.flap} />
        {seatedAccent && (
          <span
            className={styles.seated}
            style={{ background: seatedAccent }}
          />
        )}
      </div>
      <button
        type="button"
        className={styles.eject}
        onClick={onEject}
        disabled={!canEject}
      >
        <span aria-hidden="true">⏏ </span>
        Eject
      </button>
      <div className={styles.vfd} aria-hidden="true">
        {vfdText}
      </div>
    </section>
  )
}
