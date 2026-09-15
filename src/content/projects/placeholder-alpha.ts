import type { Project } from '../types'
import testPattern from './media/test-pattern.svg'

export const placeholderAlpha: Project = {
  slug: 'placeholder-alpha',
  title: 'Placeholder: Alpha',
  tagline:
    'A placeholder in the archive. The real project selection is on its way.',
  description: [
    'This is placeholder copy. A real project writeup will land here — what the project is, why it exists, and what was interesting about building it.',
    'It runs a few paragraphs long on purpose, so the CRT reading experience is judged against realistic prose: line length, rhythm, scroll behavior, and how the on-screen display chrome frames a real read.',
  ],
  year: 2026,
  role: 'Design & build',
  tags: ['typescript', 'react'],
  links: [{ label: 'Repo', url: 'https://example.com/placeholder' }],
  media: [
    {
      type: 'image',
      src: testPattern,
      alt: 'SMPTE-style color bars standing in for project footage.',
      caption: 'PLACEHOLDER FOOTAGE — replaced with real media in Stage 8.',
    },
  ],
  vhs: {
    spineLabel: 'ALPHA',
    labelVariant: 'classic',
    accent: '#ff4554',
    runtime: 'SP 0:42',
    recorded: 'JAN 2026',
  },
}
