import { useEffect, useMemo } from 'react'
import { ExtrudeGeometry, Path, Shape } from 'three'
import { Disc, Solid } from './geometry'

function oval(width: number, height: number) {
  const shape = new Shape()
  shape.absellipse(0, 0, width, height, 0, Math.PI * 2, false, 0)
  return shape
}

function extrude(shape: Shape, depth: number, bevel: number) {
  const geometry = new ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    curveSegments: 16,
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
    return {
      band: extrude(arch(0.59, 0.64, 0.545, 0.595), 0.18, 0.012),
      pad: extrude(arch(0.544, 0.593, 0.497, 0.546), 0.155, 0.009),
      mount,
      cup: extrude(oval(0.185, 0.265), 0.145, 0.025),
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
      <Solid
        size={[0.68, 0.035, 0.67]}
        position={[0, 0.02, 0]}
        color="#151c24"
        bevel={0.012}
      />
      <Solid
        size={[0.72, 0.08, 0.71]}
        position={[0, 0.075, 0]}
        color="#424d5a"
        bevel={0.035}
      />
      <Solid
        size={[0.18, 0.1, 0.2]}
        position={[0, 0.14, -0.055]}
        color="#303b47"
        bevel={0.025}
      />
      <mesh position={[0, 0.99, -0.055]} castShadow receiveShadow>
        <cylinderGeometry args={[0.035, 0.043, 1.7, 24]} />
        <meshStandardMaterial
          color="#818d9a"
          roughness={0.68}
          metalness={0.3}
          flatShading
        />
      </mesh>
      <group position={[0, 1.36, 0.065]}>
        <mesh geometry={geometry.cradle} castShadow receiveShadow>
          <meshStandardMaterial color="#3f4a56" roughness={0.82} />
        </mesh>
        <mesh geometry={geometry.cradlePad} castShadow receiveShadow>
          <meshStandardMaterial color="#151d27" roughness={0.98} />
        </mesh>
        <mesh geometry={geometry.band} castShadow receiveShadow>
          <meshStandardMaterial
            color="#778390"
            roughness={0.74}
            metalness={0.2}
          />
        </mesh>
        <mesh geometry={geometry.pad} castShadow receiveShadow>
          <meshStandardMaterial color="#222d39" roughness={0.95} />
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
              <meshStandardMaterial color="#35414e" roughness={0.78} />
            </mesh>
            <mesh
              geometry={geometry.ring}
              position={[0, 0, 0.089]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#485563" roughness={0.83} />
            </mesh>
            <mesh
              geometry={geometry.core}
              position={[0, 0, 0.081]}
              receiveShadow
            >
              <meshStandardMaterial color="#2a343f" roughness={0.9} />
            </mesh>
            <mesh geometry={geometry.inset} position={[0, 0, -0.091]}>
              <meshStandardMaterial color="#101720" roughness={1} />
            </mesh>
            <mesh
              geometry={geometry.cushion}
              position={[0, 0, -0.13]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#1b2530" roughness={0.98} />
            </mesh>
            <mesh geometry={geometry.mount} castShadow receiveShadow>
              <meshStandardMaterial color="#596675" roughness={0.8} />
            </mesh>
            <Disc
              radius={0.026}
              depth={0.012}
              position={[0, 0.135, 0.136]}
              rotation={[Math.PI / 2, 0, 0]}
              color="#8c98a4"
            />
          </group>
        </group>
      ))}
    </group>
  )
}
