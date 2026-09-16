import type { ComingTape, Project, ShelfTape } from '../types'
import { isComing } from '../types'
import { aboutTape } from '../about'
import { placeholderAlpha } from './placeholder-alpha'
import { placeholderBeta } from './placeholder-beta'
import { placeholderGamma } from './placeholder-gamma'

/** The rack holds this many tapes: the project slots, then About at the right. */
export const SHELF_SLOTS = 6

/** Project tapes only, shelf order (leftmost first); at most SHELF_SLOTS - 1. */
export const projects: Project[] = [
  placeholderAlpha,
  placeholderBeta,
  placeholderGamma,
]

if (projects.length > SHELF_SLOTS - 1)
  throw new Error(
    `The rack holds ${SHELF_SLOTS - 1} project tapes; ${projects.length} are listed.`,
  )

/**
 * Everything standing on the shelf, in slot order: the projects, a blank tape
 * in every project slot not yet filled, and the About tape (rightmost). Adding
 * a project to `projects` turns the next blank slot into a playable tape.
 */
export const shelfTapes: ShelfTape[] = [
  ...projects,
  ...Array.from(
    { length: SHELF_SLOTS - 1 - projects.length },
    (_, i): ComingTape => ({ id: `coming-${i + 1}`, coming: true }),
  ),
  aboutTape,
]

/** The tapes that play, in shelf order: every entry with a route. */
export const playableTapes: Project[] = shelfTapes.filter(
  (tape): tape is Project => !isComing(tape),
)

export function findTape(slug: string | undefined): Project | undefined {
  return slug ? playableTapes.find((t) => t.slug === slug) : undefined
}
