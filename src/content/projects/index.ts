import type { Project } from '../types'
import { aboutTape } from '../about'
import { placeholderAlpha } from './placeholder-alpha'
import { placeholderBeta } from './placeholder-beta'
import { placeholderGamma } from './placeholder-gamma'
import { placeholderDelta } from './placeholder-delta'
import { placeholderEpsilon } from './placeholder-epsilon'

/** Project tapes only, shelf order (leftmost first). */
export const projects: Project[] = [
  placeholderAlpha,
  placeholderBeta,
  placeholderGamma,
  placeholderDelta,
  placeholderEpsilon,
]

/** Everything standing on the shelf: projects plus the About tape (rightmost). */
export const shelfTapes: Project[] = [...projects, aboutTape]

export function findTape(slug: string | undefined): Project | undefined {
  return slug ? shelfTapes.find((t) => t.slug === slug) : undefined
}
