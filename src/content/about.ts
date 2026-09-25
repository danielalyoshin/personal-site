import { site } from './site'
import type { Project } from './types'

/**
 * The About tape — a special cassette on the shelf (decision recorded in
 * PLAN.md). Same shape as a project so the deck plays it identically.
 */
export const aboutTape: Project = {
  slug: 'about',
  title: 'About',
  caption: site.owner,
  tagline: 'Forward deployed engineer',
  description: [
    'I’m in my final year at the University of Toronto, in the Computer Science Specialist program with a focus on software engineering.',
    'My skills are split between software architecture and sales, so I’m as comfortable planning how a system fits together as I am talking a client through what it will do for them. I’ve worked across entertainment and health tech, and several of my projects are in active use.',
    'If you want to chat, the links are below.',
  ],
  year: 2026,
  tags: [],
  links: [
    { label: 'GitHub', url: 'https://github.com/danielalyoshin' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/danielalyoshin/' },
  ],
  media: [],
  vhs: {
    spineLabel: 'ABOUT',
    labelVariant: 'studio',
    accent: '#61e8c6',
    recorded: 'SEP 2026',
  },
}
