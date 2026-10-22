/**
 * Known gaps from the Oct 14, 2026 asset audit (main a201892).
 * Keyed by catalog slug. Only FAIL rows are listed, and only the gaps that
 * row's "What's missing" cell states. Yogesh Orb Creator, Yogesh Thinking
 * Orbs, and the nine orb-family cards passed and are absent, so the page
 * keeps "None logged".
 */
export const ASSET_GAPS: Readonly<Record<string, readonly string[]>> = {
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
