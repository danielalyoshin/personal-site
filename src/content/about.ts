import type { Project } from './types'

/**
 * The About tape — a special cassette on the shelf (decision recorded in
 * PLAN.md). Same shape as a project so the deck plays it identically.
 */
export const aboutTape: Project = {
  slug: 'about',
  title: 'About',
  tagline: 'Design engineer — working the seam between design and build.',
  description: [
    'I design interfaces and then build them, and I care about the part in the middle where most of the quality lives: the motion, the states, the details that only survive when one person owns both sides.',
    'This site is the first exhibit — a small 3D studio, with a shelf of tapes, a deck, and a CRT built from simple shapes and considered details. The project tapes around it are placeholders while the real selection is curated; the machine itself is the work for now.',
    'If you want to talk shop, the links are below.',
  ],
  year: 2026,
  tags: ['design', 'engineering', 'typescript', 'motion'],
  links: [
    { label: 'GitHub', url: 'https://github.com/danielalyoshin' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/danielalyoshin/' },
  ],
  media: [],
  vhs: {
    spineLabel: 'ABOUT',
    labelVariant: 'studio',
    accent: '#61e8c6',
    recorded: 'JUL 2026',
  },
}
