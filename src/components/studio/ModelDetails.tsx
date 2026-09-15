import { useEffect, useMemo } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import { BoxGeometry, CylinderGeometry, LatheGeometry, Vector2 } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

type MeshProps = Omit<ThreeElements['mesh'], 'args'>
type Point = [number, number, number]
type DetailBox = { size: Point; position: Point; rotation?: number }

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
  color = '#737e8b',
}: {
  positions: Point[]
  radius?: number
  color?: string
}) {
  const geometry = useMemo(() => {
    const heads = positions.map((position) => {
      const head = new CylinderGeometry(radius, radius * 0.8, 0.007, 12)
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
