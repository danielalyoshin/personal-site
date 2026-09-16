import { BoxGeometry, MathUtils, Quaternion, Vector3 } from 'three'
import type { Camera } from 'three'

// World coordinates shared by the player, cassette path, and camera.
// The deck sits on a 0.035 shadow line, the speaker's proportion, and the
// monitor's bezel 0.03 above the deck; the screen and the playback centre
// follow the monitor.
export const PLAYER = {
  position: [-1.35, 1.24, 0.25] as [number, number, number],
  /** The playback camera looks straight along the monitor's axis. */
  playbackX: -1.35,
  slot: new Vector3(-1.65, 1.31, 1.49),
  seated: new Vector3(-1.65, 1.31, 0.4),
  screenY: 3.23,
  playbackY: 2.64,
}

/** Where a shell rests in the rack's numbered slot, blank or printed. */
export function slotHome(index: number) {
  return new Vector3(1.05 + index * 0.43, 1.72, 0.28)
}

/**
 * The pointer target is the shell's resting envelope in its slot: the rack's
 * 0.43 pitch across, 1.68 tall, 1.09 deep to the spine. It never moves. The
 * cassette itself lifts on preview, and a target that lifted with it would
 * slide out from under a resting pointer, drop the preview, land back under
 * the pointer, and lift again. Fixed slots hand over cleanly, one to the next.
 * Every slot has one, blank slots included: the three-quarter camera looks
 * along the rack, so a ray through an empty slot would run on into the
 * envelope of the printed tape behind it.
 */
export const SLOT_TARGET = new BoxGeometry(0.43, 1.68, 1.09)

/**
 * A fingertip has no hover to confirm with, so a touch tap needs room the
 * slots do not have: at the phone fit the whole rack is about 110px across.
 * Every slot target answers a tap inside its projected rectangle grown to
 * this square, nearest centre first, and blank slots swallow theirs.
 */
export const TOUCH_TARGET = 44

/** A rectangle in the canvas's client pixels. */
export interface SlotRect {
  left: number
  top: number
  right: number
  bottom: number
}

const corner = new Vector3()

/**
 * Where a slot's target box lands on screen, in client pixels: its eight
 * corners projected through the camera onto the canvas rectangle.
 */
export function projectSlot(
  index: number,
  camera: Camera,
  canvas: SlotRect,
  out: SlotRect,
) {
  const home = slotHome(index)
  const { width, height, depth } = SLOT_TARGET.parameters
  out.left = out.top = Infinity
  out.right = out.bottom = -Infinity
  for (let i = 0; i < 8; i++) {
    corner
      .set(
        home.x + (i & 1 ? width : -width) / 2,
        home.y + (i & 2 ? height : -height) / 2,
        home.z + (i & 4 ? depth : -depth) / 2,
      )
      .project(camera)
    const x = canvas.left + ((corner.x + 1) / 2) * (canvas.right - canvas.left)
    const y = canvas.top + ((1 - corner.y) / 2) * (canvas.bottom - canvas.top)
    out.left = Math.min(out.left, x)
    out.right = Math.max(out.right, x)
    out.top = Math.min(out.top, y)
    out.bottom = Math.max(out.bottom, y)
  }
  return out
}

const catchRect: SlotRect = { left: 0, top: 0, right: 0, bottom: 0 }

/**
 * The slot a touch tap means: the one whose target, grown to at least
 * TOUCH_TARGET square about its centre, contains the point, nearest centre
 * first. Returns -1 when the tap is clear of every slot.
 */
export function resolveSlotTap(
  x: number,
  y: number,
  count: number,
  camera: Camera,
  canvas: SlotRect,
) {
  let nearest = -1
  let best = Infinity
  for (let index = 0; index < count; index++) {
    const rect = projectSlot(index, camera, canvas, catchRect)
    const cx = (rect.left + rect.right) / 2
    const cy = (rect.top + rect.bottom) / 2
    const halfWidth = Math.max(rect.right - rect.left, TOUCH_TARGET) / 2
    const halfHeight = Math.max(rect.bottom - rect.top, TOUCH_TARGET) / 2
    if (Math.abs(x - cx) > halfWidth || Math.abs(y - cy) > halfHeight) continue
    const distance = Math.hypot(x - cx, y - cy)
    if (distance < best) {
      best = distance
      nearest = index
    }
  }
  return nearest
}

/**
 * Whether an event came from a pointer that cannot hover. Chrome and Safari
 * deliver clicks as pointer events; a plain mouse event falls back to the
 * device's primary pointer.
 */
export function isTouchEvent(event: Event) {
  const type = (event as PointerEvent).pointerType
  return type
    ? type !== 'mouse'
    : window.matchMedia('(pointer: coarse)').matches
}

export const INSERT_SECONDS = 2.4
/** Eject runs the same path back; an exit is quicker than an entrance. */
export const EJECT_SECONDS = 1.8
export const FLAT_TAPE = new Quaternion().setFromAxisAngle(
  new Vector3(0, 0, 1),
  Math.PI / 2,
)

export function smoothStep(value: number, from: number, to: number) {
  return MathUtils.smoothstep(value, from, to)
}

/** Clear the rack and loose tape before turning; enter the slot along its axis. */
export function insertionPose(
  progress: number,
  start: Vector3,
  startRotation: Quaternion,
  position: Vector3,
  rotation: Quaternion,
) {
  // Clear the full shared shell on the loose tape, including its raised face.
  const liftedY = Math.max(start.y, 2.04)
  if (progress < 0.12) {
    position.copy(start)
    position.y = MathUtils.lerp(start.y, liftedY, smoothStep(progress, 0, 0.12))
    rotation.copy(startRotation)
  } else if (progress < 0.34) {
    position.set(
      start.x,
      liftedY,
      MathUtils.lerp(start.z, 3.08, smoothStep(progress, 0.12, 0.34)),
    )
    rotation.copy(startRotation)
  } else if (progress < 0.62) {
    const turn = smoothStep(progress, 0.34, 0.62)
    position.set(
      MathUtils.lerp(start.x, PLAYER.slot.x, turn),
      MathUtils.lerp(liftedY, PLAYER.slot.y, turn),
      3.08,
    )
    rotation.copy(startRotation).slerp(FLAT_TAPE, turn)
  } else if (progress < 0.72) {
    position.set(
      PLAYER.slot.x,
      PLAYER.slot.y,
      MathUtils.lerp(
        3.08,
        PLAYER.slot.z + 0.67,
        smoothStep(progress, 0.62, 0.72),
      ),
    )
    rotation.copy(FLAT_TAPE)
  } else {
    position.set(PLAYER.slot.x, PLAYER.slot.y, PLAYER.slot.z + 0.67)
    position.lerp(PLAYER.seated, smoothStep(progress, 0.72, 0.94))
    rotation.copy(FLAT_TAPE)
  }
}

export function slotFlapAngle(progress: number) {
  return (
    (Math.PI / 2) *
    smoothStep(progress, 0.56, 0.7) *
    (1 - smoothStep(progress, 0.94, 1))
  )
}
