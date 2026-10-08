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
  /** Where the drawn studio begins: its leftmost point, the table's left corner. */
  left: number
  /**
   * The top of what is drawn, a tape lifted included, in equal bands from
   * the still's left edge to its right: the outline the words beside the
   * studio keep clear of.
   */
  skyline: number[]
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
    left: 0.0437,
    skyline: [
      1, 1, 1, 1, 0.7604, 0.7503, 0.7395, 0.6795, 0.6694, 0.6592, 0.6485,
      0.6378, 0.6276, 0.6169, 0.6068, 0.596, 0.5859, 0.3773, 0.3621, 0.3596,
      0.3609, 0.3628, 0.364, 0.0878, 0.0809, 0.0815, 0.084, 0.0752, 0.0644,
      0.0543, 0.0493, 0.0505, 0.0524, 0.0549, 0.0575, 0.06, 0.0625, 0.0651,
      0.0676, 0.0701, 0.072, 0.0745, 0.0771, 0.0796, 0.0821, 0.0847, 0.0865,
      0.0891, 0.0916, 0.0941, 0.0967, 0.0992, 0.1017, 0.1042, 0.1061, 0.3957,
      0.3906, 0.3919, 0.3944, 0.4115, 0.414, 0.4165, 0.4184, 0.4209, 0.4247,
      0.426, 0.4285, 0.4329, 0.4336, 0.4361, 0.4405, 0.4399, 0.4304, 0.431,
      0.4336, 0.4361, 0.4525, 0.4576, 0.4197, 0.4064, 0.4001, 0.3969, 0.3969,
      0.4001, 0.4102, 0.4285, 0.4614, 0.6864, 0.6883, 0.7326, 0.7351, 0.737,
      0.7395, 0.742, 0.7446, 0.7471, 0.7623, 0.7661, 0.7718, 1,
    ],
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
    left: 0,
    skyline: [
      0.7722, 0.7603, 0.7473, 0.6998, 0.688, 0.6749, 0.6619, 0.65, 0.6381,
      0.6251, 0.4365, 0.4151, 0.4128, 0.4139, 0.4139, 0.4151, 0.4151, 0.4163,
      0.4163, 0.1399, 0.1411, 0.1423, 0.1304, 0.1186, 0.115, 0.115, 0.1162,
      0.1174, 0.1186, 0.1198, 0.1209, 0.1221, 0.1233, 0.1245, 0.1257, 0.1269,
      0.1281, 0.1293, 0.1293, 0.1304, 0.1316, 0.1328, 0.134, 0.1352, 0.1364,
      0.1376, 0.1387, 0.1399, 0.1411, 0.1423, 0.1435, 0.1435, 0.4317, 0.4187,
      0.4068, 0.4009, 0.4021, 0.4033, 0.4045, 0.4223, 0.4234, 0.4246, 0.4258,
      0.4282, 0.4282, 0.4294, 0.4306, 0.4317, 0.4317, 0.4329, 0.4341, 0.4365,
      0.4365, 0.4246, 0.4223, 0.4223, 0.4234, 0.4294, 0.4223, 0.4056, 0.3973,
      0.3914, 0.389, 0.389, 0.3914, 0.3985, 0.4092, 0.4282, 0.4638, 0.6595,
      0.7093, 0.7105, 0.7117, 0.7129, 0.7141, 0.7153, 0.7307, 0.733, 0.7354,
      0.7402,
    ],
    muted: { left: 0.4545, top: 0.6085, width: 0.0159, height: 0.0285 },
  },
}
