# CLAUDE.md

Personal portfolio site for Daniel Alyoshin, themed around VHS-era technology.
Projects are presented as selectable VHS cassettes; picking one plays its details
on a CRT-styled display. Full staged plan lives in `PLAN.md` — consult it before
starting work and keep it updated as stages complete or decisions change.

## Design direction (non-negotiable)

- **Modern-clean execution, retro objects** — the Zenless Zone Zero mix. The site
  must look contemporary and stylized even though it depicts old technology.
- Never make the site look _aged_: no grunge, sepia, dirt, or degraded textures.
- Retro effects (scanlines, tracking flicker, phosphor glow) are diegetic — they
  live inside the CRT screen area only, never on the page chrome.
- **Low-poly 3D studio** (Daniel, 2026-09-15): modeled cassettes, CRT, deck,
  and studio objects using Three.js + React Three Fiber. Broad planes, single
  bevels, matte materials, intentional small details; never pixelated or realistic.
  This supersedes the earlier SVG-only / no-WebGL decision. Keep project content
  in accessible HTML, with a complete reader when WebGL is unavailable.
- Every animation must respect `prefers-reduced-motion`.
- The design system is recorded in `DESIGN.md` ("Midnight Studio"; tokens in
  `src/styles/tokens.css`, sidecar in `.impeccable/design.json`). Follow it —
  especially The One Light Rule (only the CRT emits; neutral studio fill reveals
  geometry) and The Tube-Scale Rule
  (screen-interior type scales in `cqi` units).
- DESIGN.md's frontmatter is the source of truth for every design value.
  `tokens.css` carries the same values under the same names, the stylesheets
  read them, and `e2e/design.spec.ts` fails when any of the three disagree.
  Change a value in DESIGN.md first; never only in CSS.

## Git rules

- **NEVER push unless Daniel explicitly asks.** No exceptions.
- When a push is requested, push directly to `main` (no PR workflow for now).
- Commit only when asked.

## Project rules

- **Deployment is the very last implementation stage.** Do not add deploy
  configs, CI, or hosting setup before Stage 10 of `PLAN.md`.
- Stack: Vite + React + TypeScript + Three.js / React Three Fiber, static output,
  typed TS content
  modules (no CMS). See `PLAN.md` for rationale before changing this.

## Session guidance

- `AGENTS.md` is an exact copy of `CLAUDE.md`, created at Daniel's request.
  Keep both files in sync when changing these instructions.
- Impeccable is installed for Codex at `.agents/skills/impeccable/SKILL.md`.
  Invoke it with `$impeccable <command>`; both agents share the existing
  `PRODUCT.md`, `DESIGN.md`, and `.impeccable/` context. Setup is in `README.md`.
- Do not invent real projects or personal facts. Project tapes hold only real
  projects Daniel has supplied; an empty rack slot stays a blank "Coming soon…"
  tape, never a stand-in project.
- Verify interaction changes with `npm run test:e2e` (Playwright, Chrome),
  plus `npm run build`, `npm run lint`, and `npm run format:check`.
