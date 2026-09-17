import { useMemo } from 'react'
import CassetteModel from './CassetteModel'
import { SLOT_TARGET, slotHome } from './transport'

/**
 * A slot with no project yet holds a blank tape: the same shell as every
 * other cassette, seated flat in its slot, with nothing printed on the spine
 * or the face. Its slot target swallows the pointer, so it never previews,
 * lifts, or plays, and the printed tapes behind it in the three-quarter
 * view do not answer through it; the archive entry beside it reads
 * "Coming soon…".
 */
export default function BlankTape({
  id,
  index,
}: {
  id: string
  index: number
}) {
  const home = useMemo(() => slotHome(index), [index])
  return (
    <>
      <group name={`tape-${id}`} position={home}>
        <group rotation={[0, Math.PI / 2, Math.PI / 2]}>
          <CassetteModel blank />
        </group>
      </group>
      <mesh
        name={`pointer-target-${id}`}
        geometry={SLOT_TARGET}
        position={home}
        visible={false}
        onPointerOver={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      />
    </>
  )
}
