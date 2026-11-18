# Paper theater and a little jazz

The visual and musical reference for this revision was the user's earlier Zoud / Orquestra de Bolso prototype. This is a new implementation and composition, not imported game code or a commercial soundtrack.

## Station art

- Production asset: `game/assets/midnight-station.png`, 1664 × 941 pixels, opaque PNG.
- Generated with the built-in ImageGen tool on 18 November 2026, São Paulo time. The earlier project's station/town artwork was supplied as a style reference, not embedded in this game.
- Original generation identifier: `exec-80da756b-6681-4117-8d72-e9fccf82d93d`.
- The generated station is an environment illustration, not a screenshot of gameplay. UI, food, animation and interactions are drawn separately.
- Source previews under `private/paper-*.png` execute the actual rendering code against a software Canvas. They are development previews, not browser playtests or submission screenshots.

Image prompt (the local output-path sentence is omitted):

> Use case: stylized-concept. Asset type: final panoramic environment illustration for the original cozy musical packing puzzle Bento Rhapsody. Input image is STYLE REFERENCE ONLY: match the exquisite tactile hand-cut paper theater, gouache brushwork, layered cardboard edges, twilight teal and amber color contrast. Create a new Japanese scene, not the reference town. A tiny countryside Japanese railway platform at midnight with an intimate warmly lit bento kitchen stall at the right, a small cream-and-teal old-fashioned local train waiting behind it, layered autumn trees and distant hills. Paper lanterns, warm window lights, subtle wisps of steam. A quiet, sophisticated handmade indie-game diorama, charming rather than cartoon mobile-game gloss. Composition: wide 16:9 panorama approximately 1672x941; frontal slightly elevated viewpoint; left half and upper sky generous atmospheric deep petrol-blue negative space for title typography to be added later. Place the detailed illuminated wooden bento stall and station roof in the rightmost 55%, train a supporting shape behind. Ground and platform lower quarter. No people, no faces, no food characters: these are animated by the game code later. No letters, words, signage, typography, logos, UI, border or watermark. Opaque background.

## Food and box

`paper-art.js` draws six original articulated food characters, continuous polyomino outlines, lacquered wood, warm-colored paper pieces, green lining and brass hinges. Mouths, expressions, arms and movement respond to their musical state. The characters remain editable and animated code; no stock illustration or generated sprite sheet is used.

## Music

`ensemble.js` is an original procedural jazz ensemble. It uses 96 BPM with 56:44 swing, an eight-bar harmonic sequence (Dm9, G13, Cmaj9, A7sus, Fmaj9, Em7, Dm9, A7), instrumental patterns, sung entrances and filtered delay. The score develops instead of repeating a single isolated note per food.

Food position controls entry and note selection; friendship controls instrumental energy and singing. Multiple copies do not duplicate an entire backing band. Playback uses one AudioContext clock with lookahead scheduling; arrangement changes do not reset the clock. The final train cycles through the actual saved lunches, two bars each.

An offline test of the same synthesis graph produced a 33-second progressive band demo with nonzero output, zero clipped samples, seven chord identities, 103 transport events and no remaining sources after stopping. This verifies synthesis and scheduling, not browser-specific behavior or a subjective listening review.

Font assets retain their original SIL Open Font License texts. All runtime files remain local for offline play.
