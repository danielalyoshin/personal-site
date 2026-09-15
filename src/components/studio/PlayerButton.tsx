import { useRef, useState, type ReactNode, type RefObject } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Solid, Print } from './geometry'
import styles from './StudioScene.module.css'

/** A native, keyboard-accessible hit area follows the modeled key cap. */
export default function PlayerButton({
  name,
  position,
  size,
  interactive,
  portal,
  label,
  print,
  pressed,
  onClick,
  children,
}: {
  name: string
  position: [number, number, number]
  size: [number, number]
  interactive: boolean
  portal: RefObject<HTMLDivElement | null>
  label: string
  print: string
  pressed?: boolean
  onClick: () => void
  children: ReactNode
}) {
  const button = useRef<HTMLButtonElement>(null)
  const [hovered, setHovered] = useState(false)
  const [down, setDown] = useState(false)
  useFrame(({ camera }) => {
    if (!button.current) return
    // Orthographic projection: keep the target on its cap, with a 44px floor
    // while the camera is still wide during insertion. No continuous animation.
    const view = camera.matrixWorldInverse.elements
    button.current.style.width = `${Math.max(44, size[0] * camera.zoom * Math.abs(view[0]))}px`
    button.current.style.height = `${Math.max(44, size[1] * camera.zoom * Math.abs(view[5]))}px`
    button.current.style.fontSize = `clamp(0.75rem, ${camera.zoom * 0.052}px, 0.875rem)`
  })
  return (
    <group name={name} position={position}>
      <Solid
        size={[size[0] + 0.05, size[1] + 0.05, 0.024]}
        color="#171d25"
        bevel={0.009}
      />
      <Solid
        size={[size[0], size[1], 0.065]}
        position={[0, 0, down ? 0.015 : 0.034]}
        color={hovered ? '#66727e' : '#4d5865'}
        bevel={0.014}
      />
      {interactive ? (
        <Html
          center
          position={[0, 0, 0.072]}
          portal={portal.current ? { current: portal.current } : undefined}
          zIndexRange={[42, 41]}
        >
          <button
            ref={button}
            type="button"
            className={styles.playerButton}
            aria-label={label}
            aria-pressed={pressed}
            title={label === 'Eject tape' ? 'Eject tape (Escape)' : label}
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
          >
            {children}
          </button>
        </Html>
      ) : (
        <Print
          text={print}
          width={size[0] * 0.82}
          height={0.085}
          position={[0, 0, 0.068]}
          background="#4d5865"
        />
      )}
    </group>
  )
}
