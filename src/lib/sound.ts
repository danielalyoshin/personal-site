import { useSyncExternalStore } from 'react'

/*
 * AV-01 sound: every effect is synthesized in Web Audio — no asset files.
 * Default-off on every visit; the deck's sound toggle is the only way in,
 * and the choice lasts for the visit only (never persisted — so the page
 * can never hold pre-gesture audio state). Sound is independent of
 * prefers-reduced-motion: nothing here loops, every cue answers a user
 * action and dies out on its own.
 */

export type SoundName = 'tick' | 'insert' | 'eject'

let enabled = false

const listeners = new Set<() => void>()

let ctx: AudioContext | null = null
let master: GainNode | null = null
let noiseBuf: AudioBuffer | null = null

/** Create/resume lazily — always from inside a user gesture. */
function audio(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function noise(ac: AudioContext): AudioBuffer {
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  return noiseBuf
}

interface BurstSpec {
  type?: BiquadFilterType
  freq: number
  q?: number
  peak: number
  decay: number
}

/** Filtered noise burst — the material of every mechanical contact. */
function burst(
  ac: AudioContext,
  at: number,
  { type = 'lowpass', freq, q = 0.8, peak, decay }: BurstSpec,
) {
  const src = ac.createBufferSource()
  src.buffer = noise(ac)
  src.loop = true
  const filter = ac.createBiquadFilter()
  filter.type = type
  filter.frequency.value = freq
  filter.Q.value = q
  const g = ac.createGain()
  g.gain.setValueAtTime(0, at)
  g.gain.linearRampToValueAtTime(peak, at + 0.004)
  g.gain.exponentialRampToValueAtTime(0.001, at + decay)
  src.connect(filter).connect(g).connect(master!)
  src.start(at)
  src.stop(at + decay + 0.05)
}

interface ThumpSpec {
  from: number
  to: number
  peak: number
  decay: number
}

/** Falling sine thump — the weight of the mechanism. */
function thump(
  ac: AudioContext,
  at: number,
  { from, to, peak, decay }: ThumpSpec,
) {
  const osc = ac.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(from, at)
  osc.frequency.exponentialRampToValueAtTime(to, at + decay)
  const g = ac.createGain()
  g.gain.setValueAtTime(0, at)
  g.gain.linearRampToValueAtTime(peak, at + 0.005)
  g.gain.exponentialRampToValueAtTime(0.001, at + decay)
  osc.connect(g).connect(master!)
  osc.start(at)
  osc.stop(at + decay + 0.05)
}

const RECIPES: Record<SoundName, (ac: AudioContext, t: number) => void> = {
  /* Fingertip click: browsing tapes, flipping switches. */
  tick(ac, t) {
    burst(ac, t, {
      type: 'bandpass',
      freq: 2600,
      q: 6,
      peak: 0.1,
      decay: 0.035,
    })
  },
  /* Cassette seating: shell contact, latch snap, mechanism thump. */
  insert(ac, t) {
    burst(ac, t, { freq: 750, peak: 0.45, decay: 0.06 })
    burst(ac, t + 0.07, {
      type: 'bandpass',
      freq: 1500,
      q: 2.5,
      peak: 0.22,
      decay: 0.03,
    })
    thump(ac, t + 0.08, { from: 88, to: 46, peak: 0.85, decay: 0.17 })
  },
  /* Eject: latch release, spring, softer shell return. */
  eject(ac, t) {
    burst(ac, t, { type: 'bandpass', freq: 1900, q: 3, peak: 0.2, decay: 0.03 })
    thump(ac, t + 0.02, { from: 170, to: 95, peak: 0.2, decay: 0.09 })
    burst(ac, t + 0.09, { freq: 650, peak: 0.35, decay: 0.08 })
    thump(ac, t + 0.1, { from: 70, to: 48, peak: 0.5, decay: 0.13 })
  },
}

/*
 * A suspended context's clock is frozen: cues scheduled against it queue up
 * at the same timestamp and all fire AT ONCE when the context resumes —
 * summing into one loud pop. So a cue is only ever scheduled on a running
 * context; otherwise we keep just the latest cue and play it once, after
 * resume() actually completes.
 */
let pendingCue: SoundName | null = null

export function playSound(name: SoundName) {
  if (!enabled) return
  const ac = audio()
  if (!ac || !master) return
  if (ac.state === 'running') {
    RECIPES[name](ac, ac.currentTime + 0.01)
    return
  }
  const firstPending = pendingCue === null
  pendingCue = name
  if (firstPending) {
    ac.resume()
      .then(() => {
        const cue = pendingCue
        pendingCue = null
        if (cue && enabled && ac.state === 'running') {
          RECIPES[cue](ac, ac.currentTime + 0.01)
        }
      })
      .catch(() => {
        pendingCue = null
      })
  }
}

export function setSoundEnabled(on: boolean) {
  if (on === enabled) return
  enabled = on
  if (on) audio()
  else {
    pendingCue = null
    void ctx?.suspend()
  }
  listeners.forEach((l) => l())
}

/** Flip and report the new state (so callers can play a confirmation). */
export function toggleSound(): boolean {
  setSoundEnabled(!enabled)
  return enabled
}

/** All deck controls use the same opt-in confirmation cue. */
export function changeSound() {
  if (toggleSound()) playSound('tick')
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function useSoundEnabled(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => enabled,
    () => false,
  )
}
