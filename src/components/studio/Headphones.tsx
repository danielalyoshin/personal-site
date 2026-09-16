import { useEffect, useMemo } from 'react'
import { ExtrudeGeometry, Path, Shape } from 'three'
import { Disc, Solid } from './geometry'
import { Fasteners, Turned } from './ModelDetails'
import { MATTE, STUDIO } from './materials'

const pivotScrew: [number, number, number][] = [[0, 0.135, 0.144]]
const standScrews: [number, number, number][] = [
  [-0.16, 0, 0],
  [0.16, 0, 0],
]
const standCollar: [number, number][] = [
  [0.038, 0],
  [0.063, 0],
  [0.063, 0.019],
  [0.054, 0.028],
  [0.038, 0.028],
  [0.038, 0],
]

function oval(width: number, height: number) {
  const shape = new Shape()
  shape.absellipse(0, 0, width, height, 0, Math.PI * 2, false, 0)
  return shape
}

function extrude(shape: Shape, depth: number, bevel: number) {
  const geometry = new ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    curveSegments: 12,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 1,
  })
  geometry.translate(0, 0, -depth / 2)
  return geometry
}

export default function Headphones() {
  const geometry = useMemo(() => {
    // A wide, flat headband with an elliptical silhouette and a separate pad.
    const arch = (
      outerX: number,
      outerY: number,
      innerX: number,
      innerY: number,
      start = 0,
      end = Math.PI,
    ) => {
      const shape = new Shape()
      shape.absellipse(0, 0, outerX, outerY, start, end, false, 0)
      shape.absellipse(0, 0, innerX, innerY, end, start, true, 0)
      shape.closePath()
      return shape
    }
    // A single swept mount joins the band to an outer pivot. Its profile stays
    // within the cup's front/back outline, without rectangular fork overhangs.
    const mountProfile = new Shape()
    mountProfile.moveTo(-0.055, 0.282)
    mountProfile.lineTo(0.055, 0.282)
    mountProfile.lineTo(0.065, 0.272)
    mountProfile.lineTo(0.045, 0.135)
    mountProfile.absarc(0, 0.135, 0.045, 0, -Math.PI, true)
    mountProfile.lineTo(-0.065, 0.272)
    mountProfile.closePath()
    const mount = extrude(mountProfile, 0.028, 0.007)
    const vertices = mount.getAttribute('position')
    for (let i = 0; i < vertices.count; i++) {
      const rise = Math.max(0, Math.min(1, (vertices.getY(i) - 0.165) / 0.117))
      vertices.setZ(i, vertices.getZ(i) + 0.112 - rise * 0.02)
    }
    mount.computeVertexNormals()

    const cushion = oval(0.175, 0.243)
    const opening = new Path()
    opening.absellipse(0, 0, 0.105, 0.17, 0, Math.PI * 2, true, 0)
    cushion.holes.push(opening)
    // The outer face is a raised ring around a sunken core, the speaker's
    // mount-and-cone layering in the cup's own oval.
    const ring = oval(0.145, 0.21)
    const well = new Path()
    well.absellipse(0, 0, 0.105, 0.16, 0, Math.PI * 2, true, 0)
    ring.holes.push(well)
    const seam = oval(0.211, 0.291)
    const seamOpening = new Path()
    seamOpening.absellipse(0, 0, 0.184, 0.264, 0, Math.PI * 2, true, 0)
    seam.holes.push(seamOpening)
    return {
      band: extrude(arch(0.59, 0.64, 0.545, 0.595), 0.18, 0.012),
      pad: extrude(arch(0.544, 0.593, 0.497, 0.546), 0.155, 0.009),
      mount,
      cup: extrude(oval(0.185, 0.265), 0.145, 0.025),
      seam: extrude(seam, 0.006, 0.001),
      inset: extrude(oval(0.145, 0.21), 0.015, 0.009),
      ring: extrude(ring, 0.015, 0.009),
      core: extrude(oval(0.1, 0.152), 0.006, 0.004),
      cushion: extrude(cushion, 0.07, 0.018),
      // Match the cradle to the headband's underside so it rests on a curved
      // contact surface instead of intersecting a flat rectangular block.
      cradle: extrude(
        arch(
          0.497,
          0.512,
          0.497,
          0.479,
          Math.PI / 2 - 0.28,
          Math.PI / 2 + 0.28,
        ),
        0.24,
        0.008,
      ),
      cradlePad: extrude(
        arch(
          0.497,
          0.533,
          0.497,
          0.509,
          Math.PI / 2 - 0.28,
          Math.PI / 2 + 0.28,
        ),
        0.19,
        0.006,
      ),
    }
  }, [])
  useEffect(
    () => () => Object.values(geometry).forEach((part) => part.dispose()),
    [geometry],
  )

  return (
    <group
      name="headphones-and-stand"
      position={[3.77, 0.775, -1.02]}
      rotation={[0, -0.28, 0]}
    >
      {[-0.25, 0.25].flatMap((x) =>
        [-0.24, 0.24].map((z) => (
          <Solid
            key={`${x}-${z}`}
            size={[0.15, 0.035, 0.15]}
            position={[x, 0.0175, z]}
            color={STUDIO.rubber}
            bevel={0.008}
          />
        )),
      )}
      <Solid
        size={[0.72, 0.08, 0.71]}
        position={[0, 0.075, 0]}
        color={STUDIO.face}
        bevel={0.035}
      />
      <Solid
        size={[0.18, 0.1, 0.2]}
        position={[0, 0.14, -0.055]}
        color={STUDIO.shell}
        bevel={0.025}
      />
      <group position={[0, 0.19, -0.055]} rotation={[-Math.PI / 2, 0, 0]}>
        <Turned profile={standCollar} color={STUDIO.edge} />
      </group>
      <group position={[0, 0.118, -0.055]} rotation={[-Math.PI / 2, 0, 0]}>
        <Fasteners positions={standScrews} radius={0.018} color={STUDIO.edge} />
      </group>
      <mesh position={[0, 0.99, -0.055]} castShadow receiveShadow>
        <cylinderGeometry args={[0.035, 0.043, 1.7, 24]} />
        <meshStandardMaterial
          color={STUDIO.hardware}
          roughness={0.68}
          metalness={0.3}
          flatShading
        />
      </mesh>
      <group position={[0, 1.36, 0.065]}>
        <mesh geometry={geometry.cradle} castShadow receiveShadow>
          <meshStandardMaterial color={STUDIO.face} {...MATTE} />
        </mesh>
        <mesh geometry={geometry.cradlePad} castShadow receiveShadow>
          <meshStandardMaterial
            color={STUDIO.rubber}
            roughness={0.98}
            flatShading
          />
        </mesh>
        <mesh geometry={geometry.band} castShadow receiveShadow>
          <meshStandardMaterial
            color={STUDIO.hardware}
            roughness={0.74}
            metalness={0.2}
            flatShading
          />
        </mesh>
        <mesh geometry={geometry.pad} castShadow receiveShadow>
          <meshStandardMaterial
            color={STUDIO.rubber}
            roughness={0.95}
            flatShading
          />
        </mesh>
      </group>
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * 0.49, 1.14, 0.065]}
          rotation={[0, 0, side * 0.08]}
        >
          <group rotation={[0, (side * Math.PI) / 2, 0]}>
            <mesh geometry={geometry.cup} castShadow receiveShadow>
              <meshStandardMaterial color={STUDIO.shell} {...MATTE} />
            </mesh>
            <mesh
              geometry={geometry.seam}
              position={[0, 0, -0.037]}
              receiveShadow
            >
              <meshStandardMaterial
                color={STUDIO.recess}
                roughness={0.94}
                flatShading
              />
            </mesh>
            <mesh
              geometry={geometry.ring}
              position={[0, 0, 0.089]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color={STUDIO.face} {...MATTE} />
            </mesh>
            <mesh
              geometry={geometry.core}
              position={[0, 0, 0.081]}
              receiveShadow
            >
              <meshStandardMaterial
                color={STUDIO.recess}
                roughness={0.9}
                flatShading
              />
            </mesh>
            <mesh geometry={geometry.inset} position={[0, 0, -0.091]}>
              <meshStandardMaterial
                color={STUDIO.recess}
                roughness={1}
                flatShading
              />
            </mesh>
            <mesh
              geometry={geometry.cushion}
              position={[0, 0, -0.13]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color={STUDIO.rubber}
                roughness={0.98}
                flatShading
              />
            </mesh>
            <mesh geometry={geometry.mount} castShadow receiveShadow>
              <meshStandardMaterial color={STUDIO.edge} {...MATTE} />
            </mesh>
            <Disc
              radius={0.033}
              depth={0.012}
              position={[0, 0.135, 0.136]}
              rotation={[Math.PI / 2, 0, 0]}
              color={STUDIO.recess}
            />
            <Fasteners positions={pivotScrew} radius={0.022} />
          </group>
        </group>
      ))}
    </group>
  )
}
