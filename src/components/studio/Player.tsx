import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import type { Project } from '../../content/types'
import { Solid, Print } from './geometry'
import { PLAYER, slotFlapAngle } from './transport'
import PlayerButton from './PlayerButton'
import { EjectIcon, SoundIcon, type DeckControlsProps } from '../DeckControls'
import { changeSound } from '../../lib/sound'

export default function Player({
  tape,
  inserting,
  progress,
  interactive,
  portal,
  invalid,
  soundOn,
  onEject,
}: {
  tape: Project | null
  inserting: boolean
  progress: RefObject<number>
  interactive: boolean
  portal: RefObject<HTMLDivElement | null>
  invalid: boolean
} & DeckControlsProps) {
  const flap = useRef<Group>(null)
  useFrame(() => {
    if (flap.current) flap.current.rotation.x = slotFlapAngle(progress.current)
  })

  return (
    <group name="vhs-player" position={PLAYER.position}>
      {/* A hollow shell: the cassette stays modeled inside the player. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <Solid
            size={[3.64, 0.1, 2.3]}
            position={[0, side * 0.38, 0]}
            color="#353d48"
            bevel={0.025}
          />
          <Solid
            size={[0.1, 0.7, 2.3]}
            position={[side * 1.77, 0, 0]}
            color="#303843"
            bevel={0.018}
          />
        </group>
      ))}
      <Solid
        size={[3.44, 0.66, 0.1]}
        position={[0, 0, -1.1]}
        color="#171d25"
        bevel={0.01}
      />

      {/* Four fascia pieces surround a 1.98 × 0.47 opening. */}
      <group name="player-fascia" position={[0, 0, 1.18]}>
        <Solid
          name="slot-top"
          size={[3.64, 0.105, 0.12]}
          position={[0, 0.3775, 0]}
          color="#4a535f"
          bevel={0.012}
        />
        <Solid
          name="slot-bottom"
          size={[3.64, 0.285, 0.12]}
          position={[0, -0.2875, 0]}
          color="#444d58"
          bevel={0.016}
        />
        <Solid
          name="slot-left"
          size={[0.53, 0.47, 0.12]}
          position={[-1.555, 0.09, 0]}
          color="#444d58"
          bevel={0.01}
        />
        <Solid
          name="slot-right"
          size={[1.13, 0.47, 0.12]}
          position={[1.255, 0.09, 0]}
          color="#444d58"
          bevel={0.01}
        />
      </group>

      <group name="player-slot" position={[-0.3, 0.09, 0.56]}>
        {/* Dark tunnel walls make the depth readable as the tape passes through. */}
        {[-1, 1].map((side) => (
          <group key={side}>
            <Solid
              size={[0.045, 0.46, 1.23]}
              position={[side * 1.012, 0, 0]}
              color="#111720"
              bevel={0.004}
            />
            <Solid
              size={[1.98, 0.035, 1.23]}
              position={[0, side * 0.2525, 0]}
              color="#111720"
              bevel={0.004}
            />
          </group>
        ))}
      </group>
      <group ref={flap} name="player-flap" position={[-0.3, 0.317, 1.216]}>
        <Solid
          size={[1.92, 0.443, 0.026]}
          position={[0, -0.2215, 0]}
          color="#252d37"
          bevel={0.008}
        />
        <Print
          text="VHS  /  VIDEO CASSETTE"
          width={1.14}
          height={0.075}
          position={[0, -0.22, 0.015]}
          background="#252d37"
          color="#a2aab6"
        />
        <Solid
          size={[1.67, 0.012, 0.005]}
          position={[0, -0.39, 0.015]}
          color="#4d5866"
          bevel={0.001}
        />
      </group>

      <Solid
        size={[0.93, 0.16, 0.028]}
        position={[1.25, 0.23, 1.25]}
        color="#111920"
        bevel={0.014}
      />
      <Print
        text={
          invalid
            ? 'NO SIGNAL'
            : inserting
              ? 'LOADING'
              : tape
                ? 'PLAY  ▸  01'
                : 'STANDBY'
        }
        width={0.82}
        height={0.1}
        position={[1.25, 0.23, 1.266]}
        background="#111920"
        color="#c4ccd2"
        fitted
      />
      <Print
        text="AV–01  /  4 HEAD · HI-FI STEREO"
        width={1.65}
        height={0.09}
        position={[-0.3, -0.29, 1.243]}
        background="#444d58"
        fitted
      />
      <PlayerButton
        name="player-sound"
        position={[-1.555, 0.09, 1.253]}
        size={[0.3, 0.3]}
        interactive={interactive}
        portal={portal}
        label="Sound effects"
        print="SOUND"
        pressed={soundOn}
        onClick={changeSound}
      >
        <SoundIcon enabled={soundOn} />
        <span>{soundOn ? 'On' : 'Off'}</span>
      </PlayerButton>
      <Print
        text="SOUND"
        width={0.33}
        height={0.07}
        position={[-1.555, -0.26, 1.243]}
        background="#444d58"
        fitted
      />
      <PlayerButton
        name="player-eject"
        position={[1.25, -0.09, 1.253]}
        size={[0.93, 0.32]}
        interactive={interactive}
        portal={portal}
        label="Eject tape"
        print="EJECT"
        onClick={onEject}
      >
        <EjectIcon /> Eject
      </PlayerButton>
      <Print
        text="EJECT / ESC"
        width={0.75}
        height={0.07}
        position={[1.25, -0.35, 1.243]}
        background="#444d58"
        fitted
      />
      {[-1.45, 1.45].map((x) => (
        <Solid
          key={x}
          size={[0.28, 0.08, 1.6]}
          position={[x, -0.47, 0]}
          color="#171b20"
          bevel={0.014}
        />
      ))}
    </group>
  )
}
