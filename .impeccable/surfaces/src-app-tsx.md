---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/components/Stage.tsx", "src/components/studio/StudioScene.tsx"]
---

# Surface: Midnight Studio in three dimensions

Mode: Experience. The modeled studio leads; navigation supports exploring and reading the tapes.

Direction revised by Daniel on 2026-09-15: convert the existing personal site
into a clean, artsy, intentional low-poly 3D experience. This supersedes the
July SVG-only implementation. Normative direction: `DESIGN.md`.

Composition: compact identity header and editorial introduction, selection
guide above the orthographic 3D exhibit, the six-entry archive, GitHub/LinkedIn footer with the contact links
flush right. Every shell edge sits on the one column (the cassette mark hangs
in the gutter above 1200px); the archive entries' 12px insets are the only
inboard edges, and each entry stacks its number over its name so it has one
text edge. Arrows are drawn SVG marks spaced by flex gap, never typed glyphs. The shell carries no scene metadata,
clock, caption number, tape count, page-level sound control, or edition
marks, and the header's "The archive" link is its single visible index route
at every width. Height-aware desktop framing keeps the studio and its
selection instruction together; phones use a closer, more frontal camera
that fits every piece of equipment inside a full-bleed canvas snug to the
studio, with the shell's gutter as its margin, so the speaker and headphones
are never cropped (only the table runs out of frame).
The larger opening canvas and enlarged idle-screen message support reading
before selection. Geometry-aware framing preserves top clearance during
insertion and blends into the complete CRT and player during playback zoom.
Type is one system: Archivo at 400, 600, and 800 (page and prints alike)
and VT323 at 400. The shell renders six sizes on an 11px floor (display,
2.625rem mark, 1rem body, 0.875rem functional, 0.75rem caption, 0.6875rem
label); screen-interior type is tube-scaled. Archivo display type uses
balanced wrapping and relaxed tracking; introductory prose stays at 1rem on
every viewport. The reader aligns all content to a centered 62ch column, with
weight-400 prose, semibold taglines, and tube-scaled VT323 metadata. Every
arrow, play mark, and dot is drawn (SVG or a CSS box), never typed from a
fallback font; the Escape hint reads at 7.5:1. Scene/transport controls
provide 44px hit areas, and so does every shell link: the nameplate, both
header links, and both contact links are at least 44px tall, as hit areas
that move no word (the footer's caption-size links overhang their row by a
pixel each way). The studio contains a
beveled CRT, VCR, speaker, rack of six cassettes (blank shells in unfilled
slots), loose cassette with reels,
headphones and stand, display table, and plinth. All geometry and printed
textures are generated locally. Print is limited to the four signature marks
(status window, AV–01 model line, spine number and name, idle screen) plus one
label per working key cap; every other object is unlettered. Matte graphite,
carefully selected small details, saturated cassette accents, blue idle screen. Neutral studio fill
reveals broad planes; only the CRT emits light.
Equipment finishes share the shell, face, trim, recess, rubber, and hardware
roles in `studio/materials.ts`. The monitor and deck use the same slotted vent
plates; headphone seams, pivots, and stand fittings follow the cassette and
speaker construction, with 24-segment curves and four low stand pads.

Browse: "Choose a tape to play" explains the action before the canvas, with
a one-line instruction that says where: "Pick one in the studio." on a
desktop, and "Pick one from the archive below." at widths of 600px and
below, where the fitted rack is about 110px across, and wherever there is
no studio to pick from (no WebGL, lost graphics). The collection has one
name, the archive, in the header link, the heading it lands on, the skip
link, the status messages, and the idle tube; each tape has one spine name
and one title, the About tape ("About") included; captions are the same
words in the archive and the guide (The One Name Rule in `DESIGN.md`).
Hover/focus previews and raises a tape; click or Enter selects it. Touch
previews first: a tap lifts and names a cassette (the guide reads "Tap
again to play"), a second tap on it plays it, and every slot answers a tap
within a 44px catch about its centre, nearest centre first, blank slots
swallowing theirs (The Touch Rule in `DESIGN.md`). The
pointer target is the cassette's resting slot, fixed while the shell lifts,
so previews hand over cleanly from one slot to the next. A project slot with
nothing behind it yet holds a blank shell with no print, behind a slot
target that swallows the pointer so the tapes behind it never answer, and
its index entry is an outlined, dim "Coming soon…" text cell, not a link;
adding a project to the content list fills the next such slot (The Blank
Slot Rule in `DESIGN.md`). Internal
playback links use the drawn play mark; links that leave the site carry the
drawn outward arrow.
The view is authored: there is no drag-to-orbit and no reset, so touch
swipes scroll the page and pinch zoom remains a browser gesture. Modified
clicks retain native link navigation.
Insertion moves the actual cassette into the deck, then the camera faces the
screen. A skip control completes the transition. Eject runs the same
mechanism back to the rack, from wherever the tape is, while the camera
returns to browse; the deck and the tube read EJECT meanwhile, the tube
over the returning tape's name with no invitation (The One Readout Rule in
`DESIGN.md`). Both are one soft zoom
(The Soft Zoom Rule in `DESIGN.md`): the studio's box keeps its place on the
page, the canvas detaches over the viewport transparently and is sized in
the same commit, the camera keeps the studio where the box had it and grows
its frame to the viewport while the page chrome dissolves, and on eject the
frame shrinks back into the box as the chrome returns before the canvas
rejoins the page; no frame shows a jump either way. Reduced motion is
immediate both ways.

Read: accessible HTML inside the modeled CRT when the viewport is wider than
767px and taller than 699px; where the playback zoom would draw the 560px
reader plane smaller, the plane is enlarged and its content shrunk to match,
so the 16px prose floor is real on 1280 × 720 and 1366 × 768 laptops (The
Tube-Scale Rule in `DESIGN.md`). A bottom fade marks the article's
continuation until its end is in view, and the scrollbar thumb reads 3.5:1
on the tube, in both readers. At widths up to 767px or heights up to 699px, use
a full-height native CRT reader with a 16px prose floor, scaling to 18px.
Direct project links and tape selections before graphics are ready use this
reader immediately at every viewport size. It stays pinned only until the
scene is ready: on a desktop viewport the modeled studio then takes over in
one 560ms dissolve, with the tape already seated and the deck live, the
article continuing at the same scroll depth and focus (The Handoff Rule in
`DESIGN.md`); on narrow or short viewports the same reader continues under
the viewport rule. If graphics fail, it stays for the visit with focus and
scroll untouched. Ejecting returns to the studio; a subsequent selection uses
the normal viewport rule.
The explicit fullHeight prop/class sizes this reader independently of viewport
CSS. Playback controls are physical keys on the modeled player: sound at the
left with clearance inside its fascia, and eject at the right. Each cap carries
one printed uppercase Archivo label (EJECT led by the drawn eject mark) that
is identical in browse and playback and moves with the press; during playback an invisible native button over the
cap carries the accessible name, pressed state, and focus ring, sized to the
cap with a 44px floor. Sound state reads in the deck's status window beside
the transport state as a drawn speaker mark (waves when on, a red slash when
off), not on the key. Keys are interactive only after insertion
ends. Selection sizes the canvas to the viewport in the same commit and eases
the studio's frame out to it; the studio renders at pixel ratio 2 during
modeled playback.
Skip animation is a hardware key of the native deck family, led by a drawn
skip mark, at the viewport's lower right during insertion, or inside the
native loading screen. The playback camera keeps
both CRT and deck in view. The native reader integrates these actions into
its lower hardware panel, respecting the bottom safe area. There is no
page-wide playback footer.
Missing WebGL and lost graphics
contexts retain the entire archive and reader. Deep links, About, both 404
states, Escape/eject, and focus return remain supported. Every screen state
has a rule of its own: NO SIGNAL is a lit tube, under playback's bloom and
cast in the HTML readers and playback's phosphor light on the modeled deck.
The tube says whose archive is playing: the OSD's top bar reads PLAY, the
station ident (DANIEL ALYOSHIN, centred, screen-soft), and the tape's
reading time (1 MIN READ, derived from its copy; the word gives way below
19.5rem of tube and the field below 15.5rem, never the name), in both
readers, so the name is there in a deep link's first second, through
the handoff, and on a phone; NO SIGNAL carries the ident alone and prints
its exit beneath the reason (PRESS ESC OR EJECT TO RETURN; the deck's key
alone at 600px and below). Nothing of the shell is pinned over the studio
(The Ident Rule in `DESIGN.md`). Every readout is true or absent: no tape
speeds, invented runtimes, head counts, or stereo claims on the tube, the
deck (AV–01 / VHS), or the idle screen, and a screen reader gets the
reading time from the article's meta line (The True Readout Rule). Both
Eject keys are named "Eject tape" and declare Escape as a shortcut; the ESC
legend is not part of the name.

Share: every route names itself in the document title ("Placeholder: Alpha —
Daniel Alyoshin", "About — Daniel Alyoshin", "No signal — Daniel Alyoshin";
the home title is `index.html`'s). `index.html` carries Open Graph and
Twitter large-image tags over `public/social-card.png`, a 1200 × 630 render
of the studio itself with no copy set on it (`npm run render:card`); the
build makes its URL absolute from `SITE_URL`, which is a Stage 10 decision.

Accessibility: all tapes are ordinary links; arrows and Home/End move focus.
During reading, background regions are inert and aria-hidden; focus remains
inside the reader and transport. Skip holds focus for the insertion. Every
exit lands focus in sight (The Way Back Rule in `DESIGN.md`): on the played
tape's index entry, or on the nameplate after NO SIGNAL; when the browser
rings it, the entry is brought into view, 24px clear of the edge, in the
closing commit while the chrome is still dissolved, and a pointer exit
leaves the page where it was. A press in the studio takes focus onto the
studio's layer, so script focus after a mouse selection is never ringed. The named scrollable article is a Tab stop,
allowing return from the transport controls; initial focus announces the title.
About remains explicit in its archive link's accessible name. Sound is opt-in,
synthesized, per-visit, and toggled only on the deck (modeled key during
playback, native reader panel otherwise); browse has no sound control.
Reader contact links have separate 44px touch targets. No ambient animation or
sound; the canvas renders on demand. Printed textures redraw after explicit
Archivo and VT323 loading, with disposed textures excluded. The studio loads,
plays, and ejects with a clean console: its module drops React Three Fiber's
THREE.Clock deprecation line by exact text and passes every other three.js
message through.

Unresolved: real project content and Daniel's About rewrite (Stage 8), full
Stage 9 hardening, and final-stage deployment. No fabricated project claims.
