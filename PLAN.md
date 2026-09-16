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
  OSD underline (keyboard arrivals need it); phones show the native reader's
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

### Stage 8 — Real content pass

- Replace placeholders with real projects: copywriting, screenshots/recordings,
  per-project label art.
- Slots without a project hold blank tapes and read "Coming soon…" until one
  lands (blank slots round above); real projects fill them in order.

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
  accessibility. Open work in fix order: route titles and metadata, build-time
  pre-rendering with a deferred scene boot, compositor-only CRT grain, label-in-
  name on seven links, typed media dimensions, robots/sitemap/OG/favicon/social
  card, the handoff's aria-hidden timing, palette and radius consolidation,
  44px header and footer links, and the canvas under the phone reader.
  Content-dependent rechecks after Stage 8: alt text and image optimization on
  real media, per-project share metadata, one more Lighthouse run.
  Stage 9 remains open.
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
