import { useEffect, useMemo } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import { ExtrudeGeometry, Shape } from 'three'
import { makeTexture, useTextureDisposal } from './textures'

type BoxProps = Omit<ThreeElements['mesh'], 'args'> & {
  size: [number, number, number]
  color?: string
  bevel?: number
}

/** A single chamfer defines the edge: broad planes, crisp silhouettes, no subdivision. */
export function Solid({
  size: [width, height, depth],
  color = '#343840',
  bevel = 0.04,
  children,
  ...props
}: BoxProps) {
  const geometry = useMemo(() => {
    const b = Math.min(bevel, width / 4, height / 4, depth / 4)
    const x = width / 2 - b
    const y = height / 2 - b
    const shape = new Shape()
    shape.moveTo(-x, -y)
    shape.lineTo(x, -y)
    shape.lineTo(x, y)
    shape.lineTo(-x, y)
    shape.closePath()
    const result = new ExtrudeGeometry(shape, {
      depth: depth - b * 2,
      steps: 1,
      bevelEnabled: b > 0,
      bevelSegments: 1,
      bevelSize: b,
      bevelThickness: b,
      curveSegments: 1,
    })
    result.translate(0, 0, -depth / 2 + b)
    return result
  }, [width, height, depth, bevel])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh geometry={geometry} castShadow receiveShadow {...props}>
      {children ?? (
        <meshStandardMaterial
          color={color}
          roughness={0.82}
          metalness={0.12}
          flatShading
        />
      )}
    </mesh>
  )
}

export function Disc({
  radius,
  depth = 0.04,
  color,
  ...props
}: Omit<ThreeElements['mesh'], 'args'> & {
  radius: number
  depth?: number
  color: string
}) {
  return (
    <mesh castShadow receiveShadow {...props}>
      <cylinderGeometry args={[radius, radius, depth, 16]} />
      <meshStandardMaterial color={color} roughness={0.8} flatShading />
    </mesh>
  )
}

export function Print({
  text,
  width = 1,
  height = 0.12,
  color = '#b7bbc6',
  background = '#343840',
  fitted = false,
  ...props
}: Omit<ThreeElements['mesh'], 'args'> & {
  text: string
  width?: number
  height?: number
  color?: string
  background?: string
  fitted?: boolean
}) {
  const texture = useMemo(() => {
    const textureHeight = fitted ? Math.round((1024 * height) / width) : 128
    return makeTexture(1024, textureHeight, (ctx) => {
      ctx.fillStyle = background
      ctx.fillRect(0, 0, 1024, textureHeight)
      ctx.fillStyle = color
      ctx.font = `500 ${fitted ? textureHeight * 0.65 : 54}px "Archivo Variable", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 512, fitted ? textureHeight / 2 : 66, 980)
    })
  }, [text, color, background, fitted, height, width])
  useTextureDisposal(texture)
  return (
    <mesh {...props}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.85}
        polygonOffset
        polygonOffsetFactor={-1}
      />
    </mesh>
  )
}
