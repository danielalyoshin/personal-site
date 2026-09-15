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
