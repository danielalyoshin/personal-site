import { useEffect, useMemo } from 'react'
import { ExtrudeGeometry, Shape } from 'three'
import { shelfTapes } from '../../content/projects'
import { shelfKey } from '../../content/types'
import { Solid } from './geometry'
import { Fasteners } from './ModelDetails'
import { MATTE, STUDIO } from './materials'

const sideScrews: [number, number, number][] = [
  [-0.47, 0.105, 0.0455],
  [0.47, 0.105, 0.0455],
]

export default function TapeRack() {
  const cheek = useMemo(() => {
    // Low at the open front, rising into a rear stop. Extrude across rack width.
    const shape = new Shape()
    shape.moveTo(-0.67, 0.025)
    shape.lineTo(0.67, 0.025)
    shape.lineTo(0.67, 0.235)
    shape.lineTo(0.51, 0.235)
    shape.lineTo(-0.38, 0.49)
    shape.lineTo(-0.67, 0.49)
    shape.closePath()
    return new ExtrudeGeometry(shape, {
      depth: 0.065,
      steps: 1,
      curveSegments: 1,
      bevelEnabled: true,
      bevelSegments: 1,
      bevelSize: 0.009,
      bevelThickness: 0.009,
    }).translate(0, 0, -0.0325)
  }, [])
  useEffect(() => () => cheek.dispose(), [cheek])
  return (
    <group name="archive-holder" position={[2.125, 0.775, 0.25]}>
      {[-1.18, 1.18].flatMap((x) =>
        [-0.47, 0.47].map((z) => (
          <Solid
            key={`${x}-${z}`}
            size={[0.26, 0.032, 0.18]}
            position={[x, 0.016, z]}
            color={STUDIO.rubber}
            bevel={0.008}
          />
        )),
      )}
      <Solid
        size={[2.98, 0.07, 1.45]}
        position={[0, 0.067, 0]}
        color={STUDIO.face}
        bevel={0.022}
      />
      <Solid
        size={[2.75, 0.01, 1.29]}
        position={[0, 0.095, 0]}
        color="#1d2833"
        bevel={0.004}
      />
      {/* Channels keep a visible clearance beside every shell and its guide. */}
      {shelfTapes.map((tape, index) => (
        <group key={shelfKey(tape)} position={[-1.075 + index * 0.43, 0, 0]}>
          <Solid
            name={`rack-pad-${index}`}
            size={[0.393, 0.012, 1.08]}
            position={[0, 0.096, 0.03]}
            color="#293640"
            bevel={0.003}
          />
          {index < shelfTapes.length - 1 && (
            <Solid
              name={`rack-divider-${index}`}
              size={[0.012, 0.15, 1.12]}
              position={[0.215, 0.19, 0.025]}
              color={STUDIO.edge}
              bevel={0.003}
            />
          )}
        </group>
      ))}
      <Solid
        name="rack-backstop"
        size={[2.69, 0.27, 0.055]}
        position={[0, 0.255, -0.595]}
        color={STUDIO.shell}
        bevel={0.009}
      />
      <Solid
        name="rack-front-lip"
        size={[2.69, 0.065, 0.04]}
        position={[0, 0.139, 0.625]}
        color={STUDIO.edge}
        bevel={0.006}
      />
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * 1.36, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <mesh
            name={`rack-cheek-${side}`}
            geometry={cheek}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={STUDIO.face} {...MATTE} />
          </mesh>
          <group rotation={[0, side < 0 ? 0 : Math.PI, 0]}>
            <Fasteners positions={sideScrews} radius={0.021} />
          </group>
        </group>
      ))}
    </group>
  )
}
