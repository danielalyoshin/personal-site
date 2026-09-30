---
name: 'Daniel Alyoshin — Personal Site'
description: 'Midnight Studio — clean low-poly AV objects, matte graphite, and a single emitting CRT'
colors:
  ink-0: '#0e0f12'
  ink-2: '#1d2026'
  ink-3: '#262a32'
  seam: '#2e323b'
  seam-lit: '#3a3f4a'
  silkscreen-hi: '#e9ebf1'
  silkscreen: '#b7bbc6'
  silkscreen-dim: '#868b99'
  vfd-cyan: '#61e8c6'
  crt-blue: '#242bd9'
  screen-black: '#07080c'
  screen-text: '#dfe6ff'
  screen-dim: '#98a3c9'
  screen-soft: '#aeb8dd'
  osd-white: '#ffffff'
  rec-red: '#ff3b30'
  screen-scroll: '#5c6683'
  phosphor: '#b4c4ff'
  tube-ink: '#f0f0ff'
  tube-ink-soft: '#c4ccff'
  tube-ink-dim: '#bfc9ff'
  tube-line: '#818cfc'
typography:
  display:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: 'clamp(2rem, min(1.25rem + 2.8vw, 4.6vw), 4rem)'
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: '-0.035em'
  display-mobile:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: 'clamp(2rem, 1rem + min(5.4vw, 5.4svh), 3.375rem)'
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: '-0.035em'
  display-short:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: 'clamp(2rem, 1.5rem + 1.5vw, 3rem)'
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: '-0.035em'
  display-sideways:
    fontFamily: "'Archivo Variable', Archivo, Arial, system-ui, sans-serif"
    fontSize: 'clamp(2rem, 1rem + 4svh, 2.75rem)'
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
    lineHeight: 1.5
    letterSpacing: 'normal'
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
    letterSpacing: 'normal'
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
    padding: '12px'
  tape-link-preview:
    backgroundColor: '{colors.ink-2}'
  tape-link-coming:
    backgroundColor: 'transparent'
    textColor: '{colors.silkscreen-dim}'
    typography: '{typography.functional-title}'
    rounded: '{rounded.archive}'
    padding: '12px'
  link-osd:
    backgroundColor: 'transparent'
    textColor: '{colors.osd-white}'
    typography: '{typography.osd-meta}'
    rounded: '{rounded.hairline}'
    padding: '6px 14px'
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
    padding: '4rem 9% 4.75rem'
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

**The Source of Truth Rule.** The frontmatter above is the design system.
`src/styles/tokens.css` implements it under the same names (`--<colour>`,
`--r-<radius>`, `--sp-<step>`, and `--type-<role>` for a typography role's
size, where roles that share a size share its token), the stylesheets set
every shared value from those tokens, and `.impeccable/design.json` is
generated from this file. `e2e/design.spec.ts` holds them together: it fails
when this file and `tokens.css` disagree, when a token is defined that
nothing uses, when a typography role or component renders differently from
what the frontmatter says, and when the sidecar no longer matches this
file. A change starts here, then `tokens.css`,
then the sidecar. The sections below explain how each value is used and
never restate one differently. The composition and surface mode remain in
`.impeccable/surfaces/src-app-tsx.md`.

## Colors

Cool graphite and printed silkscreen neutrals frame a vivid CRT and colored tape labels.

### Primary

- **VFD Cyan** (`vfd-cyan`): crisp keyboard focus, text selection, and playback-state text. It is an interface accent, not an emitting display on the deck.

### Secondary

- **CRT Blue** (`crt-blue`): the idle tube in both renderers: the modeled CRT's idle, loading, and returning texture, and the HTML fallback's idle screen and bloom. One value; the fallback once carried a second, slightly different blue.
- **Tube inks** (`tube-ink`, `tube-ink-soft`, `tube-ink-dim`, `tube-line`): the idle tube's headline, sub-lines, corners, and drawn cassette outline, on CRT blue.
- **Phosphor** (`phosphor`): a lit tube's light: the CSS play and rest blooms, and the modeled point light during playback.
- **REC Red** (`rec-red`): the recorded indicator inside project playback.
- **Cassette accents**: each tape module owns its label accent (`vhs.accent`). They are label data, not additional global UI accents, and not tokens.

### Neutral

- **Graphite ground** (`ink-0`): the page and playback backdrop.
- **Graphite layers** (`ink-2`, `ink-3`): `ink-2` is the raised surface (the native reader's frame, the fallback monitor, a previewed archive entry); `ink-3` is the deck keys.
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

**The One Palette Rule.** The screen's colours have one source,
`src/styles/tokens.css`. The models read it as they paint (`studio/tokens.ts`:
the tube's ground and blue, its inks, the playback light, the status window's
red slash), and every bloom is its hue at a strength (`color-mix`),
so a colour changed there changes in both renderers and in every glow. The
one scene-only value is the blue tube's light, brighter than CRT blue because
a light is multiplied by the matte surface it lands on.

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

- **Display** (`display`, `display-short`, `display-mobile`, `display-sideways`): the introductory line at weight 600, one role per look, each floored at 2rem. Beside the studio it is capped at 4rem and never wider than 4.6vw; on windows no taller than 820px, at 3rem, and never taller than the corner above the lifted tape; in the mobile look, at 3.375rem, where the shorter side of the screen sets its size so a small phone on its side gives more of its first screen to the studio; and beside the studio on a phone on its side, at 2.75rem, set by the screen's height. The corner is layout, not type, so the stage applies it to the token (The Studio First Rule), as it raises the floor beside a narrow studio: 2.25rem at 768–939px wide, and 2.0625rem when such a window is also under 600px tall. The secondary line uses dim silkscreen.
- **Mark** (`mark`): 2.625rem at weight 600 with -0.02em tracking, used only for the AV–01 identifier while the studio loads.
- **Body** (`body`): 1rem at weight 400. The page baseline and skip link inherit 1rem at 1.5 leading.
- **Functional** (`functional-title`, `functional`): 0.875rem. The nameplate, selection guide, archive heading, and tape names are weight 600 with 1.35 leading; navigation links are weight 400 with 1.5 leading and rely on colour (silkscreen, high on hover) for their state.
- **Caption** (`caption`, `control`): 0.75rem. The role line, guide instruction, archive note, tape captions, footer statement, the loading note, and the Escape hint are weight 400 with 1.5 leading. The native deck keys and Skip animation are the control variant: uppercase, weight 600, 0.1em tracking, 1.2 leading.
- **Label** (`label`): 0.6875rem, weight 600, 0.12em tracking, uppercase, 1.2 leading, in dim silkscreen: the introductory kicker, the archive entries' numbers, the footer edition, and the native reader's AV–01 model mark. Nothing on the shell is set below this step.

### Tube ramp

Screen-interior type scales with the tube (The Tube-Scale Rule) in three roles:

- **Screen title** (`screen-title`, `full-height-title`): uppercase Archivo at weight 800, 110% stretch, 1.12 leading, and -0.015em tracking with balanced wrapping. Both modes floor at 1.5rem and cap at 2rem (5.6cqi on the modeled screen, 7.5cqi in the full-height reader). Focus lands on the title by script and draws no ring; for a tape chosen from the keyboard it adds a 3px OSD-white underline offset by 0.28em. A shared link's first load, and a key pressed while reading a tape chosen by pointer, leave it unmarked, though Chrome counts both as keyboard focus.
- **Screen body / tagline** (`screen-body`, `screen-tagline`, `full-height-body`, `full-height-tagline`): one centered column capped at 62ch aligns titles, prose, media, tags, and links in both reader modes; available tube width shortens that measure on phones. Prose is weight 400 with 1.65 leading, 0.005em tracking, and one-em paragraph spacing; the tagline is weight 600 with 1.5 leading. The modeled screen uses 1–1.0625rem (3.1cqi); full-height reading uses 1–1.125rem (2.4cqi). Long text wraps without horizontal scrolling.
- **OSD** (`osd`, `osd-meta`, `osd-display`): VT323 at weight 400. PLAY, the station ident, and the reading time use 1.125–1.375rem (4.5cqi) with 1.2 leading, the ident in screen-soft and without the OSD's glow so the transport state leads; metadata, captions, tags, links, and the REC line share 1.0625–1.25rem (4cqi) with 1.35 leading; NO SIGNAL and the idle message use 1.5–2.5rem (9cqi) with 0.06em tracking, and NO SIGNAL's exit hint is set in the metadata size in OSD white. Every other OSD line keeps VT323's own spacing, inside the reader too: the prose's tracking is set on the tagline and paragraphs, not on the reader, so it never reaches the OSD lines among them. VT323 is monospaced and no Archivo numerals align in columns, so no tabular-numeral feature is set anywhere.

**The Drawn Mark Rule.** Archivo has no arrows, so no arrow, play mark, or dot is ever typed; a typed one would come from whichever fallback font has it and mismatch its label's weight. Every interface mark is an inline SVG from `src/components/Icons.tsx`: play (the About link, each tape entry, the PLAY OSD), the outward arrow (contact and project links that leave the site), sound, skip, eject, collapse (Exit full screen), and expand (a closer look, the collapse mark's corners turned out). The arrows are 1.5-unit strokes on a 16-unit box, sized 1em beside text, 0.7em inside the OSD, and 12px on tape entries; the four deck marks are filled shapes on a 20-unit box at 18px, the speaker's waves and slash their only strokes, and the eject mark is also printed ahead of its word at the capitals' height, half an em before it, on the modeled EJECT cap and on the tube while a tape returns. Every mark takes `currentColor` and is `aria-hidden`, so the label alone carries the accessible name. The one exception in colour is the muted speaker's slash, printed in rec red on the key and in the deck's status window alike. The REC dot, the idle cursor, and the steps of the picture-size bar are CSS boxes.

Desktop HTML is authored on a 560 × 420 screen and transformed with the camera; computed CSS sizes
therefore describe the screen plane before its visual transform, except below
the reference zoom, where the plane is sized to the tube and computed sizes
are real (The Tube-Scale Rule). Canvas print
sizes are texture coordinates, not recommended HTML font sizes.

**The Silkscreen Rule.** Printed hardware text never glows. Its hierarchy comes from size appropriate to the object, weight, spacing, and contrast against the material.

**The Signature Print Rule.** The models carry four signature prints and nothing else: the deck's status window, the AV–01 model line (AV–01 / VHS, the same mark the native reader's deck carries, with no specification after it), each cassette's spine number and name, and the idle screen. Each working key cap carries its own single label. No other object is lettered: no monitor chin, plinth line, holder number or cheek mark, speaker badge, stand mark, flap legend, or cassette underside. A new object earns geometry, not a nameplate. Every print texture matches its plane's proportions, and type that would overflow its plane is set smaller, never compressed, so glyphs never stretch. Prints share the page's weights: 600 for the status window, the AV–01 line, and the key caps; 800 for each spine's number and name. Prints are transparent decals in the chassis material (roughness 0.82, metalness 0.12, flat shading): only the ink renders, so a label never sits on a differently lit patch. Print canvases carry about 1280 texture pixels per world unit, and the studio renders at pixel ratio 2 during modeled playback so the prints resolve.

**The Tube-Scale Rule.** Screen-interior type scales with the tube using cqi units. The modeled reader is authored on a 560px plane and drawn at the playback zoom; where that zoom would draw the plane smaller than 560px (laptops at 1280 × 720 and 1366 × 768, tablets at 1024 × 768), the plane is enlarged and its content shrunk to match, so one CSS pixel is one screen pixel and the prose's 1rem floor is a real 16px floor. Above that zoom the reader scales up with the tube as before. At widths up to 767px or heights up to 699px, the full-height native reader preserves a 16px prose floor and independent scrolling; comprehension takes priority over the physical metaphor.

## Layout

The shell uses a centered container (maximum 1600px) with 5% horizontal padding,
increasing to 6% in the mobile look. Fine seams divide the header,
archive, and footer. The shared spacing primitives use a 4px base; the shell
also has optical adjustments documented in its component CSS.

The page has two looks and nothing between them. Every window at least 768px
wide and 540px tall gets the Studio First look (The Studio First Rule), and
so does a window under 540px tall that is at least 740px wide, a phone on
its side, with the words beside the studio instead of over it. Anything
else gets the mobile look: the words in a band above a full-bleed studio,
the guide pointing at the list, the list in two columns with its blank
slots in one cell. The width is the reading breakpoint's, where the modeled
reader also gives way to the native one; below it the corner beside the
monitor is too narrow for the display line at its 2rem floor. The height is
where the corner above the rack, at the fold, can no longer hold the words
at that floor: phones on their side stand below it, laptops with the
browser's chrome and toolbars above it. Below it the studio and the words
share the width instead, which needs 740px: phones on their side have it,
the smallest (an iPhone SE at 667px) do not. The switch is the
stylesheet's, so a page drawn ahead of time is right on the window it
arrives in.

**The One Column Rule.** Every shell edge sits on the container's two edges:
the nameplate, archive heading, and footer statement on the left; the
navigation, archive note, and contact links on the right. In the mobile
look the kicker, display line, and guide sit on the left edge too. Beside
the studio (The Studio First Rule) they share one left edge of their own,
set by the widest of them, the display line (or the kicker on short
windows, where the display line gives way first), which ends on the
column's right edge under the navigation. The cassette mark
hangs 16px into the left gutter above 1200px so the name stays on the
column, and is not drawn below that width. The only other inboard edges are
the archive entries' own 12px insets.

**The Studio First Rule.** On every window at least 768px wide and 540px
tall, the studio takes the first screen under the header, and the
introduction and the guide stand in its open upper right, over the table
behind the rack, instead of in a band above it. The fitted studio is wider
than it is tall, and a band of words above it took the height the fit
needed, which left the studio small and its two sides empty; beside it, the
words fill the one corner the equipment leaves open, and the studio grows
to nearly the column's width. Reading order is unchanged: kicker, display
line, guide, then the studio. The words sit above the canvas and never over
equipment, and they are sized to the corner rather than the corner to them.
Measured from the box's centre in the fit's units, the monitor's right edge
stands 0.51 to the right and a tape lifted in preview rises to 0.74 above,
so: the display line is never wider than 4.6vw, which keeps the words 28px
or more from the monitor (over 100px on wide windows); on short windows it
is never taller than the corner the lifted tape leaves under a studio that
ends at the fold; and where the studio's proportion would leave the corner
too short for the words, the box grows taller than that proportion, just
enough for them. The words clear the tapes and the headphones by 14px or
more with a tape lifted in preview (`e2e/framing.spec.ts` holds them 12px
clear from the widest window down to the corner of the mobile breakpoint).
Beside a studio narrower than 940px the kicker breaks after "Bridging the
gap" rather than cross the monitor, and the display line keeps a 2.25rem
floor, wide enough for the guide's longest caption on one line.

On a phone on its side (under 540px tall, at least 740px wide) there is no
room above the rack for the words, so the studio and the words share the
width instead. The studio's box takes the left column, from the header's
seam down to the fold, and the words stand at its upper right, 24px clear
of it, beside the headphones rather than over them, with the kicker broken
after "Bridging the gap" and the display line near its 2rem floor so the
studio keeps the width. The box is narrower than 600px there but keeps the
three-quarter camera, which holds the whole table inside it; the phones'
closer view is for a canvas that runs to the screen's edges
(`phoneView` in `studio/framing.ts`). Where there is no hover the guide
points at the list, as on a phone, since the rack is small at this height;
a short window with a mouse keeps "Pick one in the studio."

The archive uses six equal columns, three at 1200px and below, and two in
the mobile look, with an 8px gap. Flex list items and full-width links keep each row's
entries equally tall when a narrow label wraps. The header has an 80px
minimum height, becoming 72px in the mobile look and on windows no taller
than 820px. The introduction's top spacing is 24px from the studio's box,
which starts 8px under the header's seam, so the kicker stands 32px from
the seam; on windows no taller than 820px the box starts at the seam and
the spacing is 20px. In the mobile look it is 16px from the seam. The
introduction is the kicker and display line alone, with no aside. On a
phone (600px and below) the kicker breaks after "Bridging the gap", and in
the mobile look the footer wraps.

The selection guide follows the introduction, 24px below it (16px on
windows no taller than 820px, 12px in the mobile look). It
pairs "Choose a tape to play" with a one-line instruction that says where:
"Pick one in the studio." beside the studio; the instruction hangs 4px
beneath. Beside the studio, the guide closes the column of words, directly
above the rack it points at, and wraps within the column's width rather
than widening it, so a long caption never moves the headline. In the mobile
look the canvas follows it directly, and it reads "Pick one from the
projects below.", as it does wherever there is no studio to pick from (no
WebGL, lost graphics): the fitted rack is about 110 to 150px across there
and the list's entries are the targets in reach; the studio still answers
taps (The Touch Rule, under Cassettes and insertion). The stylesheet, not a
script, picks the line, so a page drawn ahead of time is right on the
device it arrives on. Both lines finish the
headline's sentence with the same verb and the same noun, the tape; "cassette" is the modeled object's name in this document,
never the visitor's. While a tape is previewed the guide shows its spine
name over its caption and the action: "Cloudflare D1 in Apache Superset ·
Select to play",
or "Tap again to play" on a device without hover. Nothing shares the
guide's row: there is no scene metadata line, clock, drag hint, or reset
above the canvas. The archive follows the canvas with a seam and 16px top
padding. This groups the artifact with its selection surfaces.

The footer sets the statement and the edition mark on the left and the
contact links flush right on the column, mirroring the header. In the
mobile look the statement takes the first row and the edition and links
share the second.

Beside the words (The Studio First Rule), the exhibit's box follows the
studio's own proportion, `aspect-ratio: 1.82`. The fitted studio is about
1.72 wide to 1 tall with the fit's 24px on every side; the box is a little
wider than that, so the height sets the fit and the table stands inside each
column edge. That margin is for the table's shadow, which falls
to the right past the fitted bounds (the fit does not count it) and must end
inside the box, never be cut at its edge. Its height is capped at the viewport under the header,
`calc(100svh - 88px)`, or `calc(100svh - 72px)` up to 820px tall, so on a
wide, short window the studio ends at the fold and the fit follows the
height instead. Where the proportion would leave the corner too short for
the words, a minimum height takes over: twice the words' height plus the
lifted tape's rise above the centre, so the studio sits lower in a taller
box with the words above its rack (768 × 1024 draws a 692 × 519 box; 1024 ×
1366 a 922 × 572 one). The archive follows the box; where the proportion,
not the fold, sets the box's height (1280 × 800, 1440 × 1000, 1920 × 1080),
its heading shares the first screen with the studio. The box never runs
past the fold: a window both narrow and short (under 940px wide and under
600px tall, where the kicker takes two lines) closes up its words instead,
12px under the header, 6px under the kicker and 12px above the guide, with
the display line fitted to the corner down to 2.0625rem, the smallest that
keeps the guide's longest caption on one line.
In the mobile look the box is `clamp(220px, 72vw, 384px)` tall and extends
past the shell gutters; at phone widths the equipment, not the height, sets
the zoom, so that height is snug to the fitted studio. The orthographic
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
a 72px minimum-height deck panel within that frame. The CRT's explicit `fullHeight` prop/class applies the stretched
layout and readable type independently of viewport CSS. The mobile look
shares this breakpoint's width but not its height: a window 540 to 699px
tall browses in the Studio First look and reads in the native reader. The
phone's 600px steps (the kicker's break, the camera's closer view, the
shorter deck labels) are separate from both. A tape chosen there still goes
in on the studio first, as on every window: the canvas takes the viewport,
the studio eases out to fill it, Skip animation waits at the lower right,
and the native reader opens only once the tape is in the deck. It then
covers the studio completely, so the canvas goes back to the size of its box
under it rather than keep the viewport; the page holds still beneath all the
same, and on eject the tape returns to its slot in the box. An eject during
the insertion eases the studio back into its box, as on desktop.

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
- **Screen bloom** (`--bloom-rest`, `--bloom-play`, `--bloom-idle`): the HTML tube's states. The HTML tube has three states, idle, playback, and NO SIGNAL, each with a rule of its own: idle takes the blue idle bloom; playback and NO SIGNAL, both a lit tube of OSD on the black ground, take the play bloom; the rest value is the screen's base beneath them. It has no returning state: a tape returns only in the modeled studio, whose tube reads it out (The One Readout Rule). The modeled CRT supplies its own local point light to the same rule, the colour of what the tube shows: blue while the tube is blue, at rest, through a tape's flight in, and through its return, and phosphor from the moment the reader or NO SIGNAL is on it, the light turning in the same commit as the tube.
- **Native reader surround**: an opaque 20px spread in page-ground color masks the expanded reader's surroundings; it is not a glow.

The HTML CRT is the screen alone, with no frame, chin label, or cast of its
own: the models supply those, and the fallback monitor's frame is its own
(`--shadow-unit`). Every screen, on the tube or in the fallback, shares the
14px screen radius. The sidecar lists these shadows.

**The One Light Rule.** The CRT is the only emitting object. Neutral studio fill and shadow-casting directional illumination reveal the forms; a small screen-colored light falls onto the deck, and changes only when the screen does. Equipment labels, controls, and page chrome never glow.

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
While a tape plays on the tube the dial is its picture-size knob, and turns
(The Picture Size Rule); otherwise it rests where it was modeled.
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

Every radius on the page is a token (`--r-*` in `tokens.css`, named as
above). HTML control corners use the small radii: hairline focus and OSD links,
slightly rounded playback buttons, and subtly rounded archive entries. The
screen, the native reader's frame, and the fallback monitor's frame each
take their larger named radius. Borders are generally 1px;
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
the eject key's Escape shortcut (`aria-keyshortcuts` and a hover title), and
the crisp cyan keyboard-focus outline, and nothing else: no text, icon, or
background. Hover/focus lightens the matte
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
400, reading 7.5:1 on the key and 6.7:1 on hover. The hint is a legend, not
part of the key's name: both Eject keys are named "Eject tape" and declare
Escape through `aria-keyshortcuts`, and the legend is hidden from assistive
technology, so neither key is ever announced as "Eject tape ESC". The fixed page-wide playback popup is removed in every reading mode.
When the visitor has turned a desktop tube's picture up to full screen, the
panel leads with an Exit full screen key in the same family, the drawn
collapse mark before its words and an F legend after them, declared through
`aria-keyshortcuts` like Eject's (The Picture Size Rule).

Skip animation is a hardware key of the native deck family, available only
during insertion: the same uppercase control type, seam-lit border, darker
bottom edge, and press as the native reader's sound and eject keys, led by
the drawn skip mark. It sits at the viewport's lower right, over the insertion
playing in the studio on every window, with a 44px minimum target.
It is HTML, never a modeled key: the deck carries no physical skip, and its
printed model label stays visible. Skip takes focus for as long as it is on
stage, so focus never rests on the page body during the flight and a
keyboard visitor sees the ring on the one control there is. Any key still
skips, except the ones that mean something else: Tab, a bare modifier (Shift
on its way to Shift+Tab), and Enter or Space on a focused key, which is that
key's own press.

### Sound toggle

The guide carries no tools: the view is authored, so there is no drag hint
and no reset, and there is no page-level sound control. The deck's SOUND key
is the single toggle, live on the modeled player during playback and in the
native reader's hardware panel otherwise. Its speaker SVG shows waves when
enabled and a red slash across the speaker when disabled; `aria-pressed`
carries the state. Sound is synthesized, default-off on every visit, never persisted, and
user-triggered: tick, insert, and eject; the tick also answers the dial as a
picture is turned up to full screen (The Picture Size Rule). Because the toggle lives on the deck,
hover ticks stay silent until a visitor has switched sound on during playback.

### Navigation

Plain Archivo links with generous vertical padding and no underline. Hover
raises text contrast; keyboard focus retains the cyan outline. Every shell
link is a target at least 44px tall: the nameplate, both header links, and
both contact links. The floor is a hit area, never a layout change: the
nameplate's two lines stand 40px and the footer's caption-size links 42px,
so the nameplate centres its lines in the taller target and each contact
link overhangs its row by a pixel above and below, and no word moves. The header
carries "Projects" and "About" at every width; "Projects" is the page's
single visible route to the section of that name, and neither link shows a
count. Contact
links stay in the footer. Internal About and tape links use the drawn play mark; the
outward arrow is reserved for links that leave the site. Every mark is an
`aria-hidden` SVG (The Drawn Mark Rule) set 0.5em from its label by flex
gap, never by a typed space. The introduction
has no Projects shortcut. A focus-revealed skip link, "Skip to projects",
leads to the same section.

**The One Name Rule.** A thing has one name wherever a visitor meets it, and
a link's words are the heading it lands on. The collection of tapes is
**Projects**: the header link, the section's heading, the skip link, the phone
guide ("Pick one from the projects below."), the status messages, and the
idle tube's PROJECTS. It is never "the archive", "the tape index" or "the shelf" in
anything a visitor reads or hears; the modeled rack and holder are object
names for this document only. A tape has one short name, its spine name
(`vhs.spineLabel`: SUPERSET D1, ABOUT), printed on the spine and repeated as
written by the archive entry, the guide, the idle tube, and the loading
tube; and one title, which heads the reader and names the document. The About
tape follows the same rule as every tape: it is "About" in the header, ABOUT
on its spine, and "About" on the tube, where the owner's name is already
printed once, in the ident. A tape's caption is the same words in the
archive entry and in the guide: its `caption`, else its title ("Cloudflare D1
in Apache Superset" for a project, "Daniel Alyoshin" for the About tape; a
blank slot's "Blank tape"). The visitor's noun is "tape"; "cassette" names the modeled object in
this document.

### The archive

The section a visitor knows as "Projects" (The One Name Rule): six entries
in rack order. A linked entry with a numbered label, caption, play symbol,
and a thin accent strip supplied by its tape data. Each entry uses a seam border
and small corners; hover, focus, or modeled-tape preview fills it with ink-2 and
strengthens the border. The number sits above the name in the 11px label tier, as on a cassette
spine, so each entry has one text edge; the 12px play mark is centred on the
entry in its own column. Minimum height is 80px at every width, with a 12px
inset on every side and the accent strip inset to match. Names wrap as
needed; 12px secondary copy carries the tape's caption (a project's title,
or the About tape's "Daniel Alyoshin"), and the guide repeats the same caption while that tape is previewed. The playable links are normal Tab stops, with
arrows and Home/End for direct movement between them. The archive's heading carries no count; nothing on the
shell does.

**The Spoken Name Rule.** A link is named by the words it shows, so a name
read off the page is a name that can be said to it (WCAG 2.5.3). An archive
entry's name is its visible text between what it does and its year, "Play
tape: 01 SUPERSET D1 Cloudflare D1 in Apache Superset (2025)", the first and
last parts set aside for assistive technology; the nameplate is "Daniel
Alyoshin Forward deployed engineer home". No link carries an `aria-label` that replaces its words.

**The Blank Slot Rule.** The rack has six slots: five for projects and the
About tape at the right. One project fills slot 01 today, so slots 02 to 05
are blank. A project slot with nothing behind it yet keeps its
place and its number but is drawn as an outline, not a tape: the same 80px
cell and 12px inset, a 1px dashed seam-lit border, no accent strip, no play
mark, and dim silkscreen throughout, reading "Coming soon…" over the caption
"Blank tape". It is plain text, not a link: it answers no pointer, takes no
focus, and the arrow keys pass over it. The larger look keeps one cell per
slot, as the rack does. In the mobile look the run of blank slots shares
one cell, numbered for the run as the spines are ("02–05") and captioned
"Blank tapes": the run's first cell prints the run's last number after its
own and its caption's plural, and the others leave the page and the list
alike, so assistive technology meets the run once, as "02 to 05 Coming
soon… Blank tapes", in a list of three. From the right-hand
column of the two, that cell spans both rows, so the tape after the run
takes the left and the grid closes without a hole. The stylesheet makes the
switch, so a page drawn ahead of time is right at any width. Adding a
project to the content list turns the next blank slot into a playable tape
and nothing else changes; the run, its number, and its span follow. A
blank slot has no route, so a link to one reads NO SIGNAL like any dead tape.

### Cassettes and insertion

The loose cassette, every playable tape, and every blank tape use the same
modeled shell, with the loose cassette uniformly scaled. A blank slot's tape
is that shell with nothing stuck on it, no spine print and no face label,
seated flat in its slot. Its slot target swallows the pointer, so it never
previews, lifts, or plays, and the printed tapes behind it in the
three-quarter view do not answer through it: the camera looks along the
rack, and a ray through an empty slot would run on into the next envelope
(The Blank Slot Rule, under The archive). Modeled spine labels retain
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

**The One Readout Rule.** The modeled tube says one thing at a time, and its
sub-lines always belong to its headline. At rest: INSERT TAPE over CHOOSE A
TAPE / TO PLAY. Previewing: the cassette's name over SELECT THIS TAPE / TO
PLAY. Loading: LOADING TAPE over the name of the tape going in and nothing
else. Returning: EJECT, the deck's word
for the state, led by the key cap's drawn mark, over the name of the tape
coming out and nothing else, so the tube and the deck's status window read
the same word for as long as the return lasts. An invitation never prints
while a tape is in the mechanism, on its way in or out, and a preview made
meanwhile waits for the tape to land. Reduced motion returns the tape at
once, so the tube goes straight back to the invitation. A name too long for
the lit area is set smaller, never compressed, like any print.

**The Touch Rule.** A touch has no hover to confirm with, so on touch the
preview is a step of its own: the first tap on a cassette lifts and names
it, in the guide and on the idle screen, and a second tap on the same
cassette plays it; a tap on another cassette moves the preview, and a tap
clear of the rack drops it. A mouse is unchanged: hover previews, click
plays. Slots are far narrower than a fingertip at the phone fit (29px wide
on a 16.6px pitch at 390px), so every slot target also answers a tap
inside its projected rectangle grown to at least 44 × 44px about its
centre, the nearest centre winning where the catches overlap; a blank
slot's catch swallows its tap as its target does. A tap that lands on a
target directly is that tape's. The catch is read from the camera at the
moment of the tap, so it follows every fit and resize.

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
phase in the new box. The renderer's own measurement of its box is taken in
that commit too: React Three Fiber applies it again on every render, so a
stale one would undo the sizing at the next render, such as a hover while
the tape is still on its way home. Focus returns to the
corresponding archive link (The Way Back Rule), but that return is not a
preview, so the tape stays seated until it is hovered or focused again; an
eject during
insertion reverses from wherever the tape is; the deck reads EJECT
for the return; history back ejects the same way. Reduced motion and the
fallback reader return the tape at once. Selection and eject commit inside
the router's navigation transition, so the mechanism always starts from the
cassette's exact pose. There is no ambient geometry animation. The scene
loads lazily, and only once the page has painted and the main thread is
idle, so the words and the archive are in use first; it renders on demand, caps pixel ratio at 1.75 in browse and 2 in
modeled playback, and disposes generated
textures and geometries. It loads, plays, and ejects with a clean console:
the studio module drops one line of three.js output, the THREE.Clock
deprecation that React Three Fiber's own store raises, matched by its exact
text, and passes every other message through.

**The Way Back Rule.** Every exit lands focus somewhere the visitor can see.
After a tape, focus returns to that tape's entry in the archive; after NO
SIGNAL, where no tape played, it lands on the nameplate that opens the page,
which holds the page's first heading. A focus ring that shows must be on
screen: when the browser draws the ring (a keyboard exit), the entry is
brought into view by the shortest move and stands 24px clear of the
viewport's edge; when it draws none (a pointer exit), the page stays exactly
where it was. The move happens in the closing commit, before paint, while
the page chrome is still fully dissolved, so it is never seen as a scroll:
the studio simply eases back into its box where that now is (The Soft Zoom
Rule holds to the pixel either way). A press in the studio takes focus onto
the studio's layer, as a press on a link takes it onto the link, so the
focus that follows by script (Skip, then the title) is ringed for a
keyboard and never for a mouse. The layer is no Tab stop and owes no ring.
The title is marked only for a tape chosen from the keyboard (see Screen
title), never on a shared link's first load or at a key pressed while
reading.

### CRT reader

Selectable, scrollable HTML inside the modeled screen, with a complete native
reader when WebGL is missing, fails, or loses context. Prose uses screen-text;
metadata uses dim screen text. Playback OSD sits above the reader with a dark
fade behind it; its play mark is drawn at 0.7em with the OSD's own light, and
the REC dot closing the article is a blinking 0.5em circle. The article's
continuation is visible: a 3.5rem fade to screen black at the tube's foot
mirrors the OSD's fade above while more of the article lies below, and
lifts (240ms) once its end is in view, so the REC line closes the tape
uncovered; the reader's thin scrollbar thumb is screen-scroll, 3.5:1 on the
tube. Both cues serve the modeled and the native reader alike. Project media spans the reading column, with a seam border and
small control corners, in the full-height reader only: the modeled tube
offers it as a closer look instead (The Closer Look Rule). Every piece
declares its pixel size in the content (`ProjectMedia.width` and `height`,
required), so its place is held before it loads and nothing beneath it
moves; the first loads at once and the rest as they are reached. A picture
drawn across for the widest column (639px) may carry a drawing laid out
down for a narrow one (`ProjectMedia.narrow`, with its own pixel size),
which the reader shows below 640px wide: the D1 diagram is drawn at 640px
for full screen, where its 14px text reads at its own size and the whole
of it stands in a 1280 × 800 window, and at 360px for phones. The article is a named Tab stop within the playback
focus loop, so keyboard users can return from transport controls and resume
scrolling. Initial focus still announces the title. Missing-tape and unknown-route
screens use distinct NO SIGNAL messages and matching transport labels, with
the same eject/Escape exit, on a tube lit as playback's is (Shadow
Vocabulary). That exit is printed on the tube, a step below
the reason: PRESS ESC OR EJECT TO RETURN, the drawn eject mark leading its
word as on the key cap, in both readers. At widths of 600px and below it
names the deck's key alone, as the native Eject key drops its ESC legend
there. The printed line is decorative to assistive technology, which keeps
its own sentence and the live region.

**The Ident Rule.** The tube says whose archive is playing. The OSD's top
bar has three fields: the transport state at the left, the station ident
(DANIEL ALYOSHIN) on the tube's centre line, and the tape's reading time
at the right (The True Readout Rule); NO SIGNAL carries the ident alone in
the same place. It lives in the
reader, not the shell, so it is there in a deep link's first second, through
the handoff, in the native reader on a phone, and on a dead link, which is
often a first visit. The shell's nameplate dissolves with the rest of the
page; nothing of the shell is pinned over the studio. The outer fields
share the spare width equally so the ident is centred; on a tube too narrow
for that they pack to their content, and the reading time gives way in
steps, never the name: below 19.5rem it drops its word and keeps its number
(1 MIN), which holds two characters of air beside the name on a 320px phone,
and below 15.5rem it goes. The name is read from `src/content/site.ts`, the
same source that closes every document title.

**The True Readout Rule.** Every readout states something true of the site,
or it is not printed. The tube's counter is the tape's reading time, 1 MIN
READ: whole minutes at 230 words a minute over the title, tagline,
paragraphs, and captions, never under one, derived in
`src/content/readingTime.ts` and never typed into a tape's content, so it
stays true as the copy changes. The OSD bar is decorative to assistive
technology, so the article's meta line carries the same fact for a screen
reader ("1 minute read"). No tape speed (SP, LP), invented runtime, head
count, or stereo claim appears on the tube, the deck, or the idle screen.
The transport states, the owner's name, the archive's name, the REC date,
and NO SIGNAL's reasons are all statements of fact. AV–01 and CH 01 are
names, not claims: the machine's, and the home route's, as CHANNEL NOT FOUND
names a route that is missing.

**The Handoff Rule.** A desktop deep link's native reader hands over to the
modeled screen once, when the scene is ready. The studio composes underneath
the still-opaque reader with the tape already seated, the flap closed, the deck
reading PLAY, and the keys live, until the modeled reader is mounted and placed
on the tube plus one drawn frame; then the native frame dissolves over 560ms
(`--t-dolly`, `--ease-out`) while the tube's tracking entrance plays through
it. The modeled article inherits the native reader's scroll depth and keeps
focus in the article if that is where it was, otherwise on the title. The
outgoing frame is hidden from assistive technology only once the modeled
reader holds focus, never while focus is still inside it; it is inert for
the dissolve, then unmounts. An
invalid slug hands off the same way to the modeled NO SIGNAL screen. Reduced
motion swaps at the same moment. The dissolve stops early if playback closes,
the viewport drops below the reading breakpoints, or graphics are lost.
Under the reader the canvas leaves its box for the viewport, and the studio
composes at the tube's own view in one step rather than easing from the
box's fit, since no one sees it move; the picture is placed where it will
stay. The same handoff hands a picture back from full screen (The Picture
Size Rule).

**The Picture Size Rule.** The tube is small for reading, so the set offers
its picture at full size, in its own language rather than with a page
control. At the foot of every tape on the modeled tube, on a band of the
tube's black that the article scrolls under, the OSD prints the picture's
size: PICTURE SIZE in screen-soft, a bar of ten steps lit for the share of
the window's width the picture truly fills (measured while the camera
settles and on every resize, never typed: The True Readout Rule), and FULL
SCREEN with its F legend. The monitor's dial is the same control: while a
tape plays on the tube its pointer stands where the bar does, a tenth of its
sweep a step, and it returns to its modeled pose when there is no picture to
size (`src/lib/pictureSize.ts` holds the one value both show). The set
nudges once, at the moment the tube's window starts to cost the visitor: a
tape's first scroll on the tube turns the dial up two steps and back while
the bar lights with it, so the knob and the readout are seen to be one
control. Pointing at either previews the turn, as pointing at a tape lifts
it: the bar's unlit steps show faintly, FULL SCREEN underlines, and the knob
lightens as a hovered key does. The bar, the dial, and F all turn the
picture up the same way: the dial clicks once (the tick, with sound on), the
bar lights to full a step every 45ms with the dial turning in step, then the
full-height reader grows out of the picture's own rectangle (a clip opening
from the tube to the window over 560ms, `--t-dolly`, `--ease-out`, fading up
over its first 40%) and takes the window, carrying the reading place and
keeping focus in the article if it was there, else on the title. Its deck
gains an Exit full screen key, led by the collapse mark with an F legend,
ahead of Sound and Eject; that key and F hand the picture back with the deep
link's dissolve (The Handoff Rule), the frame closing onto the tube as it
fades. Full screen, once chosen, holds for the visit and, like sound, is
never stored: eject, Escape, and history return to the page as from any
native reader, and every later tape still flies into the deck and plays on
the tube, and once the camera is at rest there the set turns its picture up
by itself, bar and dial together, and it grows. Under reduced motion there
is no flight to watch, so a later tape opens full screen at once. Exit full
screen gives the visit back to the tube. It is offered only where the tube
is the reader, the Studio First look above the reading breakpoints with
graphics ready, and answers only once nothing is moving: not during an
insertion or a handoff. F never fires with a modifier, so Command-F still
finds in the page. The bar is the control for keyboards and assistive
technology, named "Full screen" with its shortcut declared; the dial's hit
area is the pointer's alone, out of the tab order and hidden from assistive
technology. Reduced motion skips the nudge and the steps: the reader takes
the window at once and hands back with a swap. The five nudges compared on
2026-09-27 are recorded in `PLAN.md`.

**The Closer Look Rule.** The tube is too small to read a picture from,
so the modeled reader never shows a tape's media. In its place stands a
slate the width of the column, at least 8.5rem tall, in the diagram's own
node fill and seam-lit edge with small control corners: the expand mark at
1.4em and TAKE A CLOSER LOOK in OSD white with the OSD's glow, over the
media's caption in dim OSD type. It is one button, named by the words it
shows. Pointing at it lights its edge white and underlines the action, and
previews the turn as pointing at the size bar does (the bar's unlit steps
show and the dial lightens). Pressing it turns the picture up exactly as
the bar does (The Picture Size Rule): the tick, the bar and the dial to
full, the reader growing out of the picture. The reader opens on the media,
its top under the OSD, rather than at the reading place, and focus stays in
the article. Unlike the bar, the dial, and F, a closer look is for this tape
alone: it is not held for the visit, so the next tape plays on the tube.
Exit full screen and F hand it back as from any full screen. Where the tube
cannot turn up yet (an insertion, a handoff) the slate stands but does not
answer, as the bar does not.

The modeled idle image is a local 1024 × 768 canvas texture with static scanlines.
Its lit area has the reader's corners, 26 texture pixels for the 14px screen
radius on the reader's 560px plane, over the black tube, so the screen keeps
one shape before and after a tape goes in.
Its main message uses 128px texture type; the two-line selection instruction
uses 88px so it remains legible at the opening camera scale. Its corners
carry the transport state (STANDBY, LOADING while a tape goes in, or EJECT
while one returns) at the top left, CH 01 at the top right, PROJECTS at the bottom left, and
the model mark AV–01 at the bottom right, as on the fallback's idle screen,
which prints the state and the mark alone. These are texture
coordinates, and scale with the physical screen rather than HTML font tokens.
HTML screen effects comprise faint stepped grain (0.8s; its tile is painted
once on a layer one tile larger than the tube, and the layer steps by
transform, so the reader beneath is never repainted), scanlines, a vignette,
one tracking entrance (400ms), and the REC blink (1.2s). The fallback idle cursor
blinks at 1.1s. Every effect stays clipped inside the tube. The global
reduced-motion gate collapses CSS animation and transitions; sidecar snippets
carry their own equivalent gate because shadow DOM does not inherit it. The
tracking entrance does not play at all under reduced motion: a collapsed
animation still paints its first keyframe for a frame, and this one's is the
picture 6% high at double brightness.

### OSD links and tags

Screen links use VT323, a white 1px border, small corners, and the
`link-osd` padding; links that leave the site end in the drawn outward arrow
at 0.7em, spaced 0.4em. Inline flex alignment and 44px minimum width and height
provide separate touch targets. Hover inverts to white with dark text; focus
stays white. Playback links preserve native modified-click behavior.
Tags are bracketed uppercase text in screen-soft, wrapping with the existing
small/medium gaps. They are informational labels, not filled chips or filters.

### Pages drawn ahead of time

**The First Frame Rule.** Every route is readable, and correctly named,
before any script runs. `npm run build` renders the home page and each tape
to its own static file (`index.html`, `project/<slug>.html`), and the NO
SIGNAL page to `404.html`, which a static host serves for any address it has
no file for. A tape's page carries its article in the native reader, as a
deep link first shows it, so a shared link paints its words at once and a
crawler reads them. The app then takes the page over where it stands: the
served nodes are kept, and the console stays silent. A page drawn for a
different address than the one asked for (the 404 page, answering a dead
link) is rendered afresh, so a dead tape and a dead channel still say
different things. What a server cannot know is left to the browser without
disturbing the page: the stylesheet picks width-dependent copy, and
graphics support is assumed until the browser says otherwise.

The build also writes `robots.txt` and, once the site has an address
(`SITE_URL`), `sitemap.xml`, canonical URLs, and `og:url`. The page declares
itself dark (`color-scheme`, so native scrollbars and media controls follow)
and tints browser chrome with the graphite ground (`theme-color`). The
favicon is the nameplate's cassette mark, drawn heavier for 16px, on the
graphite ground; `npm run render:icons` rasterizes the touch icon from it.

### Document titles and share card

Every route names itself. The home title is `site.title`, which
`index.html` repeats for the page as served (the build checks they agree);
a tape reads "Cloudflare D1 in Apache Superset · Daniel Alyoshin", the About tape "About ·
Daniel Alyoshin", and both missing-route states "No signal · Daniel
Alyoshin", so tabs, history, bookmarks, and a screen reader's page
announcement tell tapes apart. `index.html` carries Open Graph and Twitter
(`summary_large_image`) tags with the home title and the site description.
Crawlers run no script, so each route's file is written with its own title
and, for a tape, its tagline as the description, in the search, Open Graph,
and Twitter tags alike.

**The Card Rule.** A shared link shows what it opens. Home and the NO
SIGNAL page unfurl with the site's card, `public/social-card.png`: the
studio at rest, the tube reading INSERT TAPE. Every tape unfurls with its
own, `public/social-cards/<slug>.png`: the same studio caught as that tape
plays, the shell half through the deck's mouth, its slot in the rack empty,
and the tube reading LOADING TAPE over its spine label. One camera and one
frame for every card, so the cards read as a set and differ only by the
tape in the deck; the tube's print still names the tape in a 400px-wide
unfurl. Each card's alt text says the same: which tape, going in, under
which words.

The cards are drawn from the live scene at the browse camera on the
graphite ground by `npm run render:card` (1200 × 630, drawn at twice the
size and averaged down); a tape's card steps the real insertion frame by
frame until half the shell is through the mouth. No copy is set on an
image beyond what the tube and the labels print; the words are the title
and description tags, which are Daniel's. Re-render after the models,
materials, lighting, tube screens, or tapes change; the build stops if a
tape's card is missing. Image URLs are written as `%SITE_URL%/…`: the build
fills the site's address from the `SITE_URL` environment variable, because
several crawlers accept only absolute image URLs, and warns when a build
has none. The address itself is a Stage 10 decision.

## Do's and Don'ts

### Do:

- Do model broad planes, single bevels, recessed openings, and deliberately faceted circular parts.
- Do keep every retro effect inside the CRT screen area; its controlled light cast is the only outward glow.
- Do preserve keyboard access, visible focus, readable HTML, and a complete reader when WebGL is unavailable.
- Do hand a desktop deep link to the modeled studio in one dissolve once the scene is ready; the studio is never hidden behind a native reader while graphics are available.
- Do land focus in sight after every exit, and move the page for a ring only while the chrome is dissolved (The Way Back Rule).
- Do call a thing by its one name everywhere a visitor meets it, and make a link's words the heading it lands on (The One Name Rule).
- Do keep the owner's name on the tube in every reading state; identity during playback belongs to the OSD, not to shell chrome pinned over the studio (The Ident Rule).
- Do keep every route readable and correctly named before any script runs, and boot the studio after the page has painted (The First Frame Rule).
- Do name a link by the words it shows (The Spoken Name Rule), and take screen colours from the one palette (The One Palette Rule).
- Do respect prefers-reduced-motion in CSS, camera movement, tape movement, and design-panel examples.
- Do offer the tube's picture at full size in the set's own language, the OSD's size bar and the monitor's dial, never a page control in a corner (The Picture Size Rule).
- Do show a tape's media only where it can be read at full size; on the tube, offer it as a closer look in its place (The Closer Look Rule).
- Do give every tape a share card of its own, the studio caught as that tape goes into the deck (The Card Rule).
- Do change a design value in this file's frontmatter first, then `tokens.css`, and let `e2e/design.spec.ts` prove the site renders it (The Source of Truth Rule).
- Do let a touch tap preview a cassette before a second tap plays it; hover's confirm step has no touch equivalent, and a slot at the phone fit is narrower than a fingertip.
- Do leave an unfilled project slot legible as a blank tape and an outlined "Coming soon…" entry, never as an invented project.

### Don't:

- Don't add grunge, sepia, dirt, wear, photographic textures, or degraded page chrome.
- Don't pixelate the rendered canvas or use realism as the low-poly reference.
- Don't use VT323 for page chrome, printed hardware labels, or prose.
- Don't type an arrow, play mark, or dot; draw it (The Drawn Mark Rule).
- Don't add a weight beyond 400, 600, and 800, a seventh shell size, or any size below 11px.
- Don't introduce glowing controls, neon outlines with blur, or saturated chassis surfaces.
- Don't print VCR trivia as if it were information: no tape speeds, invented runtimes, head counts, or stereo claims (The True Readout Rule).
- Don't letter the models beyond the signature prints, and don't add metadata, clocks, counts, or edition marks to the shell.
- Don't substitute the old CSS dolly, deck VFD clock, or pulsing eject sample for the current 3D behavior.
