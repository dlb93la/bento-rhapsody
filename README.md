# Bento Rhapsody

[![make.fun bounty](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01)
[![Rank](https://make.fun/badge/best-game-01/dlb93la/bento-rhapsody/rank.svg)](https://make.fun/bounty/best-game-01)
[![Reward](https://make.fun/badge/best-game-01/dlb93la/bento-rhapsody/reward.svg)](https://make.fun/bounty/best-game-01)

Pack a lunchbox. Accidentally start a band.

Bento Rhapsody is an offline musical packing puzzle. Six food characters have six distinct synthesized voices. Friends touching along an edge unlock each other's voices; rival neighbors grumble and silence their happy singing.

The lunchbox is a small jazz arrangement. Every packed food adds its own instrumental layer: upright bass, muted brass, electric piano, brush drums, nylon guitar or vibraphone. Friends unlock full instrumental energy and a sung entrance. Its leftmost column selects one of five entries within the swinging bar; its vertical position changes notes. An original eight-bar chord progression keeps the layers in harmony without restarting the music on every move.

Orders require happy duets and a minimum number of distinct singing entries, as well as ingredients and packed spaces. The same food can fit perfectly and still need rearranging to make the chorus work. No timing reflex or musical knowledge is required.

Serve six listeners before their trains leave. Each passenger joins their lunchbox's chorus. In the finale, **The Midnight Bites** perform all six arrangements you actually made, aboard a singing train. Three missed orders end the set.

Controls: click or drag to pack; R/right-click to rotate; Z to undo; H for the guide; Escape to pause; Enter to serve. Click a placed food to move or remove it. Sound can be toggled instantly; faces, syllables and beat lights preserve all gameplay information when muted.

All UI, dialogue and instructions are in English. The paper-theater station is original AI-generated art; food illustrations and animation are original editable Canvas drawings. The stock food-character reference is not embedded. Audio is synthesized locally with Web Audio: no recordings, speech services, downloaded songs or network resources. The audio clock schedules ahead of rendering, with swing, layered instruments, vowel voices, filtered echo and bounded output gain.

Zoud / Orquestra de Bolso informed the tactile box, typography and layered musical direction. This game's music and implementation were written for Bento Rhapsody. DM Sans and Instrument Serif are bundled under their SIL Open Font Licenses in `game/assets/`. Asset provenance and the generation prompt are in `ART-AND-MUSIC.md`.

Open `game/index.html` directly in a desktop browser. For a local HTTP preview run `python -m http.server 4198 --bind 127.0.0.1 --directory game`.

The official make.fun library is preserved under `vendor/`. `node main.ts` writes the submission to `/output`; set `MAKEFUN_OUTPUT_DIR` for local packaging. The files under `screenshots/` are real browser captures of the earlier edition; they must be refreshed in a browser to show the paper-theater edition before submission. Source-rendered artwork previews are kept separately and are not presented as browser captures.

See `VALIDACAO.md` for the local checks and submission limitations. The entry has not been submitted. License: MIT.
