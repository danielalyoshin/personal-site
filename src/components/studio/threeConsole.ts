import { setConsoleFunction } from 'three'

/**
 * React Three Fiber 9 builds its store around a THREE.Clock, which three
 * r183 deprecated in favour of THREE.Timer. The warning is R3F's to retire:
 * nothing in this project constructs a clock, so nothing here can act on it.
 * Drop that one line, matched by its exact text, and hand every other
 * three.js message to the console as three itself would, so a new warning,
 * or this one reworded, is still seen. Delete this module once R3F moves to
 * Timer.
 */
const CLOCK_DEPRECATION =
  'THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.'

interface StackTrace {
  isStackTrace: true
  getError(message: string): Error
}

const isStackTrace = (value: unknown): value is StackTrace =>
  typeof value === 'object' &&
  value !== null &&
  (value as Partial<StackTrace>).isStackTrace === true

setConsoleFunction((type, message, ...params) => {
  if (type === 'warn' && message === CLOCK_DEPRECATION) return
  const [trace] = params
  if (type !== 'log' && isStackTrace(trace))
    console[type](trace.getError(message))
  else console[type](message, ...params)
})
