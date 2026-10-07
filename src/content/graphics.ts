/**
 * Why the studio is not drawn, when it is not: the browser gives the page no
 * WebGL, the renderer failed to start, or the graphics context was lost
 * during the visit. The page shows the studio's still instead and says
 * which in plain words, so a visitor knows what they are missing and what
 * brings it back. The title has already said it is a still, so each reason
 * starts at why and never says it again. Every statement here is true of
 * its case (The True Readout Rule). A no-break space (`\u00a0`) holds each
 * name together, "3D graphics (WebGL)" and "live studio", so no line of the
 * note starts with half of one.
 */
export type GraphicsFailure = 'unavailable' | 'failed' | 'lost'

export interface FlatNotice {
  /** The one line that says this is not the whole site. */
  title: string
  /** Why, and what brings the live studio back. */
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
      'This browser isn’t giving the page 3D\u00a0graphics\u00a0(WebGL). Turning on hardware acceleration, or another browser, can bring the live\u00a0studio back.',
    // A phone or tablet has no hardware acceleration to turn on.
    detailTouch:
      'This browser isn’t giving the page 3D\u00a0graphics\u00a0(WebGL). Another browser, or a computer, can bring the live\u00a0studio back.',
    reload: false,
  },
  failed: {
    title,
    detail:
      'The live\u00a0studio couldn’t start in this browser. Reloading the page may bring it back.',
    reload: true,
  },
  lost: {
    title,
    detail:
      'This browser stopped drawing the live\u00a0studio. Reloading the page can bring it back.',
    reload: true,
  },
}
