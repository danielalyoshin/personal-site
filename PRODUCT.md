# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: peers in the dev/design community — design engineers, frontend
developers, and designers — typically arriving through a shared link or social
post. Their job is to evaluate Daniel's craft, get inspired, and possibly start
a conversation. A successful visit ends in recognition: the visitor shares the
site, follows Daniel's work, or reaches out.

No other audience is confirmed as a design target.

## Product Purpose

A personal portfolio site for Daniel Alyoshin. Projects are presented as
selectable VHS cassettes on a shelf; choosing one "inserts" it into a deck and
plays its details on a CRT-styled display. The site's purpose is to demonstrate
design-engineering craft — the site itself is the primary portfolio piece, and
the featured projects are supporting evidence.

## Positioning

A design engineer's portfolio where the interface is the proof of skill: an
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
- Cassettes/deck render as SVG/CSS; WebGL is an optional late enhancement,
  never a core dependency.
- Every animation must respect `prefers-reduced-motion` (hard requirement).
- Deployment is the final stage — no deploy configs, CI, or hosting setup
  before Stage 10 of `PLAN.md`.
- Terminology is diegetic where it aids the metaphor: tape, deck, insert,
  eject, OSD (on-screen display), tracking, NO SIGNAL (404).
- Undecided product facts (tracked in `PLAN.md`, not to be invented):
  whether sound exists at all and its default state. (The About treatment is
  settled: a special tape on the shelf.)

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

- No real project content yet: the featured-project list is still being
  selected, and no screenshots, recordings, or copy exist. Placeholder
  projects stand in until Stage 8 of `PLAN.md`.
- Future work must not fabricate real-seeming projects, metrics, testimonials,
  or press. Placeholders must be legible as placeholders.

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
5. **Built to be shared.** Peer recognition is the success metric, so deep
   links, fast loads, and a strong social preview are product features, not
   polish.

## Accessibility & Inclusion

- `prefers-reduced-motion` support is a non-negotiable project rule; animated
  sequences need deterministic, skippable, or instant-swap equivalents.
- Planned commitments from `PLAN.md`: full keyboard navigation of the shelf,
  focus management across the insert/eject flow, screen-reader labels that
  translate the tape metaphor, and contrast-checked tokens.
