import { useSyncExternalStore } from 'react'

let probed: boolean | undefined

/** Probe once before loading the renderer; release the temporary GPU context. */
export function supportsWebGL() {
  if (probed === undefined) {
    try {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('webgl2')
      context?.getExtension('WEBGL_lose_context')?.loseContext()
      probed = !!context
    } catch {
      probed = false
    }
  }
  return probed
}

const never = () => () => {}

/**
 * The probe as a hook. A page rendered ahead of time cannot ask, so it is
 * drawn for a browser that has graphics, and a browser that has none finds
 * out as it takes the page over, without a hydration mismatch.
 */
export function useSupportsWebGL() {
  return useSyncExternalStore(never, supportsWebGL, () => true)
}
