import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import type { Project } from '../../content/types'
import { Decal, Solid, Print } from './geometry'
import {
  capitalsOffset,
  fitType,
  makeTexture,
  useTextureDisposal,
} from './textures'
import { PLAYER, slotFlapAngle } from './transport'
import PlayerButton from './PlayerButton'
import type { DeckControlsProps } from '../DeckControls'
import { changeSound } from '../../lib/sound'

type DeckMode = 'standby' | 'loading' | 'play' | 'nosignal'

const STATUS: Record<DeckMode, string> = {
  standby: 'STANDBY',
  loading: 'LOADING',
  play: 'PLAY',
  nosignal: 'NO SIGNAL',
}

/** The deck's readout: transport state on the left, sound state on the right. */
function StatusWindow({ mode, soundOn }: { mode: DeckMode; soundOn: boolean }) {
  const texture = useMemo(
    () =>
      makeTexture(1024, 125, (ctx) => {
        const middle = 63
        const size = fitType(ctx, STATUS[mode], 74, 560, 600, 0.06)
        ctx.textBaseline = 'alphabetic'
        ctx.fillStyle = '#c4ccd2'
        let x = 32
        if (mode === 'play') {
          // A drawn play mark, not a glyph borrowed from a fallback font.
          const half = size * 0.3
          ctx.beginPath()
          ctx.moveTo(x, middle - half)
          ctx.lineTo(x + half * 1.7, middle)
          ctx.lineTo(x, middle + half)
          ctx.closePath()
          ctx.fill()
          x += half * 1.7 + size * 0.36
        }
        ctx.textAlign = 'left'
        ctx.fillText(
          STATUS[mode],
          x,
          middle + capitalsOffset(ctx, STATUS[mode]),
        )
        const sound = soundOn ? 'SOUND ON' : 'SOUND OFF'
        fitType(ctx, sound, 74, 400, 600, 0.06)
        ctx.textAlign = 'right'
        ctx.fillStyle = soundOn ? '#c4ccd2' : '#7f8994'
        // Trailing tracking sits after the last glyph; keep the right edge true.
        ctx.fillText(
          sound,
          992 + 74 * 0.06,
          middle + capitalsOffset(ctx, sound),
        )
      }),
    [mode, soundOn],
  )
  useTextureDisposal(texture)
  return (
    <>
      <Solid
        size={[0.93, 0.16, 0.028]}
        position={[1.25, 0.23, 1.25]}
        color="#111920"
        bevel={0.014}
      />
      <Decal
        name="player-status"
        texture={texture}
        width={0.82}
        height={0.1}
        position={[1.25, 0.23, 1.265]}
      />
    </>
  )
}

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
  const mode: DeckMode = invalid
    ? 'nosignal'
    : inserting
      ? 'loading'
      : tape
        ? 'play'
        : 'standby'

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
        <Solid
          size={[1.67, 0.012, 0.005]}
          position={[0, -0.39, 0.015]}
          color="#4d5866"
          bevel={0.001}
        />
      </group>

      <StatusWindow mode={mode} soundOn={soundOn} />
      <Print
        text="AV–01  /  4 HEAD · HI-FI STEREO"
        width={1.65}
        height={0.09}
        position={[-0.3, -0.29, 1.243]}
      />
      <PlayerButton
        name="player-sound"
        position={[-1.555, 0.09, 1.253]}
        size={[0.3, 0.3]}
        label="SOUND"
        accessibleName="Sound effects"
        interactive={interactive}
        portal={portal}
        pressed={soundOn}
        onClick={changeSound}
      />
      <PlayerButton
        name="player-eject"
        position={[1.25, -0.09, 1.253]}
        size={[0.93, 0.32]}
        label="EJECT"
        accessibleName="Eject tape"
        title="Eject tape (Escape)"
        interactive={interactive}
        portal={portal}
        onClick={onEject}
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
