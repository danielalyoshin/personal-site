/** How a cassette's spine label is drawn. See DESIGN.md → Components → Cassette. */
export type LabelVariant = 'classic' | 'rental' | 'studio'

export interface ProjectLink {
  label: string
  url: string
}

export interface ProjectMedia {
  type: 'image' | 'video'
  src: string
  alt: string
  caption?: string
}

/** VHS presentation fields — how the project appears as a physical tape. */
export interface VhsPresentation {
  /**
   * The tape's short name, as printed on its spine. The archive, the guide, the
   * idle tube, and both loading screens name the tape with this same text.
   */
  spineLabel: string
  labelVariant: LabelVariant
  /** Saturated label accent; the shelf's color story comes from these. */
  accent: string
  /** When the work was made, as the tape's closing REC line: "JAN 2026". */
  recorded: string
}

export interface Project {
  slug: string
  title: string
  tagline: string
  /** Paragraphs, rendered on the CRT. */
  description: string[]
  year: number
  role?: string
  tags: string[]
  links: ProjectLink[]
  media: ProjectMedia[]
  vhs: VhsPresentation
}

/**
 * A shelf slot with no project behind it yet. It holds a blank tape: nothing
 * to play, nothing printed, and no route. The archive reads it as "Coming soon…".
 */
export interface ComingTape {
  /** Stable key for the slot; never a route. */
  id: string
  coming: true
}

/** Anything standing in the rack: a playable tape or a blank one. */
export type ShelfTape = Project | ComingTape

export function isComing(tape: ShelfTape): tape is ComingTape {
  return 'coming' in tape
}

/** A stable React key for a shelf position. */
export function shelfKey(tape: ShelfTape) {
  return isComing(tape) ? tape.id : tape.slug
}
