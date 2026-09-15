import { MathUtils, Matrix4, Mesh, Vector3 } from 'three'
import type { Object3D, OrthographicCamera } from 'three'

/** Fit the rendered equipment, excluding the shadow-catching ground plane. */
export function createStudioFraming(studio: Object3D) {
  const parts: { mesh: Mesh; playback: boolean; subject: boolean }[] = []
  studio.traverse((object) => {
    if (!(object instanceof Mesh)) return
    let monitor = false
    let player = false
    let subject = false
    for (let parent: Object3D | null = object; parent; parent = parent.parent) {
      monitor ||= parent.name === 'crt-monitor'
      player ||= parent.name === 'vhs-player'
      subject ||= parent.name.startsWith('tape-')
    }
    object.geometry.computeBoundingBox()
    parts.push({
      mesh: object,
      playback: monitor || player,
      subject: subject || monitor,
    })
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
    const narrow = width <= 600
    for (const { mesh, playback, subject } of parts) {
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
        // Phones prioritize the CRT and rack horizontally; every object still
        // contributes to headroom, including during orbit and cassette flight.
        if (!narrow || subject) browseX = Math.max(browseX, Math.abs(point.x))
        browseY = Math.max(browseY, Math.abs(point.y))
        if (playback) {
          monitorX = Math.max(monitorX, Math.abs(point.x))
          monitorY = Math.max(monitorY, Math.abs(point.y))
        }
      }
    }
    const padding = narrow ? 16 : 24
    // Blend the framing envelope as the camera turns toward playback. Fitting
    // only the destination lets the tilted CRT cross the top edge mid-flight.
    // Playback includes the complete player so its physical keys stay in view.
    return Math.min(
      (width - padding * 2) / (2 * MathUtils.lerp(browseX, monitorX, focus)),
      (height - padding * 2) / (2 * MathUtils.lerp(browseY, monitorY, focus)),
    )
  }
}
