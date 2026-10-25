/**
 * Known gaps from the Oct 14, 2026 asset audit (main a201892).
 * Keyed by catalog slug. Only FAIL rows are listed, and only the gaps that
 * row's "What's missing" cell states. Yogesh Orb Creator and Yogesh Thinking
 * Orbs passed and are absent. The nine orb-family cards log the measured
 * Canvas2D coverage residual and the live-card paint lag.
 */
const MAE_METHOD =
  'MAE is the mean per-channel absolute difference over the full canvas RGB at device pixels.';
const LIVE_LAG = 'The live card paints about 32 ms behind this Copy.';

export const ASSET_GAPS: Readonly<Record<string, readonly string[]>> = {
  'orb-working': [
    '64px coverage compensation (radius +0.12, alpha ×1.08) leaves reduced-motion mean luma at 28.72 versus live 28.79 (was 27.43) and MAE at 1.04 (was 1.72).',
    MAE_METHOD,
    LIVE_LAG,
  ],
  'orb-thinking': [
    '64px coverage compensation (radius +0.12, alpha ×1.08) leaves reduced-motion mean luma at 32.50 versus live 32.58 (was 30.60) and MAE at 0.78 (was 2.28).',
    MAE_METHOD,
    LIVE_LAG,
  ],
  'orb-searching': [
    '64px coverage compensation (radius +0.12, alpha ×1.08) leaves reduced-motion mean luma at 32.80 versus live 33.02 (was 30.21) and MAE at 2.37 (was 3.16).',
    MAE_METHOD,
    LIVE_LAG,
  ],
  'orb-solving': [
    '64px coverage compensation (radius +0.12, alpha ×1.08) leaves reduced-motion mean luma at 33.99 versus live 34.72 (was 31.47) and MAE at 2.23 (was 3.64).',
    MAE_METHOD,
    LIVE_LAG,
  ],
  'orb-agent-thinking': [
    '20px coverage compensation (radius ×1.26 +0.02, alpha ×1.12) leaves reduced-motion mean luma at 40.30 versus live 39.41 (was 34.63) and MAE at 2.57 (was 4.84).',
    MAE_METHOD,
    LIVE_LAG,
  ],
  'orb-agent-listening': [
    '20px coverage compensation (radius ×1.26 +0.02, alpha ×1.12) leaves reduced-motion mean luma at 44.22 versus live 43.63 (was 36.62) and MAE at 4.04 (was 7.09).',
    MAE_METHOD,
    LIVE_LAG,
  ],
  'orb-agent-planning': [
    '20px coverage compensation (radius ×1.26 +0.02, alpha ×1.12) leaves reduced-motion mean luma at 47.44 versus live 48.00 (was 38.04) and MAE at 3.52 (was 9.96).',
    MAE_METHOD,
    LIVE_LAG,
  ],
  'orb-agent-shaping': [
    '20px coverage compensation (radius ×1.26 +0.02, alpha ×1.12) leaves reduced-motion mean luma at 55.11 versus live 55.20 (was 42.18) and MAE at 11.21 (was 13.17). The morph dots still miss the live edge.',
    MAE_METHOD,
    LIVE_LAG,
  ],
  'orb-state-picker': [
    '20px Working uses radius ×1.12 +0.03 and alpha ×0.92 (luma 27.12 versus live 26.74, MAE 2.15; was 32.11 and 5.52). Searching uses radius ×1.18 +0.06 and alpha ×1.02 (luma 27.52 versus live 27.52, MAE 3.84; was 29.43 and 4.94). Connecting uses radius ×1.10 +0.02 and alpha ×1.12 (luma 18.92 versus live 19.10, MAE 1.07; was 21.69 and 3.00). The other 20px states keep radius ×1.26 +0.02 and alpha ×1.12: Solving luma 33.44 versus 33.48 (MAE 7.28), Listening 33.77 versus 33.12 (MAE 4.34), Composing 37.38 versus 38.04 (MAE 3.81), Breathing 29.81 versus 28.82 (MAE 2.79). 64px keeps radius +0.12 and alpha ×1.08: Working 17.26 versus 17.37 (MAE 1.14), Searching 21.48 versus 21.72 (MAE 2.54), Solving 22.74 versus 23.52 (MAE 2.38), Listening 20.37 versus 20.57 (MAE 1.80), Connecting 20.07 versus 19.88 (MAE 1.25), Composing 31.41 versus 32.24 (MAE 3.55), Breathing 21.32 versus 21.40 (MAE 0.84).',
    MAE_METHOD,
    LIVE_LAG,
  ],
  'drag-drop-physics': [
    'Phone widths are a known gap. The board is measured at a 1280 desktop and stays 213×192. It does not reflow.',
    "The puff halo edge is a smooth haze. The public demo's outline wanders more irregularly.",
    "This asset's photo is the CC0 rose crop below. A different portrait is not this board.",
  ],
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
  'confetti-burst': ['Phone widths are a known gap.'],
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
  'modal-open-close': [],
  'notification-badge': [
    'Phone widths are a known gap. On the asset page the stage shrinks to the bell and clips the Animate button. The card stage keeps that button inside the frame.',
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
    'Phone widths are a known gap. On the asset page the stage shrinks to the badge and clips the Animate button. The card stage keeps that button inside the frame.',
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
