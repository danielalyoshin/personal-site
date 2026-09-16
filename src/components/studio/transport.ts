import { BoxGeometry, MathUtils, Quaternion, Vector3 } from 'three'

// World coordinates shared by the player, cassette path, and camera.
// The deck sits on a 0.035 shadow line, the speaker's proportion, and the
// monitor's bezel 0.03 above the deck; the screen and the playback centre
// follow the monitor.
export const PLAYER = {
  position: [-1.35, 1.24, 0.25] as [number, number, number],
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
