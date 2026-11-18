# Solo design review — Remix playtest

This is a review build on `experiment/remix-playtest`, not a submitted competition entry. The previous version remains on `master`.

## Design diagnosis

The existing game had a coherent visual identity and musical system, but each order restarted an empty box and increased the same checklist. There was little reason to keep exploring after a valid arrangement, and no relaxed way to play the music as a toy. This was a design judgment, not a finding from external user testing.

## Ideas considered

| Idea | Decision | Why |
| --- | --- | --- |
| Rescue an existing rehearsal | Implemented | A situation with an obvious problem gives the player an immediate reason to move a food. |
| Reserve seats for the passenger's tea | Implemented | Changes the geometry of one puzzle rather than adding another numerical threshold. |
| Optional golden stages and encore tickets | Implemented and rebalanced | Rewards a better musical arrangement without blocking an ordinary completion. |
| A short solo on demand | Implemented | Makes an individual food's contribution easier to hear and encourages experimentation. |
| Persistent Free Jam, with tempo control | Implemented | Separates musical exploration from order requirements. |
| Mandatory rhythm-timing inputs | Not prototyped | Would demand reflexes from a game whose primary appeal is arranging and listening. |
| Random ingredient queues and permanent mistakes | Not prototyped | Would complicate the tutorial and reduce the player's freedom to explore the band. |

## What to try

1. Start **Cozy**: the six-order campaign now has no countdown. **Rush** on the title screen restores the clock and three missed-order lives.
2. Order two begins with separated partners. Order three begins with an argument. Order four reserves two cells for a thermos. The finale carries the arrangement from the previous order.
3. Complete an order, or keep working on it: one ticket for serving, one for getting every represented food type singing, one for occupying the gold stages with happy singers. Up to 18 tickets across the campaign.
4. Select a placed player and press **Space**, or use **SOLO**. For five seconds, other instrumental layers duck and the featured player gets extra musical phrases. Gold stages also add an occasional ornament.
5. Open **Free Jam** from the title. Your arrangement autosaves locally; switch between 76, 96 and 120 BPM, clear the box and undo, or just keep composing. This mode cannot earn campaign points.
6. Drag a placed piece from any occupied cell: it now retains the grabbed offset. Escape first cancels a selected piece, then pauses when nothing is selected.

## Local experiments and results

- Initial bonus prototype required every individual piece to be happy. The bounded search did not find maximum ratings for the last two orders; this was too restrictive for the intended optional reward. The released playtest asks every food *type* to have a singing representative instead.
- A search against the actual evaluation code found a valid three-ticket solution for **each of the six stages**, respecting each menu and the reserved cells.
- Simulated input handlers completed the campaign, including the new rack, rotations and seeded pieces; drag, remove, undo, pause and guide checks passed.
- Dedicated regressions checked seeded arguments, blocked tea seats, cozy/rush clock behavior, star rewards, Free Jam save/restore, clear/undo, tempo changes, solo expiry and extra solo notes.
- Offline rendering of the actual synthesis graph exercised the full band, gold-stage ornament, solo and tempo changes: 33 seconds, no clipped samples, peak 0.249 and no remaining sources after stop.
- Source renders were inspected for the title, tea stage, rehearsal starts, full box, Free Jam and encore. A text overlap on the reserved thermos was removed.

## Verification limits

These checks establish that the mechanics function and the puzzles have solutions. They do not establish that human players find the game fun. The browser integration remains unavailable in this chat, so there was no new browser playtest, subjective listening review or fresh competition screenshot capture. Source renders stay under `private/` and are not submission screenshots.

For the next human playtest, assess whether the first duet is understandable, whether the rescue stages feel different, whether soloing is satisfying, and whether optional tickets encourage another arrangement rather than busywork.
