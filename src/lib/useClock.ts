import { useSyncExternalStore } from 'react'

/** HH:MM, 24-hour — the deck clock's register. */
function stamp(): string {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

/* External store (not state-in-render): the timer runs only while a deck is
   mounted, realigns to the minute boundary, and notifies on actual change. */
let current = stamp()
const listeners = new Set<() => void>()
let align: number | undefined
let every: number | undefined

function refresh() {
  const next = stamp()
  if (next === current) return
  current = next
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  if (listeners.size === 0) {
    refresh()
    align = window.setTimeout(
      () => {
        refresh()
        every = window.setInterval(refresh, 60_000)
      },
      (60 - new Date().getSeconds()) * 1000 + 50,
    )
  }
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
    if (listeners.size === 0) {
      clearTimeout(align)
      clearInterval(every)
    }
  }
}

/** The deck's clock: quiet system time, updated on the minute. */
export function useClock(): string {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => '',
  )
}
