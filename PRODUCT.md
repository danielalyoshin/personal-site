# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: people weighing Daniel as a forward deployed engineer (engineers,
hiring teams, and the clients such a role builds for), typically arriving
through a shared link or social post. Their job is to judge whether he can
plan a system, build it, and explain it to the people it serves. A successful
visit ends in a conversation: the visitor reaches out, shares the site, or
follows Daniel's work.

No other audience is confirmed as a design target.

## Product Purpose

A personal portfolio site for Daniel Alyoshin. Projects are presented as
selectable VHS cassettes on a shelf; choosing one "inserts" it into a deck and
plays its details on a CRT-styled display. The site's purpose is to show how
Daniel plans, builds, and explains a system: the site itself is the primary
portfolio piece, and the featured projects are supporting evidence.

## Positioning

A forward deployed engineer's portfolio where the interface is the proof of
skill: an
interactive VHS-deck experience executed with modern, crisp web craft rather
than nostalgic pastiche. The claim a neighboring portfolio could not truthfully
copy is the fully diegetic physical-media metaphor — browse cassettes, insert a
tape, read the project on the CRT — built to contemporary visual and
accessibility standards.

## Operating Context

- Visitors browse casually on desktop and mobile, often from a shared link with
  no prior context; the site must land its concept in the first viewport.
- Interaction model (per `PLAN.md`): shelf of cassettes at `/`, deep-linkable
  project playback at `/project/:slug`, eject to return. Deep links are
  first-class because sharing is the success metric.
- Content is maintained by Daniel directly in the repository as typed
  TypeScript modules with co-located media — no CMS, no backend.

## Capabilities and Constraints

- Stack: Vite + React + TypeScript, static output. SPA; no server runtime.
  See `PLAN.md` for rationale before changing.
- A real low-poly studio renders with Three.js / React Three Fiber. Daniel
  requested this revision on 2026-09-15, superseding the July SVG-only decision.
  Accessible HTML navigation and reading remain usable without WebGL.
- Every animation must respect `prefers-reduced-motion` (hard requirement).
- Sound exists: synthesized mechanical cues only. On by default (Daniel,
  2026-09-30; it was default-off from 2026-07-22), silent until the
  visitor's first gesture, with a quiet sound key at the page's top right
  that hands over to the deck's key while a tape plays; a mute is
  remembered in the browser. Doctrine in `DESIGN.md` § Sound toggle.
- Hosting: GitHub Pages at `alyoshin.dev`, published by
  `.github/workflows/deploy.yml` on every push to `main` (Stage 10 of
  `PLAN.md`).
- Terminology is diegetic where it aids the metaphor: tape, deck, insert,
  eject, OSD (on-screen display), tracking, NO SIGNAL (404).
- No undecided product facts remain; Stages 0–9 of `PLAN.md` are complete
  and deployment (Stage 10) is the open work.

## Brand Commitments

- Name: Daniel Alyoshin. No logo or wordmark exists yet.
- Contact channels on the site: GitHub and LinkedIn (`danielalyoshin`) only.
  Email is deliberately excluded from the shipped site (user decision,
  2026-07-22) — do not re-add it.
- Binding visual constraint (user-set, recorded verbatim in scope): VHS-era
  technology as subject matter with **modern-clean execution** — the site must
  look contemporary and stylized, never aged; no grunge, sepia, dirt, or
  degraded textures; retro effects live only inside the CRT screen area
  (diegetic), never on page chrome.

## Evidence on Hand

- One real project: Cloudflare D1 in Apache Superset. The four project slots
  without one hold blank tapes marked "Coming soon…" until Daniel adds a
  project.
- Future work must not fabricate real-seeming projects, metrics, testimonials,
  or press. An unfilled slot must read as unfilled: a blank tape, never a
  stand-in project.

## Product Principles

1. **The site is the portfolio piece.** Execution quality of the interface is
   the primary evidence of skill; it outranks project quantity.
2. **Metaphor serves comprehension.** The VHS conceit aids navigation and
   delight but never obstructs reading or understanding a project; when they
   conflict, comprehension wins.
3. **Honest content only.** Nothing invented — no fake projects, numbers, or
   endorsements. Absences stay absent until real content lands.
4. **Accessible parity.** Keyboard, screen-reader, and reduced-motion users
   get the full content and a coherent experience, not a degraded fallback of
   the metaphor.
5. **Built to be shared.** A visitor reaching out or passing the link on is
   the success metric, so deep links, fast loads, and a strong social preview
   are product features, not polish.

## Accessibility & Inclusion

- `prefers-reduced-motion` support is a non-negotiable project rule; animated
  sequences need deterministic, skippable, or instant-swap equivalents.
- Planned commitments from `PLAN.md`: full keyboard navigation of the shelf,
  focus management across the insert/eject flow, screen-reader labels that
  translate the tape metaphor, and contrast-checked tokens.
