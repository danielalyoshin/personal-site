import { changeSound } from '../lib/sound'
import styles from './DeckControls.module.css'

export interface DeckControlsProps {
  soundOn: boolean
  onEject: () => void
}

export function SoundIcon({ enabled }: { enabled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      <path d="M9 4 5 7H2v6h3l4 3z" />
      {enabled ? (
        <path d="M12 6a6 6 0 0 1 0 8M15 3a10 10 0 0 1 0 14" />
      ) : (
        <path d="m13 7 5 6m0-6-5 6" />
      )}
    </svg>
  )
}

export function EjectIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m10 3 7 9H3zM3 14h14v3H3z" />
    </svg>
  )
}

/** The same deck actions, fitted to the native reader's hardware frame. */
export default function DeckControls({ soundOn, onEject }: DeckControlsProps) {
  return (
    <div
      className={styles.controls}
      role="group"
      aria-label="VHS player controls"
    >
      <button
        type="button"
        aria-label="Sound effects"
        aria-pressed={soundOn}
        onClick={changeSound}
      >
        <SoundIcon enabled={soundOn} />
      </button>
      <button type="button" onClick={onEject}>
        <EjectIcon /> Eject tape <kbd>ESC</kbd>
      </button>
    </div>
  )
}
