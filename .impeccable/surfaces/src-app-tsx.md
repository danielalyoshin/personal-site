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
cheeks — user removed them), viewport-height-aware CRT, deck (VFD readout
with 24h system-time clock, icon-only sound toggle, EJECT), spec-line
footer with GitHub + LinkedIn (email deliberately off the site). Whole
stage in the first desktop viewport. Mobile: vertical stack, scroll-snap
rack; playing CRT pins near-fullscreen with a deck strip (VFD ellipsizes,
sound toggle + EJECT, clock hidden).

Focal moment: insert flight → seated tape edge in slot → tracking flicker →
camera dolly (~2.1×, 560ms). Deterministic, any input skips, instant under
reduced motion. Eject reverses (EJECT, Esc, browser back). Slot flap tips
open during transit.

Atmosphere (Stage 7): phosphor grain (0.05, stepped ~5 fps) + blinking REC
dot inside the screen only; quiet 24h system-time clock on the VFD (user
cut the blinking-12:00 version as too distracting). Sound: synthesized Web
Audio (insert clunk, eject spring, browsing tick — transport whirr built
then cut), default-off behind the icon-only speaker toggle (waves on, ×
off), per-visit only (persistence removed after the frozen-clock pop bug);
no CRT hum. WebGL: decided against (2026-07-22) — CSS/SVG flight is final.

States: idle = CRT-blue INSERT TAPE; playing = OSD chrome + tube-scaled
(cqi) content scrolling in-screen; deep link = pre-seated, flicker only;
404 (both dead tape slugs and unknown paths) = ZOOMED NO SIGNAL — copy
splits "THIS TAPE DOES NOT EXIST" vs "CHANNEL NOT FOUND", no on-screen
button; the exit is the deck's EJECT (enabled, pulsing VFD-cyan outline)
or Esc. Off-stage regions are inert whenever the camera is in.

A11y: roving-tabindex shelf; focus into CRT title on insert (preventScroll)
and back to the tape on eject via post-commit pending-focus refs; SR hint on
NO SIGNAL; content parity throughout. Reduced-motion: global CSS gate +
JS-gated WAAPI; all blinks end on their visible state. SFX toggle carries
aria-pressed.

Unresolved: real content + About rewrite by Daniel (Stage 8).
