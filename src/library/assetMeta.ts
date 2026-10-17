import { TRANSITIONS, type TransitionItem } from '@/src/catalog';
import { ASSET_GAPS } from '@/src/library/assetGaps';
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

const PROP_ENTRIES: readonly PropEntry[] = [
  {
    id: 'spacing-tuner',
    props: [
      { name: 'autoPlay', type: 'boolean', fallback: 'true', description: 'Run the 10 s loop. Ignored when time is set.', required: false },
      { name: 'time', type: 'number', fallback: null, description: 'Freeze the loop at this time in seconds.', required: false },
      { name: 'interactive', type: 'boolean', fallback: 'false', description: 'Chips become buttons that toggle one variable.', required: false },
      { name: 'reducedMotion', type: 'boolean', fallback: null, description: 'Hold the tuned frame at 7.5 s. Default follows the OS.', required: false },
      { name: 'speed', type: 'number', fallback: '1', description: 'Playback speed multiplier.', required: false },
      { name: 'style', type: 'StyleProp<ViewStyle>', fallback: null, description: 'Style for the root stage.', required: false },
    ],
  },
];
const INSTALL_ENTRIES: readonly InstallEntry[] = [];
const PARITY_ENTRIES: readonly ParityEntry[] = [
  {
    id: 'spacing-tuner',
    sha: '2111383736243859714',
    href: 'https://x.com/MichaelFilipiuk/status/2111383736243859714',
  },
];

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
