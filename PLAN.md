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

#### Polish pass — deck keys and print rendering (2026-09-15)

- ✅ Each key cap carries one printed label (SOUND, EJECT) in every state; the
  label is inside the cap group, so it travels with the press. The native
  button is an invisible hit area sized to the cap (44px floor) that carries
  only the accessible name, `aria-pressed`, the Escape title, and keyboard
  focus. The icon-and-text HTML label and the browse/playback label swap are
  gone.
- ✅ Sound state moved into the status window, now a two-field readout
  (transport state with a drawn play mark on the left, SOUND ON / dimmed
  SOUND OFF on the right). The `PLAY ▸ 01` glyph is gone.
- ✅ Keys are interactive only after insertion ends (`playback && !inserting`);
  during insertion the only control is Skip animation.
- ✅ Canvas sized before the tape moves: on selection the mechanism holds at
  progress 0 until the R3F size changes or equals the viewport (0.3s
  fallback), and the camera rig snaps its zoom to the new fit instead of
  easing, so the studio lands in the full-viewport box before the cassette
  lifts.
- ✅ Print rendering: `Print` is a transparent `Decal` in the chassis
  material (roughness 0.82, metalness 0.12, flat shading, no depth write),
  so labels no longer sit on lighter patches. Textures carry ~1280 px per
  world unit at the plane's own aspect; type is measured with `fitType` and
  set smaller rather than compressed; capitals are centered on their actual
  bounds; canvas tracking is applied for the 0.1em control labels. The spine
  label is now 192×966 and the face label 256×480, matching their planes
  (the spine was 26% off). Pixel ratio is capped at 2 during modeled playback,
  1.75 in browse.
- Docs: rewrote the Playback buttons section, the control typography bullet,
  The Signature Print Rule, and the insertion/pixel-ratio notes in DESIGN.md;
  synced the sidecar (control/label purposes, `canvas-settle` motion entry)
  and the surface brief.
- Validation: 22 Chrome tests (a new transport regression records every
  frame from inside the render loop and proves the tape waits for the
  reported playback box, keys have no hit areas during insertion, hit areas
  are empty and transparent in playback, and pixel ratio is 2 in playback
  and 1.75 after eject; the fonts regression now checks every canvas print
  against its plane's proportions), production build, ESLint, formatting,
  and a clean Impeccable detector pass. Reviewed 2× renders of browse,
  insertion start and mid-flight, playback, hover, sound on, keyboard focus,
  after-eject, and 390px phone playback.

#### Layout pass — one column, guide row, phone framing (2026-09-15)

- ✅ One column: the header mark hangs 16px into the left gutter above 1200px
  (hidden below) so the nameplate sits on the column; the introductory
  aside lost its 16px right padding and the footer nav its 48px right
  margin, and the footer now reads statement + edition left, contact links
  flush right. At 1440px every shell edge measures 72px or 1368px.
- ✅ Guide row: the guide's first line is centred on the reset key's 44px
  height (padding computed from the functional type size), so the drag hint
  and the reset circle share its centre line (baselines within 0.5px); the
  instruction hangs beneath and the 48px minimum height is gone.
- ✅ Arrows: "About me ▶", "GitHub ↗", "LinkedIn ↗", and "↔ Drag to look
  around" set their glyph in an `aria-hidden` span spaced by a 0.5em flex
  gap instead of a typed space; the footer arrows are now hidden from
  screen readers like the nav's.
- ✅ Tape index entries: number stacked over the name on one text edge (as
  on a spine), 12px inset all round, accent strip inset to match, play symbol
  centred in its own grid column. The card interior went from two text edges
  (85/103px) to one (85px).
- ✅ Phone framing: canvases up to 600px fit every piece of equipment
  horizontally (only the `studio-table` group may run out of frame) with the
  shell's 6% gutter as the margin, so the speaker and headphones are never
  cropped and the widest objects land on the text column; the canvas height
  is `clamp(220px, 72vw, 384px)`, snug to that fit. Cost: the idle screen is
  about 110px wide at 390px and 90px at 320px (was 134/109).
- Docs: added The One Column Rule and rewrote the guide, footer, canvas
  height, phone framing, Studio tools, Navigation arrow, and Tape index
  passages in DESIGN.md; synced the sidecar samples and the surface brief.
- Validation: 22 Chrome tests (the framing regression now also proves every
  object stays 15px inside the canvas at 1366/390/320px throughout the
  orbit range, with a phone screen-width floor of 100px above 360px and 80px
  below), production build, ESLint, formatting, and the Impeccable detector
  (only the five pre-existing 9–42px size advisories owed to typeset).
  Measured edges, baselines, and projected equipment bounds at 1440, 1240,
  1024, 430, 390, 360, and 320px; reviewed 2× renders of the header, guide
  row, cards, footer, and 390px phone.

#### Typeset pass — four weights, six sizes, drawn marks (2026-09-15)

- ✅ Weights: eight rendered Archivo weights (400/440/500/550/560/600/650/
  800, plus 700/750 in canvas prints) reduced to 400, 600, and 800, with
  VT323 at 400. Display and loading mark 600; nameplate, guide, archive
  heading, and tape names 600; navigation, Skip animation, and reader prose
  400; spine number and name prints 800; status window, AV–01 line, and key
  caps 600.
- ✅ Sizes: the shell ramp is six tokens on an 11px floor — display,
  2.625rem mark, 1rem body, 0.875rem functional, 0.75rem caption, 0.6875rem
  label. The 9px index numbers, archive count, and footer edition and the
  10px play symbol moved to the label tier or became icons; 1.0625rem body,
  0.9375rem nameplate, and 0.8125rem navigation folded into their neighbours.
  Screen-interior sizes are unchanged (tube-scaled).
- ✅ Drawn marks: `src/components/Icons.tsx` replaces every typed glyph —
  the shell's ▶ ↔ ↺ ▶ ↗ rendered in SF Pro and Arial, and the tube's ▶ PLAY,
  link ↗, and REC ● rendered in Menlo and Courier New (verified with Chrome's
  platform-font inspection). Icons are 1.5-unit strokes on a 16-unit box,
  `currentColor`, `aria-hidden`; the REC dot and idle cursor are CSS boxes.
  OSD link names are now "GITHUB" and "LINKEDIN" (tests updated).
- ✅ Escape hint: silkscreen at weight 400 instead of dim silkscreen, 7.5:1
  on the key and 6.7:1 on hover (was 4.2:1 / 3.8:1).
- ✅ Removed `tabular-nums` everywhere: VT323 is monospaced and no Archivo
  numerals align in columns.
- Docs: DESIGN.md typography frontmatter now lists the roles that render
  (display, mark, body, functional-title, functional, caption, control, label,
  the screen roles, osd, osd-meta, osd-display); the Typography section is
  rewritten as a shell ramp, a tube ramp, and The Drawn Mark Rule; sidecar
  samples, the surface brief, and the Don'ts are synced.
- Validation: 22 Chrome tests, production build, ESLint, formatting, and a
  clean Impeccable detector pass. Computed-style dumps at 1440 and 390px show
  only 400/600 on the shell and Archivo/VT323 as the only platform fonts on
  the home and reader routes; the guide row's baselines still match within
  0.5px; the header fits at 390/360/320px without overflow.

#### Deep-link handoff — one decision (2026-09-15)

- ✅ Desktop deep links no longer hide the studio for the visit. The instant
  native reader stays pinned only until the scene is ready; then the modeled
  studio takes over in one dissolve: the seated tape, closed flap, PLAY
  status, live keys, and the modeled reader compose under the still-opaque
  reader until the reader is placed on the tube (plus one drawn frame), then
  the native frame fades over 560ms (`--t-dolly`, `--ease-out`) while the
  tube's tracking entrance plays through it. Reduced motion swaps
  at that moment. Invalid slugs hand off the same way to the modeled
  NO SIGNAL screen.
- ✅ Continuity: the modeled article inherits the native reader's scroll
  depth; focus stays in the article if that is where it was, otherwise on
  the title. The outgoing frame is `aria-hidden` and `inert` during the
  dissolve, then unmounts (transitionend, 900ms fallback); a 1.5s guard
  advances the handoff if the modeled reader never reports in. The dissolve
  stops early on eject, a resize below the reading breakpoints, or lost
  graphics. Narrow or short viewports release the pin silently and follow
  the viewport rule on later resizes, as selections already did.
- ✅ Failed graphics keep the previous behavior: the same native article,
  focus and scroll untouched.
- Docs: DESIGN.md gains The Handoff Rule (CRT reader) and a rewritten
  deep-link paragraph (Layout); sidecar `reader-handoff` motion entry and
  full-height reader description; surface brief; README; AUDIT addendum.
- Validation: 23 Chrome tests (new: the dissolve itself — hidden and inert
  outgoing frame, seated tape and closed flap behind it, focus, eject return;
  the held-module case now asserts the takeover with carried scroll depth and
  article focus), production build, ESLint, formatting, and the detector.

#### Closing polish — verification round (2026-09-15)

- ✅ One bounded verification round closed the critique follow-up: production
  build, ESLint, Prettier, the 23 Chrome tests, and the Impeccable detector,
  with screenshots at 1440×900 (browse, hover preview, insertion, modeled
  playback with sound on and keyboard focus on Eject, after eject, the About
  deep link after its dissolve, the modeled NO SIGNAL screen), 1280×680
  (short-desktop native reader), 1024×768, and 390×844, 360×740, and 320×568
  phones (browse, native reader and article end, deep link). No page errors
  and no horizontal overflow at any width; the phone fit measured the
  equipment 19–23px inside the canvas with the screen 90px wide at 320px and
  110px at 390px.
- ✅ Fallback screen radius: the HTML CRT's base `.screen` rule used 12px
  while the documented screen radius is 14px; every screen now shares 14px
  and the embedded override is gone. The detector's only remaining item is
  the native deck keys' darker 3px bottom edge, a documented false positive.
- ✅ Sidecar brought in line with the distill, layout, typeset, and handoff
  passes: the typography entries mirror the DESIGN.md roles (the stale
  nameplate, navigation, weight-440 prose, 9px number, functional-body,
  intro-body, and secondary-OSD entries are gone), The Signature Print Rule,
  The One Column Rule, and The Handoff Rule are recorded alongside the
  earlier five, and the Do and Don't lists are taken from DESIGN.md.
- ✅ Surface brief: `related_targets` is back on one double-quoted line, the
  form Impeccable's frontmatter reader parses (Prettier had wrapped and
  re-quoted it, so Stage.tsx and StudioScene.tsx no longer resolved as
  related targets); `.impeccable/surfaces/` is excluded from Prettier so the
  tool-written frontmatter stays parseable.
- Known and intentional: a deep link's programmatic title focus shows the
  OSD underline (keyboard arrivals need it; reversed 2026-09-27, see Two
  fixes under Stage 8); phones show the native reader's
  loading screen for the mechanism's 2.4 seconds unless skipped; the
  THREE.Clock deprecation warning comes from React Three Fiber's clock, not
  project code.
- Validation: production build, ESLint, formatting, 23 Chrome tests, and the
  detector, re-run after the radius change. README's pixel-ratio note now
  reads 1.75 in browse and 2 in modeled playback.

#### Refinement round (2026-09-15)

Five changes Daniel asked for after the closing polish.

- ✅ The tape index heading carries no count; the "06" is gone, so no count
  appears anywhere on the shell.
- ✅ The deck's status window prints a drawn speaker mark instead of SOUND ON
  / SOUND OFF: two waves when on, a red slash (rec red, the deck's one colour
  print) across the speaker when off. The native deck key's SVG uses the same
  slash in place of its former cross, so both readouts share one glyph.
- ✅ The monitor's dial is now a turned knob in a recessed escutcheon with a
  raised ring, a molded pointer slot, and seven tick marks over its sweep,
  built from the speaker's 24-sided profiles and the fasteners' merged
  details; it sits centred on the chin's flat face, above its old position.
- ✅ Drag-to-orbit is removed: no OrbitControls, no drag hint, no reset key.
  The camera is authored and only eases between the fitted browse and
  playback views; a change of the skip counter still snaps it. The guide's
  row no longer reserves a 44px key height, and the canvas keeps the
  browser's default touch behaviour.
- ✅ Skip animation is the same hardware key as the native reader's sound and
  eject (shared `.key` in `DeckControls.module.css`), led by a drawn skip
  mark, at the viewport's lower right during modeled insertion and inside
  the native loading screen.
- ✅ Follow-up, same day: the speaker marks are filled bodies with stroked
  waves or slash, matching the filled play, eject, and skip marks, in the
  canvas print and the SVG alike; the modeled EJECT cap's label is led by a
  drawn eject mark (`Print` gained a `mark` prop, passed through
  `PlayerButton`); the dial moved down and right to the chin's visual
  centre, its ring's right edge on the screen glass's right edge.
- Docs: DESIGN.md (frontmatter, Drawn Mark Rule, Layout, Shapes, playback
  buttons, the Studio tools section is now Sound toggle, tape index,
  insertion), the surface brief, the sidecar, and README.
- Validation: the framing test now holds the authored view instead of
  sweeping the orbit limits; the pointer-drag and touch-swipe tests assert
  that a horizontal drag leaves the camera and route untouched.

#### Hover and eject round (2026-09-15)

Two fixes Daniel asked for after using the studio.

- ✅ Hovering between cassettes no longer jitters. The preview target is each
  cassette's resting envelope in its rack slot, an invisible fixed box
  (`pointer-target-<slug>`, excluded from framing), rather than the moving
  shell. The lifted shell used to slide out from under the pointer, drop the
  preview, land back under it, and lift again: a 1px sweep across the rack
  flipped the preview 67–84 times. Fixed slots hand over at their shared
  edge; the same sweep now yields one transition per cassette. Daniel
  proposed the resting-area target himself; a deadzone would not have
  stopped the oscillation.
- ✅ Eject runs the insertion timeline back (`EJECT_SECONDS`, 1.8 seconds):
  the flap opens, the tape leaves the bay, turns, and settles flat into its
  slot. Focus still returns to its archive link, but that return no longer
  previews the tape (Daniel: "I would rather it settle flat"). An eject during
  insertion reverses from wherever the tape is; the deck reads EJECT for the
  return; history back ejects the same way. Reduced motion and the fallback
  reader return the tape at once.
- ✅ The preview lift is an arc (rise, then forward; retreat, then drop)
  instead of a straight diagonal, which had cut the corner of the rack's
  retaining lip by a hair on every hover; the early-eject test caught it once
  the returned tape settled flat.
- Mechanism: `Stage` derives the ejecting tape on the render where playback
  closes and commits selection and eject inside `startTransition`, because
  React Router 7 navigates in a transition and any state set beside it
  rendered first, seating a mid-flight tape or dropping a previewed one
  before the mechanism took over. A flight interrupted by a new selection
  snaps home; `Tape` judges completion by the last timeline position it saw
  itself, since the shared timeline is already reset for the next tape.
- Docs: DESIGN.md (Cassettes and insertion, status window), the surface
  brief, the sidecar, README.
- Validation: a pointer-sweep test asserts one preview transition per slot
  in both directions; the transport spec steps the eject back from seated
  and from mid-insertion, checking the open flap, no collisions, the
  landing, and that the slot is live again.

#### Soft zoom round (2026-09-16)

Daniel's report after using the studio: inserting and ejecting a tape showed
"frame snapping / viewport snapping and blips" too fast to see clearly; he
asked for a soft zoom into the screen and a soft zoom back out into the
site, seamless both ways.

- Mechanism found (per-frame screencast of headless Chrome): on selection
  the canvas jumped from its page box to a fixed full-viewport box in one
  commit, but its drawing buffer was resized a frame later through the
  resize observer, so one painted frame showed the old-size render parked at
  the viewport's top-left with the page gone; the next frame refit the
  studio to the viewport in a jump. Eject was the mirror: two frames of the
  fullscreen render clipped into the small box, then a squeezed playback fit
  that zoomed out, plus a scroll jump because the box left the page's flow.
- ✅ The studio's box (`.scene`) stays in the page's flow with its height; a
  `.viewport` layer inside it holds the canvas and detaches over the
  viewport, transparent, while `open || returning` (`data-detached`).
  `Stage` sizes the renderer in the same commit as that layout change
  (`useLayoutEffect` → `RootState.setSize` via `onCreated`), so no frame
  paints the old drawing at the new box's origin.
- ✅ `CameraRig` eases the studio's _frame_: a viewport-pixel rectangle that
  is the canvas while browsing, starts at the page box on selection and
  grows to the viewport (rate 5/s), and on eject shrinks from the viewport
  back to the live page box. The fit is computed for the frame and the
  camera is panned onto the frame's centre (orthographic, so a lateral move
  is an exact pixel pan), which makes both box swaps pixel-identical. It
  reports `onReturned` once the frame sits on the box; `Stage` then clears
  `returning` and the canvas rejoins the page while the tape finishes its
  return inside it. Scroll stays locked until then.
- ✅ The page chrome (header, intro, guide, archive, footer) dissolves over
  560ms as the studio zooms in and returns as it zooms out; the fixed layer
  no longer paints an opaque ground.
- ✅ Three further mechanisms the live loop demanded: the rig reads the
  transport phase (`open`, `returning`, `inserting`) from a ref that
  `StudioScene` writes in the page's layout effect, because R3F delivers
  props to the scene a commit later than the page resizes the canvas, and
  a per-frame recorder caught one frame drawn fitted to the full viewport
  before the exact departure frame; a move that starts from rest caps its
  first step at 1/60s instead of the 50ms delta cap, which had made the
  eject's first frame a 20% jump after the idle playback loop; and the
  returning layer is pointer-transparent (`pointerEvents` on the R3F
  `Canvas` style, since its wrapper opts back into pointer events), so the
  archive answers clicks right after eject. `html` also gets
  `scrollbar-gutter: stable`, so locking scroll cannot reflow the page
  under the zoom on classic-scrollbar platforms.
- Docs: DESIGN.md (The Soft Zoom Rule under Cassettes and insertion; Layout),
  the surface brief, the sidecar (`studio-frame`, `page-dissolve`), README.
- Validation: `e2e/zoom.spec.ts` steps frames by hand across a selection and
  an eject from a scrolled page and asserts the first detached frame draws
  the screen within 1.5px of its rest position, no frame moves it more than
  40px or scales the zoom outside 0.85–1.2×, the canvas always fills its
  layer, the chrome opacity reaches 0 and 1, and the studio lands back
  within 1.5px with the scroll position kept. Before/after screencast
  filmstrips (desktop and phone) and a live-loop per-frame recorder
  confirmed the stale frames are gone; the transport spec's early-eject run
  now moves the pointer off the link it clicked, since the layer's return
  is a layout change that re-hovers the link underneath (a real preview).

#### Scene cohesion round (2026-09-16)

Daniel asked for a refinement pass so every object shares one level of
detail, fidelity, clarity, and consistency, naming the cassettes, the holder,
and the speaker as the strongest pieces; the goal is cohesion, not realism.

- Analysis: the three strong objects share one grammar: a dark recess under a
  lighter raised plane, a fine parting line, 24-sided turned parts, merged
  ribs, fitted fasteners, and four isolating pads. The deck, the monitor, the
  headphones, and the table each missed part of it.
- ✅ Deck: the fascia is one tone (the top strip was a lighter band); a
  parting line, four thin pieces around the opening so the collision spec's
  per-mesh boxes stay clear, sits in the groove where the fascia meets the
  chassis; the slot flap is a door a step darker than the fascia inside the
  dark bay rather than a near-black plate; the two foot rails became one
  recessed base under the chassis.
- ✅ Monitor: the 17 vent slats are two merged `DetailBoxes` grilles (the
  side vent was a dark panel with grooves, now slats like the top); the two
  foot rails became one recessed base inset from bezel and shell. A parting
  fin between bezel and shell was tried and removed: the bezel's chamfer
  hides it from every authored camera. Four pads per object were tried
  first; Daniel saw them in his browser as "black cubes with nothing", only
  two of them visible under the chin. Recessed bases 0.08–0.09 tall came
  next; from the front-on playback camera he saw those as "jarring black
  rectangles with no depth or detail". Both were then seated at the
  speaker's proportion (deck gap 0.035; the monitor's bezel 0.03 above the
  deck), which moved the deck to y 1.24, the slot to 1.31, the monitor to
  3.10, the screen to 3.23, and the playback centre to 2.64
  (`transport.ts`), and Daniel asked for the feet to be modeled in the
  speaker's and holder's style: four dark corner pads, 0.28 × 0.035 × 0.22
  under the deck and 0.4 × 0.03 × 0.28 at all four corners of the monitor.
  Taller rear pads reaching the monitor's stepped underside were tried and
  removed ("look off"); Daniel then asked for the real-set construction:
  the rear shell's floor dropped 0.16 to the bezel's bottom plane (shell
  3.12 × 2.68 × 1.5 at y −0.06), so the underside is one plane on four
  identical pads (DESIGN.md, The Same Grammar Rule).
- The transport spec's viewport check on the physical keys now compares the
  button's bounding box to the viewport in whole pixels: Playwright's
  `toBeInViewport({ ratio: 1 })` read 0.9999998 for a fully visible key at
  1024 × 720 because the key's rect comes through a fractional 3D transform.
- ✅ Screen: the idle texture's lit area has the reader's rounded corners
  (26px on the 1024px canvas, the 14px screen radius) over a black tube,
  which is now always black, so the tube keeps one shape in browse and play.
- ✅ Headphones: the earcup's outer face is a raised ring around a sunken
  core, the speaker's layering in the cup's oval; the stand post is
  flat-shaded like every turned part.
- ✅ Table: two thin legs whose foot rails showed as stray dark bars at the
  front corners became one recessed dark pedestal under the slab.
- ✅ `Disc` is 24-sided like `Turned`.
- Docs: DESIGN.md Shapes (The Same Grammar Rule) and CRT reader.
- Validation: object-by-object renders from the authored camera before and
  after, high-zoom checks of the new seam, vents, cup, screen corner, and
  table edge, phone and short-laptop browse views, `tsc`, ESLint, Prettier,
  and the Playwright suite.

#### Blank slots round (2026-09-16)

Daniel asked for a solution for cassettes without project data: an inactive
state, greyed out with a stylized "On the way!" in the text index (changed
to "Coming soon…" on his review), and in the studio a tape that is not
selectable, does not animate, and is plain with no label.

- ✅ Content: the rack has six fixed slots (`SHELF_SLOTS`), five for projects
  and About at the right. `shelfTapes` is the project list, a `ComingTape`
  for every project slot not yet filled, then About; `playableTapes` is
  every entry with a route, and `findTape` searches only those. Adding a
  project to `projects` fills the next blank slot; listing more than five
  throws at load. Delta and Epsilon were removed so two slots are blank; the
  three remaining placeholders keep the long-title, media, and studio-label
  cases (the two-still gallery case went with Delta).
- ✅ Index: a blank slot keeps its cell and number but is a plain text entry
  (`.tapeComing`), not a link: 1px dashed seam-lit border, no accent strip,
  no play mark, dim silkscreen reading "Coming soon…" over "Blank tape". It
  takes no focus and no pointer; arrows and Home/End move between the
  playable links only. The About shortcut selects `aboutTape` directly.
- ✅ Studio: `BlankTape` seats the shared shell in its slot with
  `CassetteModel blank` (the face label moved into a `FaceLabel` child so a
  blank shell mounts no texture), no spine print, and no frame loop, behind
  a slot target of its own that swallows the pointer (`stopPropagation` on
  over and click). Without one, Gamma answered across the blank slots: the
  three-quarter camera looks along the rack, so a ray through an empty slot
  ran on into Gamma's 1.09-deep envelope, which Delta's target used to
  occlude. Daniel reported it in review. The rack's slot pads and dividers
  are unchanged. `slotHome` moved to `transport.ts` so both tape
  kinds share the slot position.
- ✅ Regression: the hover sweep now expects the guide to read idle across
  the two blank slots; a new studio test covers the four links, the two read-
  only entries, keyboard passes over them, zero printed maps on a blank shell
  against two on a printed one, exactly four pointer targets, and NO SIGNAL
  for `/project/coming-1`.
- Docs: DESIGN.md Tape index (The Blank Slot Rule) and Cassettes, the
  `tape-link-coming` token, the surface brief, README, and the sidecar
  sample.
- Validation: desktop, 1024px, and phone screenshots of the index and the
  studio, `tsc`, ESLint, Prettier, and the Playwright suite.

#### Scene finish refinement (2026-09-16)

Daniel requested a scene-only refinement after Claude's recent rounds, keeping
the established composition and bringing all equipment to the same finish.

- ✅ Consolidated the main equipment's shell, fascia, trim, recess, rubber,
  and hardware colors in `studio/materials.ts`, with one shared matte chassis
  finish. Preserved the lighter tabletop, dark cassette molding, paper labels,
  driver materials, colored tape accents, and the CRT as the only emitter.
- ✅ Replaced the CRT's raised vent bars with shallow chamfered plates with
  real slot openings over dark wells. Shared this construction with the
  deck's exposed sides, adding restrained cover fasteners. Each vent assembly
  is two draws, independent of slot count.
- ✅ Matched headphone curves to the other equipment's 24-segment, faceted
  construction; added fine earcup housing seams and fitted, slotted pivots.
  Seated the stand post in a collar, added base fasteners, and matched its
  four low pads to the speaker and rack. All screw heads now use 24 sides.
- ✅ Corrected cassette face-label weights to the existing 400/600/800 system.
- Validation: desktop, 1024px, 390px, and 320px visual review, object close-ups,
  and modeled playback; all 27 Chrome tests, production build, ESLint, and
  formatting passed. Existing tape clearances, blank-slot behavior, camera
  transitions, keyboard access, reduced motion, and fallback reading passed.

#### Phone selection and laptop reader (2026-09-16)

The third critique (27/36) put phone selection first: at 390px the six slot
targets sit on a 16.6px pitch under a guide that said to select in the
studio, so a mis-tap opened the wrong tape full-screen; common laptops drew
the modeled reader's prose under its 16px floor with nothing showing that
the article scrolled. `/impeccable adapt`, first of the agreed order.

- ✅ Touch selection (The Touch Rule in `DESIGN.md`): a touch tap on a
  cassette previews it (lift, guide, idle screen) and a second tap plays
  it; a mouse is unchanged. `Tape.tsx` skips the hover preview for touch
  pointers and branches its click on `active`. Every slot also answers a
  tap inside its projected rectangle grown to at least 44 × 44px about its
  centre, nearest centre first, blank slots swallowing theirs
  (`resolveSlotTap` in `transport.ts`); the scene registers the handler in
  the renderer's store as `onPointerMissed`, read live per event. Double
  clicks are ignored there: Chrome turns a second tap within ~300ms into a
  mouse-typed `dblclick`, which selected on the first attempt in testing.
- ✅ Guide: at 600px and below the instruction reads "Pick one from the
  index below."; while previewed it reads "Tap again to play" on devices
  without hover (`useMediaQuery` in `Stage.tsx`). The 44px-per-slot ask
  cannot be met literally at the phone fit (the whole rack is about 110px
  across), so the index is the phone's primary selection surface and the
  studio a live picture.
- ✅ Modeled reader (The Tube-Scale Rule): where the playback zoom would
  draw the 560px reader plane smaller, `Screen` enlarges the Html plane's
  group and shrinks the content to match (`playbackZoom` in `framing.ts`,
  the same fit the rig runs from the playback pose), so one CSS px is one
  screen px and the prose's rem floor is real: 16.0px at 1280 × 720 (was
  15.3), 16.8 at 1366 × 768 and 1024 × 768, 16.0 at 800 × 700; 1440 × 900
  and larger are unchanged. The 699px breakpoint stays, so those laptops
  keep the modeled playback. The framing now lives in `SceneContents` and
  is shared by the rig and the screen.
- ✅ Continuation cues: a 3.5rem bottom fade that lifts once the article's
  end is in view (`data-more` kept on the article by a callback ref with
  scroll and resize observers, no React state), and a `screen-scroll`
  scrollbar token at 3.5:1 (was seam-lit at 1.8:1). Both readers.
- Regression: hardening's touch test covers the guide copy, the two-step
  tap, the catch beside About, the blank swallow, and the cancel; a new
  `reader.spec.ts` measures the drawn prose size at 1440 × 900, 1366 × 768,
  1280 × 720, and 1024 × 768, the fade's lift, and the scrollbar colour;
  studio's first-viewport test reads both guide lines.
- Docs: DESIGN.md (The Touch Rule, The Tube-Scale Rule, Layout guide copy,
  CRT reader cues, `screen-scroll`, a Do), the sidecar, the surface brief,
  README.
- Next in the agreed order: polish (the LOADING sub-line), harden, clarify,
  polish.

#### Loading readout (2026-09-17)

The third critique's insertion finding: the modeled tube printed LOADING
TAPE over CHOOSE A TAPE / TO PLAY, because the `Screen` texture branched its
headline on `inserting` but its sub-lines on `preview` alone. `/impeccable
polish`, second of the agreed order.

- ✅ The One Readout Rule in `DESIGN.md`: the texture resolves one name (the
  tape going in, else the one under the pointer) and branches headline and
  sub-lines together. Loading reads LOADING TAPE over that tape's name, as
  the native loading screen does, and the invitation lines stay off. The
  icon and headline keep their place across all three states, so nothing
  jumps at the click. The map is rebuilt on `name` and `inserting` only.
- ✅ Names are fitted to the lit area (`fitTubeType`: set smaller, never
  compressed), headline and sub-line alike, ahead of Stage 8's real names.
- Regression: transport's "the tube names the tape going in…" records what
  each canvas map is painted with (an init script around `clearRect` and
  `fillText`) and reads the live screen map at rest, previewing, and with
  the loop held mid-insertion. It fails on the old texture.
- Next in the agreed order: harden, clarify, polish.

#### Exits and shareability (2026-09-17)

The third critique's two remaining P2s: the exit lost keyboard users, and a
shared link previewed as nothing and opened on an unnamed machine.
`/impeccable harden`, third of the agreed order.

- ✅ The Way Back Rule in `DESIGN.md`. After a tape, focus returns to its
  index entry; after NO SIGNAL it lands on the nameplate (the page's first
  heading) instead of dropping to `<body>`. When the browser draws the ring
  (`:focus-visible`, a keyboard exit) the entry is brought into view by the
  shortest move with a 24px scroll margin; a pointer exit shows no ring and
  the page stays put. The restore moved from a passive effect to a layout
  effect in the closing commit, declared ahead of the renderer sizing: the
  page moves before paint while the chrome is at opacity 0, so it is never
  seen as a scroll, and the rig, which reads the box every frame, eases the
  studio back to wherever the box now is.
- ✅ Skip takes focus for the insertion (a stable callback ref). "Any key
  skips" no longer fires on a bare modifier (Shift on its way to Shift+Tab
  used to skip) or on Enter/Space over a focused key, which is that key's
  own press.
- ✅ The studio's layer is `tabIndex={-1}`: a press on a modeled cassette
  takes focus with it, as a press on a link does. Left on `<body>`, Chrome
  counted the script focus that followed as a keyboard's and ringed Skip,
  then underlined the title, for a mouse. This also settles the critique's
  note that the title underline showed after canvas clicks but not after
  index clicks.
- ✅ NO SIGNAL prints its exit beneath the reason, PRESS ESC OR EJECT TO
  RETURN with the drawn eject mark, in both readers; at 600px and below it
  names the deck's key alone, as the native Eject key drops its ESC legend.
- ✅ The Ident Rule in `DESIGN.md`: the OSD's top bar is three fields, PLAY,
  the station ident (DANIEL ALYOSHIN, centred, screen-soft, no glow), and the
  counter; NO SIGNAL carries the ident alone. It lives in `CRT.tsx`, so both
  readers print it in the same place and it is there in a deep link's first
  second and through the handoff. Decision: identity during playback belongs
  to the tube, not to a nameplate pinned over the studio; the pinned
  nameplate could not reach the native reader or a scrolled page anyway.
  `src/content/site.ts` holds the name for the ident and the titles.
- ✅ Document titles per route from `Stage` (an effect on `document.title`;
  React 19's hoisted `<title>` would sit after `index.html`'s static one and
  lose to it): "Placeholder: Alpha — Daniel Alyoshin", "About — Daniel
  Alyoshin", "No signal — Daniel Alyoshin", and the static home title.
- ✅ Open Graph and Twitter `summary_large_image` tags in `index.html`, using
  the existing title and description verbatim, over `public/social-card.png`:
  a 1200 × 630 render of the studio itself, no copy set on it, from `npm run
render:card` (`scripts/render-social-card.mjs`: own Vite server, installed
  Chrome, drawn at 2× and averaged down, opaque, 190 KB). `vite.config.ts`
  fills `%SITE_URL%` from the environment and warns when a build has none.
- Regression: new `e2e/exits.spec.ts` (eight tests: keyboard and pointer
  exits, both NO SIGNAL exits and the hint at desktop and phone, Skip focus
  and the modifier guard, a real mouse selection carrying no ring, titles
  across routes and history, the ident before graphics and centred after
  the handoff, the three fields apart at 320px, and the served meta tags
  with the card's real dimensions), and a second zoom test: a keyboard eject
  at 1440 × 900 moves the page 140px under the dissolve and the studio still
  lands within 1.5px of its box with per-frame continuity. 38 e2e green.
- Left for later passes, by the agreed order: naming (the sr-only NO SIGNAL
  sentence still says "shelf"; "ALYOSHIN ARCHIVE" on the idle tube) belongs
  to clarify; the 404 screen's `undefined` class and the sub-44px header and
  footer links to the closing polish. Still open from `AUDIT.md`, outside
  this pass: robots/sitemap/canonical, the VHS-glyph favicon and
  `apple-touch-icon`, `theme-color` and `color-scheme`, the handoff's
  `aria-hidden` timing, and per-project share cards (needs pre-rendered HTML).
- **Stage 10 must set `SITE_URL`** so the card's image URL is absolute.
- Next in the agreed order: clarify, polish.

#### One name, true readouts (2026-09-17)

The third critique's naming drift and ornamental readouts, plus Daniel's copy
decision of 2026-09-16 (tighten the shell copy AND make the OSD honest).
`/impeccable clarify`, fourth of the agreed order.

- ✅ The One Name Rule in `DESIGN.md`. The collection is **the archive**
  everywhere a visitor meets it: the header link, the heading it lands on
  (was "The tape index"), the skip link ("Skip to the archive"), the phone
  guide ("Pick one from the archive below."), the status messages, the
  sr-only sentences (were "the shelf"), and the idle tube's ALYOSHIN ARCHIVE.
  Chosen over "the tape index" because it names the collection, not a
  widget: the rack in the studio and the list under it are the same archive,
  and it was already the word in nine of eleven places.
- ✅ The About tape has one name, "About", under the rule every tape follows:
  one spine name (ABOUT, as printed) and one title ("About": reader heading,
  document title, the entry's accessible name). Gone: "About me" in the
  header, "About Daniel" in the entry, the guide and the accessible name,
  "ABOUT · DANIEL" on the spine label, and "Daniel Alyoshin" as the reader's
  title, which since the Ident Rule printed the name twice, 60px apart.
  Three `slug === 'about'` special cases left `Stage.tsx`; the one that
  remains picks the caption. `about.ts` changed in its `title` and
  `spineLabel` only; the About prose is untouched and still Daniel's.
- ✅ `vhs.spineLabel` is the short name as printed; the " · " convention and
  every `.split(' · ')[0]` are gone, so the guide ("BETA · EXTENDED CUT")
  and the native loading screen now name a tape as the entry, the spine, and
  the tube do. Captions are one helper, `tapeCaption`: "Placeholder tape" or
  "Meet the maker", the same words in the entry and the guide.
- ✅ The guide's instruction finishes the headline's sentence with one verb
  and one noun: "Pick one in the studio." (was "Select a cassette in the
  studio."), "Pick one from the archive below." on phones and wherever there
  is no studio (no WebGL, lost graphics), where it used to point at a studio
  that was not there. The fallback's own note ("The archive is ready. Choose
  a tape below.") said the same thing a third time and is removed.
- ✅ The True Readout Rule in `DESIGN.md`. `vhs.runtime` ("SP 0:42",
  "LP 2:14") is deleted from the content type; the OSD's right field is the
  tape's reading time, 1 MIN READ, from `src/content/readingTime.ts` (230
  words a minute over title, tagline, paragraphs, captions; never under one;
  derived, so Stage 8 copy keeps it true with nothing to type). The article's
  meta line says it to a screen reader, since the bar is `aria-hidden`.
  Below 19.5rem of tube the word READ gives way (320px phones read 1 MIN
  with 33px of air; packed, the full field sat 7px from the name), below
  15.5rem the field, never the name.
- ✅ The AV–01 line reads "AV–01 / VHS", the mark the native reader's deck
  already carried; "4 HEAD · HI-FI STEREO" is gone and the print stays a
  signature print. The idle tube's corners: STANDBY / LOADING (was "SP ·"),
  CH 01, ALYOSHIN ARCHIVE, AV–01 (was HI-FI STEREO), matching the fallback's
  idle screen, whose "AV-01" hyphen became the en dash used everywhere else.
  CH 01 stays as the home route's name, as CHANNEL NOT FOUND names a missing
  one; offered to Daniel as a cut. The cassette labels' "VHS HI-FI" format
  mark is label art, not a readout, and was left.
- ✅ Shell copy, Daniel's choices from three proposals a line (2026-09-17):
  the kicker is "One person, both sides of the seam", his own About stance
  ("working the seam between design and build… one person owns both sides")
  in place of "Independent mind. Hands-on maker."; the display line "Digital
  work. / Physical feeling." stays, by his decision; the footer reads "Want
  to talk shop? I'm on GitHub and LinkedIn.", echoing the About tape's
  closing line and giving the browse page the ending the critique said it
  lacked, beside the two links it names. Both fit one line at 320px.
- ✅ Both Eject keys are named "Eject tape" and declare Escape through
  `aria-keyshortcuts`; the native key's ESC legend is `aria-hidden`, so it
  is no longer announced as "Eject tape ESC".
- ✅ Found while verifying, outside the brief: an Escape pressed while a deep
  link's handoff was still pending let the modeled title's queued focus
  frame run after the exit (Drei unmounts its root a commit after the page),
  taking focus from the archive entry and dropping it on the page body when
  the reader unmounted. `settle` in `Stage.tsx` now returns once playback
  has closed (`wasOpen`). Reproduced on demand by a new exits test (failed 2
  of 3 before, 0 of 16 after). `reader.spec` judged a second measurement
  after its poll and could land on a refit frame under load; it now asserts
  the snapshot it polled. `render:card` once captured the loading screen
  after a dev-server reload dropped its injected CSS: the CSS is now added on
  every load and the script refuses to write a card it has not checked.
- Docs: `DESIGN.md` (The One Name Rule, The True Readout Rule, guide,
  Navigation, "The archive" section, Ident Rule thresholds, key naming, idle
  corners, Signature Print Rule, a Do and a Don't), the sidecar (two rules, a
  do, a don't, renamed entries, samples), the surface brief, README.
  `public/social-card.png` re-rendered for the new prints.
- Validation: build, lint, format, detector clean; new `e2e/copy.spec.ts`
  (one name for the archive across link, heading, skip link, status and
  every canvas print, with no SP/LP/4 HEAD/STEREO printed anywhere; one name
  for About across header, entry, guide, heading, title and status, and the
  owner's name on the tube exactly once; the counter recomputed from the
  words on the tube for three tapes, its sr-only twin, and the word giving
  way at 320px with 14px of air or more; both Eject keys' names and
  shortcuts; the footer's sentence beside the two links it names). 44 e2e
  green.
- Next in the agreed order: the closing polish (the 404 screen's `undefined`
  class, sub-44px header and footer links, the THREE.Clock warning). A
  candidate for it: during eject the modeled tube already reads INSERT TAPE
  while the deck reads EJECT.

#### Closing polish (2026-09-21)

The last command of the 2026-09-16 critique's agreed order: its P3 bundle,
then one bounded verification round.

- ✅ Every screen state has a rule of its own. `CRT.tsx` classes the tube by
  mode, and `nosignal` had never had a rule, so both 404 screens carried the
  class `undefined` and sat on the screen's rest bloom while their cast on
  the deck was already playback's. `.nosignal` now joins `.playing`: a lit
  tube of OSD on the black ground takes the play bloom (0.10 → 0.16 alpha on
  the same 40px spread), in the modeled and the native reader.
- ✅ The nameplate and the contact links meet the 44px floor (`AUDIT.md`
  finding 9): 101 × 40 → 101 × 44, and 56 × 42 / 63 × 42 → 44 tall. The floor
  is a hit area, not a layout change: `.identity` takes a 44px `min-height`
  and centres its two lines, the shared link rule states the floor once, and
  the caption-size footer links overhang their row by the 1px difference
  (a `min(0px, …)` margin, so nothing is absorbed once text preferences make
  the link taller than the floor). Measured before and after at 1440 × 1000,
  1280 × 720, 390 × 844 and 320 × 640: header, footer and document heights
  and every text position identical.
- ✅ The console is clean. The THREE.Clock deprecation is raised by React
  Three Fiber 9.7.0's own store (three r183 deprecated Clock for Timer; 9.7.0
  is the latest stable), so nothing in the app can act on it.
  `studio/threeConsole.ts` uses three's `setConsoleFunction` to drop that one
  line by its exact text and pass everything else through as three would,
  stack traces included; it is imported by the lazy studio module, so three
  stays out of the main bundle. Probed against the live module: a different
  warning, the same warning reworded, an error with parameters and a log all
  still print. Delete the module when R3F moves to Timer.
- Docs: `DESIGN.md` (`nav-link` floor, Shadow Vocabulary's state list,
  Navigation's floor, NO SIGNAL under CRT reader, the clean console beside
  lazy loading), the sidecar (three bloom purposes, the navigation sample
  and description), the surface brief.
- Validation: build, lint, format and the design hook clean; three new
  hardening tests, each seen failing on the old source first (no element on
  stage classed `undefined` or `null` on home, a tape, and both 404 routes in
  both readers, with NO SIGNAL's bloom equal to playback's; all five shell
  links at least 44 × 44 at four viewports; load, play and eject without a
  console warning or error). 47 e2e green. The production build was probed
  separately: clean console through load, play, eject and a dead link, with
  the filter in the studio chunk only.
- The suite ran on port 5199 through a throwaway config: another project's
  dev server held `127.0.0.1:5173`, and `reuseExistingServer: true` would
  have pointed every test at it without a word. A candidate for Stage 9: have
  the config check what it is attaching to, or take its port from the
  environment.
- ✅ Two calls on the models, flagged by the round and made the same day at
  Daniel's request. The modeled tube's light on NO SIGNAL was the idle blue
  under a black screen (the point light's `open && !invalid` in
  `StudioScene.tsx`); it is now phosphor whenever playback is open, as the
  HTML tube's bloom and cast already were. And while a tape returned, the
  tube read STANDBY / INSERT TAPE / CHOOSE A TAPE / TO PLAY while the deck
  read EJECT: it now reads EJECT in the corner and EJECT, led by the key
  cap's drawn mark, over the returning tape's name, with no invitation until
  the tape lands (The One Readout Rule gained the return). A preview made
  during the return waits for the landing; reduced motion returns the tape
  at once, so the readout is skipped there rather than flashed for a frame.
  `drawEjectMark` moved from `geometry.tsx` to `textures.ts` so the cap and
  the tube share one path. Two new transport tests, each seen failing first
  (the tube's prints mid-return and after landing, held with the frame loop;
  the point light's colour at rest, on a tape, and on both 404 routes).
  49 e2e green, build, lint and format clean; mid-return and NO SIGNAL frames
  inspected at 1440 × 900.
- ✅ The two things noticed along the way, fixed the same day at Daniel's
  request. `CRT.tsx` carried a fourth screen mode, `ejecting` (an EJECT
  readout and an `.ejecting` rule), left from the July CSS deck, that
  `Stage.tsx` never passed: a tape returns only in the modeled studio, and
  the fallback reader returns it at once. The mode, its branch and its
  selector are gone; the HTML tube has three states. And the modeled light
  turned to phosphor at the click, 2.4 seconds before the tube stopped being
  blue: it now follows the tube (`open && !inserting`, the condition that
  mounts the reader), so it is blue at rest, through the flight and through
  the return, and turns in the commit the reader arrives. The One Light Rule
  says so ("changes only when the screen does"). The light test now reads the
  light from a held frame in which the tube provably shows LOADING TAPE
  (seen failing first), and the tube-print recorder is one helper for its
  three tests. 49 e2e green, build, lint and format clean; mid-flight and
  settled frames inspected at 1440 × 900.
- The critique's agreed order (adapt → polish → harden → clarify → polish) is
  complete. Next is Stage 8 content, then the Stage 9 remainder.

#### Second audit remediation (2026-09-21)

Daniel asked for every finding of both audits that still applied. Of the
2026-09-16 audit's ten, finding 9 (44px links) was closed by the closing
polish above and finding 1 (route titles) mostly by the harden pass; the
2026-09-15 audit's one open item (shared screen colours) is finding 8. The
rest, by finding:

- ✅ **1 and 2, the first frame.** `npm run build` now draws every route
  ahead of time (`scripts/prerender.mjs`, from `src/entry-server.tsx`): the
  home page, a flat `project/<slug>.html` per tape with its article in the
  native reader, and NO SIGNAL as `404.html`, each with its own title,
  description, and share tags, which closes what finding 1 left (crawlers run
  no script). `main.tsx` hydrates a page drawn for its own address and
  renders afresh a page drawn for another (the 404 page answering a dead
  link). Made hydration-safe: the WebGL probe is a `useSyncExternalStore`
  hook that assumes graphics until the browser says otherwise, the home
  title is `site.title` rather than whatever `document.title` was at boot
  (wrong on a drawn tape page), `CRT.tsx` no longer needs `window` to tell a
  placeholder link, and the guide's width-dependent line is picked by the
  stylesheet, so a drawn phone page is right before the app arrives. The
  studio's module waits for first paint and an idle main thread. Flat files,
  not `<slug>/index.html`: they answer at the app's own URLs without a
  trailing-slash redirect on GitHub Pages, Netlify, Cloudflare Pages, and
  `vite preview`.
- ✅ **3, grain.** The tile is painted once on a layer one tile larger than
  the tube and steps by `transform`; at rest during modeled playback the main
  thread went from 201 ms to 30 ms per 4 s (12 ms with the grain paused).
- ✅ **4, label in name.** Archive entries and the nameplate are named by the
  words they show ("Play tape: 01 ALPHA Placeholder tape (2026)", "Daniel
  Alyoshin Design engineer home"); no `aria-label` replaces a link's words.
  The Spoken Name Rule; The One Name Rule no longer says the title fills the
  entry's name.
- ✅ **5, media.** `ProjectMedia.width` and `height` are required; the first
  piece loads eagerly at high priority, the rest lazily. The placeholder
  pattern is 640 × 480 (the audit's 200 × 150 was its drawn size).
- ✅ **6, scaffolding.** `robots.txt` always; `sitemap.xml`, canonical URLs
  and `og:url` once `SITE_URL` is set; `color-scheme: dark` and
  `theme-color`; the favicon is the nameplate's cassette mark, and
  `npm run render:icons` draws the touch icon from it.
- ✅ **7, handoff.** The outgoing reader is hidden from assistive technology
  only once the modeled reader holds focus. The handoff test samples focus
  every 16 ms and failed on the old timing with the title inside hidden
  content for the whole of `pending`.
- ✅ **8, one palette.** One idle blue, the modeled studio's `#242bd9` (the
  fallback monitor's `#1523d6` is gone); the scene reads the screen's
  colours from `tokens.css` as it paints (`studio/tokens.ts`); blooms and
  casts are their hue at a strength; every radius is a named token and the
  two unused ones are removed. The One Palette Rule.
- ✅ **10, canvas under the reader.** While the native reader owns playback
  the canvas keeps its box (281px tall at 390 × 844, where it held an 844px
  buffer), the page still holds still, and the tape returns to its slot in
  the box on eject.
- Measured on the audit's phone profile (390 × 844, 4× CPU, 1.6 Mbps, no
  cache, real GPU): home first paint 944 → 508 ms; a tape link's 1,012 → 520
  ms, its LCP 1,104 → 520 ms and layout shift 0.050 → 0.022; the studio is
  ready no later than before (3.8 → 3.2 s home). Lighthouse mobile, back to
  back on one machine: performance 79–80 → 89, LCP 3.5 → 1.8 s, SEO 91 →
  100; blocking time reads about 80 ms higher, since an earlier first paint
  puts more of the same startup inside the window it counts. A first
  Lighthouse run scored 68 with 1,750 ms of observed task time against 300
  in the paired runs; it was discarded as the audit discarded its own.
- The suite has two projects: `dev`, and `built`, which builds the site and
  checks the served artifact (`e2e/built.spec.ts`, six tests). Each server
  is recognised by a file only this project serves, and the ports move with
  `E2E_PORT` and `E2E_BUILT_PORT`: the trap the closing polish hit, another
  project's server on 5173, now fails loudly.
- Docs: `DESIGN.md` (The One Palette Rule, The Spoken Name Rule, The First
  Frame Rule, tokens, Handoff, grain, media, the canvas under the reader, two
  Dos), the sidecar, the surface brief, README, an addendum in `AUDIT.md`.
- Validation: build, lint, format and the design hook clean; new tests for
  link names, focus through the handoff, the canvas's box, and the built
  site. 57 e2e green (51 on the dev server, 6 on the built site).
- Left open: per-tape share cards (every route unfurls with the site's
  card), and the no-script tape page's Eject key, which needs the app. Both
  wait on Stage 8 content.

### Stage 8 — Real content pass

- Replace placeholders with real projects: copywriting, screenshots/recordings,
  per-project label art.
- Slots without a project hold blank tapes and read "Coming soon…" until one
  lands (blank slots round above); real projects fill them in order.
- Shell and About copy pass DONE (2026-09-23, Daniel's words, item by item):
  role is now "Forward deployed engineer" (home title "Daniel Alyoshin ·
  Forward Deployed Engineer"; tab titles use " · ", not " — "); description
  "Portfolio of Daniel Alyoshin, forward deployed engineer"; the collection
  of tapes is renamed "Projects" everywhere (nav, heading, `#projects`, skip
  link, guide, status messages, the idle tube's bottom-left ident); kicker
  "Bridging the gap between client and codebase"; headline "Real experience.
  / Real solutions."; the intro paragraph is cut; the About tape's caption is
  the owner's name; archive note "Check out my works."; footer "Want to
  chat?"; About tagline "Forward deployed engineer", new three-paragraph bio
  (UofT final year, architecture + sales, entertainment and health tech), no
  tags, REC SEP 2026. Kept: the guide, loader, blank slots, tube, NO SIGNAL,
  deck, and cassette print. Project tapes remain placeholders.
- First real project DONE (2026-09-25, from Daniel's summary): "Cloudflare D1
  in Apache Superset" (`superset-d1`, spine SUPERSET D1, classic label,
  orange `#ff7a1a`, REC SEP 2026) takes slot 01 in place of the Alpha
  placeholder, which is deleted with its test-pattern media. A tape's
  caption is now data: `caption`, else the title, so the archive entry and
  guide read "Cloudflare D1 in Apache Superset", and About keeps the
  owner's name, which removes the About slug check from `Stage.tsx`.
- Review round DONE (2026-09-25, Daniel's three changes, one agent and
  branch each, merged into main):
  - Write-up: shorter (three paragraphs), first person, and it now says
    Daniel is one of the five people who built the original packages
    (org page and package author lists) and that this round is his
    maintainer work. Role "Maintainer"; links PyPI, Dialect PR, Superset
    PR, Packages (the org). A diagram of how Superset reaches D1 after
    the change sits in the reader: `media/superset-d1-diagram.webp`
    (1170 × 1911), rendered from `superset-d1-diagram.html` by
    `npm run render:diagrams` (needs `cwebp`).
  - Placeholders removed: Beta and Gamma deleted, with the example.com
    link filter in `CRT.tsx` that only existed for them. The rack reads
    01 SUPERSET D1, 02 to 05 blank "Coming soon…", 06 ABOUT. Test
    coverage lost with them: a long wrapping title, a tape with no links,
    and pointer preview between two adjacent playable tapes.
  - Layout: The Studio First Rule (DESIGN.md). At 1280px wide and 700px
    tall and up, the studio's box starts under the header and the kicker,
    headline and guide sit in its open upper right; the box keeps the
    studio's proportion (`aspect-ratio: 1.82`) and never passes the fold.
    Studio zoom 66 → 96 at 1280x800, 99 → 109 at 1440x1000. Narrower or
    shorter windows and phones keep the stacked layout. New framing test
    keeps the words 12px clear of the equipment, previews included.
  - `.impeccable/config.json` joins `.prettierignore` (its shape belongs
    to Impeccable's hook-admin script).
- Second review round DONE (2026-09-27, Daniel's five answers; two agents,
  their work brought into main uncommitted). It supersedes parts of the
  round above:
  - Credit: "one of the people who built" the original packages, and
    "Today I'm their primary maintainer"; no count, no course. Role
    "Primary maintainer".
  - Diagram: now a system diagram (1170 × 2613). A Superset boundary holds
    the D1 engine spec, SQLAlchemy's engine and inspector, and the `d1`
    extra; labelled connections show install time (the extra installs
    sqlalchemy-d1, which requires sqlalchemy-cloudflare-d1) and run time
    (SQLAlchemy loads the d1 dialect and inspects tables and views,
    sqlalchemy-d1 subclasses the community dialect, the engine spec runs
    SQL on the community driver, the driver posts to D1's REST API
    `/raw`). Each connection was checked in the source. Retired packages
    are left out.
  - Layout: the stacked desktop look is gone at every size. The Studio
    First look applies at 768px wide and 540px tall and up, the mobile
    look below either. Words and box size scale fluidly and keep 12px
    clear of the equipment with a tape lifted (framing test at 15 sizes).
    Narrow, short windows (under about 940 × 580) run the studio up to
    about 40px past the fold (fixed 2026-09-29, see Small windows below).
  - Phones: the four blank cells fold into one "02–05 Coming soon…" cell,
    captioned "Blank tapes" (Daniel's pick), spanning both rows beside
    SUPERSET D1 and ABOUT; the wider look keeps one "Blank tape" cell per
    slot. The no-WebGL phone monitor now takes its width from the studio's
    box (its screen used to spill out at 390px). The mobile headline is
    sized by the screen's shorter side (`min(5.4vw, 5.4svh)`): a phone on
    its side drops from 54px to 37px and the studio rises about 35px,
    though at 844×390 only the monitor's top is in the first screen.
    Portrait phones are unchanged.
  - CLAUDE.md and AGENTS.md: project tapes hold only real projects; an
    empty slot stays a blank tape.
- Phones on their side DONE (2026-09-27, Daniel chose the stronger fix):
  a window under 540px tall and at least 740px wide takes the Studio First
  look with the words beside the studio. The box holds the left column from
  the header's seam to the fold, the words stand 24px to its right at the
  top, the kicker breaks, and the display line sits near its 2rem floor. At
  844×390 the whole studio (480 × 318 box) and the words fit the first
  screen; before, only the monitor's top did. `phoneView` in
  `studio/framing.ts` keeps the three-quarter camera for that narrow box
  (the close phone view crops the table at a box edge). With no hover the
  guide points at the list. Phones on their side under 740px wide (iPhone
  SE, 667px) keep the mobile look with the shorter-side headline.

- Full screen from the tube DONE (2026-09-27, Daniel's ask: the modeled
  close-up reads worse than the full-height reader, so offer a manual full
  screen from the 3D view with a creative nudge, not a button in a corner;
  try several designs and settle on one). The Picture Size Rule in
  `DESIGN.md`:
  - Chosen, "picture size": an OSD size bar at the tube's foot, lit for the
    picture's measured share of the window's width (4 of 10 at 1280 × 800,
    1440 × 900 and 1920 × 1080), running to FULL SCREEN with an F legend;
    the monitor's dial is its knob, its pointer standing where the bar does
    (`src/lib/pictureSize.ts`). The first scroll of a tape turns the dial up
    two steps and back with the bar. Bar, dial, or F light the bar to full,
    then the full-height reader grows out of the picture's rectangle (clip
    and fade, 560ms). Exit full screen (collapse mark, F) leads the reader's
    deck and hands back with the deep link's dissolve, the frame closing
    onto the tube. Reading place and focus carry both ways; F ignores
    modifiers. Daniel's answers the same day: full screen holds for the
    visit (never stored): later tapes still fly into the deck, and once the
    camera rests on the tube the set turns the picture up by itself (at once
    under reduced motion); Exit full screen gives the visit back to the
    tube. The dial's tick on the turn-up stays (sound on only).
  - Rejected, each prototyped and captured at 1440 × 900: a boxed OSD
    "FULL SCREEN F" key at the tube's foot (clear, but a plain button that
    costs a line of reading); a white OSD notice ("READING? FULL SCREEN F")
    after the first scroll (covers the text being read); a label-maker strip
    on the monitor's chin (charming, but letters an object beyond the
    Signature Print Rule and reads as a label, not a control); viewfinder
    corner brackets at the tube's corners (the picture as the full-screen
    mark, but its label ends up in a corner). The prototype diff is kept
    outside the repository.
  - Also fixed on the way: when a reader that covered the studio hands the
    tape back to the tube (a deep link's, or full screen's), the camera now
    composes at the tube's view in one step instead of easing in from the
    box's fit under the dissolve (`uncovered` in the camera rig).
  - `e2e/fullscreen.spec.ts` (eight tests). The playback focus loop now
    skips buttons outside the tab order (the dial's pointer target).
  - Validation: build, lint, and format clean; 67 e2e green (61 dev, 6
    built); screencast filmstrips of the nudge, the turn-up and grow, and
    the return; captures at 1024 × 768, 1280 × 800, 1366 × 768,
    1440 × 900, and 1920 × 1080.

- Two fixes DONE (2026-09-27, Daniel's report):
  - A jumpy stutter when another tape is hovered while one is ejecting.
    Cause: React Three Fiber applies its own measurement of the canvas's
    box on every render of `<Canvas>` (its size check never matches, so it
    always calls `setSize`), and react-use-measure reports a box change
    through a resize observer debounced 50ms. The page sizes the renderer
    in the commit that rejoins the layer to the page, but a hover in the
    next ~100ms re-rendered the canvas with the viewport's measurement: a
    frame recorder showed 1440 × 900 drawn inside the 1296 × 712 box for
    about 70ms, the studio jumping ~110px and back. Fix: the renderer's
    observer is `RendererBoxObserver` (`src/lib/rendererBox.ts`), which the
    page asks for a report in the same commit (`measureRendererBox` beside
    `setSize` in Stage), undebounced; page scroll is no longer tracked
    (nothing reads the box's page offset while browsing, and undebounced it
    would render the scene on every scroll event). The same window existed
    on selection and around full screen; the one fix covers them.
  - A "weird underline" on a project's title. Cause: the title takes focus
    by script, and Chrome counts that focus as a keyboard's (`:focus-visible`)
    before the visitor has done anything (a shared link, a reload, NO
    SIGNAL) and again at any key pressed while reading (arrows, Space, even
    Shift), after a mouse choice as much as a keyboard's; a click in the
    text moved focus and cleared it. Fix: the title draws its underline only
    for a tape chosen from the keyboard (`keyedTape` in Stage, set when an
    index link or About is followed with a click of count 0, cleared on
    close; `data-keyboard` on the title). Titles and NO SIGNAL draw no ring
    otherwise. This reverses the earlier "known and intentional" deep-link
    underline: every visitor from a shared link saw it, and a keyboard
    arrival's first Tab lands on a ringed control.
  - Tests: `e2e/zoom.spec.ts` hovers the other tape's index entry in the
    commit the layer rejoins and checks every frame's renderer size against
    its box (fails without the fix: 1440 × 1000 in 1296 × 712);
    `e2e/exits.spec.ts` checks the keyboard choice's underline, no underline
    after a pointer choice plus a key, and none on a shared link or NO
    SIGNAL.

- Content closed (2026-09-29, Daniel): no more real projects. The site
  ships with SUPERSET D1 and About; slots 02 to 05 stay blank "Coming
  soon…" tapes, as the project rules require. CH 01 on the idle tube stays
  (the cut offered on 2026-09-17 is declined).
- Small windows DONE (2026-09-29, Daniel: "would be nice"). Windows under
  940px wide and under 600px tall ran the studio's box up to 41px past the
  fold (939 × 540), and from 900px wide the table itself was cut by up to
  9px: the kicker takes two lines there and the display line held its
  2.25rem floor, so the words outgrew the corner the fold leaves, and the
  box's minimum height (words clear of a lifted tape) beat its maximum (the
  fold). In that band the words now close up (12px under the header, 6px
  under the kicker, 12px above the guide) and the display line follows the
  short windows' corner fit down to 2.0625rem, the smallest that keeps the
  guide's longest caption (259px) on one line. The box ends at the fold at
  every size measured (768 to 1280 wide, 540 to 800 tall); 939 × 540 now
  draws exactly as 940 × 540 (studio zoom 69, 6% smaller than before, its
  base 25px above the fold instead of 9px below it). Clearance above a
  lifted tape stays 13px or more. The framing test adds 939 × 599,
  939 × 540 and 900 × 540 and now requires the first screen at every size.
- Three flaky tests steadied (2026-09-29; each failed about 2 runs in 9
  under load, at HEAD as well). Two in `studio.spec.ts` queried the page
  during a deep link's handoff, when both readers and both decks are on it
  (a strict-mode double match); they now wait for the native reader to
  leave (`onTheTube`). The phone-grid test measured its three cells in
  three calls while the first frame after a resize was still settling: in
  that frame Chrome sets the headline's first line at the old size (57 +
  39px lines, then 2 × 39px) and lays the full-bleed studio box out 4px past
  a 320px window. The cells are now measured in one layout, and the overflow
  check waits for the settled page. 69 green in a full run; the three
  passed 25 repeats.
- D1 write-up made general DONE (2026-09-29, Daniel's updated summary: the
  Superset PR is merged). Daniel asked for a write-up that describes what
  the project does now and does not need editing on every release. The
  credit paragraph stays; the other two now say how Superset reaches D1
  (sqlalchemy-d1 over the community dialect, the `d1` extra, the engine
  spec and the driver). The write-up and the diagram no longer name
  versions, dates, the 7.0 ask or the reported driver bugs; the diagram
  drops its "PR #44505" and "Rebuilt" tags and the "0.2.0" in
  sqlalchemy-d1's name. Links: PyPI (no version), Source (the
  sqlalchemy-d1 repository), Superset PR.
- Closer look DONE (2026-09-29, Daniel's same-day follow-up): the write-up
  drops its SQLAlchemy 2 / what-it-adds sentence; the diagram's engine spec
  keeps only "Runs SQL on the driver" (its other three lines and "built
  in" go) and sqlalchemy-d1 only "Adds what Superset needs". The diagram is
  now drawn twice: across at 640px (`superset-d1-diagram.html`, 2080 × 1638) for the full-height reader, whose column tops out at 639px, so its
  text reads at its own 14px and the whole drawing stands in a 1280 × 800
  full screen (it used to show 1.8× up and 1300px tall), and down at 360px
  (`superset-d1-diagram-narrow.html`, 1170 × 2184) for windows under
  640px. `ProjectMedia.narrow` carries the second drawing; the reader
  picks it with a `<picture>` source. The modeled tube no longer shows
  media: The Closer Look Rule (DESIGN.md) puts a slate in its place that
  turns the picture up like the size bar, opens on the diagram, and is not
  held for the visit. Three indicators were prototyped and captured at
  1440 × 900: an OSD key in the links' family (clear, but reads as one more
  link beside PYPI and SOURCE), the slate (chosen: it holds the media's
  place and says a picture is there, the largest target, in the diagram's
  own fill and edge), and a divider with the cue at its centre (quiet, but
  reads as a section break more than a control). The prototype diff is
  kept outside the repository. Two tests in `fullscreen.spec.ts`.

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
- Second technical UI audit completed on 2026-09-16 as the Stage 9 shell pass,
  taken before Stage 8 content by Daniel's decision. Findings, measurements,
  and reproduction steps are at the top of `AUDIT.md`; the 2026-09-15 audit is
  kept below it as history. Score: 16/20 (was 13/20), with 1 major, 5 minor,
  and 4 polish issues. axe reports zero violations across nine states;
  Lighthouse (mobile profile, real GPU) scores 67/62 performance and 100
  accessibility. All ten findings were closed by 2026-09-21 (the harden and
  closing-polish passes, then "Second audit remediation" above; the addendum
  in `AUDIT.md` has the re-measured numbers: Lighthouse mobile performance
  89, SEO 100, axe clean over seven states of the built site).
- ✅ Final checks with the real content (2026-09-29), recorded in
  `AUDIT.md` ("Final checks with the real content"):
  - Per-tape share cards (The Card Rule): `npm run render:card` now also
    draws `public/social-cards/<slug>.png`, the studio caught as that tape
    goes into the deck, half through the mouth, with the tube reading
    LOADING TAPE over its name; `scripts/prerender.mjs` gives each tape's
    page its card and alt text, and stops the build when a card is
    missing. Three looks were prototyped at 1200 × 630: the tape pulled
    from the rack with the tube naming it (too close to the home card at
    thumbnail size, and "select this tape" asks for a click a card cannot
    take), the tape going in (chosen: the shell in the deck and the gap in
    the rack read even at 400px wide), and a tighter crop (cut the
    speaker and headphones, read as a screenshot). The site's own card was
    re-rendered too: it still showed the removed ALPHA, BETA and GAMMA.
  - axe over fourteen states: zero violations. Lighthouse 13.5.0: mobile
    82–87, desktop 97–100, accessibility, best practices and SEO 100 (NO
    SIGNAL's SEO is its `noindex`).
  - Media: alt text, sizes and reserved boxes checked; load cost on a slow
    connection measured. A density `srcset` for diagrams is offered, not
    done (45 KB saved on 1× screens, 27 KB on 2×, none on 3× phones).
  - Fixed: the tube's tracking entrance no longer plays under reduced
    motion; its collapsed first keyframe was a one-frame jolt and flash.
  - `.impeccable/design.json` regenerated from DESIGN.md (24 rules, 15 dos,
    9 don'ts, 11 components).
- Left of Stage 9: a screen-reader session and a physical-device pass,
  which no audit has done.

### Stage 10 — Deployment (LAST, per project rules)

- Choose host (GitHub Pages / Vercel / Netlify / Cloudflare Pages) and wire the
  build. No deploy config or CI before this stage.
- Set `SITE_URL` to the site's address for the release build: it makes the
  share card's image URLs absolute and turns on `sitemap.xml`, canonical
  URLs, and `og:url` (the build warns without it).
- The build is a set of static files. The host must serve
  `project/<slug>.html` at `/project/<slug>` and `404.html` for unknown
  addresses (defaults on GitHub Pages, Netlify, and Cloudflare Pages; Vercel
  needs `cleanUrls`). Do not add a single-page fallback to `index.html`: it
  would answer dead links with the home page. Settle the trailing-slash
  policy with the host; canonical and sitemap URLs come from one place in
  `scripts/prerender.mjs`.
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
