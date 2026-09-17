import type { Project } from './types'

/** A typical silent reading speed for English prose, in words per minute. */
const WORDS_PER_MINUTE = 230

/**
 * Whole minutes it takes to read a tape's write-up: its title, tagline,
 * paragraphs, and captions. The tube's counter prints this. It is derived,
 * never typed in, so it stays true as the copy changes; the shortest tape
 * still reads as one minute.
 */
export function readingMinutes(tape: Project) {
  const words = [
    tape.title,
    tape.tagline,
    ...tape.description,
    ...tape.media.map((item) => item.caption ?? ''),
  ]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
