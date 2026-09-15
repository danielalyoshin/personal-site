import { useEffect } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

const pendingDraws = new Set<() => void>()
const updateListeners = new Set<() => void>()
const textureOwners = new WeakMap<CanvasTexture, number>()
let fontsRequested = false
let fontsSettled = false

function loadStudioFonts() {
  if (fontsRequested) return
  fontsRequested = true
  // Canvas text does not reliably trigger a font download. Load both faces
  // once, including VT323 when the idle screen is the only place using it.
  void Promise.allSettled([
    document.fonts.load('500 16px "Archivo Variable"'),
    document.fonts.load('16px "VT323"'),
  ]).then(() => {
    fontsSettled = true
    const draws = [...pendingDraws]
    pendingDraws.clear()
    for (const draw of draws) draw()
    if (draws.length) for (const listener of updateListeners) listener()
  })
}

/** Redrawn canvas maps need a new frame in the on-demand studio. */
export function subscribeTextureUpdates(listener: () => void) {
  updateListeners.add(listener)
  return () => {
    updateListeners.delete(listener)
  }
}

/** Keep StrictMode's immediate effect replay from disposing a retained map. */
export function useTextureDisposal(texture: CanvasTexture) {
  useEffect(() => {
    textureOwners.set(texture, (textureOwners.get(texture) ?? 0) + 1)
    return () => {
      textureOwners.set(texture, textureOwners.get(texture)! - 1)
      queueMicrotask(() => {
        if (textureOwners.get(texture) === 0) {
          textureOwners.delete(texture)
          texture.dispose()
        }
      })
    }
  }, [texture])
}

export function makeTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const paint = () => {
    ctx.save()
    try {
      ctx.clearRect(0, 0, width, height)
      draw(ctx)
    } finally {
      ctx.restore()
    }
  }
  paint()
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8
  if (!fontsSettled) {
    let disposed = false
    const redraw = () => {
      if (disposed) return
      paint()
      texture.needsUpdate = true
      texture.removeEventListener('dispose', onDispose)
    }
    const onDispose = () => {
      disposed = true
      pendingDraws.delete(redraw)
      texture.removeEventListener('dispose', onDispose)
    }
    texture.addEventListener('dispose', onDispose)
    pendingDraws.add(redraw)
    loadStudioFonts()
  }
  return texture
}
