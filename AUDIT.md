# Technical UI audit — 2026-09-16

Second technical audit, run as the Stage 9 shell pass ahead of Stage 8 content.
It records findings only; application code was not changed. The 2026-09-15
audit and its remediation addendum follow below as history.

## Implementation integrity verdict: PASS

The implementation still expresses one product-specific system: procedural
low-poly equipment, restrained HTML chrome, tape-driven navigation, CRT-contained
effects, and explicit placeholders. The bundled detector returned one advisory
(a false positive, see below); no design-system drift, decorative filler, or
interchangeable structure was found. All 26 Chrome regression tests, the
production build, ESLint, and Prettier pass.

Release readiness now hinges on the loading path and publishing metadata rather
than on interaction defects.

## Executive summary

**Audit Health Score: 16/20 — Good; address the weak dimensions.**

**10 consolidated issues: 0 P0, 1 P1, 5 P2, 4 P3.**

| #         | Dimension                | Score     | Key finding                                                                              |
| --------- | ------------------------ | --------- | ---------------------------------------------------------------------------------------- |
| 1         | Accessibility            | 3/4       | The document title never changes across routes; seven links fail label-in-name           |
| 2         | Performance              | 3/4       | Blank until JavaScript runs (Lighthouse mobile 62–67); grain repaints 5×/s at rest       |
| 3         | Responsive design        | 3/4       | No overflow or clipping at any tested size; three shell links sit at 40–42px             |
| 4         | Theming                  | 3/4       | Screen palette duplicated in WebGL with a drifted idle blue; eight non-token radii       |
| 5         | Implementation integrity | 4/4       | Coherent, product-specific, placeholders explicit; detector advisory is a false positive |
| **Total** |                          | **16/20** | **Good**                                                                                 |

Top issues:

1. Route changes never update the document title, and there is no route-level
   metadata (P1).
2. The page paints nothing until the main chunk executes; Lighthouse's mobile
   profile puts LCP at 3.7–3.9 s with a 3.2–3.4 s render delay (P2).
3. The CRT grain animates a paint property five times a second for the whole
   reading session, roughly 5% of a desktop core and more on phones (P2).
4. Seven links' accessible names do not contain their visible text (P2).
5. Project media has no intrinsic size and the first image is lazy-loaded (P2).

Recommended order: harden (titles, handoff timing, media sizing) → optimize
(pre-render, grain, scene boot) → clarify (label-in-name) → SEO scaffolding →
adapt → polish.

## Scope and verification

- Reviewed the working tree at `f046514`: routing, stage, readers, scene, tokens,
  stylesheets, content types, `index.html`, and the Vite output.
- **Passed:** `npm run build`, `npm run lint`, `npm run format:check`, and all
  **26 tests** in `npm run test:e2e` (Chrome, 1.5 min).
- Static: Impeccable's detector (`detect.mjs --json src index.html`), a
  source-map attribution of both chunks, and greps for literals, effects,
  landmarks, timers, and title handling.
- Live, against the production build served by `vite preview` on port 4173:
  - axe-core 4.10.3 (WCAG 2.0/2.1 A+AA, 2.2 AA, best-practice) over nine states:
    home at 1440×1000 and 390×844, modeled playback (clicked and deep-linked),
    the phone native reader, `/project/nope`, `/nowhere`, and the no-WebGL
    fallback home and reader. **Zero violations.** Seven `color-contrast` nodes
    were returned as "incomplete" because of the screen overlays; they were
    resolved by hand (see positive findings).
  - Headings, landmarks, tab order, focus rings, touch targets, horizontal
    overflow, and text-spacing overrides at 320, 390, 720×500, 768×1024,
    844×390, and 1440.
  - Handoff and focus timelines sampled every 16 ms on a real GPU (headed
    Chrome).
  - Loading and interaction metrics on a real GPU: desktop unthrottled, and a
    phone profile (390×844, 4× CPU, 1.6 Mbps / 150 ms RTT, cache disabled).
    Frame gaps during insert and eject; main-thread time at rest with
    animations running, paused, and resumed.
  - Lighthouse 12, mobile simulated profile, run **headed** so WebGL used the
    real GPU. A first headless run scored 45 because SwiftShader rendered the
    scene on the CPU; those numbers were discarded.
- Not performed: physical devices, a screen-reader session, field data, or
  browser-zoom conformance beyond the 720×500 reflow check. Real project media
  and copy remain Stage 8 work.

Measured baseline (production build, real GPU):

| Measure                                  | Desktop, unthrottled | Phone profile, 4× CPU, slow 4G |
| ---------------------------------------- | -------------------- | ------------------------------ |
| Largest contentful paint (home)          | 88 ms (intro `h2`)   | 944 ms (intro `h2`)            |
| Scene ready (`data-ready`)               | 580 ms               | 3,250 ms                       |
| Long tasks during boot                   | 2, 132 ms total      | 3, 406 ms total, 173 ms max    |
| Cumulative layout shift (home)           | 0.0001               | 0.023 (web font swap)          |
| Insert transition frames over 33 ms      | 0 of 309             | 1 of 290                       |
| Eject transition frames over 33 ms       | 0 of 310             | 0 of 299                       |
| Animation frames requested at rest, 3 s  | 0                    | 0                              |
| Deep link: article readable              | —                    | 945 ms                         |
| Main chunk / scene chunk (gzip)          | 82 KB / 243 KB       | same                           |
| Lighthouse mobile: performance           | 67 home, 62 project  |                                |
| Lighthouse mobile: a11y / best-practices | 100 / 100            |                                |
| Lighthouse mobile: SEO                   | 91 home, 92 project  |                                |

## P1 — Major: resolve before release

### 1. The document title and route metadata never change

- **Location:** `src/components/Stage.tsx` (no title handling; `grep` finds
  none), `index.html:5-11`.
- **Category:** Accessibility / SEO.
- **Evidence:** `document.title` is "Daniel Alyoshin — Design Engineer" on `/`,
  `/project/placeholder-alpha`, `/project/nope`, and `/nowhere` alike. Browser
  history, tabs, bookmarks, and screen-reader page announcements all read the
  same title for every tape. No route carries its own description, canonical,
  or share metadata.
- **Impact:** Screen-reader users get no page-level confirmation that a tape
  opened; shared links preview as the home page; search results cannot
  distinguish projects.
- **Standard:** [WCAG 2.4.2 Page Titled (A)](https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html).
- **Recommendation:** Render `<title>` and `<meta name="description">` from
  `Stage` (React 19 hoists them into `<head>`): "Placeholder: Alpha — Daniel
  Alyoshin", "No signal — Daniel Alyoshin", and the home title. Per-project
  share cards need the HTML pre-rendered (finding 2) or a host-level fallback;
  the static defaults belong in finding 6.
- **Suggested command:** `$impeccable harden`.

## P2 — Minor: address in the next pass

### 2. The page is blank until JavaScript runs, and the scene boots at once

- **Location:** `index.html:16` (`<div id="root">` only), `src/main.tsx`,
  `src/components/Stage.tsx:27` (scene import), `src/components/Stage.tsx:76`.
- **Category:** Performance / SEO.
- **Evidence:** Lighthouse (headed, mobile profile): home FCP 2.8 s, LCP 3.9 s
  with a **3.4 s render delay**, TBT 690 ms, TTI 4.5 s, score 67; project route
  LCP 3.7 s, TBT 1,030 ms, score 62. Main-chunk script evaluation (react-dom,
  react-router, page render) is 1,121 ms in that simulation, more than the scene
  chunk's 374 ms. The scene chunk (243 KB gzip) is requested as soon as the app
  mounts, at 848 ms on the phone profile, and its boot produces long tasks of
  166 and 173 ms while the intro is already readable. Source-map attribution:
  the main chunk is ~55% react-dom and ~37% react-router by source size.
- **Impact:** Visitors from a shared link on a slow phone see a dark page for
  most of a second and a busy main thread for the next three; crawlers and
  link unfurlers receive an empty body.
- **Standard:** Core Web Vitals thresholds (LCP ≤ 2.5 s, TBT under 200 ms in
  lab). Measured real-GPU numbers are better than the simulation (LCP 944 ms at
  4× CPU), so this is a lab and slow-device concern, not a desktop one.
- **Recommendation:** Pre-render the three route shapes at build time
  (`react-dom/server` into static HTML for `/`, each `/project/:slug`, and the 404) and hydrate; guard `supportsWebGL` and `matchMedia` for the server
  pass. Start the scene import after first paint (`requestIdleCallback` or an
  intersection check on the exhibit) so the intro and index are interactive
  before the scene boots. Keep the lazy chunk as is; splitting three.js further
  will not help.
- **Suggested command:** `$impeccable optimize`.

### 3. The CRT grain repaints the reader five times a second for the whole visit

- **Location:** `src/components/CRT.module.css:50-76` (`.grain`, `grainShift`).
- **Category:** Performance.
- **Evidence:** At rest during modeled playback, no animation frames are
  requested and no DOM mutations occur, yet the main thread spends **206 ms of
  every 4 s** (desktop, DPR 2) in style and paint. Pausing only the grain
  animation drops that to 14 ms; pausing the REC blink as well drops it to 0;
  resuming restores 212 ms. In the phone native reader the cost is 178 ms per
  4 s unthrottled, so roughly 18% of a 4×-throttled core. The animation steps
  `background-position`, a paint property, at 5 steps per second inside a
  3D-transformed layer.
- **Impact:** Battery and heat on phones for as long as a tape is open; the
  visual result is a broadcast-style grain that could be produced on the
  compositor for free.
- **Standard:** Impeccable's expensive-animation check; the surface brief's
  "canvas renders on demand" is honored, this is the HTML layer.
- **Recommendation:** Animate `transform: translate(...)` on an oversized noise
  tile (or step a `translate` on a pseudo-element) so the grain runs on the
  compositor, or drop it to a static texture during reading. The REC blink and
  idle cursor are negligible and can stay.
- **Suggested command:** `$impeccable optimize`.

### 4. Seven links' accessible names do not contain their visible text

- **Location:** `src/components/Stage.tsx:419-457` (identity link),
  `src/components/Stage.tsx:604-646` (tape index links).
- **Category:** Accessibility.
- **Evidence:** Lighthouse's `label-content-name-mismatch` audit (axe's
  experimental rule, off in the default axe run) flags the identity link
  (visible "Daniel Alyoshin Design engineer", name "Daniel Alyoshin home") and
  all six tape index links (visible "01 ALPHA Placeholder", name "Play tape:
  Placeholder: Alpha (2026)"). The About link was fixed last audit but its
  visible text ("06 About Daniel Meet the maker") is still not contained.
- **Impact:** Speech-control users who say the visible label may not match the
  link; the mismatch is a conformance failure even though partial matches
  usually work in practice.
- **Standard:** [WCAG 2.5.3 Label in Name (A)](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html).
- **Recommendation:** Build the name from the visible content: drop the
  `aria-label`, prefix a visually hidden "Play tape" and suffix the year inside
  the link, and let the identity link's name be its visible text plus a hidden
  "home".
- **Suggested command:** `$impeccable clarify`.

### 5. Project media has no intrinsic size and the first image is lazy

- **Location:** `src/content/types.ts:9-14` (`ProjectMedia`),
  `src/components/CRT.tsx:65-78`.
- **Category:** Performance / Responsive design.
- **Evidence:** `ProjectMedia` carries `src`, `alt`, and `caption` only; every
  `<img>` renders without `width`/`height` and with `loading="lazy"`. Lighthouse
  on the project route: "Largest Contentful Paint image was lazily loaded" and a
  0.024 layout shift on `<figcaption>` ("media element lacking an explicit
  size"); measured phone deep link CLS 0.050, of which 0.027 is the caption and
  tag list moving when the image arrives.
- **Impact:** Small today with one 200×150 SVG placeholder; with Stage 8
  screenshots and recordings this becomes visible reader jump and a slower LCP
  on every shared project link.
- **Standard:** Core Web Vitals CLS; Lighthouse `lcp-lazy-loaded`.
- **Recommendation:** Add `width` and `height` (or an aspect ratio) to
  `ProjectMedia` so the type forces them, render them on `<img>` and
  `<video>`, load the first media eagerly with `fetchpriority="high"`, and keep
  the rest lazy. Do this before Stage 8 content lands so the content contract
  is right from the first real entry.
- **Suggested command:** `$impeccable harden`.

### 6. Publishing scaffolding is missing

- **Location:** `index.html:3-16`, `public/` (only `favicon.svg`),
  `src/styles/global.css` (no `color-scheme`).
- **Category:** SEO / Theming.
- **Evidence:** No `robots.txt` (Lighthouse parses the SPA fallback HTML as
  robots and reports 22 errors; SEO 91–92), no `sitemap.xml`, no canonical, no
  Open Graph or Twitter card tags, no social card image, a placeholder favicon
  (`public/favicon.svg` is a grey rounded square), no `apple-touch-icon`, no
  `theme-color`, and `color-scheme` is `normal` on a dark-only site.
- **Impact:** Shared links unfurl without a card; crawlers get parse errors;
  iOS home-screen and tab UI fall back to defaults; native scrollbars and
  `<video controls>` render in the light scheme.
- **Standard:** Lighthouse SEO audits; PLAN.md Stage 9 deliverables.
- **Recommendation:** Add `robots.txt` and `sitemap.xml` to `public/`, static
  OG/Twitter defaults and a canonical in `index.html`, the VHS-glyph favicon
  with an `apple-touch-icon`, `theme-color` set to `--ink-0`, and
  `color-scheme: dark` on `:root`. The 1200×630 card is a render of the
  studio; its copy is Daniel's.
- **Suggested command:** `$impeccable harden`.

## P3 — Polish

### 7. Focus sits inside hidden content for part of the desktop handoff

- **Location:** `src/components/Stage.tsx:683-716` (`aria-hidden={handoff ? true : undefined}`).
- **Category:** Accessibility.
- **Evidence:** Sampled at 16 ms on a real GPU: on `/project/placeholder-alpha`
  the native reader receives `aria-hidden="true"` at 580 ms (handoff `pending`)
  while the focused title still lives inside it; the modeled title takes focus
  at 913 ms. That is **~330 ms** of focus inside an `aria-hidden` subtree
  (~120 ms on `/project/nope`). axe reported it as an `aria-hidden-focus`
  incomplete when it caught that state. One of three probe runs also showed
  focus returning to `body` two seconds after the handoff; a second, targeted
  run did not reproduce it.
- **Impact:** A screen reader can lose its reading position for a beat while
  the studio takes over; ordinary visitors see nothing.
- **Standard:** [WCAG 4.1.2 / ARIA authoring guidance](https://www.w3.org/WAI/ARIA/apg/) on focus and hidden content.
- **Recommendation:** Hide the native reader only once the modeled title holds
  focus (`settled`/`fading`), or move focus before hiding. Re-check the
  focus-to-body observation while there.
- **Suggested command:** `$impeccable harden`.

### 8. Screen palette and radii drift between tokens and scene literals

- **Location:** `src/styles/tokens.css:22-27`,
  `src/components/studio/StudioScene.tsx:327-363, 373, 402`; radii in
  `src/components/Stage.module.css:212, 337, 462, 485`,
  `src/components/CRT.module.css:26, 462`, `src/components/DeckControls.module.css:19`,
  `src/components/studio/StudioScene.module.css:15`.
- **Category:** Theming.
- **Evidence:** The HTML idle screen uses `--crt-blue: #1523d6`; the modeled
  screen paints `#242bd9` with tone mapping off, so the fallback and the studio
  show different blues. Phosphor text is `#bfc9ff`/`#c4ccff`/`#f0f0ff` in the
  texture and `#b4c4ff` in the point light versus `--screen-text: #dfe6ff`;
  `--screen-black` is repeated as a literal. Eight `border-radius` values
  (3, 14, 18, 24 px) fall outside the 2/4/8/12/20 token scale.
- **Impact:** No visible mismatch inside one presentation; a palette change
  must be made in two places and the two presentations already disagree on the
  idle blue.
- **Standard:** Design-token consistency; dark-only theming is intentional.
- **Recommendation:** Export the screen palette once (a small TS module that
  also feeds `tokens.css`, or read the custom properties at texture time) and
  either add `--r-key: 3px` / `--r-screen: 14px` tokens or fold the strays onto
  existing ones.
- **Suggested command:** `$impeccable polish`.

### 9. Three shell links sit under the 44 px benchmark

- **Location:** `src/components/Stage.module.css:14-20, 48-58`.
- **Category:** Responsive design.
- **Evidence:** At every viewport the identity link measures **101×40 px**,
  GitHub **56×42 px**, LinkedIn **63×42 px**. Everything else, including the
  reader contact links and deck keys, is at or above 44 px.
- **Impact:** Slightly more precise taps in the header and footer; no overlap
  with neighbours.
- **Standard:** 44 px is [WCAG 2.5.5 (AAA)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html);
  the 24 px AA minimum passes.
- **Recommendation:** Raise `padding-block` on `.navigation a, .footer a` to
  13 px and give `.identity` a 44 px `min-height`.
- **Suggested command:** `$impeccable adapt`.

### 10. The full-viewport canvas stays live under the phone reader

- **Location:** `src/components/Stage.tsx:527-535`,
  `src/components/Stage.module.css:127-135`.
- **Category:** Performance.
- **Evidence:** While the native reader is open on a 390×844 phone, a
  390×844 WebGL canvas (DPR capped at 1.75, 2048² shadow map) remains mounted
  underneath, inert and fully covered. It requests no frames, so the cost is
  retained GPU memory rather than CPU.
- **Impact:** Low; matters most on memory-constrained phones during long
  reads.
- **Recommendation:** When the native reader owns playback, shrink the canvas
  back to the box or unmount the renderer until eject.
- **Suggested command:** `$impeccable optimize`.

## Detector verification and false positives

- The static detector returned one advisory, `border-accent-on-rounded` on
  `DeckControls.module.css:18` (`border-bottom: 3px solid` with a 3 px radius).
  Verified false positive: the thicker bottom edge is the hardware key's
  mechanical relief, documented in the surface brief, and it moves on press.
- axe reported seven `color-contrast` nodes as incomplete inside the readers
  because the grain, scanline, and vignette layers overlap the text. Computed
  by hand from the tokens: screen text 16.1:1, screen dim 8.0:1, screen soft
  10.2:1, OSD white on CRT blue 9.4:1. Under the vignette's 25% darkening
  (the most any text sits under) the lowest pair is 4.8:1; the 50% corner
  where it would fall to 4.3:1 holds no text.
- Lighthouse's `valid-source-maps` fails because production maps are not
  shipped; that is a build choice, not a user issue. `render-blocking-resources`
  is the 6 KB stylesheet (151 ms simulated); inlining it is optional.
- The first (headless) Lighthouse run's TBT of 4.5 s and score of 45 were
  SwiftShader artifacts and are not reported.
- The console warning "THREE.Clock has been deprecated" comes from
  `@react-three/fiber` 9.7.0 with three 0.186, not from app code.

## Patterns and positive findings

The remaining gaps cluster at the edges of the SPA model: what exists before
JavaScript runs (title, metadata, first paint) and what the HTML layer does
while the studio is idle (grain paint). The interaction model itself audits
clean.

Preserve these strengths:

- axe: zero violations across nine states; Lighthouse accessibility and
  best-practices 100 on both routes.
- Keyboard: skip link first, arrows and Home/End on the index, the playback
  loop cycles Sound → Eject → article, Escape ejects, and focus returns to the
  ejected tape's link. Every stop draws the 2 px VFD ring.
- Reduced motion keeps every state change: the reader opens in 372 ms, CSS
  animations collapse to 0.01 ms with one iteration (grain static, REC solid),
  and the handoff swaps instead of fading.
- The on-demand loop is honored: zero animation frames requested at rest at
  home, after a hover, during playback, and under the phone reader. Insert and
  eject run without a dropped frame on desktop and with one 42 ms frame on the
  4× phone profile.
- No horizontal overflow at 320, 390, 720, 768, 844, or 1440, including with
  WCAG text-spacing overrides on the home page and the reader; 720×500,
  844×390, and 768×1024 all route to the native reader. Reader prose is 17 px
  on the phone with a scrollable article and 44 px contact links.
- Fonts are self-hosted, unicode-range subset, and `swap`; the first paint
  shifts by 0.0001 on desktop and 0.023 on the phone profile (font swap).
- The deep-link path is progressive: on the phone profile the article is
  readable at 945 ms while the scene arrives at 3.3 s.
- Token contrast is 4.79:1 or better everywhere on the chassis and 8:1 or
  better on the screen; the DOM is 111 nodes and the heap 17 MB at home.
- Placeholders remain explicit; no real project claims were introduced.

## Recommended actions

1. **P1 — `$impeccable harden`:** route titles and descriptions from `Stage`
   (finding 1); hide the native reader only after the modeled title has focus
   (7); typed media dimensions with an eager first image (5).
2. **P2 — `$impeccable optimize`:** build-time pre-render with hydration and a
   deferred scene boot (2); compositor-only grain (3); release the canvas under
   the phone reader (10).
3. **P2 — `$impeccable clarify`:** names composed from visible text on the
   identity and tape index links (4).
4. **P2 — `$impeccable harden`:** `robots.txt`, `sitemap.xml`, canonical,
   Open Graph and Twitter defaults, VHS favicon and touch icon, `theme-color`,
   `color-scheme: dark`, and the social card (6).
5. **P3 — `$impeccable adapt`:** 44 px header and footer links (9).
6. **P3 — `$impeccable polish`:** one source for the screen palette, radii on
   the token scale (8), and a closing review of the completed fixes against
   Midnight Studio.

You can ask me to run these one at a time, all at once, or in any order you prefer.
Re-run `$impeccable audit` after fixes to see your score improve.

## Remediation addendum — 2026-09-21

The findings and score above record the audit as run; this is not a new
score. Details and mechanisms are in `PLAN.md`, "Second audit remediation".

| #   | Finding                       | Status                                                                                                           |
| --- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | Titles and route metadata     | Closed: titles in the harden pass; per-route title, description, and share tags are written into each drawn page |
| 2   | Blank until JavaScript runs   | Closed: every route pre-rendered and hydrated; the studio's module waits for first paint and idle                |
| 3   | Grain repaints at rest        | Closed: the grain steps by transform on its own layer                                                            |
| 4   | Label in name                 | Closed: links are named by the words they show                                                                   |
| 5   | Media without intrinsic size  | Closed: required `width` and `height`; eager first image                                                         |
| 6   | Publishing scaffolding        | Closed, except what needs the site's address (sitemap, canonical), which the build adds once `SITE_URL` is set   |
| 7   | Focus in hidden content       | Closed: hidden only once the modeled reader holds focus                                                          |
| 8   | Palette and radius drift      | Closed: one palette read by both renderers, one idle blue, named radii                                           |
| 9   | 44 px links                   | Closed in the closing polish                                                                                     |
| 10  | Canvas under the phone reader | Closed: the canvas keeps its box while the native reader owns playback                                           |

Measured again on the same phone profile (390 × 844, 4× CPU, 1.6 Mbps /
150 ms, cache disabled, real GPU), production build:

| Measure                                   | Audit baseline, re-measured | After    |
| ----------------------------------------- | --------------------------- | -------- |
| First contentful paint, home              | 944 ms                      | 508 ms   |
| Largest contentful paint, home            | 944 ms                      | 508 ms   |
| First contentful paint, project deep link | 1,012 ms                    | 520 ms   |
| Largest contentful paint, project         | 1,104 ms                    | 520 ms   |
| Cumulative layout shift, project          | 0.050                       | 0.022    |
| Scene ready, home                         | 3,767 ms                    | 3,195 ms |
| Main thread at rest in playback, per 4 s  | 201 ms                      | 30 ms    |
| Lighthouse mobile performance, home       | 79–80                       | 89       |
| Lighthouse mobile LCP, home               | 3.5 s                       | 1.8 s    |
| Lighthouse mobile total blocking time     | 300–350 ms                  | 400 ms   |
| Lighthouse mobile SEO                     | 91                          | 100      |

The Lighthouse rows are paired runs on one machine, the old build and the
new served side by side; they are comparable to each other, not to the
67/62 above, which came from another session. Blocking time reads higher
because first paint is earlier, so more of the same startup falls inside
the window it counts. Lighthouse's `label-content-name-mismatch`,
`robots-txt`, `unsized-images`, and `lcp-lazy-loaded` checks pass.
axe-core 4.10.3 (the same tags, with `label-content-name-mismatch` enabled)
over seven states of the built site, home at 1440 and 390, modeled playback
of a project and of About, the phone native reader, and both NO SIGNAL
routes, reports zero violations; the label rule finds nothing to check, as
no link's name comes from an `aria-label` any more, and the only incompletes
are the overlay-layer contrast nodes resolved by hand above (OSD white on
the one idle blue, `#242bd9`, is 8.7:1). Not re-run: axe on the two no-WebGL
states, and the frame-gap measurements.

---

# Technical UI audit — 2026-09-15 (historical)

The findings and score below record the original audit. Follow-up fixes are
tracked in the remediation addendum at the end; this is not a new audit score.

## Implementation integrity verdict: PASS

The implementation expresses the Midnight Studio system: procedural low-poly
equipment, restrained HTML chrome, tape-driven navigation, and CRT-contained
effects. Project placeholders are explicit, and the HTML archive provides an
accessible equivalent to selecting modeled tapes. The visual identity is coherent.

Release readiness needs work in reader sizing, keyboard access, and touch behavior.
This audit documents findings; application code was not changed.

## Executive summary

**Audit Health Score: 13/20 — Acceptable; significant work needed.**

**10 consolidated issues: 0 P0, 3 P1, 6 P2, 1 P3.** These counts represent verified
problems, rather than individual detector warnings or affected elements.

| #         | Dimension                | Score     | Key finding                                                                                                      |
| --------- | ------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------- |
| 1         | Accessibility            | 2/4       | Keyboard users cannot return to scrolling project content after leaving the heading; About label/name mismatch   |
| 2         | Performance              | 3/4       | Desktop reading waits for the 250 KB gzip scene chunk                                                            |
| 3         | Responsive design        | 2/4       | Landscape shrinks modeled-screen text and clips the fallback reader; touch scrolling is blocked over the exhibit |
| 4         | Theming                  | 3/4       | HTML tokens work; shared screen colors are duplicated in WebGL literals                                          |
| 5         | Implementation integrity | 3/4       | Coherent product-specific implementation; canvas typography has a font-loading race                              |
| **Total** |                          | **13/20** | **Acceptable**                                                                                                   |

Prioritize the three P1 findings, then touch scrolling and functional text sizes.
The score is a qualitative technical audit rating, not a Lighthouse score or WCAG
conformance certificate.

## Scope and verification

- Reviewed the current working tree, `PLAN.md`, product/design context, tokens,
  routing, scene, reader, accessibility handlers, and existing browser tests.
- **Passed:** `npm run build`, `npm run lint`, `npm run format:check`, and all
  **9 tests** in `npm run test:e2e` using Chrome.
- Inspected the production build in Chrome at **1440 × 1000, 390 × 844,
  320 × 740, 768 × 1024, 600 × 800, 844 × 390, and 720 × 500**.
- Used one batched inspection and one targeted confirmation: screenshots,
  rendered geometry, keyboard scrolling, touch gestures, delayed fonts,
  delayed scene loading, text-spacing overrides, and no-WebGL landscape playback.
- Ran Impeccable's bundled static detector and its browser detector. Findings
  were checked against rendered behavior and the binding design direction.
- Browser measurements and screenshots are in the temporary directory
  `/tmp/personal-site-audit/`; static findings are in
  `/tmp/personal-site-audit-detector.json`. Reproduction steps below remain useful
  after these temporary artifacts are removed.

No Lighthouse run, real-device GPU benchmark, native screen-reader session, or
full browser-zoom conformance test was performed. Normal-size HTML text/background
contrast was checked; this does not certify every composited CRT pixel. Real
project media and publishing metadata remain scheduled Stage 8/9 work.

## P1 — Major: resolve before release

### 1. Short viewports break both reader presentations

- **Location:** `src/components/Stage.tsx:49`,
  `src/components/studio/StudioScene.tsx:59`,
  `src/components/Stage.module.css:337`, `src/components/Stage.module.css:370`.
- **Category:** Responsive design / Accessibility.
- **Evidence:** At **844 × 390**, the desktop screen transform reduces 17px prose
  to approximately **8.7px on screen**. At 720 × 500 it becomes 11.8px.
  The native phone reader is selected only below 600px in width.
  With WebGL disabled at 844 × 390, the reader starts at **y = −101.5px**;
  its heading ends at y = −12.1px, entirely above the viewport. Body scrolling
  is locked, and the fixed transport obscures the reader's bottom.
- **Impact:** Landscape phone visitors struggle to read; fallback visitors lose
  the heading and cannot reveal it through the reader's normal scrolling.
- **Standard:** Project requirements for readable content and fallback parity.
  The measured small type is a legibility defect; WCAG does not specify an
  absolute minimum font size. Browser zoom/reflow conformance is not claimed here.
- **Recommendation:** Select the native reader when available height or the
  modeled screen scale becomes insufficient. Bound the fallback frame by the
  space above transport, with a shrinking, independently scrollable interior.
- **Suggested command:** `$impeccable adapt`.

### 2. Leaving the project heading removes keyboard access to scrolling

- **Location:** `src/components/Stage.tsx:136`, `src/components/CRT.tsx:48`.
- **Category:** Accessibility.
- **Reproduce:** Open `/project/placeholder-alpha`, press Page Down, then Tab.
  Continue pressing Tab and Page Up. Focus cycles between Sound and Eject;
  reader scroll position remains unchanged. In the confirmed run it stayed at
  **380px** across six cycles.
- **Cause:** The reader has no explicit Tab stop, its heading uses `tabIndex=-1`,
  and the focus loop includes only links, buttons, and controlled video.
  Current project tapes have no rendered project links.
- **Impact:** After operating transport, keyboard users must eject and reopen
  the tape to regain scrolling. Escape still exits playback.
- **Standard:** Keyboard operability under
  [WCAG 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html).
- **Recommendation:** Make the scrollable article a named keyboard stop and
  include it in the modal focus loop. Keep initial title focus, and verify
  Page Up/Down work after visiting transport controls.
- **Suggested command:** `$impeccable harden`.

### 3. “About Daniel” is absent from the tape's accessible name

- **Location:** `src/components/Stage.tsx:444`.
- **Category:** Accessibility.
- **Evidence:** The visible label is **About Daniel**; the link's `aria-label`
  is **Play tape: Daniel Alyoshin (2026)**.
- **Impact:** Speech users referring to the visible label may not activate the
  expected link. Visible and announced labels disagree.
- **Standard:** [WCAG 2.5.3 — Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)
  requires the accessible name to contain the visible text label.
- **Recommendation:** Derive both labels from the same display name, for example
  “Play tape: About Daniel (2026),” or use the visible label as the name and put
  additional context in a description.
- **Suggested command:** `$impeccable harden`.

## P2 — Minor: address in the next pass

### 4. The exhibit blocks vertical touch scrolling

- **Location:** `src/components/studio/StudioScene.tsx:540`,
  `src/components/Stage.module.css:108`.
- **Category:** Responsive design.
- **Evidence:** The Canvas wrapper has inline **`touch-action: none`**. The
  stylesheet's `pan-y` targets the descendant canvas and cannot override that
  ancestor. At 390 × 844, an upward touch swipe over the exhibit left page
  scroll at **0px**; a control swipe on the introduction scrolled **145px**.
- **Impact:** A 350px-tall, full-width portion of the phone page captures normal
  browsing gestures. Visitors must begin scrolling outside the exhibit.
- **Standard:** Touch usability; no specific WCAG failure asserted.
- **Recommendation:** Allow vertical panning on the actual event wrapper and
  coordinate OrbitControls gestures with it. Keep intentional horizontal orbiting
  or provide explicit activation for orbit mode on touch devices.
- **Suggested command:** `$impeccable adapt`.

### 5. Functional labels use 7–10px type

- **Location:** `src/components/Stage.module.css:273`,
  `src/components/Stage.module.css:389`, `src/components/Stage.module.css:550`.
- **Category:** Accessibility / Responsive design.
- **Evidence:** Tape placeholder disclosures are **7px**; the phone curation
  message and playback state are **8px**; mobile transport text is **10px**.
  The browser detector reported 24 undersized-text elements on desktop home
  and 26 on phone home. These are grouped into one issue.
- **Impact:** Visitors can miss that projects are placeholders or struggle to
  read instructions and playback state. These labels communicate useful content.
- **Standard:** Impeccable's functional-type quality floor, not an absolute
  WCAG font-size requirement.
- **Recommendation:** Raise functional HTML labels to at least 11–12px and let
  the archive entries and controls accommodate them. Preserve tiny physical
  equipment print where it serves the modeled artifact.
- **Suggested command:** `$impeccable typeset`.

### 6. Several phone controls miss the 44px touch target

- **Location:** `src/components/Stage.module.css:539`,
  `src/components/Stage.module.css:588`, `src/components/CRT.module.css:236`.
- **Category:** Responsive design.
- **Evidence:** Reset measures **32 × 32px**; browse Sound **30 × 32px**;
  playback Sound **40 × 42px**; Eject is **39px high**; reader contact links
  are **34px high** before desktop scene transforms.
- **Impact:** Small controls require more precise taps, particularly near Eject.
- **Standard:** The 44 × 44px benchmark corresponds to
  [WCAG 2.5.5, AAA](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html).
  These measurements alone do not establish an AA failure: WCAG 2.5.8 uses a
  [24px minimum with exceptions](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).
- **Recommendation:** Enlarge hit areas with padding/minimum dimensions, retaining
  compact visible glyphs and preventing adjacent hit-area overlap.
- **Suggested command:** `$impeccable adapt`.

### 7. Desktop deep-link reading waits for the whole scene module

- **Location:** `src/components/Stage.tsx:343`.
- **Category:** Performance.
- **Evidence:** Production output contains **259.09 KB / 83.60 KB gzip** of main
  JavaScript and **938.11 KB / 250.07 KB gzip** of scene JavaScript. Holding the
  scene request on `/project/about` leaves no article in the desktop DOM;
  the reader appears only after the module is released. The loading placeholder
  replaces the reader inside Suspense.
- **Impact:** Visitors following a shared project link wait for graphics code
  before accessing HTML content that is already available to the app.
- **Standard:** Performance and progressive reading availability; no measured
  Core Web Vitals failure asserted. Three.js itself is an authorized requirement.
- **Recommendation:** Render the native reader during scene loading for direct
  playback routes, preserving focus and scroll if it later moves onto the CRT.
  Profile download/parse/render cost before adding more chunk splits.
- **Suggested command:** `$impeccable optimize`.

### 8. Canvas labels retain fallback fonts after the intended fonts load

- **Location:** `src/components/studio/geometry.tsx:89`,
  `src/components/studio/Tape.tsx:54`,
  `src/components/studio/StudioScene.tsx:113`,
  `src/components/studio/StudioScene.tsx:471`.
- **Category:** Implementation integrity.
- **Evidence:** With font requests held, **33 of 45** recorded canvas text draws
  happened before their specified fonts were available. After releasing fonts,
  Archivo became available but the draw count stayed **45**. The font-ready
  handler invalidates a frame; it does not redraw memoized canvas textures.
- **Impact:** Cold-cache visitors can see inconsistent cassette, hardware, and
  CRT lettering for the rest of the visit.
- **Standard:** Midnight Studio typography consistency.
- **Recommendation:** Redraw font-dependent textures after their fonts load, or
  gate texture creation on explicit font readiness while keeping HTML usable.
  Continue disposing replaced textures.
- **Suggested command:** `$impeccable harden`.

### 9. Header About suppresses modified link activation

- **Location:** `src/components/Stage.tsx:280`.
- **Category:** Implementation integrity.
- **Evidence:** The header About handler always calls `preventDefault()`. A
  Cmd-click navigated the current page to `/project/about` and opened no new tab.
  Archive links already contain modifier-key guards.
- **Impact:** Opening About in a background tab behaves differently from normal
  links and the adjacent tape index.
- **Standard:** Native browser link conventions.
- **Recommendation:** Apply the archive link's modifier-key handling to About,
  or share the existing selection-link behavior between both entry points.
- **Suggested command:** `$impeccable harden`.

## P3 — Polish

### 10. Shared HTML/WebGL screen colors have separate literal sources

- **Location:** `src/styles/tokens.css:23`,
  `src/components/studio/StudioScene.tsx:165`,
  `src/components/studio/StudioScene.tsx:194`.
- **Category:** Theming.
- **Evidence:** Semantic screen colors such as `#07080c` and phosphor
  `#b4c4ff` are repeated between the CSS/design system and scene code.
- **Impact:** No current visible color mismatch was found. Future palette changes
  require manual synchronization and can separate the fallback from the 3D view.
- **Standard:** Design-token consistency. The intentionally dark-only theme is
  valid; an additional light mode is not required.
- **Recommendation:** Share semantic screen colors between HTML and WebGL.
  Keep object-specific material colors as deliberate scene data.
- **Suggested command:** `$impeccable polish`.

## Detector verification and false positives

The static scan returned **33 findings**: 32 `design-system-font-size` and one
`design-system-radius`. All were labeled advisory in their finding payloads,
although this detector invocation exited with code 2.

- Several font values are explicitly described in DESIGN.md's narrative,
  including the 13px mobile nameplate and 28px mobile title maximum. The detector
  compares the structured ramp, so those warnings alone are not implementation
  drift. Smaller functional text was independently verified in finding 5.
- The flagged base 12px screen radius is overridden by the active embedded
  reader's 14px radius. It is not a visible defect in the current routes.
- The rendered detector's single-font warning ignores VT323 baked into canvas
  textures. Archivo outside the CRT and VT323 inside it are intentional.
- Uppercase short labels, tracked equipment metadata, and tight display tracking
  match the pinned system; inspected headings do not have character collisions.
- CRT glow and cyan playback text follow the One Light Rule. The native frame is
  equipment framing, rather than a generic nested-card layout. Screen clipping
  is intentional at the tested desktop size; the separately reproduced fallback
  clipping in finding 1 is a real defect.
- Initial script-tag injection made the detector scan its own source and report
  nonexistent marquee/gradient-text/phrase matches. The confirmation used direct
  script evaluation; those three matches disappeared and were discarded.

No low-contrast text finding appeared in the inspected DOM states. The detector
does not establish complete canvas or assistive-technology accessibility.

## Patterns and positive findings

Recurring gaps center on the boundary between the modeled exhibit and HTML:
viewport height, focusable scrolling, touch gesture ownership, and resource
readiness. Several existing tests check visibility or call `scrollTop` directly;
they therefore miss real keyboard scrolling and physical text scale.

Preserve these strengths:

- Semantic archive links, arrow/Home/End navigation, explicit focus cues,
  modal background isolation, Escape/eject, and reliable focus return.
- Reduced motion immediately skips insertion and camera interpolation. The CSS
  duration gate retains state feedback; no loss of useful state was observed.
- Sound is opt-in, synthesized, and resets on a fresh visit.
- The normal portrait reader maintains 16px prose and independent scrolling.
  Standard-size home layouts had no horizontal overflow across the seven widths.
- Missing WebGL and graphics context loss retain archive/content functionality
  in the existing regression tests; the landscape exception is recorded above.
- Token contrast: dim silkscreen/page **5.63:1**, dim silkscreen/hover **4.79:1**,
  screen metadata/black **8.02:1**, and prose/black **16.11:1** before CRT effects.
- The scene loads separately, renders on demand, caps DPR at 1.75, and disposes
  generated textures and geometry. Assets and fonts are local.
- Placeholder project destinations are filtered out; no invented real project
  claims were introduced. The forthcoming content pass remains explicit.

Text-spacing overrides at 320px left the active reader within its width and
transport reachable. They produced 8px of document overflow in the offstage
shell; this limited check does not certify text-spacing support throughout the
home page or future content.

## Recommended actions

1. **P1 — `$impeccable harden`:** Restore keyboard scrolling and fix the About
   accessible name; also address font readiness and modified link activation.
2. **P1/P2 — `$impeccable adapt`:** Fix low-height reading in both rendering paths,
   restore vertical touch scrolling, and enlarge control hit areas.
3. **P2 — `$impeccable typeset`:** Raise functional labels and placeholder
   disclosures without changing the physical equipment typography.
4. **P2 — `$impeccable optimize`:** Make desktop deep-link reading available
   while scene code loads.
5. **P3 — `$impeccable polish`:** Consolidate shared screen colors and review
   the completed fixes against Midnight Studio.

You can ask me to run these one at a time, all at once, or in any order you prefer.
Re-run `$impeccable audit` after fixes to see your score improve.

## Remediation addendum — 2026-09-15

- Findings **1, 2, 3, and 5** were addressed in the critique follow-up: native
  reading on narrow or short viewports, a named keyboard-focusable article,
  an About label/name match, and readable functional captions.
- Findings **4, 6, 7, 8, and 9** are addressed by the interaction/loading pass:
  native vertical touch scrolling with horizontal orbit, 44px reader links,
  immediate HTML reading before scene loading, font-triggered canvas redraws,
  and modified-click support for header About. Scene controls were already
  enlarged in the critique follow-up.
- Direct links and early selections keep the same native article through scene
  loading or failure. On failure its focus and scroll position stay in place;
  once a desktop scene is ready, the modeled screen takes over in one dissolve
  and the article continues at the same scroll depth and focus (2026-09-15
  deep-link handoff). Ejecting returns to the studio; selecting from a ready
  desktop scene uses the CRT. Returning through browser history also restores
  content before graphics load.
- Finding **10** (shared HTML/WebGL color sources) remains open. Stage 9's
  broader performance, accessibility, and SEO review also remains open.

Verification: all **17 Chrome regression tests**, production build, ESLint, and
formatting passed. Delayed graphics tests preserve article identity, keyboard
focus, and scroll through module success/failure; history and early selection
also work while loading. Cold-cache font tests verify changed live texture
pixels, an on-demand frame, and unchanged disposed maps. Chrome touch events
verify native vertical scrolling, horizontal orbit, and cassette taps.

The held-module comparison changed from **zero articles** to **one readable
article before graphics are ready**. Viewport review measured phone contact
links at **44px high with 16px separation**, modeled desktop contacts at **67px
high**, and the updated component preview at **98 × 44px**. The repeated
decorative typography advisories remain classified above; no detector rules
were suppressed. The original score remains historical; no new Lighthouse or
Core Web Vitals result is claimed. Touch checks used Chrome emulation, not
physical-device testing.
