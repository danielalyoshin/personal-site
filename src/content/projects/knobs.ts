import type { Project } from '../types'
// The knobs logo, copied unchanged from the knobs repository's assets/: the
// lockup with light text, for dark grounds, and its dark-text twin for a
// light high-contrast theme. Their use here is the one TRADEMARKS.md there
// allows without asking: unmodified, to refer to knobs.
import lockup from './media/knobs-lockup-horizontal-light.svg'
import lockupOnLight from './media/knobs-lockup-horizontal-dark.svg'
// Rendered from the two .html sources beside them by `npm run render:diagrams`.
import diagram from './media/knobs-diagram.webp'
import narrowDiagram from './media/knobs-diagram-narrow.webp'

export const knobs: Project = {
  slug: 'knobs',
  title: 'knobs',
  caption: 'Your OBS mic chain, in every app',
  logo: { src: lockup, width: 1375, height: 304, onLight: lockupOnLight },
  tagline:
    'A Windows app I built that gives every app on your PC the mic sound you set up in OBS Studio.',
  description: [
    'Streamers and podcasters often shape their microphone’s sound in OBS Studio, the free streaming and recording app, with filters that cut background noise and keep their voice at an even level. Using that sound in a call or a game usually means keeping OBS open all day.',
    'knobs runs the same filters in the background instead, with OBS closed. It uses OBS’s own audio code and reads your settings from OBS, so your mic sounds exactly as it does there, bit for bit. Other apps hear it through a virtual audio cable, which they pick as their microphone.',
    'It starts with Windows, waits in the system tray and steps aside whenever OBS is open. knobs is an independent project, not affiliated with or endorsed by the OBS Project.',
  ],
  year: 2026,
  role: 'Creator',
  tags: ['c++', 'libobs', 'obs-studio', 'windows'],
  links: [
    { label: 'getknobs.app', url: 'https://getknobs.app' },
    { label: 'Source', url: 'https://github.com/danielalyoshin/knobs' },
  ],
  media: [
    {
      type: 'image',
      src: diagram,
      width: 2080,
      height: 1742,
      narrow: { src: narrowDiagram, width: 1170, height: 2730 },
      alt: 'System diagram of how knobs runs a microphone through OBS’s own audio code. Inside knobs, the loader keeps a private copy of OBS Studio, your own install, made once per OBS version, and loads libobs, OBS’s audio engine, from it with no video. OBS’s settings, your profile, are read and never written by the importer inside knobs, which rebuilds your mic in libobs with OBS’s own code. Inside libobs your mic’s audio passes from the mic input, as set in OBS, through your filters in order, to the output, OBS’s audio monitoring. The processed mic goes out to a virtual cable, which other apps use as their mic. knobs pauses while OBS runs. Solid lines are audio and dashed lines are code and settings. The loader and the importer are outlined in red as my code.',
      caption: 'How knobs runs your mic through OBS’s own audio code.',
    },
  ],
  vhs: {
    spineLabel: 'KNOBS',
    labelVariant: 'rental',
    accent: '#e5484d',
    recorded: 'OCT 2026',
  },
}
