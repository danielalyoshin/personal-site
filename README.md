# Daniel Alyoshin — Midnight Studio

A personal portfolio as a low-poly 3D studio. Pick a VHS cassette and the camera
moves toward a CRT to play its project details. The six tapes currently contain
five explicit placeholders and an About draft.

## Develop

Use a supported Node.js LTS release (22.13+ or 24+).

```sh
npm install
npm run dev
```

The app uses Vite, React 19.2, TypeScript, Three.js, React Three Fiber, and Drei.
React is pinned to 19.2.8 to match the renderer's peer range. Fonts, geometry,
labels, and sound are local; no external model or texture service is required.

## Explore

- Click a modeled cassette or its tape-index link to play it.
- Drag the studio to change the angle; the circular arrow restores the view.
  On touch screens, swipe vertically to scroll or horizontally to rotate.
- Arrow keys and Home/End navigate the tape index; Enter plays a tape.
- Eject or Escape returns to the archive and restores focus.
- Sound is optional and defaults off each visit.
- `/project/:slug` opens a tape directly; `/project/about` introduces Daniel.

Desktop tape selection shows selectable HTML on the 3D screen. Phones and short
viewports use a full-height reader. Direct links and selections made before
graphics load open that reader immediately and keep it stable through loading.
Reduced motion skips flights and camera interpolation.
WebGL unavailability or context loss falls back to the full HTML archive reader.

## Structure

| Location                                | Purpose                                                 |
| --------------------------------------- | ------------------------------------------------------- |
| `src/components/Stage.tsx`              | Routes, archive, focus, playback controls, fallback     |
| `src/components/studio/StudioScene.tsx` | Composition, lighting, camera, equipment                |
| `src/components/studio/Tape.tsx`        | Cassette model, labels, hover, insertion                |
| `src/components/studio/geometry.tsx`    | Single-bevel solids and printed details                 |
| `src/components/CRT.tsx`                | HTML project reader and CRT effects                     |
| `src/content/`                          | Typed project content and About tape                    |
| `src/lib/sound.ts`                      | Opt-in synthesized mechanical cues                      |
| `e2e/`                                  | Studio, transport, loading, font, and touch regressions |

The scene is lazy-loaded and renders only when needed. Pixel ratio is capped at
1.75. The 3D dependency chunk is approximately 250 KB gzipped; the HTML shell
loads separately. See the [React Three Fiber rendering guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance).

## Verify

```sh
npm run build
npm run lint
npm run format:check
npm run test:e2e
```

The browser suite uses installed Google Chrome (`channel: 'chrome'`). It covers
real canvas rendering, modeled cassette selection, drag behavior, keyboard
navigation, reading, focus return and containment, deep links, browser history,
404s, reduced motion, 320px/390px mobile layouts, resize, sound reset, missing
WebGL, and graphics context loss. Hardening cases cover delayed or failed scene
loading, stable reader focus/scroll, modified clicks, contact targets, native
touch gestures, and delayed-font texture redraws. It starts a local server when
needed.

## Impeccable in Codex

Impeccable 4.0.2 is installed for this repository in
`.agents/skills/impeccable/`, matching the existing Claude plugin version.
The skill, command references, scripts, and agent definitions come from
[upstream revision `d272b9b`](https://github.com/pbakaus/impeccable/tree/d272b9bd5dcfcb52d32482d192d06045ca31c503/.agents/skills/impeccable).
Its Apache 2.0 license is included in the skill directory.

Use these prompts in Codex:

```text
$impeccable critique
$impeccable audit
$impeccable polish
```

The skill should appear on the next turn; restart Codex if it does not.
Codex discovers repository skills in `.agents/skills/` ([official skill docs](https://learn.chatgpt.com/docs/build-skills)).
Both agents use the existing `PRODUCT.md`, `DESIGN.md`, design sidecar, and
surface briefs. Initial project setup is already complete.

`.codex/hooks.json` connects Impeccable's checks after edits and at the end of a
turn. Open `/hooks` in Codex CLI from this project to review and trust these
definitions. Codex requires that review before non-managed hooks can run
([official hook docs](https://learn.chatgpt.com/docs/hooks)). Commands resolve
from the Git root, including when Codex starts in a subdirectory.

The Stop hook uses `scripts/codex-impeccable-stop.mjs` to translate Impeccable
4.0.2's findings into Codex's `decision: "block"` / `reason` response. The
after-edit hook still uses the upstream entry point. Clean passes, deduplication,
disabled-hook settings, and the repeated-Stop guard retain upstream behavior.
Run `npm run test:hooks` to check this integration without editing site files.
After installing or changing the hook command, review the updated Stop definition
in `/hooks`; Codex's trust is tied to the exact definition.

The vendored skill is excluded from project linting and formatting to preserve
upstream files. Hook cache and pending-session state are ignored by Git.

## Project guidance

- `AGENTS.md` and `CLAUDE.md` — identical working instructions
- `PLAN.md` — stage history and the user-directed 3D revision
- `DESIGN.md` — current art direction and design rules
- `PRODUCT.md` — audience, content, and constraints

Real project content, the full Stage 9 hardening pass, and deployment remain
future work. Commit and push only when Daniel requests them.
