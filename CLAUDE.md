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
- Crisp SVG/CSS rendering for cassettes and deck; WebGL is an optional late-stage
  enhancement, never a core dependency.
- Every animation must respect `prefers-reduced-motion`.
- Design system tokens come from `/impeccable init` (Stage 1 of the plan); follow
  them once they exist.

## Git rules

- **NEVER push unless Daniel explicitly asks.** No exceptions.
- When a push is requested, push directly to `main` (no PR workflow for now).
- Commit only when asked.

## Project rules

- **Deployment is the very last implementation stage.** Do not add deploy
  configs, CI, or hosting setup before Stage 10 of `PLAN.md`.
- Planned stack: Vite + React + TypeScript, static output, typed TS content
  modules (no CMS). See `PLAN.md` for rationale before changing this.
