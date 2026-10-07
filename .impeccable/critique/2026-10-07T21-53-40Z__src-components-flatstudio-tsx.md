---
target: no-WebGL still + note (spacing/alignment/sizing/styling of the note text)
total_score: 27
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 0
timestamp: 2026-10-07T21-53-40Z
slug: src-components-flatstudio-tsx
---
Method: dual-agent (A: design review sub-agent · B: detector + browser sub-agent)

Target: the no-WebGL state from 4b9b0dd (the studio's still + FlatNote), focused on the note's spacing, alignment, sizing and styling.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | All three cases are named correctly. On context loss the note appears with no fade and the box grows ~100px, so the archive jumps (1440×900). |
| 2 | Match System / Real World | 3 | "(WebGL)" and "hardware acceleration" are jargon, though bracketed and actionable. |
| 3 | User Control and Freedom | 3 | Reload only where it can help. Escape, eject and the list all work. |
| 4 | Consistency and Standards | 3 | Three placements with three spacing ratios (24/12, 8/8, no seam). The seam inside the column is a new idiom. |
| 5 | Error Prevention | 3 | No pointless Reload when WebGL is missing. "can"/"may" never over-promise. |
| 6 | Recognition Rather Than Recall | 3 | At 1440×900 the grown box pushes the Projects heading from y817 to y916, below the fold. |
| 7 | Flexibility and Efficiency | n/a | Experience surface, fallback state; no accelerators to judge. |
| 8 | Aesthetic and Minimalist Design | 3 | The note outweighs the guide it follows, and on short windows it costs the still 20–28% of its size. |
| 9 | Error Recovery | 3 | Names the problem and the fix. On a managed laptop neither fix may be possible. |
| 10 | Help and Documentation | 3 | Contextual and case-specific. Leaves out the fix that always works (another device), apart from the touch copy. |
| **Total** | | **27/36** | **Good (75%)** |

## Design Specificity Verdict

LLM assessment: authored, not generic. The still can't be told from the live studio at rest, its rack still picks (hover lifts the tape and the tube names it), and the note speaks in the page's voice with the guide's own type pair. It never reads as an error box. The weaknesses are placement and economy, not language.

Deterministic scan: detect.mjs on FlatStudio.tsx + Stage.tsx, and on src/components (27 files), exit 0 with no findings. The in-page overlay ran on 5 views. Its banner flags (single-font, pulsing REC dot, phosphor glow, scanline stripes, all-caps eyebrow) are the diegetic CRT effects and the label style that DESIGN.md sanctions, so they are false positives. `clipped-overflow-container` on `.studio` at 390×844 is the documented cut of the phones' table. Nothing touched the note.

## Measured facts (note)
- Title 14px/600 `--silkscreen` (9.98:1). Detail 12px/18px/400 `--silkscreen-dim` (5.63:1), balance, max 64ch = 440px. Reload hit area 65×44; focus ring 10px clear of the reason.
- Left edges: 0px delta to the guide and headline in every column layout. The tablet portrait note sits on the page column (x41), not the guide's (x477), which is the documented rule.
- Guide to note-title text: 40px on desktop (24 margin + 1px seam + 12 padding), 20px sideways (8 + 1 + 8). Title to detail: 8.9px everywhere.
- No horizontal overflow, nothing clipped, no still pixels under the note in any view.

## Priority Issues

**[P2] On short laptop windows the note shrinks the still.** The note lengthens the column by ~106px (~140px with Reload), and the still must clear it, so it drops and shrinks: 1366×657 lost = 758px wide against 1006px live; 1280×720 = 951–995 against 1152; 1536×730 = 1001 against 1382. That leaves a dead upper-left quadrant, on exactly the managed work-laptop sizes where the hiring visitor lands. Fix: below ~820px tall, keep the title (and Reload) in the column and move the reason under the box, or shorten the reason to two lines and drop the padding to 8px. Command: /impeccable layout.

**[P2] The note is orphaned on portrait tablets, and loosely tied on phones.** At 820×1180 the drawn still ends ~80px above the note, and the note sits 24px above the archive seam, so it reads as an intro to Projects. Phones: ~36px above, 24px below. Fix: FlatStudio publishes the plate's empty depth (`--still-slack`); then `.flat .flatNote { margin: calc(8px - var(--still-slack, 0px)) 0 32px }`, so the gap above is always smaller than the gap below. Command: /impeccable layout.

**[P2] The note outweighs the instruction it follows.** Its title is the guide title's size and weight (14/600), one colour step down, and its 30-word reason runs 3 lines (4 at 800×560 and 844×390), so the column's heaviest block is about what's missing rather than what to do. The reason also restates the title ("The full site is a live 3D studio"). At four lines, balance makes awkward breaks ("Turning / on hardware…"), and at 820 "(WebGL)." starts a line. Fix: shorten the reason (keep offered), and consider the title in caption size at 600 (DESIGN.md first). Commands: /impeccable clarify, /impeccable typeset.

**[P3] The seam crowds the guide on a sideways phone.** At 844×390 the guide-to-seam gap is 8px, half the display-to-guide gap, so the seam reads as an underline of "Pick one from the projects below." Fix: `.flatNote { margin-top: 12px }` in the `(width >= 740px) and (height < 540px)` block (22px spare at the fold with Reload). Command: /impeccable layout.

**[P3] Losing graphics mid-visit is abrupt.** The note appears without the 240ms fade the stills use, and at 1440×900 the box grows ~100px, so the archive drops. Fix: fade the note in on --t-med, and consider not growing the box for the lost case. Command: /impeccable polish.

## Persona Red Flags
- Jordan (first-timer): may read "this browser isn't giving it 3D graphics" as "I must fix something first". Nothing says the still and the list work as they are.
- Sam (keyboard/screen reader): good overall. The Reload ring is clear, the status message names the state, and the still's targets are aria-hidden with the list carrying access. The note is a role="note" div with no heading, so heading navigation can't find it (minor).
- Casey (phone): "Pick one from the projects below." is followed by the still and then three dim 12px lines before the projects arrive. The note sits nearer the archive seam than the table.
- Hiring engineer on a locked-down laptop (1366×657 / 1536×730): a still 20–28% smaller than live, sitting low. Both remedies offered (hardware acceleration, another browser) are often blocked by IT policy, and the one that works (open it on a phone) isn't offered. "The full site is…" tells them outright they're judging the lesser version.

## Minor Observations
- The stacked titles differ in punctuation: "Choose a tape to play" has no full stop; "You're seeing a still of the studio." does.
- Spacing ratios by layout: tall 24/24/12, short 16/16/12, sideways 16/8/8 (display→guide, guide→seam, seam→note).
- The detail text stops 174px short of the column's right edge at 1440 (64ch + balance), while the seam runs the full column. Acceptable, but the block reads narrower than its rule.
- Reload's 14px print under a 12px reason reads fine as a link.

## Questions to Consider
- Does the visitor need to learn they're on a still before trying it, when everything that matters still works? Could the note be one line, with the reason on request?
- On a managed laptop the real remedy is another device. Should the desktop copy say so?
- Could the still's own tube carry the notice in the studio's language, instead of more prose in the column?
- On short windows, is a full-size still with the reason below it better than a smaller still with the reason beside it?
