import { useEffect, useMemo } from 'react'
import { ExtrudeGeometry, Path, Shape } from 'three'
import { Disc, Solid } from './geometry'
import { DetailBoxes, Fasteners, Turned } from './ModelDetails'
import { fitType, makeTexture, useTextureDisposal } from './textures'

const screws: [number, number, number][] = [
  [-0.745, 0.415, 0.195],
  [0.745, 0.415, 0.195],
  [-0.745, -0.32, 0.195],
  [0.745, -0.32, 0.195],
  [0, -0.32, 0.195],
]
const reelRim: [number, number][] = [
  [0.091, 0],
  [0.214, 0],
  [0.214, 0.007],
  [0.203, 0.012],
  [0.091, 0.012],
  [0.091, 0],
]
const hub: [number, number][] = [
  [0.041, 0],
  [0.09, 0],
  [0.09, 0.01],
  [0.083, 0.016],
  [0.041, 0.016],
  [0.041, 0],
]
const winding: [number, number][] = [
  [0.163, 0],
  [0.17, 0],
  [0.17, 0.001],
  [0.163, 0.001],
  [0.163, 0],
]
const teeth = Array.from({ length: 6 }, (_, i) => {
  const angle = (i * Math.PI) / 3
  return {
    size: [0.017, 0.024, 0.009] as [number, number, number],
    position: [Math.sin(angle) * 0.042, Math.cos(angle) * 0.042, 0.012] as [
      number,
      number,
      number,
    ],
    rotation: -angle,
  }
})
const ribs = [-1, 1].flatMap((side) =>
  Array.from({ length: 6 }, (_, i) => ({
    size: [0.018, 0.155, 0.008] as [number, number, number],
    position: [side * (0.48 + i * 0.042), 0.36, 0.194] as [
      number,
      number,
      number,
    ],
  })),
)

function chamferedRectangle(width: number, height: number, bevel: number) {
  const shape = new Shape()
  const x = width / 2,
    y = height / 2
  shape.moveTo(-x + bevel, -y)
  shape.lineTo(x - bevel, -y)
  shape.lineTo(x, -y + bevel)
  shape.lineTo(x, y - bevel)
  shape.lineTo(x - bevel, y)
  shape.lineTo(-x + bevel, y)
  shape.lineTo(-x, y - bevel)
  shape.lineTo(-x, -y + bevel)
  shape.closePath()
  return shape
}

/** The paper label stuck on the broad face; a blank shell carries none. */
function FaceLabel({ title, accent }: { title: string; accent: string }) {
  // 256 × 480 matches the 0.233 × 0.436 label plane, so the print never stretches.
  const label = useMemo(
    () =>
      makeTexture(256, 480, (ctx) => {
        ctx.fillStyle = '#d5d9d4'
        ctx.fillRect(0, 0, 256, 480)
        ctx.fillStyle = accent
        ctx.fillRect(20, 24, 216, 34)
        ctx.fillStyle = '#25303a'
        ctx.textAlign = 'center'
        fitType(ctx, title, 40, 216, 600)
        ctx.fillText(title, 128, 141)
        ctx.fillRect(20, 179, 216, 2)
        ctx.font = '800 66px "Archivo Variable", sans-serif'
        ctx.fillText('VHS', 128, 291)
        ctx.font = '400 28px "Archivo Variable", sans-serif'
        ctx.fillText('HI-FI', 128, 378)
        ctx.fillRect(20, 428, 216, 2)
      }),
    [title, accent],
  )
  useTextureDisposal(label)
  return (
    <>
      <Solid
        size={[0.243, 0.448, 0.008]}
        position={[0, 0.032, 0.198]}
        color="#d5d9d4"
        bevel={0.002}
      />
      <mesh position={[0, 0.032, 0.204]}>
        <planeGeometry args={[0.233, 0.436]} />
        <meshStandardMaterial map={label} roughness={0.9} />
      </mesh>
    </>
  )
}

/**
 * Canonical VHS shell: 1.68 × 1.08 × 0.40. The broad printed face points +Z.
 * A blank shell is the same molding with no label stuck on it.
 */
export default function CassetteModel({
  title = 'SIDE A',
  accent = '#bfc8cd',
  blank = false,
}: {
  title?: string
  accent?: string
  blank?: boolean
}) {
  const face = useMemo(() => {
    const shape = chamferedRectangle(1.61, 0.91, 0.027)
    for (const x of [-0.43, 0.43]) {
      const window = chamferedRectangle(0.565, 0.485, 0.055)
      const hole = new Path(
        window.getPoints().map((point) => point.setX(point.x + x)),
      )
      shape.holes.push(hole)
    }
    return new ExtrudeGeometry(shape, {
      depth: 0.022,
      steps: 1,
      curveSegments: 1,
      bevelEnabled: true,
      bevelSize: 0.004,
      bevelThickness: 0.004,
      bevelSegments: 1,
    })
  }, [])
  useEffect(() => () => face.dispose(), [face])
  return (
    <group name="cassette-shell">
      <Solid size={[1.68, 1.08, 0.344]} color="#222c36" bevel={0.025} />
      {/* A fine parting line runs around the actual two-piece housing. */}
      <Solid
        size={[1.682, 1.082, 0.009]}
        position={[0, 0, -0.055]}
        color="#101922"
        bevel={0.003}
      />
      <mesh
        geometry={face}
        position={[0, 0.032, 0.17]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#3a4653" roughness={0.86} flatShading />
      </mesh>
      {[-0.43, 0.43].map((x) => (
        <group key={x} position={[x, 0.032, 0.174]}>
          <Turned profile={reelRim} color="#17212b" roughness={0.92} />
          <Turned profile={winding} position={[0, 0, 0.012]} color="#303c47" />
          <Turned profile={hub} color="#aeb8bb" roughness={0.75} />
          <DetailBoxes boxes={teeth} color="#aeb8bb" />
        </group>
      ))}
      {!blank && <FaceLabel title={title} accent={accent} />}
      <DetailBoxes boxes={ribs} color="#27323d" />
      <Fasteners positions={screws} radius={0.014} color="#7a858f" />
      {/* The long hinged guard and its end pivots enclose the tape edge. */}
      <Solid
        size={[1.625, 0.135, 0.375]}
        position={[0, -0.469, 0]}
        color="#303c48"
        bevel={0.014}
      />
      <Solid
        size={[1.48, 0.013, 0.004]}
        position={[0, -0.415, 0.19]}
        color="#141e28"
        bevel={0.001}
      />
      <group rotation={[0, Math.PI / 2, 0]}>
        {[-0.817, 0.817].map((z) => (
          <Disc
            key={z}
            radius={0.039}
            depth={0.012}
            position={[0, -0.464, z]}
            rotation={[Math.PI / 2, 0, 0]}
            color="#1b2630"
          />
        ))}
      </group>
      <Solid
        size={[1.6, 0.009, 0.331]}
        position={[0, 0.538, 0]}
        color="#121c25"
        bevel={0.002}
      />
      {/* The underside's sockets and mold detail are revealed in transit. */}
      <group rotation={[0, Math.PI, 0]}>
        <Solid
          size={[1.58, 0.91, 0.012]}
          position={[0, 0.025, 0.177]}
          color="#2d3945"
          bevel={0.003}
        />
        {[-0.43, 0.43].map((x) => (
          <group key={x} position={[x, 0.032, 0.181]}>
            <Disc
              radius={0.109}
              depth={0.01}
              rotation={[Math.PI / 2, 0, 0]}
              color="#111c26"
            />
            <Turned profile={hub} color="#7b8993" />
            <DetailBoxes boxes={teeth} color="#7b8993" />
          </group>
        ))}
        <DetailBoxes boxes={ribs} color="#202c37" />
        <Fasteners positions={screws} radius={0.014} color="#697783" />
      </group>
    </group>
  )
}
