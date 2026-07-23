---
version: 1
slug: 'src-app-tsx'
primary_target: 'src/App.tsx'
related_targets: ['src/components/Stage.tsx']
---

# Surface: Core experience — continuous stage (/, /project/:slug)

Mode: Experience. The stage (shelf · deck · CRT) is the work; chrome recedes.

Audience & job: dev/design peers from shared links, lit room, desktop or
mobile. Get the concept in seconds, play a tape, want to share it.

Direction: "Midnight Studio" (user-chosen 2026-07-22, beats prior light-chassis
recommendation). Matte graphite AV rack; CRT is the only light source; color
only via cassette labels + screen output. Guardrails: matte, no neon wash,
no glow outside the screen's cast.

Composition: one centered stage — nameplate header, shelf of 4–6 project
tapes + 1 About tape (single row), CRT with deck beneath, footer spec line;
whole stage in first desktop viewport. Mobile: vertical stack, scroll-snap
tape rack, playing CRT pins near-fullscreen with compact deck strip.

Focal moment: insert sequence — tape lifts, flies to slot, seats; tracking
flicker; camera dollies to CRT (~1.15s, deterministic, skippable, instant
under reduced motion). Eject reverses (deck button, Esc, browser back).

States: idle CRT = blue INSERT TAPE screen (teaches interaction); playing =
OSD chrome + scrollable content in screen; deep link = pre-inserted tape,
flicker only; unknown slug = NO SIGNAL; reduced-motion swaps throughout.

A11y: shelf = list of links, roving tabindex arrows; focus into CRT heading
on insert, back to tape on eject; content parity for screen readers.

Unresolved: sound (Stage 7), WebGL upgrade (Stage 7), real content (Stage 8).
