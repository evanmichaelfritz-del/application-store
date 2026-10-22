/**
 * Known gaps from the Oct 14, 2026 asset audit (main a201892).
 * Keyed by catalog slug. Only FAIL rows are listed, and only the gaps that
 * row's "What's missing" cell states. Yogesh Orb Creator and Yogesh Thinking
 * Orbs passed and are absent. The nine orb-family cards log the measured
 * Canvas2D coverage residual and the Skia render delay.
 */
const SKIA_FRAME_DELAY =
  'Live Skia paints about 2 frames (~32 ms) behind the Copy, because Skia web draws the Picture on a later turn than the React commit. The Copy does not add that delay.';

export const ASSET_GAPS: Readonly<Record<string, readonly string[]>> = {
  'orb-working': [
    '64px coverage compensation (radius +0.12, alpha ×1.08) leaves reduced-motion mean luma at 28.72 versus live 28.79 (was 27.43) and MAE at 0.78 (was 1.29).',
    SKIA_FRAME_DELAY,
  ],
  'orb-thinking': [
    '64px coverage compensation (radius +0.12, alpha ×1.08) leaves reduced-motion mean luma at 32.50 versus live 32.58 (was 30.60) and MAE at 0.58 (was 1.71).',
    SKIA_FRAME_DELAY,
  ],
  'orb-searching': [
    '64px coverage compensation (radius +0.12, alpha ×1.08) leaves reduced-motion mean luma at 32.80 versus live 33.02 (was 30.21) and MAE at 1.78 (was 2.37).',
    SKIA_FRAME_DELAY,
  ],
  'orb-solving': [
    '64px coverage compensation (radius +0.12, alpha ×1.08) leaves reduced-motion mean luma at 33.99 versus live 34.72 (was 31.47) and MAE at 1.67 (was 2.73).',
    SKIA_FRAME_DELAY,
  ],
  'orb-agent-thinking': [
    '20px coverage compensation (radius ×1.26 +0.02, alpha ×1.12) leaves reduced-motion mean luma at 40.30 versus live 39.41 (was 34.63) and MAE at 1.93 (was 3.63).',
    SKIA_FRAME_DELAY,
  ],
  'orb-agent-listening': [
    '20px coverage compensation (radius ×1.26 +0.02, alpha ×1.12) leaves reduced-motion mean luma at 44.22 versus live 43.63 (was 36.62) and MAE at 3.03 (was 5.32).',
    SKIA_FRAME_DELAY,
  ],
  'orb-agent-planning': [
    '20px coverage compensation (radius ×1.26 +0.02, alpha ×1.12) leaves reduced-motion mean luma at 47.44 versus live 48.00 (was 38.04) and MAE at 2.64 (was 7.47).',
    SKIA_FRAME_DELAY,
  ],
  'orb-agent-shaping': [
    '20px coverage compensation (radius ×1.26 +0.02, alpha ×1.12) leaves reduced-motion mean luma at 55.11 versus live 55.20 (was 42.18) and MAE at 8.41 (was 9.88). The morph dots still miss the live edge.',
    SKIA_FRAME_DELAY,
  ],
  'orb-state-picker': [
    'Same per-size coverage as the single cards (64px radius +0.12 and alpha ×1.08; 20px radius ×1.26 +0.02 and alpha ×1.12). Reduced-motion luma on those cards is within 1 level of live. Residual MAE remains, worst on Agent shaping at 20px (8.41, was 9.88) and Searching at 64px (1.78, was 2.37).',
    SKIA_FRAME_DELAY,
  ],
  'drag-drop-physics': [],
  'preview-tools': [
    '95.8 KB but still the generic template: code is inlined (byte-matches Copy), but there are no per-state tables, gotchas or parity checklist, and it carries the boilerplate.',
    'Unused .trigger.',
  ],
  'abrar-overview': [
    'No explicit setup/gotchas section; states are partial (static dashboard).',
  ],
  'gooey-plus-menu': [
    'Fails scope only: "Not Helix, not grok.me", a "Card copy buttons" store-process section and "load it in Application Store → Playground".',
    'The state list is partial (open/closed only).',
  ],
  'avatar-group-hover': [
    'Generic template prompt (4720 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
    'Unused CSS: .col, .is-hot, .trigger.',
  ],
  'card-resize': [
    'Generic template prompt (3630 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
  ],
  'card-stack-hover': [
    'Generic template prompt (3937 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
    'Unused CSS: .col, .trigger.',
  ],
  'confetti-burst': [
    'Generic template prompt (5707 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
    'Unused CSS: .col.',
  ],
  'error-state-shake': [
    'Generic template prompt (4189 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
  ],
  gooey: [],
  'input-clear-dissolve': [
    'Generic template prompt (4336 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
    'Unused CSS: .col, .trigger.',
  ],
  'icon-swap': [
    'Generic template prompt (3917 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
  ],
  'menu-dropdown': [
    'Generic template prompt (4784 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
    'Unused CSS: .col.',
  ],
  'modal-open-close': [
    'Generic template prompt (4644 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
  ],
  'notification-badge': [
    'Generic template prompt (4208 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
    'Unused CSS: .col, .trigger.',
  ],
  'number-pop-in': [
    'Generic template prompt (4523 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
  ],
  'page-side-by-side': [
    'Generic template prompt (4289 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
  ],
  'shimmer-text': [
    'Generic template prompt (4115 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
    'Unused CSS: .col, .trigger.',
  ],
  'skeleton-reveal': [
    'Generic template prompt (4550 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
  ],
  'success-check': [
    'Generic template prompt (4117 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
    'The live stage starts empty until Animate; Copy shows the check at rest.',
    'The replay change was not captured by the screenshot diff ("not proven").',
  ],
  'tabs-sliding': [
    'Generic template prompt (4264 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
    'Unused CSS: .col, .trigger.',
  ],
  'text-states-swap': [
    'Generic template prompt (4078 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
  ],
  'texts-reveal': [
    'Generic template prompt (3618 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
  ],
  'tilt-3d': [
    'Generic template prompt (7900 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
  ],
  'spacing-tuner': [
    'Phone widths are a known gap. The 1440×1080 stage scales with the card, but parity is desktop web at 1280.',
    'The revert dip runs −2 px from 9.400 to 9.480 s vs the original\'s 9.367–9.500 s, and the sidebar chip returns to 184 at about 9.355 s vs 9.333 s.',
    'The phase-1 counter\'s first change is one frame late (184 at 1.000 s, where the original shows 185).',
  ],
  'tooltip-open-close': [
    'Generic template prompt (4850 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
    'Unused CSS: .col, .trigger.',
  ],
};
