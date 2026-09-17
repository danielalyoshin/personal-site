import { changeSound } from '../lib/sound'
import styles from './DeckControls.module.css'
import { EjectIcon, SoundIcon } from './Icons'

export interface DeckControlsProps {
  soundOn: boolean
  onEject: () => void
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
        className={styles.key}
        aria-label="Sound effects"
        aria-pressed={soundOn}
        onClick={changeSound}
      >
        <SoundIcon enabled={soundOn} />
      </button>
      {/* The ESC legend is a hint, not part of the key's name: the shortcut
          is declared on the button, where assistive technology reads it. */}
      <button
        type="button"
        className={styles.key}
        aria-keyshortcuts="Escape"
        onClick={onEject}
      >
        <EjectIcon /> Eject tape <kbd aria-hidden="true">ESC</kbd>
      </button>
    </div>
  )
}
