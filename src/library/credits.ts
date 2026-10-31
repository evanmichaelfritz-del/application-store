import { ASSET_META } from '@/src/library/taxonomy';

/**
 * Verified author and source URL for one asset, from mapping.verified.csv.
 * Unverified assets are omitted: no source chip and no Open source button.
 */
const CREDITS = [
  { id: 'card-resize', label: 'transitions.dev', url: 'https://transitions.dev' },
  { id: 'number-pop-in', label: 'transitions.dev', url: 'https://transitions.dev' },
  { id: 'notification-badge', label: 'transitions.dev', url: 'https://transitions.dev' },
  { id: 'confetti-burst', label: 'transitions.dev', url: 'https://transitions.dev' },
  { id: 'gooey-plus-menu', label: 'transitions.dev', url: 'https://transitions.dev' },
  { id: 'page-side-by-side', label: 'transitions.dev', url: 'https://transitions.dev' },
  { id: 'avatar-group-hover', label: 'transitions.dev', url: 'https://transitions.dev' },
  { id: 'card-stack-hover', label: 'transitions.dev', url: 'https://transitions.dev' },
  { id: 'error-state-shake', label: 'transitions.dev', url: 'https://transitions.dev' },
  { id: 'input-clear-dissolve', label: 'transitions.dev', url: 'https://transitions.dev' },
  { id: 'skeleton-reveal', label: 'transitions.dev', url: 'https://transitions.dev' },
  { id: 'texts-reveal', label: 'transitions.dev', url: 'https://transitions.dev' },
  { id: 'tabs-sliding', label: 'transitions.dev', url: 'https://transitions.dev' },
  { id: 'drag-drop-physics', label: 'transitions.dev', url: 'https://transitions.dev' },
  { id: 'tooltip-open-close', label: 'transitions.dev', url: 'https://transitions.dev' },
  { id: 'tilt-3d', label: 'transitions.dev', url: 'https://transitions.dev' },
  { id: 'border-beam', label: 'libraries.dev', url: 'https://libraries.dev/beam.html' },
  { id: 'gooey', label: 'libraries.dev', url: 'https://libraries.dev/gooey.html' },
  { id: 'liquid-metal', label: 'libraries.dev', url: 'https://libraries.dev/metal.html' },
  { id: 'orb-solving', label: 'Jakub Antalik', url: 'https://x.com/Jakubantalik/status/2084674723934318901' },
  { id: 'orb-thinking', label: 'Jakub Antalik', url: 'https://x.com/Jakubantalik/status/2084674723934318901' },
  { id: 'orb-agent-listening', label: 'Jakub Antalik', url: 'https://x.com/Jakubantalik/status/2084674723934318901' },
  { id: 'orb-searching', label: 'Jakub Antalik', url: 'https://x.com/Jakubantalik/status/2084674723934318901' },
  { id: 'orb-agent-planning', label: 'Jakub Antalik', url: 'https://x.com/Jakubantalik/status/2084674723934318901' },
  { id: 'orb-agent-thinking', label: 'Jakub Antalik', url: 'https://x.com/Jakubantalik/status/2084674723934318901' },
  { id: 'orb-working', label: 'Jakub Antalik', url: 'https://x.com/Jakubantalik/status/2084674723934318901' },
  { id: 'orb-agent-shaping', label: 'Jakub Antalik', url: 'https://x.com/Jakubantalik/status/2084674723934318901' },
  { id: 'orb-state-picker', label: 'Jakub Antalik', url: 'https://x.com/Jakubantalik/status/2084674723934318901' },
  { id: 'yogesh-thinking-orbs', label: 'Yogesh', url: 'https://x.com/yogesharc/status/2105360780015128808' },
  { id: 'yogesh-orb-creator', label: 'Yogesh', url: 'https://x.com/yogesharc/status/2106085555201024409' },
  { id: 'abrar-overview', label: 'Abrar Karim', url: 'https://x.com/AbrarInPixels/status/2086055804957065518' },
  { id: 'spacing-tuner', label: 'Michael Filipiuk', url: 'https://x.com/MichaelFilipiuk/status/2111383736243859714' },
  { id: 'stageshow', label: 'Benji Taylor', url: 'https://github.com/benjitaylor/skills', license: 'MIT' },
] as const;

const UNVERIFIED = [
  'text-states-swap',
  'menu-dropdown',
  'modal-open-close',
  'icon-swap',
  'success-check',
  'shimmer-text',
  'image-generation-loader',
  'preview-tools',
] as const;

export type AssetCredit = { label: string; url: string; license: string | null };

export function creditFor(id: string): AssetCredit | null {
  const row = CREDITS.find((item) => item.id === id);
  if (!row) return null;
  return { label: row.label, url: row.url, license: 'license' in row ? row.license : null };
}

function assertCredits() {
  const ids = Object.keys(ASSET_META);
  if (ids.length !== 41) throw new Error(`credit map expected 41 assets, found ${ids.length}`);
  for (const id of ids) {
    const credit = creditFor(id);
    const unverified = UNVERIFIED.some((item) => item === id);
    if (unverified && credit) throw new Error(`${id} is unverified and must not show a source`);
    if (!unverified && !credit) throw new Error(`${id} is missing a verified source`);
    if (!unverified && ASSET_META[id].source == null) throw new Error(`${id} credit without a source chip`);
    if (unverified && ASSET_META[id].source != null) throw new Error(`${id} unverified asset still has a source`);
  }
  const homepage = 'https://transitions.dev';
  if (CREDITS.some((row) => row.label === 'transitions.dev' && row.url !== homepage)) {
    throw new Error('transitions.dev links to its homepage');
  }
  const counts = {
    'transitions.dev': 16,
    'libraries.dev': 3,
    'Jakub Antalik': 9,
    Yogesh: 2,
    'Abrar Karim': 1,
    'Michael Filipiuk': 1,
    'Benji Taylor': 1,
  } as const;
  for (const [label, expected] of Object.entries(counts)) {
    const n = CREDITS.filter((row) => row.label === label).length;
    if (n !== expected) throw new Error(`${label} expected ${expected} credits, found ${n}`);
  }
}

assertCredits();
