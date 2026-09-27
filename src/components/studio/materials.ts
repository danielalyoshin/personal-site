/** Shared equipment finishes; cassette ink and CRT output keep their own color. */
export const STUDIO = {
  shell: '#35404b',
  face: '#46515d',
  edge: '#596675',
  recess: '#151d27',
  rubber: '#141d27',
  hardware: '#7d8996',
  /** Hardware under the pointer: the lighter matte a hovered key cap takes. */
  hardwareLit: '#98a3af',
  tabletop: '#59636f',
} as const

export const MATTE = {
  roughness: 0.82,
  metalness: 0.12,
  flatShading: true,
} as const
