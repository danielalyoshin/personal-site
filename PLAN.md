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
- **Three.js + React Three Fiber / Drei** for a modeled low-poly studio.
  Daniel explicitly requested real 3D on 2026-09-15, superseding the July
  SVG-only decision. Objects use procedural geometry and printed canvas
  textures, with no remote model or texture services. The scene loads in a
  separate chunk and renders on demand. React is pinned to 19.2.8 within
  the renderer's supported peer range.
- **Accessible HTML content and navigation** remain independent of WebGL.
  Desktop reading sits on the actual modeled screen; phones use a full-height
  CRT reader. Missing WebGL or a lost graphics context uses the HTML reader.
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
- ✅ Codex setup (2026-09-15): installed Impeccable 4.0.2 in
  `.agents/skills/impeccable/`, matching Claude's installed revision
  `d272b9bd5dcfcb52d32482d192d06045ca31c503`. Added project hooks in
  `.codex/hooks.json` and usage instructions in `README.md`. Both agents share
  the established product/design context. Codex requires native `/hooks` trust
  review before automatic design checks run.
  Verified Codex discovers the enabled repository skill, existing context loads,
  both hooks run from a subdirectory, and build/lint/format checks pass.
- ✅ Codex hook compatibility (2026-09-15): added a repository-owned Stop
  adapter that translates Impeccable 4.0.2 findings into Codex's continuation
  format. Kept the vendored skill and after-edit entry point unchanged.
  Added isolated regression coverage for findings, clean passes, cache
  deduplication, repeated-Stop protection, disabled hooks, and malformed input.
  Validation: all six hook tests, the configured command from `src/components`,
  build, ESLint, and formatting passed. Activation requires Daniel to review
  and trust the changed Stop definition in Codex's `/hooks` interface.

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

### 3D studio conversion — user-directed revision (2026-09-15)

Daniel requested a branch converting the existing 2D portfolio to a clean,
artsy, intentional low-poly 3D site. This overrides the earlier Stage 7 decision
against WebGL; the July entries below remain a record of the original build.

- ✅ Branch: `feat/low-poly-studio`; `CLAUDE.md` duplicated to `AGENTS.md`.
- ✅ Reviewed the routing, content schema, original tape choreography, design
  system, accessibility handling, synthesized sound, and remaining content work.
- ✅ Built procedural beveled CRT, deck, cassettes with three label variants,
  tape rack, loose cassette with reels, speaker, headphone stand, and plinth.
- ✅ Composed an orthographic three-quarter studio with matte graphite materials,
  directional fill, real shadows, and a controlled blue screen cast.
- ✅ Added constrained drag-to-orbit and reset; modeled tapes answer hover/focus
  and insert into the deck. Camera moves to a front-facing reading position.
- ✅ Preserved all six tapes, routes, About and contact links, Escape/eject,
  focus return, keyboard archive navigation, and default-off sound.
- ✅ Native readable HTML on the desktop screen; full-height reading on phones;
  no-WebGL / context-loss fallback. Reduced motion skips flights and interpolation.
- ✅ Editorial shell and six-item tape index; placeholder status stays explicit.
- ✅ Lazy-loaded scene, on-demand rendering, capped device pixel ratio, local
  textures, and resource cleanup. Added browser regression coverage.
- Validation: build, ESLint, formatting, desktop/mobile visual review, and
  Playwright checks. See `README.md` for commands and current coverage.
- No commit, push, deployment config, CI, or hosting changes were made.

#### 3D object and insertion corrections (2026-09-15)

- ✅ Rebuilt the VHS player below the CRT with a cassette-sized opening,
  hollow chassis, recessed bay, hinged flap, and distinct transport controls.
- ✅ Tape motion lifts and pulls clear of the archive, turns flat in front of
  the table, aligns with the slot, then slides fully inside. Tapes remain
  modeled in the bay, with enough depth for the flap to close without clipping.
- ✅ One render-driven timeline controls the tape, flap, and playback handoff;
  removed the independent timeout that could cut insertion short. Skip,
  reduced motion, deep links, and eject retain immediate completion/return.
- ✅ Refined headphones with an elliptical padded headband, oval shells,
  recessed ear cushions, yokes, and a weighted stand with a padded support.
- ✅ Extended the front tabletop and moved the decorative cassette into its
  own space, clear of the rack and the animated project cassettes.
- ✅ Kept hover at the cassette's actual size and orientation so neighboring
  tapes stay clear while lifting and pulling forward.
- Validation: desktop and narrow-phone visual review; all 9 Chrome tests,
  production build, ESLint, and formatting passed. Geometry regression checks
  cover all six cassette paths, slot fit, physical occlusion, skip, interrupted
  loading, and reduced-motion changes.

#### Headphone refinement (2026-09-15)

- ✅ Replaced the protruding rectangular earcup forks with compact, tapered
  mounts with rounded ends and smaller, seated pivots.
- ✅ Aligned the padded headband with the mounts, seated the outer earcup
  panels closer to their shells, and shaped the stand's padded cradle to fit
  the underside of the band.
- Scope: headphone assembly only; retained the clean, matte low-poly finish.
- Validation: front, side, rear, and three-quarter close-ups; desktop and
  390px/320px phone visual review; all 9 Chrome tests, production build,
  ESLint, and formatting passed.

#### Design documentation refresh (2026-09-15)

- ✅ Refreshed `DESIGN.md` from the current 3D implementation using the eight
  canonical sections, preserving Midnight Studio and its four named rules.
- ✅ Regenerated `.impeccable/design.json` with current typography, colors,
  motion, breakpoints, and ten HTML/CSS component previews. Removed obsolete
  deck/VFD examples and recorded the remaining fixed-size OSD type exception.
- ✅ Recorded Experience mode in the existing surface brief.
- Scope: design documentation and panel examples; application code is unchanged.
- Validation: desktop/mobile computed-style sampling and all ten component
  previews in Chrome, including hover, keyboard focus, and reduced motion;
  document parsing, token references, narrative consistency, build, ESLint,
  formatting, and a clean doctor report.

#### Critique follow-up — all five priorities (2026-09-15)

- ✅ Prioritized the opening studio: compact header and introduction, readable
  selection guidance and controls above the canvas, viewport-height-aware
  desktop framing, and a closer phone camera centered on the CRT and tape rack.
- ✅ Made the article a named keyboard focus stop, reachable again after
  visiting playback controls; kept the initial heading announcement.
- ✅ Extended the full-height reader to viewports up to 767px wide or 699px
  high, with a 16px prose floor and matching fallback behavior.
- ✅ Enlarged functional instructions, tape disclosures, contact links, and
  transport labels; allowed tape labels to wrap and equalized each index row.
  Scene controls now have 44px targets, and transport reserves safe-area space.
- ✅ Clarified selection as one action and reserved external-link arrows for
  external destinations. Preserved About in its accessible name and aligned
  missing-tape recovery text and screen-heading focus styling.
- Updated the design documentation and surface brief; retained all content,
  placeholder truth, sound defaults, reduced motion, and the 3D object designs.
- Validation: all 10 Chrome tests, production build, ESLint, and formatting
  passed; bounded desktop/phone/tablet and fallback visual review. Final layout
  scan: no findings.
  Stage 8 content and the remaining Stage 9 hardening remain open.

#### Interaction and loading hardening (2026-09-15)

- ✅ Restored native vertical touch scrolling over the studio while preserving
  horizontal orbit, tape taps, and browser pinch zoom.
- ✅ Canvas textures explicitly load Archivo and VT323, redraw live labels and
  previews after fonts settle, and request an on-demand frame. Disposed maps
  stay released, including during React StrictMode effect replay.
- ✅ Header About preserves modified-click navigation; ordinary clicks retain
  tape playback. Reader contact links now have 44px minimum targets.
- ✅ Direct project links and archive selections made before graphics are
  ready open a full-height HTML reader immediately. The same article stays
  mounted through scene loading or failure, preserving focus and scroll.
  Browser history also restores the reader while graphics are still pending.
  Ejecting returns to the studio, where ready-scene selections use the modeled
  CRT at desktop sizes.
- Updated the design documentation, component preview, surface brief, and
  browser regression coverage.
- Validation: all 17 Chrome tests, production build, ESLint, and formatting
  passed. Desktop and phone viewport review confirmed both reading modes and
  contact targets. Holding the scene module previously left zero articles;
  it now leaves one readable article before graphics are ready. No controlled
  speed benchmark or Core Web Vitals improvement is claimed.

#### Camera framing and opening readability (2026-09-15)

- ✅ Enlarged the opening canvas and moved to a more frontal desktop view;
  increased the idle CRT message and split its selection instruction over two
  readable lines. Phones retain the CRT and tape rack as their primary subjects.
- ✅ Replaced fixed zoom ratios with a fit based on projected equipment bounds,
  preserving headroom during orbit, cassette insertion, and viewport changes.
  Playback blends into the complete CRT chassis bounds so its top stays visible
  during the turn and zoom. Reset, skip, and reduced motion use the same fit.
- Added Chrome regressions for initial screen size, orbit limits, intermediate
  animation frames, playback resizing, and eject; updated design documentation.
- Validation: all 19 Chrome tests, production build, ESLint, and formatting
  passed. Desktop and 390px/320px phone visual review confirmed opening
  readability and top clearance; layout scan returned no findings.

#### Speaker, holder, and cassette fidelity (2026-09-15)

- ✅ Matched the established CRT, player, and headphone construction: matte
  graphite, broad planes, single bevels, and selective fitted details.
- ✅ Rebuilt the speaker with recessed cones, shaped surrounds and dust caps,
  an inset baffle, driver fasteners, rear connections, and isolating feet.
- ✅ Replaced the block holder with symmetric sloped sides, individual guide
  channels, numbered bays, a rear stop, retaining lip, and fitted hardware.
- ✅ Shared one cassette model across all six project tapes and the loose tape:
  reel-window openings, winding rings, toothed hubs, readable face labels,
  molded ribs, housing seams, edge guards, and underside detail. Preserved
  all three spine-label variants and the existing content-owned accents.
- ✅ Merged repeated ribs, teeth, and fasteners within each assembly. Kept
  demand rendering, generated-resource cleanup, and reduced-motion behavior.
- ✅ Raised the initial insertion lift to clear the thicker shared loose-tape
  model and extended the transport regression to check each holder component.
- Validation: all 19 Chrome tests, production build, ESLint, and formatting
  passed. Desktop/tablet/390px/320px and front/rear object close-ups reviewed;
  all six cassettes clear the holder, loose tape, and player during insertion.

#### Physical player controls (2026-09-15)

- ✅ Removed the bottom playback popup and moved sound, eject, and the
  loading-only skip action onto the modeled VHS player's front panel.
- ✅ Replaced decorative transport keys with beveled working caps, a clearer
  status window, printed labels, hover/press feedback, and native keyboard
  buttons that follow the geometry with 44px minimum targets.
- ✅ Reframed playback around both CRT and player. Preserved the cassette
  opening, internal bay, flap, and existing insertion path.
- ✅ Integrated the same controls into the full-height native reader's lower
  hardware panel for phones, short viewports, direct links, and graphics
  fallback. Preserved sound defaults, focus order/return, Escape, and reduced
  motion. Updated the design narrative and surface brief.
- Validation: all 21 Chrome tests, production build, ESLint, and formatting
  passed. Reviewed desktop, short desktop, 390px/320px phones, and loading.
  New regressions verify cap/target alignment across resize, real pointer
  activation, native-reader touch controls, and focus return after eject.

#### Typography refinement (2026-09-15)

- ✅ Preserved Archivo Variable and screen-only VT323. Added shared type-role
  tokens, balanced display wrapping, relaxed display/title tracking, and
  consistent rem-based navigation and captions. Introductory prose stays at
  16px across viewports; mobile line breaks and spacing preserve the first tape
  in the opening 390px viewport.
- ✅ Aligned project titles, prose, media, tags, and links to one centered 62ch
  column. Prose uses weight 440, 1.65 leading, subtle tracking, and one-em
  paragraph spacing; taglines remain semibold. Narrow tubes use their available
  width. The modeled reader measured 17px prose; native reading measured 16–18px.
- ✅ Replaced the remaining fixed OSD caption/tag/link sizes with shared cqi
  clamps. Screen titles are 24–32px; metadata scales from 17–20px. Numeric
  metadata and the local clock use tabular numerals.
- ✅ Retained local, non-blocking font loading and canvas redraws. The English
  surface requests only the Archivo and VT323 Latin WOFF2 files. Arial provides
  a close installed fallback; its regular-width difference on the intro is 2.2%.
- Updated `DESIGN.md`, the affected sidecar typography/examples, and the surface
  brief. The ten remaining type-scan advisories are documented decorative
  8–10px equipment/index markings and the 42px loading identifier; no findings
  were suppressed. The legacy 12px screen-radius advisory is outside this pass
  and is overridden by the active embedded reader's documented 14px radius.
- Validation: bounded desktop/320px/390px visual review, native and modeled
  playback, graphics fallback, and 200% text size. Chrome regression suite:
  20 passed initially; the mobile opening check passed after adjusting the intro.
  Production build, ESLint, and formatting passed. Stage 8 and Stage 9 remain open.

#### Player control refinement (2026-09-15)

- ✅ Reduced and centered the sound cap and recess within the left fascia so
  neither crosses its ridge. Retained 44px minimum native hit targets.
- ✅ Aligned sound state and eject labels with the hardware's uppercase Archivo,
  semibold weight, restrained tracking, and smaller camera-relative sizing.
- ✅ Removed the physical skip key. Skip animation is now a plain underlined
  action at the viewport's lower right, or inside the native loading screen.
  The deck's model label remains visible throughout insertion.
- Validation: all 21 Chrome tests, production build, ESLint, and formatting
  passed. Reviewed desktop, compact desktop, and 390px/320px phone playback
  and loading. Regressions cover sound-recess clearance, skip outside the
  hardware, touch activation, and focus return.

#### Distill pass (2026-09-15)

- ✅ Cut the model print from 29 planes to the four signature prints (status
  window, AV–01 model line, spine number and name, idle screen) plus one label
  per working key cap. Removed the fascia SOUND and EJECT / ESC prints, the
  flap legend, both plinth lines, the monitor chin, both speaker badges, the
  six holder numbers and two cheek marks, the headphone-stand mark, and the
  seven cassette undersides. `Print` now always matches its plane's aspect;
  the stretched 1024×128 path is gone.
- ✅ Shell: removed the scene metadata line, the local clock (`useClock`
  deleted), the "01—06" caption number, the page-level Sound control, the
  navigation count, the introduction's index shortcut, and the fallback
  monitor's chin label. The index heading keeps the one tape count; the
  header's "The archive" link is the single index route and now shows on
  phones too. The guide's idle instruction points at the studio, not the index.
- Sound is toggled only on the deck (modeled key in playback, native reader
  panel otherwise), so hover ticks are silent until a visitor enables sound in
  playback. Deck key label mechanics, print material matching, canvas sizing
  before insertion, and the 9–10px shell sizes wait for polish and typeset.
- Docs: rewrote the DESIGN.md Label bullet, Layout guide paragraph, Studio
  tools, Navigation, and Tape index sections; added The Signature Print Rule
  and a matching Don't; removed the `button-sound` component. Sidecar and
  surface brief updated to match.
- Validation: 21 Chrome tests, production build, ESLint, and formatting
  passed; the fonts regression now asserts an aspect-fitted print texture.

### Stage 8 — Real content pass

- Replace placeholders with real projects: copywriting, screenshots/recordings,
  per-project label art.

### Stage 9 — Hardening: performance, accessibility, SEO

- Technical UI audit completed on 2026-09-15; findings and reproduction steps
  are in `AUDIT.md`. Score: 13/20, with 3 major, 6 minor, and 1 polish issue.
  These are the original audit results; subsequent remediation is recorded
  above and in `AUDIT.md`. Stage 9 remains open.
- Independent design critique completed on 2026-09-15; snapshot is in
  `.impeccable/critique/` for `src-app-tsx`. Score: 22/32, with one P1 and four
  P2 priorities. All five priorities were addressed in the critique follow-up
  above. The snapshot retains the original findings and score; it is not a
  post-remediation review. Stage 9 remains open.
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
4. **WebGL upgrade** — ✅ Revised by Daniel (2026-09-15): **yes**, a real
   low-poly studio with accessible HTML reading and a non-WebGL fallback.
   Supersedes the 2026-07-22 SVG-only decision.
