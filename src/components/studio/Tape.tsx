import { useMemo, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Group, Quaternion, Vector3 } from 'three'
import type { Project } from '../../content/types'
import CassetteModel from './CassetteModel'
import { fitType, makeTexture, useTextureDisposal } from './textures'
import { insertionPose } from './transport'

export interface TapeProps {
  tape: Project
  index: number
  active: boolean
  selected: boolean
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
  const previousSelected = useRef(selected)
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
        ctx.font = '700 42px "Archivo Variable", sans-serif'
        ctx.fillText(String(index + 1).padStart(2, '0'), 24, 84)
        ctx.save()
        ctx.translate(113, 139)
        ctx.rotate(Math.PI / 2)
        const name = tape.vhs.spineLabel.split(' · ')[0]
        fitType(ctx, name, 43, 630, 750)
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
    const selectionChanged = selected !== previousSelected.current
    if (selectionChanged) {
      start.copy(group.current.position)
      startRotation.copy(group.current.quaternion)
      previousSelected.current = selected
    }
    const dt = Math.min(delta, 0.05)
    if (selected) {
      insertionPose(progress.current, start, startRotation, target, rotation)
      group.current.position.copy(target)
      group.current.quaternion.copy(rotation)
    } else {
      target.copy(home)
      target.y += active ? 0.22 : 0
      target.z += active ? 0.38 : 0
      const factor = reduced ? 1 : 1 - Math.exp(-dt * 14)
      // Eject restores the archive immediately instead of cutting through the CRT.
      if (selectionChanged) group.current.position.copy(target)
      else group.current.position.lerp(target, factor)
      rotation.identity()
      group.current.quaternion.slerp(rotation, selectionChanged ? 1 : factor)
      if (
        group.current.position.distanceTo(target) > 0.001 ||
        group.current.quaternion.angleTo(rotation) > 0.001
      )
        invalidate()
    }
  })

  return (
    <group
      ref={group}
      name={`tape-${tape.slug}`}
      position={home}
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
    >
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
  )
}
