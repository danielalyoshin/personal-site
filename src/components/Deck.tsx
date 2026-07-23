import type { Ref } from 'react'
import { playSound, toggleSound, useSoundEnabled } from '../lib/sound'
import { useClock } from '../lib/useClock'
import styles from './Deck.module.css'

interface DeckProps {
  vfdText: string
  canEject: boolean
  onEject: () => void
  /** The slot mouth — flight-animation target. */
  slotRef: Ref<HTMLDivElement>
  /** Accent of the seated cassette, visible in the slot while playing. */
  seatedAccent: string | null
  /** NO SIGNAL: pulse the eject outline — the way out is on the hardware. */
  attention?: boolean
  /** A tape is in transit: the slot flap tips open to receive/release it. */
  flapOpen?: boolean
}

export default function Deck({
  vfdText,
  canEject,
  onEject,
  slotRef,
  seatedAccent,
  attention = false,
  flapOpen = false,
}: DeckProps) {
  const soundOn = useSoundEnabled()
  const clock = useClock()
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
      <div
        ref={slotRef}
        className={`${styles.slot} ${flapOpen ? styles.slotOpen : ''}`}
        aria-hidden="true"
      >
        <span className={styles.flap} />
        {seatedAccent && (
          <span
            className={styles.seated}
            style={{ background: seatedAccent }}
          />
        )}
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.sfx}
          aria-pressed={soundOn}
          aria-label="Sound effects"
          title="Sound effects"
          onClick={() => {
            if (toggleSound()) playSound('tick')
          }}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M8 2.5 4.5 5.5H2v5h2.5L8 13.5z" fill="currentColor" />
            {soundOn ? (
              <>
                <path
                  d="M10.2 5.6a3.4 3.4 0 0 1 0 4.8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <path
                  d="M12.2 3.9a6 6 0 0 1 0 8.2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </>
            ) : (
              <path
                d="m10.4 6.4 3.2 3.2m0-3.2-3.2 3.2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
        <button
          type="button"
          className={`${styles.eject} ${attention ? styles.attention : ''}`}
          onClick={onEject}
          disabled={!canEject}
        >
          <span aria-hidden="true">⏏ </span>
          Eject
        </button>
      </div>
      <div className={styles.vfd} aria-hidden="true">
        <span className={styles.vfdText}>{vfdText}</span>
        <span className={styles.clock}>{clock}</span>
      </div>
    </section>
  )
}
