import { useEffect, useMemo } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import { ExtrudeGeometry, MathUtils, Shape, type CanvasTexture } from 'three'
import {
  capitalsOffset,
  fitType,
  makeTexture,
  useTextureDisposal,
} from './textures'

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

/**
 * A printed mark laid onto a surface. Only the inked pixels render, in the
 * same matte material as the chassis, so print never sits on a differently
 * lit patch and never casts a rectangular shadow.
 */
export function Decal({
  texture,
  width,
  height,
  ...props
}: Omit<ThreeElements['mesh'], 'args'> & {
  texture: CanvasTexture
  width: number
  height: number
}) {
  return (
    <mesh receiveShadow {...props}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        map={texture}
        transparent
        depthWrite={false}
        roughness={0.82}
        metalness={0.12}
        flatShading
        polygonOffset
        polygonOffsetFactor={-1}
      />
    </mesh>
  )
}

/** Texture pixels per world unit: about 3× the playback zoom on a 2× display. */
const PRINT_DENSITY = 1280

/** One line of printed capitals, set to its plane's proportions and measured to fit. */
export function Print({
  text,
  width = 1,
  height = 0.12,
  color = '#b7bbc6',
  weight = 600,
  tracking = 0,
  ...props
}: Omit<ThreeElements['mesh'], 'args'> & {
  text: string
  width?: number
  height?: number
  color?: string
  weight?: number
  /** Letter spacing in em, matching the control typography in CSS. */
  tracking?: number
}) {
  const texture = useMemo(() => {
    const textureWidth = MathUtils.clamp(
      Math.round(width * PRINT_DENSITY),
      256,
      2048,
    )
    const textureHeight = Math.max(
      8,
      Math.round((textureWidth * height) / width),
    )
    return makeTexture(textureWidth, textureHeight, (ctx) => {
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      const size = fitType(
        ctx,
        text,
        textureHeight * 0.65,
        textureWidth * 0.94,
        weight,
        tracking,
      )
      // Canvas tracking trails the last glyph; shift by half a step to center.
      ctx.fillText(
        text,
        textureWidth / 2 + (size * tracking) / 2,
        textureHeight / 2 + capitalsOffset(ctx, text),
      )
    })
  }, [text, color, height, width, weight, tracking])
  useTextureDisposal(texture)
  return <Decal texture={texture} width={width} height={height} {...props} />
}
