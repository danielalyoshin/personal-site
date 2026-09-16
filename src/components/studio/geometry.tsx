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

/** Drawn marks a print can lead with (The Drawn Mark Rule: never a typed glyph). */
export type PrintMark = 'eject'

/**
 * The eject mark of the native key, as a canvas path: a triangle over a bar
 * on a 14-unit square, the same proportions as the SVG icon.
 */
function drawEjectMark(
  ctx: CanvasRenderingContext2D,
  left: number,
  middle: number,
  size: number,
) {
  const unit = size / 14
  const x = (u: number) => left + u * unit
  const y = (u: number) => middle + (u - 7) * unit
  ctx.beginPath()
  ctx.moveTo(x(7), y(0))
  ctx.lineTo(x(14), y(9))
  ctx.lineTo(x(0), y(9))
  ctx.closePath()
  ctx.rect(x(0), y(11), size, unit * 3)
  ctx.fill()
}

/**
 * One line of printed capitals, set to its plane's proportions and measured
 * to fit, optionally led by a drawn mark set to the capitals' height.
 */
export function Print({
  text,
  mark,
  width = 1,
  height = 0.12,
  color = '#b7bbc6',
  weight = 600,
  tracking = 0,
  ...props
}: Omit<ThreeElements['mesh'], 'args'> & {
  text: string
  mark?: PrintMark
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
      ctx.textBaseline = 'alphabetic'
      const room = textureWidth * 0.94
      let size = fitType(
        ctx,
        text,
        textureHeight * 0.65,
        room,
        weight,
        tracking,
      )
      const middle = textureHeight / 2
      if (!mark) {
        ctx.textAlign = 'center'
        // Canvas tracking trails the last glyph; shift by half a step to center.
        ctx.fillText(
          text,
          textureWidth / 2 + (size * tracking) / 2,
          middle + capitalsOffset(ctx, text),
        )
        return
      }
      // The mark stands as tall as the capitals and sits half an em before
      // them; the pair is centred as one unit, trailing tracking excluded.
      const metrics = ctx.measureText(text)
      const capitals = metrics.actualBoundingBoxAscent
      const gap = size * 0.5
      if (metrics.width + capitals + gap > room)
        size = fitType(ctx, text, size, room - capitals - gap, weight, tracking)
      const textWidth = ctx.measureText(text).width - size * tracking
      const left = (textureWidth - (capitals + gap + textWidth)) / 2
      drawEjectMark(ctx, left, middle, capitals)
      ctx.textAlign = 'left'
      ctx.fillText(
        text,
        left + capitals + gap,
        middle + capitalsOffset(ctx, text),
      )
    })
  }, [text, mark, color, height, width, weight, tracking])
  useTextureDisposal(texture)
  return <Decal texture={texture} width={width} height={height} {...props} />
}
