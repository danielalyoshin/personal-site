import { useEffect, useMemo } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  LatheGeometry,
  Path,
  Shape,
  Vector2,
} from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { MATTE, STUDIO } from './materials'

type MeshProps = Omit<ThreeElements['mesh'], 'args'>
type Point = [number, number, number]
type DetailBox = { size: Point; position: Point; rotation?: number }

/** A shallow vent plate with real openings over a dark well, facing +Z. */
export function VentPanel({
  width,
  height,
  rows,
  color = STUDIO.shell,
  ...props
}: Omit<ThreeElements['group'], 'args'> & {
  width: number
  height: number
  rows: number
  color?: string
}) {
  const geometry = useMemo(() => {
    const shape = new Shape()
    const x = width / 2
    const y = height / 2
    const corner = 0.016
    shape.moveTo(-x + corner, -y)
    shape.lineTo(x - corner, -y)
    shape.lineTo(x, -y + corner)
    shape.lineTo(x, y - corner)
    shape.lineTo(x - corner, y)
    shape.lineTo(-x + corner, y)
    shape.lineTo(-x, y - corner)
    shape.lineTo(-x, -y + corner)
    shape.closePath()
    const pitch = (height - 0.065) / rows
    const halfSlot = width / 2 - 0.05
    for (let i = 0; i < rows; i++) {
      const middle = (i - (rows - 1) / 2) * pitch
      const halfGap = pitch * 0.24
      const slot = new Path()
      slot.moveTo(-halfSlot, middle - halfGap)
      slot.lineTo(-halfSlot, middle + halfGap)
      slot.lineTo(halfSlot, middle + halfGap)
      slot.lineTo(halfSlot, middle - halfGap)
      slot.closePath()
      shape.holes.push(slot)
    }
    return new ExtrudeGeometry(shape, {
      depth: 0.012,
      steps: 1,
      curveSegments: 1,
      bevelEnabled: true,
      bevelSegments: 1,
      bevelSize: 0.002,
      bevelThickness: 0.002,
    }).translate(0, 0, 0.006)
  }, [width, height, rows])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <group {...props}>
      <mesh position={[0, 0, 0.002]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={STUDIO.recess} roughness={1} />
      </mesh>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color={color} {...MATTE} />
      </mesh>
    </group>
  )
}

/** A revolved cross-section, facing +Z. Profiles model recesses and real rims. */
export function Turned({
  profile,
  color,
  roughness = 0.82,
  ...props
}: MeshProps & {
  profile: [number, number][]
  color: string
  roughness?: number
}) {
  const geometry = useMemo(
    () =>
      new LatheGeometry(
        profile.map(([radius, depth]) => new Vector2(radius, depth)),
        24,
      ).rotateX(Math.PI / 2),
    [profile],
  )
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh geometry={geometry} castShadow receiveShadow {...props}>
      <meshStandardMaterial color={color} roughness={roughness} flatShading />
    </mesh>
  )
}

/** Merge small repeated details so ribs and screw slots don't each cost a draw. */
export function DetailBoxes({
  boxes,
  color,
  ...props
}: MeshProps & { boxes: DetailBox[]; color: string }) {
  const geometry = useMemo(() => {
    const parts = boxes.map(({ size, position, rotation = 0 }) => {
      const box = new BoxGeometry(...size)
      box.rotateZ(rotation)
      box.translate(...position)
      return box
    })
    const merged = mergeGeometries(parts)
    parts.forEach((part) => part.dispose())
    return merged
  }, [boxes])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh geometry={geometry} castShadow receiveShadow {...props}>
      <meshStandardMaterial color={color} roughness={0.88} />
    </mesh>
  )
}

export function Fasteners({
  positions,
  radius = 0.019,
  color = STUDIO.hardware,
}: {
  positions: Point[]
  radius?: number
  color?: string
}) {
  const geometry = useMemo(() => {
    const heads = positions.map((position) => {
      const head = new CylinderGeometry(radius, radius * 0.8, 0.007, 24)
      head.rotateX(Math.PI / 2)
      head.translate(...position)
      return head
    })
    const merged = mergeGeometries(heads)
    heads.forEach((head) => head.dispose())
    return merged
  }, [positions, radius])
  const slots = useMemo(
    () =>
      positions.map(([x, y, z]) => ({
        size: [radius * 1.15, radius * 0.22, 0.002] as Point,
        position: [x, y, z + 0.004] as Point,
        rotation: Math.PI / 4,
      })),
    [positions, radius],
  )
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial color={color} roughness={0.72} metalness={0.25} />
      </mesh>
      <DetailBoxes boxes={slots} color="#141b24" />
    </>
  )
}
