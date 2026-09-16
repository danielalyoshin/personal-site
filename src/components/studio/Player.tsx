import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import type { Project } from '../../content/types'
import { Decal, Solid, Print } from './geometry'
import { Fasteners, VentPanel } from './ModelDetails'
import { STUDIO } from './materials'
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

type DeckMode = 'standby' | 'loading' | 'play' | 'eject' | 'nosignal'

type Point = [number, number, number]

const coverScrews: Point[] = [
  [-0.88, 0.22, 0.008],
  [0.88, 0.22, 0.008],
]

/**
 * The fascia's parting line: the four fascia pieces again, a hair larger on
 * their outer edges and set into the groove where they meet the chassis.
 */
const FASCIA_SEAM: { size: Point; position: Point }[] = [
  { size: [3.66, 0.115, 0.012], position: [0, 0.3825, -0.045] },
  { size: [3.66, 0.295, 0.012], position: [0, -0.2925, -0.045] },
  { size: [0.54, 0.47, 0.012], position: [-1.56, 0.09, -0.045] },
  { size: [1.14, 0.47, 0.012], position: [1.26, 0.09, -0.045] },
]

const STATUS: Record<DeckMode, string> = {
  standby: 'STANDBY',
  loading: 'LOADING',
  play: 'PLAY',
  eject: 'EJECT',
  nosignal: 'NO SIGNAL',
}

/**
 * The sound mark, the same speaker as the SVG on the native deck key: a filled
 * body, like the readout's play mark, with two stroked waves when on or a red
 * slash across it when off. `box` is the mark's height; the 20-unit icon grid
 * scales to it, so the body stands as tall as the readout's capitals.
 */
function drawSoundMark(
  ctx: CanvasRenderingContext2D,
  right: number,
  middle: number,
  box: number,
  on: boolean,
) {
  const unit = box / 20
  const left = right - box
  const x = (u: number) => left + u * unit
  const y = (u: number) => middle + (u - 10) * unit
  ctx.lineWidth = unit * 1.6
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.fillStyle = '#c4ccd2'
  ctx.strokeStyle = '#c4ccd2'
  ctx.beginPath()
  ctx.moveTo(x(9), y(4))
  ctx.lineTo(x(5), y(7))
  ctx.lineTo(x(2), y(7))
  ctx.lineTo(x(2), y(13))
  ctx.lineTo(x(5), y(13))
  ctx.lineTo(x(9), y(16))
  ctx.closePath()
  ctx.fill()
  if (on) {
    ctx.beginPath()
    ctx.arc(x(7.53), y(10), 6 * unit, -0.7297, 0.7297)
    ctx.moveTo(x(15), y(3))
    ctx.arc(x(7.86), y(10), 10 * unit, -0.7754, 0.7754)
    ctx.stroke()
  } else {
    ctx.strokeStyle = '#ff3b30'
    ctx.beginPath()
    ctx.moveTo(x(3), y(17))
    ctx.lineTo(x(17), y(3))
    ctx.stroke()
  }
}

/** The deck's readout: transport state on the left, the sound mark on the right. */
function StatusWindow({ mode, soundOn }: { mode: DeckMode; soundOn: boolean }) {
  const texture = useMemo(
    () =>
      makeTexture(1024, 125, (ctx) => {
        const middle = 63
        const size = fitType(ctx, STATUS[mode], 74, 640, 600, 0.06)
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
        drawSoundMark(ctx, 992, middle, 88, soundOn)
      }),
    [mode, soundOn],
  )
  useTextureDisposal(texture)
  return (
    <>
      <Solid
        size={[0.93, 0.16, 0.028]}
        position={[1.25, 0.23, 1.25]}
        color={STUDIO.recess}
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
  ejecting,
  progress,
  interactive,
  portal,
  invalid,
  soundOn,
  onEject,
}: {
  tape: Project | null
  inserting: boolean
  ejecting: boolean
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
    : ejecting
      ? 'eject'
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
            color={STUDIO.shell}
            bevel={0.025}
          />
          <Solid
            size={[0.1, 0.7, 2.3]}
            position={[side * 1.77, 0, 0]}
            color={STUDIO.shell}
            bevel={0.018}
          />
          <group
            position={[side * 1.821, 0, 0]}
            rotation={[0, (side * Math.PI) / 2, 0]}
          >
            <VentPanel
              name={`player-side-vents-${side}`}
              width={0.88}
              height={0.3}
              rows={4}
              position={[side * 0.35, -0.015, 0]}
            />
            <Fasteners
              positions={coverScrews}
              radius={0.018}
              color={STUDIO.edge}
            />
          </group>
        </group>
      ))}
      <Solid
        size={[3.44, 0.66, 0.1]}
        position={[0, 0, -1.1]}
        color={STUDIO.recess}
        bevel={0.01}
      />

      {/* Four fascia pieces surround a 1.98 × 0.47 opening. */}
      <group name="player-fascia" position={[0, 0, 1.18]}>
        <Solid
          name="slot-top"
          size={[3.64, 0.105, 0.12]}
          position={[0, 0.3775, 0]}
          color={STUDIO.face}
          bevel={0.012}
        />
        <Solid
          name="slot-bottom"
          size={[3.64, 0.285, 0.12]}
          position={[0, -0.2875, 0]}
          color={STUDIO.face}
          bevel={0.016}
        />
        <Solid
          name="slot-left"
          size={[0.53, 0.47, 0.12]}
          position={[-1.555, 0.09, 0]}
          color={STUDIO.face}
          bevel={0.01}
        />
        <Solid
          name="slot-right"
          size={[1.13, 0.47, 0.12]}
          position={[1.255, 0.09, 0]}
          color={STUDIO.face}
          bevel={0.01}
        />
        {/* A parting line where the fascia meets the chassis, as on the
            cassette housing: four pieces, so the opening stays clear. */}
        {FASCIA_SEAM.map(({ size, position }, index) => (
          <Solid
            key={index}
            size={size}
            position={position}
            color={STUDIO.recess}
            bevel={0.002}
          />
        ))}
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
          color={STUDIO.shell}
          bevel={0.008}
        />
        <Solid
          size={[1.67, 0.012, 0.005]}
          position={[0, -0.39, 0.015]}
          color={STUDIO.edge}
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
        mark="eject"
        accessibleName="Eject tape"
        title="Eject tape (Escape)"
        interactive={interactive}
        portal={portal}
        onClick={onEject}
      />
      {/* Four isolating pads in the speaker's style, tucked under the corners. */}
      {[-1.55, 1.55].flatMap((x) =>
        [-0.95, 0.95].map((z) => (
          <Solid
            key={`${x}-${z}`}
            size={[0.28, 0.035, 0.22]}
            position={[x, -0.4475, z]}
            color={STUDIO.rubber}
            bevel={0.012}
          />
        )),
      )}
    </group>
  )
}
