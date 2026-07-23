---
name: Daniel Alyoshin — Personal Site
description: Midnight Studio — matte graphite AV-rack chassis; the CRT is the page's only light source
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
typography:
  display:
    fontFamily: "'Archivo Variable', Archivo, system-ui, sans-serif"
    fontSize: 'clamp(1.35rem, 2.4vw, 1.9rem)'
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: '0.02em'
  label:
    fontFamily: "'Archivo Variable', Archivo, system-ui, sans-serif"
    fontSize: '0.6875rem'
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: '0.14em'
  body:
    fontFamily: "'Archivo Variable', Archivo, system-ui, sans-serif"
    fontSize: '1.0625rem'
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: '0.005em'
  screen-title:
    fontFamily: "'Archivo Variable', Archivo, system-ui, sans-serif"
    fontSize: 'clamp(1.1rem, 7.5cqi, 1.9rem)'
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: '0.02em'
  screen-body:
    fontFamily: "'Archivo Variable', Archivo, system-ui, sans-serif"
    fontSize: 'clamp(0.85rem, 4.6cqi, 1.0625rem)'
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: '0.005em'
  osd:
    fontFamily: "'VT323', monospace"
    fontSize: 'clamp(1rem, 6cqi, 1.375rem)'
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: '0.02em'
  osd-small:
    fontFamily: "'VT323', monospace"
    fontSize: 'clamp(0.95rem, 5.4cqi, 1.25rem)'
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: '0.02em'
  osd-display:
    fontFamily: "'VT323', monospace"
    fontSize: 'clamp(1.2rem, 9cqi, 2.5rem)'
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: '0.06em'
rounded:
  hairline: '2px'
  control: '4px'
  panel: '8px'
  rack: '12px'
  bezel: '20px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '16px'
  lg: '24px'
  xl: '40px'
  xxl: '64px'
components:
  button-eject:
    backgroundColor: '{colors.ink-3}'
    textColor: '{colors.silkscreen}'
    rounded: '{rounded.control}'
    padding: '10px 18px'
  button-eject-hover:
    backgroundColor: '{colors.seam-lit}'
    textColor: '{colors.silkscreen-hi}'
  link-osd:
    backgroundColor: '{colors.screen-black}'
    textColor: '{colors.osd-white}'
    rounded: '{rounded.hairline}'
    padding: '6px 14px'
---

# Design System: Daniel Alyoshin — Personal Site

## Overview

**Creative North Star: "Midnight Studio"**

A dim, precise edit suite. The page is a piece of high-end AV equipment — a
matte graphite rack holding a shelf of VHS cassettes, a tape deck, and a CRT —
rendered as crisp, contemporary flat vectors. The retro lives entirely in the
_subject matter_; the execution is modern, machined, and clean. The single
governing physical fact: the room is dark and the CRT is the only thing
emitting light. Everything else is lit by implication — hairline seams, quiet
silkscreen labels, controlled per-object color.

Confirmed anti-references: aged/grunge/sepia/VHS-damage aesthetics; the
neon-glow dark-portfolio template; texture noise on page chrome.

**Key Characteristics:**

- Matte graphite chassis, machined seams, silkscreen labels
- The CRT emits; nothing else glows
- Saturated color arrives only through artifacts (cassette labels, screen output)
- Crisp flat SVG/CSS vectors; no photographic grunge, no wear

## Colors

A graphite scale for the chassis, one VFD accent, and saturated color reserved
for content artifacts.

### Primary

- **VFD Cyan** (#61e8c6): the single interface accent — the deck's display
  text, live indicators, and focus rings. Small doses only; it marks "the
  machine is on," never decoration.

### Secondary

- **CRT Blue** (#1523d6): the iconic VCR blue screen. Owns the idle screen and
  eject flash — always inside the screen plane, plus its cast on the deck.

### Neutral

- **Ink 0** (#0e0f12): page ground. Deepest matte graphite — never pure black.
- **Ink 1** (#16181d): rack/chassis panels.
- **Ink 2** (#1d2026): raised panels, deck face, CRT bezel.
- **Ink 3** (#262a32): highest surfaces, physical controls.
- **Seam** (#2e323b) / **Seam Lit** (#3a3f4a): machined hairlines and edges.
- **Silkscreen Hi/Std/Dim** (#e9ebf1 / #b7bbc6 / #868b99): printed chassis
  text, three intensities. Dim is for uppercase labels ≥11px only.
- **Screen Black** (#07080c) / **Screen Text** (#dfe6ff) / **OSD White**
  (#ffffff): playback ground, prose, and OSD chrome inside the CRT.
- **Screen Dim** (#98a3c9) / **Screen Soft** (#aeb8dd): secondary text inside
  the tube — meta lines, captions, tags. Blue-tinted, never gray.
- **Phosphor** (#b4c4ff): the tube's light itself; at low alpha it forms the
  screen bloom (`0 0 40px rgba(180,196,255,0.1–0.16)`) and the playback cast
  on the deck. Idle bloom/cast use CRT Blue instead.
- **REC Red** (#ff3b30): the tiny recording dot in OSD chrome. Screen
  interior only, a few pixels at a time.

**The One Light Rule.** The CRT is the page's only light source. Glow
(box-shadow blooms, text-shadow halos) exists only inside the screen and as
the screen's controlled cast onto the deck below it. Chassis text, buttons,
and edges never glow. Focus indicators are crisp 2px VFD-cyan outlines, not
halos.

**The Artifact Color Rule.** Saturated hues (cassette label accents, screen
output) belong to content objects, driven by per-project data. The chassis
itself never exceeds graphite + VFD cyan, and VFD cyan stays under ~5% of any
viewport.

## Typography

**Display Font:** Archivo Variable (system-ui fallback) — width axis 62–125
**Body Font:** Archivo Variable
**OSD Font:** VT323 (monospace fallback) — inside the CRT screen only

**Character:** machined instrument lettering. The name is an engraved
nameplate (expanded width 125, weight 800, caps), labels read as silkscreened
equipment print, and the only "retro" face on the page lives inside the tube.

### Hierarchy

- **Display / Nameplate** (800, clamp(1.35rem→1.9rem), 1.05, +0.02em,
  font-stretch 125%, uppercase): the site owner's name and CRT project titles.
- **Label / Silkscreen** (600, 0.6875rem, +0.14em, uppercase): all chassis
  labels, nav, footer spec line, tags.
- **Body** (400, 1.0625rem, 1.65): the chassis base size.
- **Screen Title / Screen Body** (clamp(1.1rem, 7.5cqi, 1.9rem) /
  clamp(0.85rem, 4.6cqi, 1.0625rem)): CRT titles and prose — tube-scaled per
  The Tube-Scale Rule, capped at the display/body steps. Measure 55–68ch at
  cap.
- **OSD** (VT323, 1.375rem+): PLAY/STOP/EJECT chrome, counters, timestamps,
  idle-screen prompts. Never used for chassis text or long prose.
- **OSD Small** (VT323, 1.25rem): secondary OSD — deck VFD readout, meta
  lines, captions, tags, corner marks.
- **OSD Display** (VT323, clamp(1.75rem→2.5rem), +0.06em): the screen's big
  moments only — INSERT TAPE, NO SIGNAL, EJECT.

**The Silkscreen Rule.** Chassis hierarchy comes from weight, width, and
spacing — never from glow, color, or size inflation. If a chassis element
needs emphasis, widen or embolden it; do not brighten it past Silkscreen Hi.

**The Tube-Scale Rule.** Type inside the CRT scales with the tube, not the
viewport: `.crtUnit` is an inline-size container and every screen-interior
size is a `cqi` clamp capped at its documented step (title 7.5cqi→1.9rem,
OSD 6cqi→1.375rem, prose 4.6cqi→1.0625rem, OSD display 9cqi→2.5rem). The
title's focus cue is a 3px OSD-white underline, never an outline box.

## Layout

One continuous stage, centered column (max 880px): header nameplate → tape
shelf (board hugs the rack, `width: fit-content`) → CRT → deck (max 520px) →
footer spec line, all visible in the first desktop viewport. The CRT is
viewport-height-aware — `clamp(300px, min(400px, calc((100vh - 640px) *
1.3333 + 38px)), 100%)` — so the whole instrument fits ≥800px-tall screens;
playback legibility comes from the camera dolly (translate+scale toward the
CRT center, ~2.1×, 560ms), not from overview size. Below 720px the stage
stacks vertically, the shelf becomes a horizontal scroll-snap rack, and the
playing CRT pins near-fullscreen with a compact deck strip beneath it.
Spacing rhythm on a 4px base: tight groups (4–8px), panel padding 16–24px,
section separation 24–40px, more space above a heading than below.

## Elevation & Depth

Machined, not floaty. Depth reads through seams and edges: a 1px lit top edge
(inset highlight, rgba(255,255,255,0.05)) plus a soft ambient drop
(`0 12px 32px rgba(0,0,0,0.4)`) on major units (shelf, deck, CRT). No
elevation-by-glow anywhere on the chassis (see The One Light Rule). Inside
the screen, the phosphor bloom and the blue cast onto the deck are the
permitted, diegetic exceptions.

### Shadow Vocabulary

- **Unit drop** (`box-shadow: 0 12px 32px rgba(0,0,0,0.4)` + lit edge
  `inset 0 1px 0 rgba(255,255,255,0.05)`): shelf board, deck, CRT bezel.
- **Object drop** (`0 3px 8px rgba(0,0,0,0.6)`): small physical parts — the
  seated cassette edge in the slot, comparable hardware details.
- **Recess** (`inset 0 2px 8px rgba(0,0,0,0.8)`): shallow machined insets —
  VFD window, small wells.
- **Deep recess** (`inset 0 3px 10px rgba(0,0,0,0.9), inset 0 -1px 0
rgba(255,255,255,0.04)`): the tape slot mouth and other dark cavities.

## Shapes

Instrument geometry: rectangles with small, confident radii — controls 4px,
panels 8px, rack units 12px, CRT bezel 20px outer with an 8px screen inset
whose gentle corner rounding implies tube curvature. Cassettes are crisp flat
SVG objects (4px shell corners, hard color planes, 1px seams — no gradients
doing the work of form). Hairline borders (1px Seam) separate machined parts;
nothing thicker than 1px unless it is a physical object's silhouette.

## Components

### Cassette (signature)

- Standing spine-out on the shelf: dark shell (Ink 1–3 planes), accent label
  band from project data, vertical spine text, 4px corners.
- Label variants: `classic` (white label + accent stripes), `rental` (solid
  accent, bold reversed text), `studio` (dark shell, thin accent rule).
- Hover/focus: slides toward viewer ~10%; focus adds the 2px VFD outline.
  Motion alone never signals focus.

### Deck (signature)

- Ink 2 face, slot inset (Screen Black), VFD readout (VT323, VFD Cyan, no
  glow) showing the focused tape's full title, one functional EJECT button
  plus an icon-only sound toggle. No decorative dead controls.
- Sound toggle: icon-only chassis button beside EJECT — speaker glyph in
  silkscreen color, waves when on, × when off. The glyph carries the state
  (plus `aria-pressed`); no glow, no accent color.
- VFD clock: 24-hour system time (HH:MM) at the right end of the readout,
  updated on the minute. Quiet — no blink (user call 2026-07-22). Hidden in
  the collapsed mobile playing strip.
- Slot flap tips open (transform only, 120ms mech ease) while a tape is in
  transit.
- Attention state (NO SIGNAL): EJECT is the exit and carries a crisp 2px
  VFD-cyan outline pulsing opacity at 1.6s — never a halo; solid under
  reduced motion and while focused.

### CRT (signature)

- Ink 2 bezel (20px), screen inset with vignette + ≤6% opacity scanlines over
  prose; tracking flicker ≤400ms on state change only. All effects clipped to
  the screen plane. Idle = CRT Blue + OSD prompt; playback = Screen Black.
- Phosphor grain: desaturated turbulence tile at opacity 0.05, stepped
  through four offsets (~5 fps) — live broadcast, not damage. Static under
  reduced motion. Screen plane only, like every other effect.
- REC dot blinks at 1.2s during playback; solid under reduced motion.

### Buttons

- **Eject/chassis** (Ink 3, Silkscreen text, 4px radius, 10×18px padding):
  hover lifts to Seam Lit + Silkscreen Hi; pressed compresses 1px down.
- **OSD links** (inside screen: OSD White text, 1px OSD border, 2px radius):
  hover inverts to white fill / Screen Black text.

### Navigation

- Header: nameplate left; silkscreen label-links right (ABOUT). Active/hover:
  Silkscreen Hi + underline seam, no color change.

## Sound

Mechanical and diegetic, never ambient. Every cue is the machine answering a
user action: insert clunk (shell contact → latch → thump), eject spring, and
a fingertip tick when browsing tapes. No CRT hum, no transport whirr (built,
then cut as too much), no music, no loops of any kind.

- **Default-off, every visit.** The deck's sound toggle is the only way in,
  and the choice lasts for the visit only — never persisted, so a page load
  can never hold pre-gesture audio state. Enabling answers with a
  confirmation tick.
- **Never schedule against a stopped clock.** Cues are scheduled only on a
  running AudioContext; on a suspended one, only the latest cue is kept and
  played after resume completes. (Queued cues on a frozen clock all fire at
  once on resume and sum into one loud pop.)
- **Synthesized, not sampled.** All cues are Web Audio synthesis
  (`src/lib/sound.ts`) — zero asset files, slightly stylized rather than
  photoreal, matching the crisp-vector visual execution.
- **Quiet.** Master gain 0.5 with per-cue peaks well below it; the browsing
  tick is barely there. Sound seasons the interaction, it never announces
  itself.
- Sound is independent of `prefers-reduced-motion` — cues are
  user-initiated, not motion. The mute toggle is the control.

## Do's and Don'ts

### Do:

- **Do** keep every retro effect (scanlines, flicker, curvature, phosphor,
  static) clipped inside the CRT screen plane.
- **Do** drive cassette accent colors from project content data — the shelf's
  color story is the portfolio's color story.
- **Do** give every animated sequence a reduced-motion equivalent that swaps
  states instantly; `prefers-reduced-motion` support is non-negotiable.
- **Do** keep prose legibility above the metaphor: Screen Text ≥ 4.5:1 over
  Screen Black under all effect layers.

### Don't:

- **Don't** age anything: no grunge, sepia, dust, tape damage, or noise
  textures on chassis or content.
- **Don't** glow outside the screen: no neon edges, no glowing chassis text,
  no colored halos on hover (The One Light Rule).
- **Don't** use VT323 for chassis text or paragraphs — OSD chrome only.
- **Don't** let the chassis compete with the artifacts: no saturated fields,
  gradients, or decorative color on rack surfaces.
