import { useSyncExternalStore } from 'react'

/*
 * The modeled tube's picture size, the one value its two controls show: the
 * size bar at the foot of the picture and the dial on the monitor's chin.
 * `base` is the share of the window's width the picture fills, in tenths,
 * measured and never typed (The True Readout Rule); `level` is where the dial
 * stands: `base` at rest, a step or two higher for a moment when reading
 * begins, and up to 10 as the picture is turned up to full screen. Null while
 * no tape plays on the modeled tube.
 */
export interface PictureSize {
  base: number
  level: number
}

/** The dial turns up to full screen a step at a time, at this pace. */
const STEP_MS = 45

let size: PictureSize | null = null
/** The dial is on its way up to full screen; nothing else moves it. */
let turning = false
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setPictureSize(next: PictureSize | null) {
  if (next?.base === size?.base && next?.level === size?.level) return
  size = next
  if (!next) pointing = false
  for (const listener of listeners) listener()
}

export function getPictureSize() {
  return size
}

export function usePictureSize() {
  return useSyncExternalStore(
    subscribe,
    () => size,
    () => null,
  )
}

/**
 * A pointer or keyboard focus rests on either control: the bar previews the
 * steps a turn would light, and the dial lights as a hovered key does.
 */
let pointing = false

export function setPointing(next: boolean) {
  if (next === pointing) return
  pointing = next
  for (const listener of listeners) listener()
}

export function usePointing() {
  return useSyncExternalStore(
    subscribe,
    () => pointing,
    () => false,
  )
}

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Turn the picture up to full, one lit step at a time, then call `done`.
 * Reduced motion goes straight to `done`. Returns a cancel.
 */
export function turnUp(done: () => void) {
  if (!size || size.level >= 10 || reducedMotion()) {
    done()
    return () => {}
  }
  turning = true
  const stop = () => {
    window.clearInterval(timer)
    turning = false
  }
  const timer = window.setInterval(() => {
    if (!size) return stop()
    setPictureSize({ base: size.base, level: Math.min(10, size.level + 1) })
    if (size.level >= 10) {
      stop()
      done()
    }
  }, STEP_MS)
  return stop
}

/**
 * The set's one nudge, when reading begins on the tube: the dial turns up
 * two steps and settles back, and the bar lights with it, so the knob and
 * the readout are seen to be one control.
 */
export function nudgeDial() {
  if (!size || reducedMotion()) return
  const { base } = size
  const steps = [base + 1, base + 2, base + 2, base + 1, base]
  steps.forEach((level, index) =>
    window.setTimeout(() => {
      // Only while the dial is still where the nudge left it.
      if (!turning && size?.base === base)
        setPictureSize({ base, level: Math.min(9, level) })
    }, index * 110),
  )
}
