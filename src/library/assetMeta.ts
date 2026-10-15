import { TRANSITIONS, type TransitionItem } from '@/src/catalog';
import { ASSET_META } from '@/src/library/taxonomy';

/** Static tuners and pickers. Gesture assets are reset separately. */
const STATEFUL_IDS = ['yogesh-orb-creator', 'orb-state-picker'] as const;

export type PreviewControl = 'replay' | 'reset';

export function previewControl(id: string): PreviewControl | null {
  const meta = ASSET_META[id];
  if (!meta || meta.motion === 'ambient-loop') return null;
  if (meta.motion === 'gesture' || STATEFUL_IDS.some((item) => item === id)) return 'reset';
  return 'replay';
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

export const ADDED_LABEL = 'Oct 14, 2026';

type PropRow = {
  name: string;
  type: string;
  fallback: string | null;
  description: string;
  required: boolean;
};

type PropEntry = { id: string; props: readonly PropRow[] };
type InstallEntry = { id: string; line: string; deps: readonly string[] };
type GapEntry = { id: string; gaps: readonly string[] };
type ParityEntry = { id: string; sha: string; href: string };

/** No catalog asset publishes a prop table, install line, gap, or parity record yet. */
const PROP_ENTRIES: readonly PropEntry[] = [];
const INSTALL_ENTRIES: readonly InstallEntry[] = [];
const GAP_ENTRIES: readonly GapEntry[] = [];
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
  return GAP_ENTRIES.find((entry) => entry.id === id)?.gaps ?? [];
}

export function parityFor(id: string): AssetParity | null {
  const entry = PARITY_ENTRIES.find((item) => item.id === id);
  return entry ? { sha: entry.sha, href: entry.href } : null;
}
