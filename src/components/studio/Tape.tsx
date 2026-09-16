import { useMemo, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { BoxGeometry, Group, MathUtils, Quaternion, Vector3 } from 'three'
import type { Project } from '../../content/types'
import CassetteModel from './CassetteModel'
import { fitType, makeTexture, useTextureDisposal } from './textures'
import { insertionPose } from './transport'

/** A previewed cassette rises and comes forward by this much. */
const LIFT = new Vector3(0, 0.22, 0.38)

/**
 * The preview arc from the slot (0) to the lifted pose (1): the shell rises
 * before it comes forward, and retreats before it drops, so its bottom edge
 * clears the rack's retaining lip both ways. A straight diagonal cut the
 * lip's corner.
 */
function liftPose(home: Vector3, amount: number, out: Vector3) {
  out.set(
    home.x,
    home.y + LIFT.y * amount * (2 - amount),
    home.z + LIFT.z * amount * amount,
  )
}

/**
 * The pointer target is the shell's resting envelope in its slot: the rack's
 * 0.43 pitch across, 1.68 tall, 1.09 deep to the spine. It never moves. The
 * cassette itself lifts on preview, and a target that lifted with it would
 * slide out from under a resting pointer, drop the preview, land back under
 * the pointer, and lift again. Fixed slots hand over cleanly, one to the next.
 */
const SLOT_TARGET = new BoxGeometry(0.43, 1.68, 1.09)

type Flight = 'insert' | 'eject' | null

export interface TapeProps {
  tape: Project
  index: number
  active: boolean
  selected: boolean
  /** The mechanism runs back from wherever it is until the tape is home. */
  ejecting: boolean
  reduced: boolean
  progress: RefObject<number>
  interactive: boolean
  onSelect: (tape: Project) => void
  onPreview: (tape: Project | null) => void
}

export default function Tape({
  tape,
  index,
  active,
  selected,
  ejecting,
  reduced,
  progress,
  interactive,
  onSelect,
  onPreview,
}: TapeProps) {
  const group = useRef<Group>(null)
  const invalidate = useThree((state) => state.invalidate)
  const home = useMemo(
    () => new Vector3(1.05 + index * 0.43, 1.72, 0.28),
    [index],
  )
  const previousFlight = useRef<Flight>(null)
  /** Where the shell sits on the preview arc; a flight resumes from it. */
  const lift = useRef(0)
  /** The last timeline position a flight saw: an eject lands only at 0. */
  const lastProgress = useRef(1)
  const scratch = useRef({
    target: new Vector3(),
    rotation: new Quaternion(),
    start: home.clone(),
    startRotation: new Quaternion(),
  })
  // 192 × 966 matches the 0.306 × 1.54 spine plane, so the print never stretches.
  const label = useMemo(
    () =>
      makeTexture(192, 966, (ctx) => {
        const accent = tape.vhs.accent
        const studio = tape.vhs.labelVariant === 'studio'
        const classic = tape.vhs.labelVariant === 'classic'
        ctx.fillStyle = studio ? '#232931' : classic ? '#deded5' : accent
        ctx.fillRect(0, 0, 192, 966)
        ctx.fillStyle = studio ? accent : '#192026'
        ctx.fillRect(20, 24, 152, 3)
        ctx.font = '800 42px "Archivo Variable", sans-serif'
        ctx.fillText(String(index + 1).padStart(2, '0'), 24, 84)
        ctx.save()
        ctx.translate(113, 139)
        ctx.rotate(Math.PI / 2)
        const name = tape.vhs.spineLabel.split(' · ')[0]
        fitType(ctx, name, 43, 630, 800)
        ctx.fillText(name, 0, 0)
        ctx.restore()
        ctx.fillStyle = accent
        ctx.fillRect(0, 796, 192, 82)
        if (studio) {
          ctx.fillStyle = '#232931'
          ctx.fillRect(24, 818, 144, 3)
          ctx.fillRect(24, 834, 100, 3)
        } else {
          ctx.fillStyle = '#192026'
          for (let i = 0; i < 5; i++) ctx.fillRect(0, 802 + i * 14, 192, 4)
        }
        ctx.fillStyle = studio ? '#dfe6e1' : '#192026'
        ctx.font = '600 22px "Archivo Variable", sans-serif'
        ctx.fillText('VHS', 24, 927)
        ctx.font = '400 14px "Archivo Variable", sans-serif'
        ctx.fillText('HI-FI', 108, 925)
      }),
    [tape, index],
  )

  useTextureDisposal(label)

  useFrame((_, delta) => {
    const { target, rotation, start, startRotation } = scratch.current
    if (!group.current) return
    const flight: Flight = selected ? 'insert' : ejecting ? 'eject' : null
    const previous = previousFlight.current
    if (flight !== previous) {
      previousFlight.current = flight
      if (flight === 'insert') {
        // From wherever the shell is: at rest, or lifted on preview.
        start.copy(group.current.position)
        startRotation.copy(group.current.quaternion)
      }
    }
    if (flight === 'eject' && progress.current >= 0.34) {
      // Back into the slot itself, flat. The path only depends on this
      // start once the tape has turned; an early eject retraces its own
      // outward start instead and settles the rest below.
      start.copy(home)
      startRotation.identity()
      lift.current = 0
    }
    if (flight) {
      lastProgress.current = progress.current
      insertionPose(progress.current, start, startRotation, target, rotation)
      group.current.position.copy(target)
      group.current.quaternion.copy(rotation)
      return
    }
    // A mechanism that stops short (reduced motion, the fallback reader, a
    // new selection mid-eject) restores the archive at once rather than
    // cutting through the CRT; a landed tape only settles. The shared
    // timeline may already be reset for the next tape, so completion is
    // judged by the last position this flight itself saw.
    const interrupted =
      flight !== previous && (previous === 'insert' || lastProgress.current > 0)
    const snap = reduced || interrupted
    const factor = snap ? 1 : 1 - Math.exp(-Math.min(delta, 0.05) * 14)
    const raised = active ? 1 : 0
    lift.current = MathUtils.lerp(lift.current, raised, factor)
    liftPose(home, lift.current, target)
    rotation.identity()
    group.current.position.copy(target)
    group.current.quaternion.slerp(rotation, factor)
    if (
      Math.abs(lift.current - raised) > 0.001 ||
      group.current.quaternion.angleTo(rotation) > 0.001
    )
      invalidate()
  })

  return (
    <>
      <group ref={group} name={`tape-${tape.slug}`} position={home}>
        <group rotation={[0, Math.PI / 2, Math.PI / 2]}>
          <CassetteModel
            title={tape.vhs.spineLabel.split(' · ')[0]}
            accent={tape.vhs.accent}
          />
        </group>
        <mesh position={[0, 0, 0.546]}>
          <planeGeometry args={[0.306, 1.54]} />
          <meshStandardMaterial map={label} roughness={0.9} />
        </mesh>
      </group>
      <mesh
        name={`pointer-target-${tape.slug}`}
        geometry={SLOT_TARGET}
        position={home}
        visible={false}
        onPointerOver={(event) => {
          event.stopPropagation()
          if (interactive) {
            document.body.style.cursor = 'pointer'
            onPreview(tape)
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = ''
          onPreview(null)
        }}
        onClick={(event) => {
          event.stopPropagation()
          if (event.delta < 5 && interactive) {
            document.body.style.cursor = ''
            onSelect(tape)
          }
        }}
      />
    </>
  )
}
