/*
 * The studio's renderer learns its box from a resize observer, and React
 * Three Fiber applies that measurement again on every render of its canvas.
 * The page moves the canvas between its box and the viewport and sizes the
 * renderer in the same commit, so the measurement has to arrive in that
 * commit too: left to report on its own, a frame or more later, it is stale
 * in between, and any render then (a tape hovered as the studio lands back
 * on the page) puts the old box back for a frame or two.
 */

const reports = new Set<() => void>()

/**
 * The renderer's resize observer: an ordinary one, which the page can also
 * ask for a report at once. Wraps rather than extends the browser's class,
 * so the page's module loads where there is none (pages drawn ahead of time).
 */
export class RendererBoxObserver implements ResizeObserver {
  private observer: ResizeObserver
  private report: () => void

  constructor(callback: ResizeObserverCallback) {
    this.observer = new ResizeObserver(callback)
    this.report = () => callback([], this)
    reports.add(this.report)
  }

  observe(target: Element, options?: ResizeObserverOptions) {
    this.observer.observe(target, options)
  }

  unobserve(target: Element) {
    this.observer.unobserve(target)
  }

  disconnect() {
    reports.delete(this.report)
    this.observer.disconnect()
  }
}

/** Measure the renderer's box now, in the commit that changed it. */
export function measureRendererBox() {
  for (const report of reports) report()
}
