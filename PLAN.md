# Implementation Plan — VHS Personal Site

A personal portfolio themed around VHS-era technology. Projects are presented as
individual VHS cassettes on a shelf; selecting a tape "inserts" it into a deck and
plays the project's details on a CRT-styled display.

**Aesthetic north star:** modern, clean, stylized execution with retro _objects_ —
the Zenless Zone Zero approach. The site must never look aged. Retro lives in the
subject matter (tapes, deck, CRT, on-screen-display text), not in grunge, sepia,
noise-everywhere, or degraded textures. Crisp vectors, confident color, precise
motion.

---

## Recommended stack (open to revision)

- **Vite + React + TypeScript** — the site is one interactive app, so an SPA fits
  better than a content framework like Astro/Next. Static output, deployable
  anywhere at the end.
- **Cassettes and deck as SVG/CSS components** with CSS 3D transforms for depth —
  crisp at every size, fully styleable by the design system, accessible, and far
  more maintainable than WebGL. Real three.js 3D was deferred to Stage 7 and
  there decided against (2026-07-22): the CSS/SVG version is final.
- **CRT effects as layered CSS/canvas inside the screen area only** — scanlines,
  phosphor glow, and a brief "tracking" flicker on tape insert, kept restrained
  and diegetic (confined to the CRT screen, never applied to the page chrome).
- **Project content as typed TS data modules** — no CMS; each project is a data
  file plus media assets.

---

## Stages

### Stage 0 — Foundations & scaffold ✅ (2026-07-22)

- ✅ Scaffold Vite + React + TS; ESLint + Prettier; folder structure
  (`src/components`, `src/content`, `src/styles`, `src/lib`).
  Note: the current create-vite template ships oxlint; swapped for ESLint
  (flat config + typescript-eslint + react-hooks/react-refresh plugins) +
  Prettier per this plan. Versions: Vite 8, React 19, TS 6.
- ✅ Base `index.html` (lang, meta description, title), font-loading
  placeholder comment; neutral placeholder favicon (real one in Stage 9).
- ✅ 3 placeholder projects (`src/content/projects/`) with a minimal
  `Project` type (`src/content/types.ts`) — Stage 2 expands the schema.
- ✅ Verified: dev server serves, `npm run build` (tsc + vite) passes,
  lint and format checks clean.

### Stage 1 — Design system ✅ (2026-07-22)

- ✅ `/impeccable init` run: product context captured in `PRODUCT.md`
  (audience: dev/design peers; positioning: design engineer — the site
  itself is the proof).
- ✅ Visual world settled and recorded: **"Midnight Studio"** in `DESIGN.md`
  (+ `.impeccable/design.json` sidecar). Faces: Archivo Variable (chassis,
  width axis) + VT323 (OSD, inside the tube only). Named rules: One Light,
  Artifact Color, Silkscreen, Tube-Scale.
- ✅ Tokens encoded as CSS custom properties in `src/styles/tokens.css`.

### Stage 2 — Content model ✅ (2026-07-22, as part of core-experience build)

- `Project` schema: slug, title, tagline, description, year, role, tech tags,
  links (repo/live), media (images/video).
- VHS presentation fields per project: spine label text, label design variant,
  accent color, and flavor metadata ("runtime", "recorded" date) for the OSD.
- Typed TS modules in `src/content/projects/`; media co-located.

### Stage 3 — App shell & layout ✅ (2026-07-22)

- Responsive shell: minimal header, main stage (shelf + deck/CRT), footer.
- Routing: `/` for the shelf, `/project/:slug` for a selected tape — deep-linkable
  and shareable, while visually remaining one continuous stage.
- Accessibility skeleton: landmarks, focus-management plan,
  `prefers-reduced-motion` plumbing that every animation must respect.

### Stage 4 — The VHS shelf (project browser) ✅ (2026-07-22)

- Parameterized cassette component (SVG): spine + face, label variants, accent
  color driven by project data.
- Shelf/rack layout: hover slides a tape out slightly; clear focus states; full
  keyboard navigation (arrow keys between tapes, Enter to select).
- Responsive behavior: mobile becomes a swipeable rack or vertical stack.

### Stage 5 — Tape → deck → CRT sequence ✅ (2026-07-22)

- Selection animation: tape lifts off the shelf, travels, inserts into the VCR
  slot. Deterministic timeline, skippable, and instant-swap under reduced motion.
- CRT display component: subtle curvature, scanlines, phosphor glow, brief
  tracking flicker on load — all tasteful and confined to the screen.
- Project details rendered "on screen": description, media gallery, tech tags,
  links, with OSD-style chrome (PLAY ▶, counter, date stamp). Eject to return.

### Stage 6 — Supporting content ✅ (2026-07-22)

- ✅ About as a special tape (copy is a generic draft; Daniel rewrites it in
  Stage 8's content pass).
- ✅ Contact links: GitHub + LinkedIn in footer and on the About tape; email
  deliberately removed from the site (2026-07-22).
- ✅ 404: both cases (dead tape slug / unknown path) zoom into the CRT's
  NO SIGNAL screen with distinct copy; exit is the deck's EJECT (enabled,
  pulsing VFD outline) or Esc — no on-screen button.

### Stage 7 — Motion & atmosphere polish ✅ (2026-07-22)

- ✅ Ambient details: deck clock at the right end of the VFD showing 24h
  system time, updated on the minute (a blinking 12:00 was built first and
  cut as too distracting — Daniel, 2026-07-22; hidden in the collapsed
  mobile playing strip); subtle stepped phosphor grain inside the CRT screen
  only (desaturated feTurbulence tile, opacity 0.05, ~5 fps; static under
  reduced motion); blinking REC dot in playback OSD; slot flap tips open
  while a tape is in transit.
- ✅ Sound (decisions settled at stage start, see below): synthesized in Web
  Audio (`src/lib/sound.ts`, zero assets) — insert clunk, eject spring,
  browsing tick per newly previewed tape (a transport whirr was built and
  removed on Daniel's review). Default-off behind the deck's icon-only
  sound toggle (speaker glyph: waves on, × off; `aria-pressed`); the choice
  is per-visit — persistence was removed (Daniel, 2026-07-22) after a bug
  where a persisted-on refresh queued hover ticks against the suspended
  AudioContext's frozen clock and released them all at once on first
  activation (one very loud pop). Fixed structurally (no persistence) and
  at the root: cues are never scheduled on a non-running context; a
  suspended context keeps only the latest cue and plays it post-resume.
  Disabling suspends the context.
- ✅ WebGL: decided **no** — the CSS/SVG flight holds up; three.js would add
  weight and complexity for marginal gain (decision 4 closed).
- ✅ Reduced-motion audit: global CSS gate (0.01ms + single iteration,
  `!important` — also covers the dolly's inline transitions) collapses all
  CSS animation; every blink keyframe ends on its visible state; WAAPI
  flights JS-gated to instant swaps. Verified via Playwright with
  `reducedMotion: 'reduce'` (desktop + mobile, no overflow, no errors).
  Sound is deliberately independent of reduced motion: no ambient loops,
  every cue answers a user action.

### Stage 8 — Real content pass

- Replace placeholders with real projects: copywriting, screenshots/recordings,
  per-project label art.

### Stage 9 — Hardening: performance, accessibility, SEO

- Lighthouse pass; image optimization; code-splitting if warranted.
- A11y audit (contrast against the design tokens, alt text, focus order,
  screen-reader labels for the tape metaphor).
- Meta/OG tags, social card image, favicon (VHS glyph).

### Stage 10 — Deployment (LAST, per project rules)

- Choose host (GitHub Pages / Vercel / Netlify / Cloudflare Pages) and wire the
  build. No deploy config or CI before this stage.
- Nothing is pushed at any stage unless Daniel explicitly asks; pushes go
  directly to `main` when asked.

---

## Open decisions (flagged, not blocking)

1. ~~**Light vs dark base**~~ — ✅ Settled (2026-07-22, `/impeccable shape`):
   **dark** — "Midnight studio" rendition. Matte graphite chassis like
   high-end AV gear in a dim edit suite; the CRT is the page's light source;
   color arrives only through cassette spines/labels and the CRT. Guardrails:
   matte materials, no neon wash, no glow outside the CRT's controlled cast.
2. ~~**Sound**~~ — ✅ Settled (2026-07-22, Stage 7 start): **in,
   default-off** behind the deck's visible sound toggle. Final palette:
   insert clunk + eject and UI ticks; transport whirr built then cut on
   review; CRT hum deliberately excluded. Source: synthesized Web Audio,
   no asset files.
3. ~~**About treatment**~~ — ✅ Settled (2026-07-22, `/impeccable shape`):
   **special labeled tape on the shelf**, alongside 4–6 project tapes
   (shelf designed around 4–6 projects, one row).
4. ~~**WebGL upgrade**~~ — ✅ Settled (2026-07-22, Stage 7): **no** — the
   CSS/SVG flight is crisp and deterministic; three.js would be weight
   without payoff. Closed, not deferred.
