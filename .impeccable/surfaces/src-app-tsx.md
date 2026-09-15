---
version: 1
slug: 'src-app-tsx'
primary_target: 'src/App.tsx'
related_targets:
  ['src/components/Stage.tsx', 'src/components/studio/StudioScene.tsx']
---

# Surface: Midnight Studio in three dimensions

Mode: Experience. The modeled studio leads; navigation supports exploring and reading the tapes.

Direction revised by Daniel on 2026-09-15: convert the existing personal site
into a clean, artsy, intentional low-poly 3D experience. This supersedes the
July SVG-only implementation. Normative direction: `DESIGN.md`.

Composition: compact identity header and editorial introduction, selection
guide whose first line carries the drag hint and reset above the orthographic
3D exhibit, six-tape text index, GitHub/LinkedIn footer with the contact links
flush right. Every shell edge sits on the one column (the cassette mark hangs
in the gutter above 1200px); the tape index entries' 12px insets are the only
inboard edges, and each entry stacks its number over its name so it has one
text edge. Arrows are spans spaced by flex gap. The shell carries no scene metadata,
clock, caption number, page-level sound control, or edition marks; the index
heading holds the page's only tape count, and the header's "The archive" link
is its single visible index route at every width. Height-aware desktop framing keeps the studio and its
selection instruction together; phones use a closer, more frontal camera
that fits every piece of equipment inside a full-bleed canvas snug to the
studio, with the shell's gutter as its margin, so the speaker and headphones
are never cropped (only the table runs out of frame).
The larger opening canvas and enlarged idle-screen message support reading
before selection. Geometry-aware framing preserves top clearance during orbit
and blends into the complete CRT and player during playback zoom.
Archivo display type uses balanced wrapping and relaxed tracking; introductory
prose stays at 1rem on every viewport. The reader aligns all content to a
centered 62ch column, with weight-440 prose, semibold taglines, and tube-scaled
VT323 metadata. Functional captions retain a 0.75rem floor, and scene/transport controls provide
44px hit areas. The studio contains a
beveled CRT, VCR, speaker, rack of six cassettes, loose cassette with reels,
headphones and stand, display table, and plinth. All geometry and printed
textures are generated locally. Print is limited to the four signature marks
(status window, AV–01 model line, spine number and name, idle screen) plus one
label per working key cap; every other object is unlettered. Matte graphite,
carefully selected small details, saturated cassette accents, blue idle screen. Neutral studio fill
reveals broad planes; only the CRT emits light.

Browse: "Choose a tape to play" explains the action before the canvas, with
a one-line instruction that points at the studio rather than the index.
Hover/focus previews and raises a tape; click or Enter selects it. Internal
playback links use a play symbol; external links retain the outward arrow.
Drag within constrained camera angles; reset restores the original view.
Vertical touch swipes scroll the page; horizontal drags orbit, and pinch zoom
remains a browser gesture. Modified clicks retain native link navigation.
Insertion moves the actual cassette into the deck, then the camera faces the
screen. A skip control completes the transition. Reduced motion is immediate.

Read: accessible HTML inside the modeled CRT when the viewport is wider than
767px and taller than 699px. At widths up to 767px or heights up to 699px, use
a full-height native CRT reader with a 16px prose floor, scaling to 18px.
Direct project links and tape selections before graphics are ready use this
reader immediately at every viewport size. It stays mounted through graphics
loading or failure, preserving focus and scroll for the playback visit. Ejecting
returns to the studio; a subsequent selection uses the normal viewport rule.
The explicit fullHeight prop/class sizes this reader independently of viewport
CSS. Playback controls are physical keys on the modeled player: sound at the
left with clearance inside its fascia, and eject at the right. Each cap carries
one printed uppercase Archivo label that is identical in browse and playback
and moves with the press; during playback an invisible native button over the
cap carries the accessible name, pressed state, and focus ring, sized to the
cap with a 44px floor. Sound state reads in the deck's status window beside
the transport state, not on the key. Keys are interactive only after insertion
ends. Selection sizes the canvas to the viewport and refits the studio before
the tape moves; the studio renders at pixel ratio 2 during modeled playback.
Skip animation is a plain underlined interface action
at the viewport's lower right during insertion, or inside the native loading
screen. The playback camera keeps
both CRT and deck in view. The native reader integrates these actions into
its lower hardware panel, respecting the bottom safe area. There is no
page-wide playback footer.
Missing WebGL and lost graphics
contexts retain the entire archive and reader. Deep links, About, both 404
states, Escape/eject, and focus return remain supported.

Accessibility: all tapes are ordinary links; arrows and Home/End move focus.
During reading, background regions are inert and aria-hidden; focus remains
inside the reader and transport. The named scrollable article is a Tab stop,
allowing return from the transport controls; initial focus announces the title.
About remains explicit in its archive link's accessible name. Sound is opt-in,
synthesized, per-visit, and toggled only on the deck (modeled key during
playback, native reader panel otherwise); browse has no sound control.
Reader contact links have separate 44px touch targets. No ambient animation or
sound; the canvas renders on demand. Printed textures redraw after explicit
Archivo and VT323 loading, with disposed textures excluded.

Unresolved: real project content and Daniel's About rewrite (Stage 8), full
Stage 9 hardening, and final-stage deployment. No fabricated project claims.
