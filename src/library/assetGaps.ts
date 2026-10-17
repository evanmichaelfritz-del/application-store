/**
 * Known gaps from the Oct 14, 2026 asset audit (main a201892).
 * Keyed by catalog slug. Only FAIL rows are listed, and only the gaps that
 * row's "What's missing" cell states. Yogesh Orb Creator and Yogesh Thinking
 * Orbs passed and are absent, so the page keeps "None logged".
 */
export const ASSET_GAPS: Readonly<Record<string, readonly string[]>> = {
  'orb-agent-listening': [
    'Live is a dark Skia particle orb (20px chip); Copy is a white pill with a simplified 2D-canvas/CSS glyph. Same failure as Orb state picker.',
    'Template prompt (8234 B) with no Skia/shader code, no per-state values (0 ms timings stated), no setup/gotchas and no checklist.',
    'Unused CSS: .col, .controls, .is-on, .label, .picker, .pill, .trigger.',
  ],
  'orb-agent-planning': [
    'Live is a dark Skia particle orb (20px chip); Copy is a white pill with a simplified 2D-canvas/CSS glyph. Same failure as Orb state picker.',
    'Template prompt (8160 B) with no Skia/shader code, no per-state values (0 ms timings stated), no setup/gotchas and no checklist.',
    'Unused CSS: .col, .controls, .is-on, .label, .picker, .pill, .trigger.',
  ],
  'orb-agent-shaping': [
    'Live is a dark Skia particle orb (20px chip); Copy is a white pill with a simplified 2D-canvas/CSS glyph. Same failure as Orb state picker.',
    'Template prompt (8167 B) with no Skia/shader code, no per-state values (0 ms timings stated), no setup/gotchas and no checklist.',
    'Unused CSS: .col, .controls, .is-on, .label, .picker, .pill, .trigger.',
  ],
  'orb-agent-thinking': [
    'Live is a dark Skia particle orb (20px chip); Copy is a white pill with a simplified 2D-canvas/CSS glyph. Same failure as Orb state picker.',
    'Template prompt (8211 B) with no Skia/shader code, no per-state values (0 ms timings stated), no setup/gotchas and no checklist.',
    'Unused CSS: .col, .controls, .is-on, .label, .picker, .pill, .trigger.',
  ],
  'orb-searching': [
    'Live is a dark Skia particle orb (64px); Copy is a white pill with a simplified 2D-canvas/CSS glyph. Same failure as Orb state picker.',
    'Template prompt (8108 B) with no Skia/shader code, no per-state values (0 ms timings stated), no setup/gotchas and no checklist.',
    'Unused CSS: .agent, .chip, .col, .controls, .is-on, .muted, .picker, .trigger.',
  ],
  'orb-solving': [
    'Live is a dark Skia particle orb (64px); Copy is a white pill with a simplified 2D-canvas/CSS glyph. Same failure as Orb state picker.',
    'Template prompt (8189 B) with no Skia/shader code, no per-state values (0 ms timings stated), no setup/gotchas and no checklist.',
    'Unused CSS: .agent, .chip, .col, .controls, .is-on, .muted, .picker, .trigger.',
  ],
  'orb-state-picker': [
    '10.4 KB template; no per-state values, no Skia stage code, no setup/gotchas, no parity checklist.',
    'Copy is a 64px 2D-canvas sketch, not the live Skia stage.',
    'Unused .trigger/.col/.pill/.chip/.label/.agent/.muted; unreachable "shaping" drawing.',
  ],
  'orb-thinking': [
    'Live is a dark Skia particle orb (64px); Copy is a white pill with a simplified 2D-canvas/CSS glyph. Same failure as Orb state picker.',
    'Template prompt (8204 B) with no Skia/shader code, no per-state values (0 ms timings stated), no setup/gotchas and no checklist.',
    'Unused CSS: .agent, .chip, .col, .controls, .is-on, .muted, .picker, .trigger.',
  ],
  'orb-working': [
    'Live is a dark Skia particle orb (64px); Copy is a white pill with a simplified 2D-canvas/CSS glyph. Same failure as Orb state picker.',
    'Template prompt (8086 B) with no Skia/shader code, no per-state values (0 ms timings stated), no setup/gotchas and no checklist.',
    'Unused CSS: .agent, .chip, .col, .controls, .is-on, .muted, .picker, .trigger.',
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
  'tooltip-open-close': [
    'Generic template prompt (4850 B) from a short LOCK: one motion line plus fixed springs; code inline via the template; no state table, gotchas or parity checklist; boilerplate scope lines.',
    'Smaller trigger label differs from live.',
    'Unused CSS: .col, .trigger.',
  ],
};
