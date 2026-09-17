import { useRef, useState, type RefObject } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Solid, Print, type PrintMark } from './geometry'
import styles from './StudioScene.module.css'

/**
 * A working deck key: one printed cap label in every state, and during
 * playback an invisible native button over the cap that carries the
 * accessible name, keyboard focus, and the press.
 */
export default function PlayerButton({
  name,
  position,
  size,
  label,
  mark,
  accessibleName,
  title,
  shortcut,
  interactive,
  portal,
  pressed,
  onClick,
}: {
  name: string
  position: [number, number, number]
  size: [number, number]
  /** The cap print, in capitals. */
  label: string
  /** A drawn mark leading the cap print. */
  mark?: PrintMark
  accessibleName: string
  title?: string
  /** A key that also presses this one, in `aria-keyshortcuts` form. */
  shortcut?: string
  interactive: boolean
  portal: RefObject<HTMLDivElement | null>
  pressed?: boolean
  onClick: () => void
}) {
  const button = useRef<HTMLButtonElement>(null)
  const [hovered, setHovered] = useState(false)
  const [down, setDown] = useState(false)
  // The hit area unmounts on eject; release a cap it left lit or pressed.
  if (!interactive && (hovered || down)) {
    setHovered(false)
    setDown(false)
  }
  useFrame(({ camera }) => {
    if (!button.current) return
    // Orthographic projection: the target follows the cap's projected size,
    // with a 44px floor. No continuous animation.
    const view = camera.matrixWorldInverse.elements
    button.current.style.width = `${Math.max(44, size[0] * camera.zoom * Math.abs(view[0]))}px`
    button.current.style.height = `${Math.max(44, size[1] * camera.zoom * Math.abs(view[5]))}px`
  })
  return (
    <group name={name} position={position}>
      <Solid
        size={[size[0] + 0.05, size[1] + 0.05, 0.024]}
        color="#171d25"
        bevel={0.009}
      />
      {/* The label is part of the cap: it travels with the press. */}
      <group position={[0, 0, down ? 0.015 : 0.034]}>
        <Solid
          size={[size[0], size[1], 0.065]}
          color={hovered ? '#66727e' : '#4d5865'}
          bevel={0.014}
        />
        <Print
          name={`${name}-label`}
          text={label}
          mark={mark}
          width={size[0] - 0.04}
          height={0.11}
          weight={600}
          tracking={0.1}
          position={[0, 0, 0.0335]}
        />
      </group>
      {interactive && (
        <Html
          center
          position={[0, 0, 0.072]}
          portal={portal.current ? { current: portal.current } : undefined}
          zIndexRange={[42, 41]}
        >
          <button
            ref={button}
            type="button"
            className={styles.playerKey}
            aria-label={accessibleName}
            aria-pressed={pressed}
            aria-keyshortcuts={shortcut}
            title={title ?? accessibleName}
            onPointerDown={(event) => {
              event.stopPropagation()
              setDown(true)
            }}
            onPointerUp={() => setDown(false)}
            onPointerCancel={() => setDown(false)}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => {
              setHovered(false)
              setDown(false)
            }}
            onFocus={() => setHovered(true)}
            onBlur={() => {
              setHovered(false)
              setDown(false)
            }}
            onClick={onClick}
          />
        </Html>
      )}
    </group>
  )
}
