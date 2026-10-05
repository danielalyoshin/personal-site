/**
 * Why the studio is not drawn, when it is not: the browser gives the page no
 * WebGL, the renderer failed to start, or the graphics context was lost
 * during the visit. The page shows the studio's still instead and says
 * which in plain words, so a visitor knows what they are missing and what
 * brings it back. Every statement here is true of its case (The True
 * Readout Rule).
 */
export type GraphicsFailure = 'unavailable' | 'failed' | 'lost'

export interface FlatNotice {
  /** The one line that says this is not the whole site. */
  title: string
  /** Why, and what brings the studio back. */
  detail: string
  /** The same, where the advice differs on a phone or tablet. */
  detailTouch?: string
  /** A reload can bring the studio back. */
  reload: boolean
}

const title = 'You’re seeing a still of the studio.'

export const flatNotice: Record<GraphicsFailure, FlatNotice> = {
  unavailable: {
    title,
    detail:
      'The full site is a live 3D studio, and this browser isn’t giving it 3D graphics (WebGL). Turning on hardware acceleration, or opening the site in another browser, can bring it back.',
    // A phone or tablet has no hardware acceleration to turn on.
    detailTouch:
      'The full site is a live 3D studio, and this browser isn’t giving it 3D graphics (WebGL). Opening the site in another browser, or on a computer, can bring it back.',
    reload: false,
  },
  failed: {
    title,
    detail:
      'The full site is a live 3D studio, and it couldn’t start in this browser. Reloading the page may bring it back.',
    reload: true,
  },
  lost: {
    title,
    detail:
      'The full site is a live 3D studio, and this browser stopped drawing it. Reloading the page can bring it back.',
    reload: true,
  },
}
