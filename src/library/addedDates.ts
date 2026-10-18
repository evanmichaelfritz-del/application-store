/**
 * Author date of the first commit that added `id: '<slug>'` to src/catalog.ts.
 * Taken from `git log --reverse -S` (UTC). Not a single shared label.
 */
export const ADDED_ON: Record<string, string> = {
  'card-resize': 'Sep 16, 2026',
  'number-pop-in': 'Sep 16, 2026',
  'notification-badge': 'Sep 16, 2026',
  'text-states-swap': 'Sep 16, 2026',
  'menu-dropdown': 'Sep 16, 2026',
  'yogesh-thinking-orbs': 'Oct 7, 2026',
  'confetti-burst': 'Sep 16, 2026',
  'modal-open-close': 'Sep 16, 2026',
  'gooey-plus-menu': 'Sep 16, 2026',
  'page-side-by-side': 'Sep 16, 2026',
  'icon-swap': 'Sep 16, 2026',
  'success-check': 'Sep 16, 2026',
  'avatar-group-hover': 'Sep 16, 2026',
  'card-stack-hover': 'Sep 16, 2026',
  'error-state-shake': 'Sep 16, 2026',
  'input-clear-dissolve': 'Sep 16, 2026',
  'skeleton-reveal': 'Sep 16, 2026',
  'texts-reveal': 'Sep 16, 2026',
  'tabs-sliding': 'Sep 16, 2026',
  'drag-drop-physics': 'Sep 16, 2026',
  'shimmer-text': 'Sep 16, 2026',
  'image-generation-loader': 'Sep 20, 2026',
  'tooltip-open-close': 'Sep 16, 2026',
  'tilt-3d': 'Sep 16, 2026',
  'border-beam': 'Sep 17, 2026',
  'orb-solving': 'Sep 24, 2026',
  'orb-thinking': 'Sep 24, 2026',
  'orb-agent-listening': 'Sep 24, 2026',
  'orb-searching': 'Sep 24, 2026',
  'orb-agent-planning': 'Sep 24, 2026',
  'orb-agent-thinking': 'Sep 24, 2026',
  'orb-working': 'Sep 24, 2026',
  'orb-agent-shaping': 'Sep 24, 2026',
  gooey: 'Sep 17, 2026',
  'liquid-metal': 'Sep 17, 2026',
  'abrar-overview': 'Sep 24, 2026',
  'preview-tools': 'Sep 24, 2026',
  'orb-state-picker': 'Sep 24, 2026',
  'yogesh-orb-creator': 'Oct 7, 2026',
  'spacing-tuner': 'Oct 17, 2026',
};

export function addedOn(id: string): string | null {
  return ADDED_ON[id] ?? null;
}
