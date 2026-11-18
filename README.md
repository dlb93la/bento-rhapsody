# O Último Bentô

An offline browser puzzle about packing bento boxes and making food friends happy.

Drag ingredients into a 5×5 lunchbox. R rotates a piece, Z undoes a move, Escape pauses, and Enter serves a completed order. Ingredients smile next to their friends and frown next to ingredients they dislike. Complete all six customers before their trains leave. Three missed orders end the shift.

All illustration, animation, game logic and synthesized sound are original code. The supplied reference guided the cheerful food-character direction. No stock image is embedded.

Open `game/index.html` directly in a desktop browser. For a local HTTP preview run `python -m http.server 4198 --bind 127.0.0.1 --directory game`.

The official make.fun library is preserved under `vendor/`. `node main.ts` writes the submission to `/output`; set `MAKEFUN_OUTPUT_DIR` for local packaging. The four files under `screenshots/` must be real browser captures before packaging.

Submission and transcript checks are in progress. No competition entry has been sent.
