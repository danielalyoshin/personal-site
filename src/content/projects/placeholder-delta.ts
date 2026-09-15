import type { Project } from '../types'
import testPattern from './media/test-pattern.svg'

export const placeholderDelta: Project = {
  slug: 'placeholder-delta',
  title: 'Placeholder: Delta',
  tagline:
    'A placeholder in the archive. The real project selection is on its way.',
  description: [
    'Placeholder copy for a mid-weight writeup: two paragraphs and a couple of stills. A real project story will take its place.',
    'Its job on the shelf is variety — a different accent, a different label style, a different year — so the rack never reads as five copies of one tape.',
  ],
  year: 2023,
  role: 'Design engineering',
  tags: ['motion', 'css'],
  links: [{ label: 'Writeup', url: 'https://example.com/placeholder' }],
  media: [
    {
      type: 'image',
      src: testPattern,
      alt: 'SMPTE-style color bars standing in for project footage.',
      caption: 'PLACEHOLDER FOOTAGE — replaced with real media in Stage 8.',
    },
    {
      type: 'image',
      src: testPattern,
      alt: 'A second placeholder test pattern, standing in for a gallery.',
      caption: 'SECOND ANGLE — galleries hold up to six items.',
    },
  ],
  vhs: {
    spineLabel: 'DELTA',
    labelVariant: 'classic',
    accent: '#ff7a1a',
    runtime: 'SP 1:05',
    recorded: 'OCT 2023',
  },
}
