import { useEffect, useMemo } from 'react'
import { ExtrudeGeometry, Path, Shape } from 'three'
import { Disc, Print, Solid } from './geometry'
import { Fasteners, Turned } from './ModelDetails'

const mount: [number, number][] = [
  [0.82, 0],
  [1, 0],
  [1, 0.08],
  [0.96, 0.12],
  [0.83, 0.12],
  [0.82, 0],
]
const surround: [number, number][] = [
  [0.62, 0.045],
  [0.67, 0.13],
  [0.72, 0.18],
  [0.77, 0.17],
  [0.82, 0.11],
  [0.84, 0.04],
]
const cone: [number, number][] = [
  [0, -0.09],
  [0.26, -0.09],
  [0.4, -0.05],
  [0.64, 0.06],
]
const dome: [number, number][] = [
  [0, 0.025],
  [0.13, 0.018],
  [0.24, -0.025],
  [0.3, -0.07],
]
surround.reverse()
cone.reverse()
dome.reverse()

const driverScrews: [number, number, number][] = [-1, 1].flatMap((x) =>
  [-1, 1].map(
    (y) => [x * 0.202, y * 0.202 - 0.23, 0.517] as [number, number, number],
  ),
)
const rearScrews: [number, number, number][] = [
  [-0.24, -0.21, 0.01],
  [0.24, -0.21, 0.01],
  [-0.24, 0.21, 0.01],
  [0.24, 0.21, 0.01],
]

export default function Speaker() {
  const baffle = useMemo(() => {
    const shape = new Shape()
    const w = 0.39,
      h = 0.667,
      b = 0.025
    shape.moveTo(-w + b, -h)
    shape.lineTo(w - b, -h)
    shape.lineTo(w, -h + b)
    shape.lineTo(w, h - b)
    shape.lineTo(w - b, h)
    shape.lineTo(-w + b, h)
    shape.lineTo(-w, h - b)
    shape.lineTo(-w, -h + b)
    shape.closePath()
    for (const [y, radius] of [
      [-0.23, 0.305],
      [0.39, 0.164],
    ]) {
      const opening = new Path()
      opening.absarc(0, y, radius, 0, Math.PI * 2, true)
      shape.holes.push(opening)
    }
    return new ExtrudeGeometry(shape, {
      depth: 0.035,
      steps: 1,
      curveSegments: 12,
      bevelEnabled: true,
      bevelSegments: 1,
      bevelThickness: 0.005,
      bevelSize: 0.005,
    })
  }, [])
  useEffect(() => () => baffle.dispose(), [baffle])
  return (
    <group
      name="studio-speaker"
      position={[-3.66, 1.535, 0.1]}
      rotation={[0, 0.12, 0]}
    >
      <Solid
        size={[0.89, 1.45, 0.86]}
        position={[0, 0, -0.025]}
        color="#35404b"
        bevel={0.055}
      />
      <Solid
        size={[0.82, 1.37, 0.036]}
        position={[0, 0, 0.421]}
        color="#151d27"
        bevel={0.02}
      />
      <mesh geometry={baffle} position={[0, 0, 0.441]} castShadow receiveShadow>
        <meshStandardMaterial color="#424d59" roughness={0.84} flatShading />
      </mesh>
      {/* The woofer slopes into its opening; the soft surround stands proud. */}
      {[
        [-0.23, 0.305],
        [0.39, 0.164],
      ].map(([y, radius]) => (
        <group key={y} position={[0, y, 0.48]} scale={radius}>
          <Turned profile={mount} color="#222c37" />
          <Turned profile={surround} color="#17212b" roughness={0.98} />
          <Turned profile={cone} color="#465260" roughness={0.92} />
          <Turned profile={dome} color="#273440" roughness={0.94} />
        </group>
      ))}
      <Fasteners positions={driverScrews} radius={0.015} color="#75808b" />
      <Print
        text="STUDIO / 01"
        width={0.43}
        height={0.048}
        position={[0, -0.602, 0.482]}
        background="#424d59"
        color="#c0c7cf"
      />
      <group position={[0, -0.18, -0.46]} rotation={[0, Math.PI, 0]}>
        <Solid size={[0.56, 0.5, 0.022]} color="#1b2530" bevel={0.016} />
        <Fasteners positions={rearScrews} radius={0.012} color="#606e7d" />
        <Print
          text="STUDIO / 01"
          width={0.32}
          height={0.045}
          position={[0, 0.125, 0.012]}
          background="#1b2530"
        />
        {[-0.1, 0.1].map((x) => (
          <group
            key={x}
            position={[x, -0.055, 0.025]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <Disc radius={0.053} depth={0.018} color="#0f1721" />
            <Disc radius={0.031} depth={0.04} color="#677582" />
            <Disc radius={0.017} depth={0.044} color="#212b36" />
          </group>
        ))}
      </group>
      {[-0.28, 0.28].flatMap((x) =>
        [-0.27, 0.27].map((z) => (
          <Solid
            key={`${x}-${z}`}
            size={[0.16, 0.035, 0.18]}
            position={[x, -0.7425, z]}
            color="#141d27"
            bevel={0.012}
          />
        )),
      )}
    </group>
  )
}
