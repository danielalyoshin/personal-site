import type { Project } from '../types'

// Deliberately long title and tag list so every stage exercises overflow.
export const placeholderBeta: Project = {
  slug: 'placeholder-beta',
  title: 'Placeholder: Beta, a Project With a Much Longer Working Title',
  tagline:
    'A placeholder in the archive. The real project selection is on its way.',
  description: [
    'This is placeholder copy testing the long end of every range: the title above is deliberately unwieldy, the tag list below is at maximum, and this paragraph runs on longer than the others to check how the screen handles a dense read.',
    'Nothing described here is a real project. This tape will be replaced or removed as the archive takes shape.',
    'A third paragraph pads the scroll so the on-screen display is tested with content that genuinely overflows the tube.',
  ],
  year: 2024,
  role: 'Everything, allegedly',
  tags: ['typescript', 'webgl', 'svg', 'animation', 'audio'],
  links: [
    { label: 'Repo', url: 'https://example.com/placeholder' },
    { label: 'Live', url: 'https://example.com/placeholder-live' },
  ],
  media: [],
  vhs: {
    spineLabel: 'BETA',
    labelVariant: 'rental',
    accent: '#ffc21a',
    recorded: 'AUG 2024',
  },
}
