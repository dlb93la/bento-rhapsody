# Bento Rhapsody

Pack a lunchbox. Accidentally start a band.

Bento Rhapsody is an offline musical packing puzzle. Six food characters have six distinct synthesized voices. Friends touching along an edge unlock each other's voices; rival neighbors grumble and silence their happy singing.

The lunchbox is a five-step sequencer. A food enters on its leftmost column, and its vertical position sets its pitch. Orders require happy duets and a minimum number of distinct singing beats, as well as ingredients and packed spaces. The same food can fit perfectly and still need rearranging to make the chorus work. No timing reflex or musical knowledge is required.

Serve six listeners before their trains leave. Each passenger joins their lunchbox's chorus. In the finale, **The Midnight Bites** perform all six arrangements you actually made, aboard a singing train. Three missed orders end the set.

Controls: click or drag to pack; R/right-click to rotate; Z to undo; H for the guide; Escape to pause; Enter to serve. Click a placed food to move or remove it. Sound can be toggled instantly; faces, syllables and beat lights preserve all gameplay information when muted.

All UI, dialogue and instructions are in English. All illustration, animation, game logic, voices and music are original procedural code. The food-character reference is not embedded. Audio uses local Web Audio vowel/formant synthesis, with no recordings, speech services, external assets or existing songs. The choir clock is independent of rendering so slow frames do not slow the song.

Open `game/index.html` directly in a desktop browser. For a local HTTP preview run `python -m http.server 4198 --bind 127.0.0.1 --directory game`.

The official make.fun library is preserved under `vendor/`. `node main.ts` writes the submission to `/output`; set `MAKEFUN_OUTPUT_DIR` for local packaging. The four files under `screenshots/` are real browser captures, checked against the competition's size and dimension limits.

See `VALIDACAO.md` for the local checks and submission limitations. The entry has not been submitted. License: MIT.
