# Open Bot Avatar

These sources are Dominik Scholz's open-bot-avatar package, Copyright (c) 2026 Dominik Scholz, MIT.

Upstream commit 323ce6ab8bc6b0bc9603a418ee3d91442e4996fc
https://github.com/DominikScholz/open-bot-avatar/commit/323ce6ab8bc6b0bc9603a418ee3d91442e4996fc

This note stays in the repo. It is not part of the card, the Copy, or the app bundle.

## Modified from upstream

- Every relative import in `core/` dropped its `.ts` suffix. No other line in those files was edited, except `core/dom/reduced.ts`.
- `core/dom/reduced.ts`: `watchingStore` (line 12) and `watchStoreSwitch` (lines 23–28) were added. `prefersReducedMotion` (lines 30–36) returns true when `document.documentElement` has `data-reduce-motion="1"`, and the observer calls `requestFrame` when that attribute changes. The `prefers-reduced-motion` media query is unchanged.
- A MIT header (lines 1–5 of each TypeScript file) was added. The copyright line is `Copyright (c) 2026 Dominik Scholz`. `gallery/*.json` and `gallery/colors.json` are unchanged: JSON has no comment syntax.
