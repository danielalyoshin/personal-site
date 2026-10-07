// Written by scripts/render-flat-studio.mjs (npm run render:flat). Do not
// edit: re-render after the models, materials, lighting, tube screens, or
// tapes change.

/**
 * One framing of the studio's stills, in public/flat-studio/. Positions are
 * shares of the still's width and height.
 */
export interface StudioStill {
  /** The still's size in CSS px at its first width. */
  width: number
  height: number
  /** The share of its width the live fit framed, centred. */
  fitted: number
  /** The widths each still is offered at. */
  widths: number[]
  /** The tapes with a still of their own, lifted in preview. */
  previews: string[]
  /** Each rack slot's pointer target, in slot order: a tape's slug, or a blank slot's id. */
  slots: {
    id: string
    /** The target's outline, in order around it. */
    outline: [number, number][]
    /** Its bounding rectangle: left, top, right, bottom. */
    rect: [number, number, number, number]
    /** Its distance from the camera: a nearer target takes the pointer first. */
    depth: number
  }[]
  /** What stands under the words beside the studio, a tape lifted included. */
  obstacles: { left: number; top: number; right: number }[]
  /** Where the drawn studio ends: its lowest point, the table's front corner. */
  foot: number
  /** The deck's status window, drawn again with sound off. */
  muted: { left: number; top: number; width: number; height: number }
}

export const studioStills: Record<'desk' | 'phone', StudioStill> = {
  desk: {
    width: 1440,
    height: 791,
    fitted: 1,
    widths: [1440, 2880],
    previews: ['superset-d1', 'about'],
    slots: [
      {
        id: 'superset-d1',
        outline: [
          [0.5333, 0.4495],
          [0.5735, 0.4075],
          [0.6064, 0.4155],
          [0.6064, 0.6646],
          [0.5661, 0.7067],
          [0.5333, 0.6987],
        ],
        rect: [0.5333, 0.4075, 0.6064, 0.7067],
        depth: 13.2419,
      },
      {
        id: 'coming-1',
        outline: [
          [0.5661, 0.4575],
          [0.6064, 0.4155],
          [0.6392, 0.4235],
          [0.6392, 0.6727],
          [0.599, 0.7147],
          [0.5661, 0.7067],
        ],
        rect: [0.5661, 0.4155, 0.6392, 0.7147],
        depth: 13.0621,
      },
      {
        id: 'coming-2',
        outline: [
          [0.599, 0.4655],
          [0.6392, 0.4235],
          [0.672, 0.4315],
          [0.672, 0.6807],
          [0.6318, 0.7227],
          [0.599, 0.7147],
        ],
        rect: [0.599, 0.4235, 0.672, 0.7227],
        depth: 12.8823,
      },
      {
        id: 'coming-3',
        outline: [
          [0.6318, 0.4736],
          [0.672, 0.4315],
          [0.7048, 0.4395],
          [0.7048, 0.6887],
          [0.6646, 0.7307],
          [0.6318, 0.7227],
        ],
        rect: [0.6318, 0.4315, 0.7048, 0.7307],
        depth: 12.7025,
      },
      {
        id: 'coming-4',
        outline: [
          [0.6646, 0.4816],
          [0.7048, 0.4395],
          [0.7377, 0.4475],
          [0.7377, 0.6967],
          [0.6975, 0.7387],
          [0.6646, 0.7307],
        ],
        rect: [0.6646, 0.4395, 0.7377, 0.7387],
        depth: 12.5228,
      },
      {
        id: 'about',
        outline: [
          [0.6975, 0.4896],
          [0.7377, 0.4475],
          [0.7705, 0.4556],
          [0.7705, 0.7047],
          [0.7303, 0.7468],
          [0.6975, 0.7387],
        ],
        rect: [0.6975, 0.4475, 0.7705, 0.7468],
        depth: 12.343,
      },
    ],
    obstacles: [
      { left: 0.5228, top: 0.3905, right: 0.7681 },
      { left: 0.7713, top: 0.381, right: 0.8722 },
    ],
    foot: 0.969,
    muted: { left: 0.4597, top: 0.6169, width: 0.009, height: 0.0202 },
  },
  phone: {
    width: 440,
    height: 281,
    fitted: 0.8864,
    widths: [440, 880, 1320],
    previews: ['superset-d1', 'about'],
    slots: [
      {
        id: 'superset-d1',
        outline: [
          [0.5298, 0.4546],
          [0.558, 0.4193],
          [0.5957, 0.4234],
          [0.5957, 0.6566],
          [0.5675, 0.692],
          [0.5298, 0.6879],
        ],
        rect: [0.5298, 0.4193, 0.5957, 0.692],
        depth: 12.4654,
      },
      {
        id: 'coming-1',
        outline: [
          [0.5675, 0.4588],
          [0.5957, 0.4234],
          [0.6333, 0.4275],
          [0.6333, 0.6607],
          [0.6051, 0.6961],
          [0.5675, 0.692],
        ],
        rect: [0.5675, 0.4234, 0.6333, 0.6961],
        depth: 12.3468,
      },
      {
        id: 'coming-2',
        outline: [
          [0.6051, 0.4629],
          [0.6333, 0.4275],
          [0.6709, 0.4317],
          [0.6709, 0.6649],
          [0.6427, 0.7002],
          [0.6051, 0.6961],
        ],
        rect: [0.6051, 0.4275, 0.6709, 0.7002],
        depth: 12.2283,
      },
      {
        id: 'coming-3',
        outline: [
          [0.6427, 0.467],
          [0.6709, 0.4317],
          [0.7085, 0.4358],
          [0.7085, 0.669],
          [0.6803, 0.7044],
          [0.6427, 0.7002],
        ],
        rect: [0.6427, 0.4317, 0.7085, 0.7044],
        depth: 12.1098,
      },
      {
        id: 'coming-4',
        outline: [
          [0.6803, 0.4712],
          [0.7085, 0.4358],
          [0.7462, 0.4399],
          [0.7462, 0.6731],
          [0.718, 0.7085],
          [0.6803, 0.7044],
        ],
        rect: [0.6803, 0.4358, 0.7462, 0.7085],
        depth: 11.9913,
      },
      {
        id: 'about',
        outline: [
          [0.718, 0.4753],
          [0.7462, 0.4399],
          [0.7838, 0.444],
          [0.7838, 0.6773],
          [0.7556, 0.7126],
          [0.718, 0.7085],
        ],
        rect: [0.718, 0.4399, 0.7838, 0.7126],
        depth: 11.8728,
      },
    ],
    obstacles: [
      { left: 0.5239, top: 0.4016, right: 0.7812 },
      { left: 0.7739, top: 0.3794, right: 0.8885 },
    ],
    foot: 0.9039,
    muted: { left: 0.4545, top: 0.6085, width: 0.0159, height: 0.0285 },
  },
}
