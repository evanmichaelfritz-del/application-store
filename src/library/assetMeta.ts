import { TRANSITIONS, type TransitionItem } from '@/src/catalog';
import { ASSET_GAPS } from '@/src/library/assetGaps';
import { ASSET_META } from '@/src/library/taxonomy';

/** Static tuners and pickers. Gesture assets are reset separately. */
const STATEFUL_IDS = ['yogesh-orb-creator', 'orb-state-picker'] as const;

/**
 * These previews wait on their own press. Mounting the demo does not play it,
 * and the press is a menu, a modal, or a tab, so the card does not fire it.
 */
const PRESS_PLAY_IDS = [
  'card-resize',
  'notification-badge',
  'text-states-swap',
  'menu-dropdown',
  'modal-open-close',
  'page-side-by-side',
  'icon-swap',
  'success-check',
  'error-state-shake',
  'tabs-sliding',
] as const;

export type PreviewControl = 'replay' | 'reset';

export function previewControl(id: string): PreviewControl | null {
  const meta = ASSET_META[id];
  if (!meta || meta.motion === 'ambient-loop') return null;
  if (meta.motion === 'gesture' || STATEFUL_IDS.some((item) => item === id)) return 'reset';
  return 'replay';
}

/** Gallery card stays on the still and shows the Interactive label. */
export function galleryInteractive(id: string): boolean {
  return previewControl(id) === 'reset' || PRESS_PLAY_IDS.some((item) => item === id);
}

/** Same component type first, then the same verified source, excluding this asset. */
export function relatedItems(id: string): TransitionItem[] {
  const meta = ASSET_META[id];
  if (!meta) return [];
  const rest = TRANSITIONS.filter((item) => item.id !== id);
  const sameType = rest.filter((item) => ASSET_META[item.id].type === meta.type);
  const sameSource =
    meta.source == null
      ? []
      : rest.filter((item) => ASSET_META[item.id].type !== meta.type && ASSET_META[item.id].source === meta.source);
  return [...sameType, ...sameSource].slice(0, 3);
}

export { addedOn } from '@/src/library/addedDates';

type PropRow = {
  name: string;
  type: string;
  fallback: string | null;
  description: string;
  required: boolean;
};

type PropEntry = { id: string; props: readonly PropRow[] };
type InstallEntry = { id: string; line: string; deps: readonly string[] };
type ParityEntry = { id: string; sha: string; href: string };

/** No catalog asset publishes a prop table, install line, or parity record yet. */
const PROP_ENTRIES: readonly PropEntry[] = [];
const INSTALL_ENTRIES: readonly InstallEntry[] = [];
const PARITY_ENTRIES: readonly ParityEntry[] = [];

export type AssetProp = PropRow;
export type AssetInstall = { line: string; deps: readonly string[] };
export type AssetParity = { sha: string; href: string };

export function propsFor(id: string): readonly AssetProp[] {
  return PROP_ENTRIES.find((entry) => entry.id === id)?.props ?? [];
}

export function installFor(id: string): AssetInstall | null {
  const entry = INSTALL_ENTRIES.find((item) => item.id === id);
  return entry ? { line: entry.line, deps: entry.deps } : null;
}

export function gapsFor(id: string): readonly string[] {
  return ASSET_GAPS[id] ?? [];
}

export function parityFor(id: string): AssetParity | null {
  const entry = PARITY_ENTRIES.find((item) => item.id === id);
  return entry ? { sha: entry.sha, href: entry.href } : null;
}
