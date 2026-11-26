# Open Bot Avatar

These sources are Dominik Scholz's open-bot-avatar package, Copyright (c) 2026 Dominik Scholz, MIT.

Upstream commit 646793af2c86604539e02faa344e9793ab2aefe8
https://github.com/DominikScholz/open-bot-avatar/commit/646793af2c86604539e02faa344e9793ab2aefe8

This note stays in the repo. It is not part of the card, the Copy, or the app bundle.

## Modified from upstream

- Every relative import that ended in `.ts` dropped that suffix, in: `animator.ts`, `contour.ts`, `distance.ts`, `effects.ts`, `examples.ts`, `eyes.ts`, `index.ts`, `mood.ts`, `motion.ts`, `render.ts`, `seams.ts`, `types.ts`, `validate.ts`, `volume.ts`, `dom/eye.ts`, `dom/index.ts`, `dom/mount.ts`, `dom/paint.ts`, `dom/pointer.ts`, `dom/reduced.ts`, `dom/fluffy/dye.ts`, `dom/fluffy/mesh.ts`, `dom/fluffy/renderer.ts`, `dom/fluffy/shaders.ts`, `dom/glass/renderer.ts`, `dom/glass/shaders.ts`, `dom/materials/fluffy.ts`, `dom/materials/glass.ts`, `dom/materials/marks.ts`, `dom/materials/material.ts`, `dom/materials/shape.ts`, `dom/materials/socket.ts`. The bundler does not resolve the `.ts` suffix. No other line in those files was edited, except `dom/reduced.ts`.
- `dom/reduced.ts`: `watchingStore` (line 13) and `watchStoreSwitch` (lines 24–29) were added. `prefersReducedMotion` (lines 31–37) returns true when `document.documentElement` has `data-reduce-motion="1"`, and the observer calls `requestFrame` when that attribute changes. The `prefers-reduced-motion` media query is unchanged.
- Each TypeScript file has a short header that names `646793af2c86604539e02faa344e9793ab2aefe8` and keeps `Copyright (c) 2026 Dominik Scholz`. The full MIT text ships once, next to that hash, in the Copy. `gallery/*.json` and `gallery/colors.json` are unchanged: JSON has no comment syntax. `LICENSE` is byte-identical to upstream.
