---
name: 'Daniel Alyoshin — Personal Site'
description: 'Midnight Studio — clean low-poly AV objects, matte graphite, and a single emitting CRT'
colors:
  ink-0: '#0e0f12'
  ink-1: '#16181d'
  ink-2: '#1d2026'
  ink-3: '#262a32'
  seam: '#2e323b'
  seam-lit: '#3a3f4a'
  silkscreen-hi: '#e9ebf1'
  silkscreen: '#b7bbc6'
  silkscreen-dim: '#868b99'
  vfd-cyan: '#61e8c6'
  crt-blue: '#1523d6'
  screen-black: '#07080c'
  screen-text: '#dfe6ff'
  screen-dim: '#98a3c9'
  screen-soft: '#aeb8dd'
  osd-white: '#ffffff'
  rec-red: '#ff3b30'
  phosphor: '#b4c4ff'
  studio-blue: '#242bd9'
typography:
  display:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: 'clamp(2.5rem, 1.25rem + 2.8vw, 4rem)'
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: '-0.035em'
  display-mobile:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: 'clamp(2rem, 1rem + 5.4vw, 3.375rem)'
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: '-0.035em'
  display-short:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: 'clamp(2.5rem, 1.5rem + 1.5vw, 3rem)'
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: '-0.035em'
  mark:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: '2.625rem'
    fontWeight: 600
    lineHeight: 1
    letterSpacing: '-0.02em'
  body:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: '0.005em'
  functional-title:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: '0.875rem'
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: 'normal'
  functional:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 'normal'
  caption:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: '0.75rem'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 'normal'
  control:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: '0.75rem'
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: '0.1em'
  label:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: '0.6875rem'
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: '0.12em'
  screen-title:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: 'clamp(1.5rem, 5.6cqi, 2rem)'
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: '-0.015em'
  screen-body:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: 'clamp(1rem, 3.1cqi, 1.0625rem)'
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: '0.005em'
  screen-tagline:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: 'clamp(1rem, 3.1cqi, 1.0625rem)'
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: '0.005em'
  full-height-title:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: 'clamp(1.5rem, 7.5cqi, 2rem)'
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: '-0.015em'
  full-height-body:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: 'clamp(1rem, 2.4cqi, 1.125rem)'
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: '0.005em'
  full-height-tagline:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: 'clamp(1rem, 2.4cqi, 1.125rem)'
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: '0.005em'
  osd:
    fontFamily: "'VT323', ui-monospace, 'Courier New', monospace"
    fontSize: 'clamp(1.125rem, 4.5cqi, 1.375rem)'
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 'normal'
  osd-meta:
    fontFamily: "'VT323', ui-monospace, 'Courier New', monospace"
    fontSize: 'clamp(1.0625rem, 4cqi, 1.25rem)'
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: '0.005em'
  osd-display:
    fontFamily: "'VT323', ui-monospace, 'Courier New', monospace"
    fontSize: 'clamp(1.5rem, 9cqi, 2.5rem)'
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: '0.06em'
rounded:
  hairline: '2px'
  control: '4px'
  archive: '3px'
  screen: '14px'
  expanded-reader: '18px'
  fallback-monitor: '24px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '16px'
  lg: '24px'
components:
  button-transport:
    backgroundColor: '{colors.ink-3}'
    textColor: '{colors.silkscreen-hi}'
    typography: '{typography.control}'
    rounded: '{rounded.archive}'
    padding: '10px 12px'
  button-transport-hover:
    backgroundColor: '{colors.seam}'
  nav-link:
    textColor: '{colors.silkscreen}'
    typography: '{typography.functional}'
    padding: '12px 0'
  nav-link-hover:
    textColor: '{colors.silkscreen-hi}'
  tape-link:
    backgroundColor: 'transparent'
    textColor: '{colors.silkscreen-hi}'
    typography: '{typography.functional-title}'
    rounded: '{rounded.archive}'
    padding: '16px 12px'
  tape-link-preview:
    backgroundColor: '{colors.ink-2}'
  tape-link-coming:
    backgroundColor: 'transparent'
    textColor: '{colors.silkscreen-dim}'
    typography: '{typography.functional-title}'
    rounded: '{rounded.archive}'
    padding: '16px 12px'
  link-osd:
    backgroundColor: 'transparent'
    textColor: '{colors.osd-white}'
    typography: '{typography.osd-meta}'
    rounded: '{rounded.hairline}'
    padding: '6px 14px'
    minWidth: '44px'
    minHeight: '44px'
  link-osd-hover:
    backgroundColor: '{colors.osd-white}'
    textColor: '{colors.screen-black}'
  tag-osd:
    textColor: '{colors.screen-soft}'
    typography: '{typography.osd-meta}'
  crt-reader:
    backgroundColor: '{colors.screen-black}'
    textColor: '{colors.screen-text}'
    rounded: '{rounded.screen}'
    padding: '4rem 9% 2.75rem'
  crt-reader-full-height:
    backgroundColor: '{colors.screen-black}'
    textColor: '{colors.screen-text}'
    typography: '{typography.full-height-body}'
    rounded: '{rounded.screen}'
    padding: '4rem 7% 2.5rem'
---

# Design System: Daniel Alyoshin — Personal Site

## Overview

**Creative North Star: "Midnight Studio — in three dimensions"**

A small, carefully arranged listening and viewing studio, built from real low-poly objects. Broad planes, single bevels, matte graphite, and restrained printed details make the equipment feel intentional and tactile. The execution is contemporary and crisp; VHS-era technology supplies the subject matter.

The CRT carries the light and screen typography. Quiet Archivo text and thin seams organize the surrounding interface. Neutral studio fill reveals the geometry without making the equipment glow. Daniel established this 3D direction on 2026-09-15, superseding the earlier SVG/CSS execution.

**Key Characteristics:**

- Matte graphite equipment, precise silhouettes, and small silkscreen labels.
- Saturated cassette accents and blue screen output against a quiet page.
- Real modeled depth with clean full-resolution rendering.
- Accessible HTML reading and immediate alternatives to motion.

This refresh records the implementation in `src/styles/tokens.css`,
`src/styles/global.css`, `src/components/Stage.module.css`,
`src/components/CRT.module.css`, `src/components/Icons.tsx`, and
`src/components/studio/`.
Tokens above are normative; the sections below explain their use. The
composition and surface mode remain in `.impeccable/surfaces/src-app-tsx.md`.

## Colors

Cool graphite and printed silkscreen neutrals frame a vivid CRT and colored tape labels.
Existing token names are retained; CSS uses `--silk-hi`, `--silk`, `--silk-dim`,
`--vfd`, and `--osd` for the corresponding silkscreen, VFD-cyan, and OSD-white entries.

### Primary

- **VFD Cyan** (`vfd-cyan`): crisp keyboard focus, text selection, and playback-state text. It is an interface accent, not an emitting display on the deck.

### Secondary

- **Studio Blue** (`studio-blue`): the modeled CRT's idle and loading texture; authored in `StudioScene.tsx`.
- **CRT Blue** (`crt-blue`): the HTML fallback's idle screen and idle bloom. Preserve this separate value when documenting either renderer.
- **Phosphor** (`phosphor`): the modeled screen's playback light and the matching CSS bloom hue.
- **REC Red** (`rec-red`): the recorded indicator inside project playback.
- **Cassette accents**: content-owned red, yellow, blue, orange, violet, and cyan in the current tape modules. These are label data, not additional global UI accents.

### Neutral

- **Graphite ground** (`ink-0`): the page and playback backdrop.
- **Graphite layers** (`ink-1`, `ink-2`, `ink-3`): transport strip, control surfaces, tape-preview surfaces, and hover states.
- **Machined seams** (`seam`, `seam-lit`): thin dividers, borders, and emphasized edges.
- **Silkscreen** (`silkscreen-hi`, `silkscreen`, `silkscreen-dim`): primary identity and controls, general chrome, and secondary labels respectively.
- **Screen neutrals** (`screen-black`, `screen-text`, `screen-dim`, `screen-soft`, `osd-white`): reading ground, prose, metadata, secondary screen text, and OSD actions.

Modeled graphite colors vary by material and plane to stay legible under studio
lighting. `studio/materials.ts` holds the shared shell, raised face, edge,
recess, rubber, hardware, and tabletop colors, plus the matte chassis finish.
The CRT, deck, speaker, rack, and headphones use these same material roles;
cassette molding, paper, driver cones, and soft pads retain their own finishes.
Do not replace these values with page-background tokens. Sidecar tonal ramps
are panel visualizations; synthesized steps are not additional application tokens.

**The Artifact Color Rule.** Saturated color belongs to cassette labels and screen output. Cassette accents come from project data; small VFD-cyan focus and status marks support interaction without coloring the page chrome.

## Typography

**Display Font:** Archivo Variable, Archivo, Arial, system-ui, sans-serif.
**Body Font:** the same Archivo stack.
**Label/Mono Font:** Archivo for hardware and chrome; VT323, ui-monospace,
Courier New, monospace for screen OSD only. Both fonts are bundled locally.
Arial is the first installed fallback: its regular-weight width is within 3%
of Archivo on the introductory copy. Explicit line heights stabilize vertical
metrics, and font-display swap keeps text visible. Unicode subsets load on demand;
the English surface requests one Archivo WOFF2 and one VT323 WOFF2.
Canvas textures paint immediately, then redraw after explicit Archivo and VT323
loading settles. Live maps request a render; disposed maps remain released.

**Character:** a compact, wide Archivo display leads into quiet functional
text. Three Archivo weights carry the whole site, page and models alike: 400
for reading and quiet actions, 600 for the display, titles, labels, and
controls, and 800 for the screen title and the cassette spines. VT323 renders
at its one weight, 400. The display keeps 110% stretch, -0.035em tracking, and
1.06 leading. Shared role sizes live in `src/styles/tokens.css`; every
functional HTML size is set in rem so text preferences scale it.

### Shell ramp

The shell renders six sizes and nothing between them; 11px is the floor.

- **Display** (`display`, `display-mobile`, `display-short`): the introductory line at weight 600, capped at 4rem normally, 3.375rem on phones, and 3rem on short desktop viewports; the mobile floor is 2rem. The secondary line uses dim silkscreen.
- **Mark** (`mark`): 2.625rem at weight 600 with -0.02em tracking, used only for the AV–01 identifier while the studio loads.
- **Body** (`body`): 1rem at weight 400. Introductory prose uses 1.6 leading and 0.005em tracking, capped at 36ch; the page baseline, skip link, and the native reader's loading line inherit 1rem at 1.5 leading.
- **Functional** (`functional-title`, `functional`): 0.875rem. The nameplate, selection guide, archive heading, and tape names are weight 600 with 1.35 leading; navigation links are weight 400 with 1.5 leading and rely on colour (silkscreen, high on hover) for their state.
- **Caption** (`caption`, `control`): 0.75rem. The role line, guide instruction, archive note, tape captions, footer statement, loading and fallback notes, and the Escape hint are weight 400 with 1.5 leading. The native deck keys and Skip animation are the control variant: uppercase, weight 600, 0.1em tracking, 1.2 leading.
- **Label** (`label`): 0.6875rem, weight 600, 0.12em tracking, uppercase, 1.2 leading, in dim silkscreen: the introductory kicker, the tape index numbers, the footer edition, and the native reader's AV–01 model mark. Nothing on the shell is set below this step.

### Tube ramp

Screen-interior type scales with the tube (The Tube-Scale Rule) in three roles:

- **Screen title** (`screen-title`, `full-height-title`): uppercase Archivo at weight 800, 110% stretch, 1.12 leading, and -0.015em tracking with balanced wrapping. Both modes floor at 1.5rem and cap at 2rem (5.6cqi on the modeled screen, 7.5cqi in the full-height reader). Keyboard focus adds a 3px OSD-white underline offset by 0.28em.
- **Screen body / tagline** (`screen-body`, `screen-tagline`, `full-height-body`, `full-height-tagline`): one centered column capped at 62ch aligns titles, prose, media, tags, and links in both reader modes; available tube width shortens that measure on phones. Prose is weight 400 with 1.65 leading, 0.005em tracking, and one-em paragraph spacing; the tagline is weight 600 with 1.5 leading. The modeled screen uses 1–1.0625rem (3.1cqi); full-height reading uses 1–1.125rem (2.4cqi). Long text wraps without horizontal scrolling.
- **OSD** (`osd`, `osd-meta`, `osd-display`): VT323 at weight 400. PLAY and the runtime use 1.125–1.375rem (4.5cqi) with 1.2 leading; metadata, captions, tags, links, and the REC line share 1.0625–1.25rem (4cqi) with 1.35 leading; NO SIGNAL and the idle message use 1.5–2.5rem (9cqi) with 0.06em tracking. VT323 is monospaced and no Archivo numerals align in columns, so no tabular-numeral feature is set anywhere.

**The Drawn Mark Rule.** Archivo has no arrows, so no arrow, play mark, or dot is ever typed; a typed one would come from whichever fallback font has it and mismatch its label's weight. Every interface mark is an inline SVG from `src/components/Icons.tsx`: play (the About link, each tape entry, the PLAY OSD), the outward arrow (contact and project links that leave the site), sound, skip, and eject. The arrows are 1.5-unit strokes on a 16-unit box, sized 1em beside text, 0.7em inside the OSD, and 12px on tape entries; the three deck marks are filled shapes on a 20-unit box at 18px, the speaker's waves and slash their only strokes, and the eject mark is also printed on the modeled EJECT cap ahead of its label at the capitals' height. Every mark takes `currentColor` and is `aria-hidden`, so the label alone carries the accessible name. The one exception in colour is the muted speaker's slash, printed in rec red on the key and in the deck's status window alike. The REC dot and the idle cursor are CSS boxes.

Desktop HTML is authored on a 560 × 420 screen and transformed with the camera; computed CSS sizes
therefore describe the screen plane before its visual transform. Canvas print
sizes are texture coordinates, not recommended HTML font sizes.

**The Silkscreen Rule.** Printed hardware text never glows. Its hierarchy comes from size appropriate to the object, weight, spacing, and contrast against the material.

**The Signature Print Rule.** The models carry four signature prints and nothing else: the deck's status window, the AV–01 model line, each cassette's spine number and name, and the idle screen. Each working key cap carries its own single label. No other object is lettered: no monitor chin, plinth line, holder number or cheek mark, speaker badge, stand mark, flap legend, or cassette underside. A new object earns geometry, not a nameplate. Every print texture matches its plane's proportions, and type that would overflow its plane is set smaller, never compressed, so glyphs never stretch. Prints share the page's weights: 600 for the status window, the AV–01 line, and the key caps; 800 for each spine's number and name. Prints are transparent decals in the chassis material (roughness 0.82, metalness 0.12, flat shading): only the ink renders, so a label never sits on a differently lit patch. Print canvases carry about 1280 texture pixels per world unit, and the studio renders at pixel ratio 2 during modeled playback so the prints resolve.

**The Tube-Scale Rule.** Screen-interior type scales with the tube using cqi units. At widths up to 767px or heights up to 699px, the full-height native reader preserves a 16px prose floor and independent scrolling; comprehension takes priority over the physical metaphor.

## Layout

The shell uses a centered container (maximum 1600px) with 5% horizontal padding,
increasing to 6% at widths of 600px and below. Fine seams divide the header,
archive, and footer. The shared spacing primitives use a 4px base; the shell
also has optical adjustments documented in its component CSS.

**The One Column Rule.** Every shell edge sits on the container's two edges:
the nameplate, kicker, display line, guide, archive heading, and footer
statement on the left; the navigation, introductory aside, archive note, and
contact links on the right. The cassette mark hangs 16px into the left gutter
above 1200px so the name stays on the column, and is not drawn below that
width. The only inboard edges are the tape index entries' own 12px insets.

The archive uses six equal columns, three at 1200px and below, and two at 600px
and below, with an 8px gap. Flex list items and full-width links keep each row's
entries equally tall when a narrow label wraps. The header has an 80px minimum height, becoming 72px on phones
and on viewports wider than 600px but no taller than 820px. The introduction
uses 32px top spacing, reduced to 20px on those short desktop viewports and
16px on phones. At 600px and below, the introduction stacks and the footer wraps.

The selection guide precedes the canvas, 24px below the introduction. It
pairs "Choose a tape to play" with a one-line instruction that points at the
studio rather than the index; the instruction hangs 4px beneath, and the
canvas follows it directly. Nothing shares the guide's row: there is no scene
metadata line, clock, drag hint, or reset above the canvas. The index follows the
canvas with a seam and 16px top padding. This groups the artifact with its
selection surfaces.

The footer sets the statement and the edition mark on the left and the
contact links flush right on the column, mirroring the header. At 600px and
below the statement takes the first row and the edition and links share the
second.

The exhibit's default height is
`clamp(360px, min(48vw, calc(100svh - 350px)), 680px)` so the opening studio
has room for readable screen text while adapting to short desktop viewports.
At 600px and below it uses `clamp(220px, 72vw, 384px)` and extends past the
shell gutters; at phone widths the equipment, not the height, sets the zoom,
so that height is snug to the fitted studio. The orthographic
camera provides a three-quarter browse view with constrained rotation and no
user-controlled pan or zoom. The desktop camera starts at `[5.8, 5.75, 12]`
looking at `[0, 1.9, 0]`; canvases up to 600px use `[3.8, 5.05, 12]`
looking at `[0.25, 2, 0]`. Camera zoom fits the equipment's projected geometry
with 24px margins. Canvases up to 600px use the shell's 6% gutter as the
margin and fit every piece of equipment horizontally, so no object is cropped
and the widest pieces land on the text column; only the table may run out of
the sides, as a real tabletop would. Every object still contributes to
headroom. The framing updates during insertion, resize, and eject, and is
computed for the studio's eased frame rather than the canvas, so it changes
smoothly as the frame grows out of the page box and shrinks back (The Soft
Zoom Rule, under Cassettes and insertion). Playback centers the CRT and player together at y = 2.64 and blends toward
their combined bounds as the camera turns, preserving the complete chassis
and clickable front panel throughout the zoom. Reduced motion applies the same fit immediately.
The view is authored, not orbited: there is no drag-to-look and no reset, so
on every device swipes scroll the page and pinch gestures zoom the browser as
they do anywhere else, and the canvas answers only clicks and taps on
cassettes.

Playback fills the viewport with the modeled CRT and VHS player; there is no
fixed transport footer. The canvas layer over the viewport is transparent;
the page chrome around the studio fades to the graphite ground and back
rather than being covered. The root keeps a stable scrollbar gutter, so
locking the page's scroll for playback never reflows the page under the
zoom. Above both 767px width and 699px height, the camera
faces the modeled screen and HTML occupies its 4:3 plane. At widths up to
767px **or** heights up to 699px, the native reader fills the available height
with its own scroll area. Its frame is inset 12px vertically and 10px
horizontally, respecting the bottom safe area. Sound and eject are built into
a 72px minimum-height deck panel within that frame; skip appears in the loading screen. The CRT's explicit `fullHeight` prop/class applies the stretched
layout and readable type independently of viewport CSS. The shell's 600px
breakpoint is separate from this reading decision.

Direct project links and selections made before graphics are ready immediately
open the full-height native reader at every viewport size. That reader stays
pinned only until the scene is ready. On a desktop viewport the modeled studio
then takes over in one dissolve (The Handoff Rule, under CRT reader); on narrow
or short viewports the same reader simply continues under the viewport rule,
and a later resize follows that rule. If graphics fail, the reader stays for
the visit with focus and scroll untouched. After ejecting, a selection from the
ready studio uses the modeled CRT at desktop sizes.

Without WebGL, browse mode uses a framed HTML monitor with a maximum width of
560px; selecting a tape opens the full-height reader. A context failure during
modeled playback opens the same full-height HTML reader with its own deck controls. Offstage regions,
including the canvas behind a native reader, become inert and aria-hidden.

## Elevation & Depth

Real geometry, material contrast, and cast shadows carry the exhibit's depth.
The HTML shell uses flat tonal surfaces and fine borders. The default modeled
solid uses flat shading, roughness 0.82, and metalness 0.12; soft headphone
surfaces use rougher materials. Neutral ambient, hemisphere, and directional
fill reveal the objects without making them emit.

### Shadow Vocabulary

- **Monitor support** (`--shadow-unit`): the active HTML fallback frame uses the existing ambient drop shadow.
- **Screen bloom** (`--bloom-rest`, `--bloom-play`, `--bloom-idle`): existing CSS screen states. The modeled CRT supplies its own local point light.
- **Native reader surround**: an opaque 20px spread in page-ground color masks the expanded reader's surroundings; it is not a glow.

The token file retains older recess, object, edge, and CSS-cast definitions.
The embedded reader hides the old chin and cast and removes bezel shadows;
every screen, embedded or fallback, shares the 14px screen radius. These
legacy definitions are not the current 3D material system. The sidecar
lists the shadows used by the active surfaces.

**The One Light Rule.** The CRT is the only emitting object. Neutral studio fill and shadow-casting directional illumination reveal the forms; a small screen-colored light falls onto the deck. Equipment labels, controls, and page chrome never glow.

## Shapes

Broad planes and single-segment bevels define modeled equipment. Every
circular part is a 24-sided revolved profile, discs and pivots included, and
every curved surface is flat-shaded. Speaker drivers
use those profiles for mounting rings, rubber surrounds, recessed
cones, and dust caps. The cabinet has an inset baffle, rear connection panel,
and isolating feet. Cassettes share one shell with cut-out reel windows,
24-sided winding rings, toothed hubs, a hinged-edge guard, underside sockets,
molded ribs, and a fine housing seam. Their labels remain matte printed surfaces.
The monitor's one dial, on the flat face of its chin, is a turned knob in a
recessed escutcheon with a raised ring, a molded pointer slot, and seven tick
marks over its sweep, built from the same 24-sided profiles and merged details
as the speaker and its fasteners; its top and side vents are shallow chamfered
plates with actual slots over a dark well, shared with the deck's side vents.
Each grille uses two draws regardless of its slot count. The bezel's step over
the rear shell is its parting line, the rear shell's floor is level with the bezel's bottom
as on a real set, and it stands on four identical low pads in the speaker's
style under the bezel's front corners and the shell's rear corners.
The deck's fascia is one tone, with a fine parting line set into the groove
where it meets the chassis, as on the cassette housing; its slot flap is a
door, a step darker than the fascia with a lighter finger lip, inside the
dark bay; the cover's side vents and fitted screws give its exposed planes
the same construction detail as the speaker. It stands on four corner pads
0.035 tall, the speaker's proportion.
The archive holder has symmetric sloped side cheeks, fitted fasteners, individual
guide channels, a rear stop, and a low retaining lip. Small repeated
details are merged into shared draws within each assembly. Recessed windows,
vents, the hollow deck bay, and a hinged slot flap supply selective detail.
Headphones use a padded elliptical band, oval earcups whose outer face is a
raised ring around a sunken core (the speaker's mount-and-cone layering in
the cup's own oval), a fine shell seam, and compact tapered mounts with slotted
pivots. Hard and padded curves share the 24-segment, flat-shaded construction.
The stand has a fitted cradle, a faceted post seated in a collar, two base
fasteners, and four low corner pads. The table is a slab on a recessed dark
pedestal over its plinth. Keep surfaces clean and matte.

**The Same Grammar Rule.** Every object is built from the one vocabulary the
strongest pieces established: a dark recess under a lighter raised plane, a
fine parting line where two housings meet, 24-sided turned parts, merged
ribs and slats for repeated detail, and fitted fasteners where the real
object shows them. Every piece of equipment stands on isolating pads in
one style, the speaker's: dark, low (about 0.035 units, the speaker's
proportion), and tucked under the corners, so from every authored camera
they read as a shadow line, not as parts; four under each of the deck, the
monitor, the speaker, the holder, and the headphone stand. The table alone
stands on its pedestal. A taller bare block under a chassis reads as an unfinished part,
and a recessed face that tall reads as a flat black bar from the front-on
playback camera; both were tried and rejected. A new
object earns its detail from this list, at the scale of the cassette's, not
from ornament of its own.

HTML control corners use the small radii above: hairline focus and OSD links,
slightly rounded playback buttons, and subtly rounded archive entries. The
embedded screen, native-reader frame, and fallback-monitor
frame each retain their larger documented radius. Borders are generally 1px;
keyboard focus uses a crisp 2px cyan outline with a 2px offset. The scrollable
article uses an inset 2px OSD-white outline, offset by -4px, when focused.

## Components

### Playback buttons

Tape controls belong to the player. The modeled front panel has a raised sound
key centered within the left fascia with clearance around its recess, and a wide
eject key beneath the playback status window. Decorative
REW/PLAY/FF/STOP keys are removed. The cassette opening, flap, and internal
clearances remain the transport's source of truth.

Each working key is a beveled mesh cap with one printed label (SOUND, EJECT)
in uppercase Archivo at weight 600 and 0.1em tracking; EJECT's label is led
by the drawn eject mark, set to the capitals' height and half an em before
them, as on the native key. The label is part of the cap, identical in browse
and playback, and travels with the press. During
playback an invisible native button sits over the cap, sized to it with a
44px floor; it carries the accessible name, the sound key's pressed state,
the eject key's Escape title, and the crisp cyan keyboard-focus outline, and
nothing else: no text, icon, or background. Hover/focus lightens the matte
material and pointer press depresses the cap. Keys become interactive only
after insertion ends; during insertion the only control is Skip animation.

The status window is the deck's readout, a two-field print in its dark
recess: transport state on the left (STANDBY, LOADING, a drawn play mark with
PLAY, EJECT while the tape returns, or NO SIGNAL) and the sound mark on the
right: the same speaker as the
native key, a filled body in the readout's light ink like its play mark, with
two stroked waves when sound is on and a red slash across it when off. Sound
state lives here, not on the key, and the mark carries no word. Nothing emits
light; the slash is printed ink, the deck's one colour print. The article
precedes the keys in native tab order.

Phones, short viewports, direct links, and graphics fallback put the same actions
inside the native reader's lower hardware panel. These controls have 44px
minimum targets, 0.75rem uppercase labels at weight 600, small corners, a darker bottom edge, and a pressed
state. The Escape hint inside Eject is the same size in silkscreen at weight
400, reading 7.5:1 on the key and 6.7:1 on hover. The fixed page-wide playback popup is removed in every reading mode.

Skip animation is a hardware key of the native deck family, available only
during insertion: the same uppercase control type, seam-lit border, darker
bottom edge, and press as the native reader's sound and eject keys, led by
the drawn skip mark. It sits at the viewport's lower right for modeled
playback and inside the native loading screen, with a 44px minimum target.
It is HTML, never a modeled key: the deck carries no physical skip, and its
printed model label stays visible.

### Sound toggle

The guide carries no tools: the view is authored, so there is no drag hint
and no reset, and there is no page-level sound control. The deck's SOUND key
is the single toggle, live on the modeled player during playback and in the
native reader's hardware panel otherwise. Its speaker SVG shows waves when
enabled and a red slash across the speaker when disabled; `aria-pressed`
carries the state. Sound is synthesized, default-off on every visit, never persisted, and
user-triggered: tick, insert, and eject. Because the toggle lives on the deck,
hover ticks stay silent until a visitor has switched sound on during playback.

### Navigation

Plain Archivo links with generous vertical padding and no underline. Hover
raises text contrast; keyboard focus retains the cyan outline. The header
carries "The archive" and About at every width; "The archive" is the page's
single visible route to the index, and neither link shows a count. Contact
links stay in the footer. Internal About and tape links use the drawn play mark; the
outward arrow is reserved for links that leave the site. Every mark is an
`aria-hidden` SVG (The Drawn Mark Rule) set 0.5em from its label by flex
gap, never by a typed space. The introduction
has no index shortcut. A focus-revealed skip link leads to the accessible archive.

### Tape index

A linked entry with a numbered label, explicit placeholder caption, play symbol,
and a thin accent strip supplied by its tape data. Each entry uses a seam border
and small corners; hover, focus, or modeled-tape preview fills it with ink-2 and
strengthens the border. The number sits above the name in the 11px label tier, as on a cassette
spine, so each entry has one text edge; the 12px play mark is centred on the
entry in its own column. Minimum height is 80px at every width, with a 12px
inset on every side and the accent strip inset to match. Names wrap as
needed; 12px secondary copy distinguishes "Placeholder" from the About
tape's "Meet the maker". The playable links are normal Tab stops, with
arrows and Home/End for direct movement between them; About is included in
its accessible name. The index heading carries no count; nothing on the
shell does.

**The Blank Slot Rule.** The rack has six slots: five for projects and the
About tape at the right. A project slot with nothing behind it yet keeps its
place and its number but is drawn as an outline, not a tape: the same 80px
cell and 12px inset, a 1px dashed seam-lit border, no accent strip, no play
mark, and dim silkscreen throughout, reading "Coming soon…" over the caption
"Blank tape". It is plain text, not a link: it answers no pointer, takes no
focus, and the arrow keys pass over it. Adding a project to the content list
turns the next blank slot into a playable tape and nothing else changes. A
blank slot has no route, so a link to one reads NO SIGNAL like any dead tape.

### Cassettes and insertion

The loose cassette, every playable tape, and every blank tape use the same
modeled shell, with the loose cassette uniformly scaled. A blank slot's tape
is that shell with nothing stuck on it, no spine print and no face label,
seated flat in its slot. Its slot target swallows the pointer, so it never
previews, lifts, or plays, and the printed tapes behind it in the
three-quarter view do not answer through it: the camera looks along the
rack, and a ray through an empty slot would run on into the next envelope
(The Blank Slot Rule, under Tape index). Modeled spine labels retain
classic, rental, and studio variants. High-resolution
local canvas textures carry the print; hovering a tape or focusing its link
lifts and previews the same cassette without changing its size or orientation.
The lift follows an arc that rises before it comes forward, and retreats
before it drops, so the shell's bottom edge clears the rack's retaining lip
both ways.
The pointer target is each cassette's resting envelope in its rack slot (the
0.43 pitch across, the shell's height and depth), an invisible fixed box that
does not lift with the shell: a target that moved would slide out from under
a resting pointer and flicker the preview, whereas fixed slots hand over
cleanly at their shared edge. Selection lifts clear of the rack, pulls
forward of the table, turns flat, aligns with the deck slot, and seats inside
the hollow bay. The flap closes before the camera moves to reading position.

**The Soft Zoom Rule.** Choosing a tape and ejecting it are one continuous
camera move each way; no frame ever shows the studio jump between its box
on the page and the viewport. The studio's box keeps its place in the page
throughout, so nothing beneath it moves and the scroll position is kept. On
selection the canvas layer detaches from the box over the whole viewport,
transparent, and is sized in the same commit, so the first frame it paints
is drawn for that box; the camera keeps drawing the studio exactly where the
box had it, then grows its frame to the viewport (exponential ease, rate 5
per second, about 0.9 seconds to settle) while the page chrome dissolves
over 560ms (`--t-dolly`, `--ease-out`). The tape's mechanism starts on the
next frame, so the studio grows as the cassette lifts. One render-driven
timeline coordinates the mechanism (nominally 2.4 seconds, with frame
deltas capped at 0.05 seconds, so slow rendering can lengthen it). The
camera turns onto the screen afterward, at rate 7 per second, never as a
fixed 560ms CSS dolly. A move that starts from rest begins with an ordinary
frame's step, never the idle gap since the last drawn frame. Skip finishes
immediately; reduced motion snaps tape, frame and camera state. Deep links
begin seated (The Handoff Rule).
Eject runs the same timeline back, nominally 1.8 seconds, an exit quicker
than the entrance: the flap opens, the tape leaves the bay, turns, and
settles into its slot along the path it came by, while the view pulls back
from the screen and the studio's frame shrinks into its box in one move at
the frame's rate, as the page chrome returns; the layer over the page is
pointer-transparent on the way back, so the archive answers the pointer at
once. Only once the frame has settled on the box does the canvas rejoin the
page, again without a visible change, and the tape finishes its return
there. The scene reads the transport phase from the page's own commit, not
from its props, which arrive a commit later, so no frame is drawn for the old
phase in the new box. Focus returns to the
corresponding archive link, but that return is not a preview, so the tape
stays seated until it is hovered or focused again; an eject during
insertion reverses from wherever the tape is; the deck reads EJECT
for the return; history back ejects the same way. Reduced motion and the
fallback reader return the tape at once. Selection and eject commit inside
the router's navigation transition, so the mechanism always starts from the
cassette's exact pose. There is no ambient geometry animation. The scene
loads lazily, renders on demand, caps pixel ratio at 1.75 in browse and 2 in
modeled playback, and disposes generated
textures and geometries.

### CRT reader

Selectable, scrollable HTML inside the modeled screen, with a complete native
reader when WebGL is missing, fails, or loses context. Prose uses screen-text;
metadata uses dim screen text. Playback OSD sits above the reader with a dark
fade behind it; its play mark is drawn at 0.7em with the OSD's own light, and
the REC dot closing the article is a blinking 0.5em circle. Project media spans the reading column, with a seam border and
small control corners. The article is a named Tab stop within the playback
focus loop, so keyboard users can return from transport controls and resume
scrolling. Initial focus still announces the title. Missing-tape and unknown-route
screens use distinct NO SIGNAL messages and matching transport labels, with
the same eject/Escape exit.

**The Handoff Rule.** A desktop deep link's native reader hands over to the
modeled screen once, when the scene is ready. The studio composes underneath
the still-opaque reader with the tape already seated, the flap closed, the deck
reading PLAY, and the keys live, until the modeled reader is mounted and placed
on the tube plus one drawn frame; then the native frame dissolves over 560ms
(`--t-dolly`, `--ease-out`) while the tube's tracking entrance plays through
it. The modeled article inherits the native reader's scroll depth and keeps
focus in the article if that is where it was, otherwise on the title. During
the dissolve the outgoing frame is aria-hidden and inert, then unmounts. An
invalid slug hands off the same way to the modeled NO SIGNAL screen. Reduced
motion swaps at the same moment. The dissolve stops early if playback closes,
the viewport drops below the reading breakpoints, or graphics are lost.

The modeled idle image is a local 1024 × 768 canvas texture with static scanlines.
Its lit area has the reader's corners, 26 texture pixels for the 14px screen
radius on the reader's 560px plane, over the black tube, so the screen keeps
one shape before and after a tape goes in.
Its main message uses 128px texture type; the two-line selection instruction
uses 88px so it remains legible at the opening camera scale. These are texture
coordinates, and scale with the physical screen rather than HTML font tokens.
HTML screen effects comprise faint stepped grain (0.8s), scanlines, a vignette,
one tracking entrance (400ms), and the REC blink (1.2s). The fallback idle cursor
blinks at 1.1s. Every effect stays clipped inside the tube. The global
reduced-motion gate collapses CSS animation and transitions; sidecar snippets
carry their own equivalent gate because shadow DOM does not inherit it.

### OSD links and tags

Screen links use VT323, a white 1px border, small corners, and the
`link-osd` padding; links that leave the site end in the drawn outward arrow
at 0.7em, spaced 0.4em. Inline flex alignment and 44px minimum width and height
provide separate touch targets. Hover inverts to white with dark text; focus
stays white. Playback links preserve native modified-click behavior.
Tags are bracketed uppercase text in screen-soft, wrapping with the existing
small/medium gaps. They are informational labels, not filled chips or filters.

## Do's and Don'ts

### Do:

- Do model broad planes, single bevels, recessed openings, and deliberately faceted circular parts.
- Do keep every retro effect inside the CRT screen area; its controlled light cast is the only outward glow.
- Do preserve keyboard access, visible focus, readable HTML, and a complete reader when WebGL is unavailable.
- Do hand a desktop deep link to the modeled studio in one dissolve once the scene is ready; the studio is never hidden behind a native reader while graphics are available.
- Do respect prefers-reduced-motion in CSS, camera movement, tape movement, and design-panel examples.
- Do keep placeholder projects explicitly labeled until Daniel supplies real content.
- Do leave an unfilled project slot legible as a blank tape and an outlined "Coming soon…" entry, never as an invented project.

### Don't:

- Don't add grunge, sepia, dirt, wear, photographic textures, or degraded page chrome.
- Don't pixelate the rendered canvas or use realism as the low-poly reference.
- Don't use VT323 for page chrome, printed hardware labels, or prose.
- Don't type an arrow, play mark, or dot; draw it (The Drawn Mark Rule).
- Don't add a weight beyond 400, 600, and 800, a seventh shell size, or any size below 11px.
- Don't introduce glowing controls, neon outlines with blur, or saturated chassis surfaces.
- Don't letter the models beyond the signature prints, and don't add metadata, clocks, counts, or edition marks to the shell.
- Don't substitute the old CSS dolly, deck VFD clock, or pulsing eject sample for the current 3D behavior.
