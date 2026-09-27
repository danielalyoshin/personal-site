import { MathUtils, Matrix4, Mesh, OrthographicCamera, Vector3 } from 'three'
import type { Object3D } from 'three'
import { PLAYER } from './transport'

export type StudioFraming = ReturnType<typeof createStudioFraming>

const playbackCamera = new OrthographicCamera()

/** The stylesheet's phone-on-its-side arrangement (Stage.module.css). */
const SIDEWAYS = '(width >= 740px) and (height < 540px)'

/**
 * Phones frame the studio closer and more frontal, and let the table run out
 * of a canvas that runs to the screen's edges. A phone on its side has a
 * narrow canvas too, but boxed beside the words, so it keeps the
 * three-quarter view that holds the whole table inside the box.
 */
export function phoneView(canvasWidth: number) {
  return canvasWidth <= 600 && !window.matchMedia(SIDEWAYS).matches
}

/**
 * The zoom the playback view settles on for a frame of this size: the same
 * fit the rig runs, taken from the camera's playback pose ahead of time. The
 * modeled reader sizes itself to it before the camera arrives.
 */
export function playbackZoom(
  fit: StudioFraming,
  width: number,
  height: number,
) {
  playbackCamera.position.set(PLAYER.playbackX, PLAYER.playbackY, 12)
  playbackCamera.lookAt(PLAYER.playbackX, PLAYER.playbackY, 0)
  return fit(playbackCamera, width, height, 1)
}

/** Fit the rendered equipment, excluding the shadow-catching ground plane. */
export function createStudioFraming(studio: Object3D) {
  const parts: { mesh: Mesh; playback: boolean; furniture: boolean }[] = []
  studio.traverse((object) => {
    // Pointer targets are invisible slot boxes; they never drive the framing.
    if (!(object instanceof Mesh) || !object.visible) return
    let monitor = false
    let player = false
    let table = false
    for (let parent: Object3D | null = object; parent; parent = parent.parent) {
      monitor ||= parent.name === 'crt-monitor'
      player ||= parent.name === 'vhs-player'
      table ||= parent.name === 'studio-table'
    }
    object.geometry.computeBoundingBox()
    parts.push({ mesh: object, playback: monitor || player, furniture: table })
  })
  const view = new Matrix4()
  const point = new Vector3()

  return (
    camera: OrthographicCamera,
    width: number,
    height: number,
    focus: number,
  ) => {
    studio.updateWorldMatrix(true, true)
    camera.updateMatrixWorld()
    let browseX = 0
    let browseY = 0
    let monitorX = 0
    let monitorY = 0
    const narrow = phoneView(width)
    for (const { mesh, playback, furniture } of parts) {
      // The idle screen plane unmounts when the HTML reader takes its place.
      if (!mesh.parent) continue
      // R3F can replace a geometry when playback changes its props.
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox()
      const bounds = mesh.geometry.boundingBox!
      view.multiplyMatrices(camera.matrixWorldInverse, mesh.matrixWorld)
      for (let corner = 0; corner < 8; corner++) {
        point
          .set(
            corner & 1 ? bounds.max.x : bounds.min.x,
            corner & 2 ? bounds.max.y : bounds.min.y,
            corner & 4 ? bounds.max.z : bounds.min.z,
          )
          .applyMatrix4(view)
        // Phones keep every piece of equipment in frame; only the table may
        // run out of the sides, as a real tabletop would. Every object still
        // contributes to headroom, including during cassette flight.
        if (!narrow || !furniture)
          browseX = Math.max(browseX, Math.abs(point.x))
        browseY = Math.max(browseY, Math.abs(point.y))
        if (playback) {
          monitorX = Math.max(monitorX, Math.abs(point.x))
          monitorY = Math.max(monitorY, Math.abs(point.y))
        }
      }
    }
    // Phones land the widest equipment on the shell's 6% text gutter.
    const padding = narrow ? Math.round(width * 0.06) : 24
    // Blend the framing envelope as the camera turns toward playback. Fitting
    // only the destination lets the tilted CRT cross the top edge mid-flight.
    // Playback includes the complete player so its physical keys stay in view.
    return Math.min(
      (width - padding * 2) / (2 * MathUtils.lerp(browseX, monitorX, focus)),
      (height - padding * 2) / (2 * MathUtils.lerp(browseY, monitorY, focus)),
    )
  }
}
