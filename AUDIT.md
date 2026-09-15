# Technical UI audit — 2026-09-15

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
  loading or failure. Its focus and scroll position stay in place. Ejecting
  returns to the studio; selecting from a ready desktop scene uses the CRT.
  Returning through browser history also restores content before graphics load.
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
