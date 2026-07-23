---
version: 1
slug: 'src-app-tsx'
primary_target: 'src/App.tsx'
related_targets: ['src/components/Stage.tsx']
---

# Surface: Core experience — continuous stage (/, /project/:slug, 404)

Mode: Experience. The stage (shelf · deck · CRT) is the work; chrome recedes.

Audience & job: dev/design peers from shared links, lit room, desktop or
mobile. Get the concept in seconds, play a tape, want to share it.

Direction: "Midnight Studio" (user-chosen 2026-07-22 over the light-chassis
recommendation; now the committed world in DESIGN.md). Matte graphite AV
rack; CRT is the only light source; color only via cassette labels + screen
output. Guardrails: matte, no neon wash, no glow outside the screen's cast.

Composition (as built): 880px centered column — nameplate header, shelf of
5 placeholder tapes + About tape (single row, board hugs the rack, no side
cheeks — user removed them), viewport-height-aware CRT, deck (VFD readout,
EJECT), spec-line footer with GitHub + LinkedIn (email deliberately off the
site). Whole stage in the first desktop viewport. Mobile: vertical stack,
scroll-snap rack; playing CRT pins near-fullscreen with a deck strip.

Focal moment: insert flight → seated tape edge in slot → tracking flicker →
camera dolly (~2.1×, 560ms). Deterministic, any input skips, instant under
reduced motion. Eject reverses (EJECT, Esc, browser back).

States: idle = CRT-blue INSERT TAPE; playing = OSD chrome + tube-scaled
(cqi) content scrolling in-screen; deep link = pre-seated, flicker only;
404 (both dead tape slugs and unknown paths) = ZOOMED NO SIGNAL — copy
splits "THIS TAPE DOES NOT EXIST" vs "CHANNEL NOT FOUND", no on-screen
button; the exit is the deck's EJECT (enabled, pulsing VFD-cyan outline)
or Esc. Off-stage regions are inert whenever the camera is in.

A11y: roving-tabindex shelf; focus into CRT title on insert (preventScroll)
and back to the tape on eject via post-commit pending-focus refs; SR hint on
NO SIGNAL; content parity throughout.

Unresolved: sound (Stage 7), WebGL (Stage 7), real content + About rewrite
by Daniel (Stage 8).
