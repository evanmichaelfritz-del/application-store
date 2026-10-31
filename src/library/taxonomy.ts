import type { Href } from 'expo-router';
import { TRANSITIONS, matchesSearch, type TransitionItem } from '@/src/catalog';

/**
 * Component-type gallery metadata for PR 1.
 * `sections` on each catalog item is left unchanged so agent prompts and the
 * playground keep their current copy. This map is the sidebar and chip source.
 *
 * Sources come from mapping.verified.csv. An asset with source_verified=no
 * has `source: null` — no source chip, and it matches no source filter.
 * Orb Creator is shipped (the CSV status "in progress" is stale).
 * Stack and motion use the CSV columns.
 * libraries.dev (Jakub Antalik) maps to the libraries.dev chip; the
 * parenthetical is the author, and the lock has one libraries.dev source.
 */

export const COMPONENT_TYPES = [
  { slug: 'inputs-pickers', label: 'Inputs & Pickers' },
  { slug: 'buttons', label: 'Buttons' },
  { slug: 'menus-overlays', label: 'Menus & Overlays' },
  { slug: 'cards', label: 'Cards' },
  { slug: 'navigation', label: 'Navigation' },
  { slug: 'text-effects', label: 'Text effects' },
  { slug: 'backgrounds-shaders', label: 'Backgrounds & Shaders' },
  { slug: 'loaders', label: 'Loaders' },
  { slug: 'data-display', label: 'Data display' },
  { slug: 'ai-skills', label: 'AI skills' },
] as const;

export const MOTIONS = [
  { slug: 'static', label: 'Static', line: 'static' },
  { slug: 'hover', label: 'Hover', line: 'hover' },
  { slug: 'scroll', label: 'Scroll', line: 'scroll' },
  { slug: 'gesture', label: 'Gesture', line: 'gesture' },
  { slug: 'ambient-loop', label: 'Ambient loop', line: 'ambient loop' },
] as const;

export const STACKS = [
  { slug: 'rn-reanimated', label: 'RN Reanimated' },
  { slug: 'rn-skia', label: 'RN Skia' },
  { slug: 'rn-svg', label: 'RN SVG' },
  { slug: 'web-svg-filter', label: 'Web SVG filter' },
  { slug: 'web-css', label: 'Web CSS' },
  { slug: 'web-webgl', label: 'Web WebGL' },
] as const;

export const SOURCES = [
  { slug: 'transitions-dev', label: 'transitions.dev' },
  { slug: 'yogesh', label: 'Yogesh' },
  { slug: 'libraries-dev', label: 'libraries.dev' },
  { slug: 'closed-network', label: 'Closed Network' },
  { slug: 'abrar', label: 'Abrar' },
  { slug: 'agentation', label: 'Agentation' },
  { slug: 'michael-filipiuk', label: 'Michael Filipiuk' },
  { slug: 'benji-taylor', label: 'Benji Taylor' },
] as const;

export const STATUSES = [
  { slug: 'shipped', label: 'Shipped' },
  { slug: 'in-progress', label: 'In progress' },
] as const;

export type ComponentType = (typeof COMPONENT_TYPES)[number]['slug'];
export type Motion = (typeof MOTIONS)[number]['slug'];
export type Stack = (typeof STACKS)[number]['slug'];
export type Source = (typeof SOURCES)[number]['slug'];
export type Status = (typeof STATUSES)[number]['slug'];
export type FilterGroup = 'motion' | 'stack' | 'source' | 'status';

export type AssetMeta = {
  type: ComponentType;
  motion: Motion;
  stack: Stack;
  source: Source | null;
  status: Status;
};

type Row = [ComponentType, Motion, Stack, Source | null, Status];

const ROWS: Record<string, Row> = {
  'card-resize': ['cards', 'hover', 'rn-reanimated', 'transitions-dev', 'shipped'],
  'number-pop-in': ['text-effects', 'static', 'rn-reanimated', 'transitions-dev', 'shipped'],
  'notification-badge': ['data-display', 'static', 'rn-reanimated', 'transitions-dev', 'shipped'],
  'text-states-swap': ['text-effects', 'static', 'rn-reanimated', null, 'shipped'],
  'menu-dropdown': ['menus-overlays', 'static', 'rn-reanimated', null, 'shipped'],
  'yogesh-thinking-orbs': ['loaders', 'ambient-loop', 'rn-skia', 'yogesh', 'shipped'],
  'confetti-burst': ['buttons', 'gesture', 'rn-reanimated', 'transitions-dev', 'shipped'],
  'modal-open-close': ['menus-overlays', 'static', 'rn-reanimated', null, 'shipped'],
  'gooey-plus-menu': ['menus-overlays', 'gesture', 'web-svg-filter', 'transitions-dev', 'shipped'],
  'page-side-by-side': ['navigation', 'static', 'rn-reanimated', 'transitions-dev', 'shipped'],
  'icon-swap': ['buttons', 'static', 'rn-reanimated', null, 'shipped'],
  'success-check': ['buttons', 'static', 'rn-reanimated', null, 'shipped'],
  'avatar-group-hover': ['data-display', 'hover', 'rn-reanimated', 'transitions-dev', 'shipped'],
  'card-stack-hover': ['cards', 'hover', 'rn-reanimated', 'transitions-dev', 'shipped'],
  'error-state-shake': ['inputs-pickers', 'static', 'rn-reanimated', 'transitions-dev', 'shipped'],
  'input-clear-dissolve': ['inputs-pickers', 'static', 'rn-reanimated', 'transitions-dev', 'shipped'],
  'skeleton-reveal': ['loaders', 'ambient-loop', 'rn-reanimated', 'transitions-dev', 'shipped'],
  'texts-reveal': ['text-effects', 'static', 'rn-reanimated', 'transitions-dev', 'shipped'],
  'tabs-sliding': ['navigation', 'static', 'rn-reanimated', 'transitions-dev', 'shipped'],
  'drag-drop-physics': ['inputs-pickers', 'gesture', 'web-svg-filter', 'transitions-dev', 'shipped'],
  'shimmer-text': ['text-effects', 'ambient-loop', 'rn-reanimated', null, 'shipped'],
  'image-generation-loader': ['loaders', 'ambient-loop', 'web-webgl', null, 'shipped'],
  'tooltip-open-close': ['menus-overlays', 'hover', 'rn-reanimated', 'transitions-dev', 'shipped'],
  'tilt-3d': ['cards', 'hover', 'rn-reanimated', 'transitions-dev', 'shipped'],
  'border-beam': ['backgrounds-shaders', 'ambient-loop', 'web-css', 'libraries-dev', 'shipped'],
  'orb-solving': ['loaders', 'ambient-loop', 'rn-skia', 'libraries-dev', 'shipped'],
  'orb-thinking': ['loaders', 'ambient-loop', 'rn-skia', 'libraries-dev', 'shipped'],
  'orb-agent-listening': ['loaders', 'ambient-loop', 'rn-skia', 'libraries-dev', 'shipped'],
  'orb-searching': ['loaders', 'ambient-loop', 'rn-skia', 'libraries-dev', 'shipped'],
  'orb-agent-planning': ['loaders', 'ambient-loop', 'rn-skia', 'libraries-dev', 'shipped'],
  'orb-agent-thinking': ['loaders', 'ambient-loop', 'rn-skia', 'libraries-dev', 'shipped'],
  'orb-working': ['loaders', 'ambient-loop', 'rn-skia', 'libraries-dev', 'shipped'],
  'orb-agent-shaping': ['loaders', 'ambient-loop', 'rn-skia', 'libraries-dev', 'shipped'],
  gooey: ['backgrounds-shaders', 'gesture', 'web-svg-filter', 'libraries-dev', 'shipped'],
  'liquid-metal': ['backgrounds-shaders', 'ambient-loop', 'web-webgl', 'libraries-dev', 'shipped'],
  'abrar-overview': ['data-display', 'static', 'rn-svg', 'abrar', 'shipped'],
  'preview-tools': ['inputs-pickers', 'gesture', 'rn-reanimated', null, 'shipped'],
  'orb-state-picker': ['inputs-pickers', 'static', 'rn-skia', 'libraries-dev', 'shipped'],
  'yogesh-orb-creator': ['inputs-pickers', 'static', 'rn-skia', 'yogesh', 'shipped'],
  'spacing-tuner': ['data-display', 'ambient-loop', 'web-css', 'michael-filipiuk', 'shipped'],
  stageshow: ['ai-skills', 'ambient-loop', 'web-css', 'benji-taylor', 'shipped'],
};

export const ASSET_META: Record<string, AssetMeta> = Object.fromEntries(
  Object.entries(ROWS).map(([id, [type, motion, stack, source, status]]) => [
    id,
    { type, motion, stack, source, status },
  ]),
);

const EXPECTED_COUNTS: Record<ComponentType, number> = {
  'inputs-pickers': 6,
  buttons: 3,
  'menus-overlays': 4,
  cards: 3,
  navigation: 2,
  'text-effects': 4,
  'backgrounds-shaders': 3,
  loaders: 11,
  'data-display': 4,
  'ai-skills': 1,
};

function assertTaxonomy() {
  const catalogIds = TRANSITIONS.map((item) => item.id);
  const metaIds = Object.keys(ASSET_META);
  const missing = catalogIds.filter((id) => !ASSET_META[id]);
  const extra = metaIds.filter((id) => !catalogIds.includes(id));
  if (missing.length || extra.length || metaIds.length !== 41) {
    throw new Error(
      `Library taxonomy out of sync with the catalog (missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'}; count ${metaIds.length})`,
    );
  }
  for (const type of COMPONENT_TYPES) {
    const n = metaIds.filter((id) => ASSET_META[id].type === type.slug).length;
    if (n !== EXPECTED_COUNTS[type.slug]) {
      throw new Error(`${type.label} expected ${EXPECTED_COUNTS[type.slug]}, got ${n}`);
    }
  }
  if (ASSET_META['yogesh-orb-creator'].status !== 'shipped') {
    throw new Error('Orb Creator is a shipped asset');
  }
  if (ASSET_META['yogesh-thinking-orbs'].type !== 'loaders') {
    throw new Error('Thinking Orbs belongs in Loaders');
  }
  const unverified = [
    'text-states-swap',
    'menu-dropdown',
    'modal-open-close',
    'icon-swap',
    'success-check',
    'shimmer-text',
    'image-generation-loader',
    'preview-tools',
  ];
  for (const id of unverified) {
    if (ASSET_META[id].source !== null) {
      throw new Error(`${id} source is not verified and must not carry a source chip`);
    }
  }
}

assertTaxonomy();

export type GalleryFilters = {
  motion: Motion[];
  stack: Stack[];
  source: Source[];
  status: Status[];
  q: string;
};

export const EMPTY_FILTERS: GalleryFilters = {
  motion: [],
  stack: [],
  source: [],
  status: [],
  q: '',
};

function countWhere(pred: (meta: AssetMeta) => boolean): number {
  return Object.values(ASSET_META).filter(pred).length;
}

export function typeCount(slug: ComponentType): number {
  return countWhere((meta) => meta.type === slug);
}

export function totalAssets(): number {
  return Object.keys(ASSET_META).length;
}

export function isComponentType(slug: string): slug is ComponentType {
  return COMPONENT_TYPES.some((type) => type.slug === slug);
}

export function typeLabel(slug: string | null): string | null {
  if (!slug) return null;
  return COMPONENT_TYPES.find((type) => type.slug === slug)?.label ?? null;
}

export const VISIBLE_TYPES = COMPONENT_TYPES.filter((type) => typeCount(type.slug) > 0);

export const VISIBLE_MOTIONS = MOTIONS.filter(
  (motion) => motion.slug !== 'scroll' || countWhere((meta) => meta.motion === 'scroll') > 0,
);

export const VISIBLE_SOURCES = SOURCES.filter(
  (source) => countWhere((meta) => meta.source === source.slug) > 0,
);

function pick<T extends string>(raw: string | null, order: readonly T[]): T[] {
  if (!raw) return [];
  const wanted = new Set(raw.split(',').map((part) => part.trim()).filter(Boolean));
  return order.filter((slug) => wanted.has(slug));
}

export function parseGallerySearch(search: string): GalleryFilters {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return {
    motion: pick(params.get('motion'), MOTIONS.map((item) => item.slug)),
    stack: pick(params.get('stack'), STACKS.map((item) => item.slug)),
    source: pick(params.get('source'), SOURCES.map((item) => item.slug)),
    status: pick(params.get('status'), STATUSES.map((item) => item.slug)),
    q: params.get('q') ?? '',
  };
}

export function readFilters(): GalleryFilters {
  if (typeof window === 'undefined') return EMPTY_FILTERS;
  return parseGallerySearch(window.location.search);
}

function joinedParam(value: string | string[] | undefined): string | null {
  if (typeof value === 'string') return value;
  if (!Array.isArray(value)) return null;
  const parts: string[] = [];
  for (const part of value) {
    if (typeof part === 'string' && part.length > 0) parts.push(part);
  }
  return parts.length > 0 ? parts.join(',') : null;
}

/** Gallery filters from the route, not `window.location` (that lags a navigation). */
export function filtersFromParams(params: { [key: string]: string | string[] | undefined }): GalleryFilters {
  return {
    motion: pick(joinedParam(params.motion), MOTIONS.map((item) => item.slug)),
    stack: pick(joinedParam(params.stack), STACKS.map((item) => item.slug)),
    source: pick(joinedParam(params.source), SOURCES.map((item) => item.slug)),
    status: pick(joinedParam(params.status), STATUSES.map((item) => item.slug)),
    q: joinedParam(params.q) ?? '',
  };
}

function encodeList(values: readonly string[]): string {
  return values.map((value) => encodeURIComponent(value)).join(',');
}

/** Query string without the leading `?`. Commas stay literal, matching the lock. */
export function serializeFilters(filters: GalleryFilters): string {
  const parts: string[] = [];
  if (filters.motion.length) parts.push(`motion=${encodeList(filters.motion)}`);
  if (filters.stack.length) parts.push(`stack=${encodeList(filters.stack)}`);
  if (filters.source.length) parts.push(`source=${encodeList(filters.source)}`);
  if (filters.status.length) parts.push(`status=${encodeList(filters.status)}`);
  if (filters.q.trim()) parts.push(`q=${encodeURIComponent(filters.q)}`);
  return parts.join('&');
}

export function galleryPath(typeSlug: string | null, filters: GalleryFilters): string {
  const path = typeSlug ? `/c/${typeSlug}` : '/';
  const qs = serializeFilters(filters);
  return qs ? `${path}?${qs}` : path;
}

export function assetHref(slug: string): Href {
  return { pathname: '/a/[slug]', params: { slug } };
}

export function galleryHref(typeSlug: string | null, filters: GalleryFilters): Href {
  const params: Record<string, string> = {};
  if (filters.motion.length) params.motion = filters.motion.join(',');
  if (filters.stack.length) params.stack = filters.stack.join(',');
  if (filters.source.length) params.source = filters.source.join(',');
  if (filters.status.length) params.status = filters.status.join(',');
  const q = filters.q.trim();
  if (q) params.q = q;
  if (typeSlug) {
    return { pathname: '/c/[type]', params: { ...params, type: typeSlug } };
  }
  return { pathname: '/', params };
}

export function replaceGalleryQuery(filters: GalleryFilters) {
  if (typeof window === 'undefined') return;
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const qs = serializeFilters(filters);
  const next = qs ? `${path}?${qs}` : path;
  const current = `${path}${window.location.search}`;
  if (current === next) return;
  window.history.replaceState(window.history.state, '', next);
}

export function filtersActive(filters: GalleryFilters): boolean {
  return (
    filters.motion.length + filters.stack.length + filters.source.length + filters.status.length > 0 ||
    filters.q.trim().length > 0
  );
}

function labelsFor<T extends string>(
  selected: readonly T[],
  options: readonly { slug: T; label: string }[],
): string {
  return options.filter((option) => selected.includes(option.slug)).map((option) => option.label).join(', ');
}

export function filterSummary(filters: GalleryFilters): string {
  const parts: string[] = [];
  if (filters.motion.length) parts.push(`Motion: ${labelsFor(filters.motion, MOTIONS)}`);
  if (filters.stack.length) parts.push(`Stack: ${labelsFor(filters.stack, STACKS)}`);
  if (filters.source.length) parts.push(`Source: ${labelsFor(filters.source, SOURCES)}`);
  if (filters.status.length) parts.push(`Status: ${labelsFor(filters.status, STATUSES)}`);
  const q = filters.q.trim();
  if (q) parts.push(`Search: ${q}`);
  return parts.join(' · ');
}

export function resultLine(
  matched: number,
  total: number,
  typeName: string | null,
  filters: GalleryFilters,
): string {
  const where = typeName ?? 'all assets';
  const summary = filterSummary(filters);
  const base = `${matched} of ${total} in ${where}`;
  return summary ? `${base} · ${summary}` : base;
}

export function sameFilters(a: GalleryFilters, b: GalleryFilters): boolean {
  const eq = (left: readonly string[], right: readonly string[]) =>
    left.length === right.length && left.every((value, index) => value === right[index]);
  return eq(a.motion, b.motion) && eq(a.stack, b.stack) && eq(a.source, b.source) && eq(a.status, b.status) && a.q === b.q;
}

function isListedSlug<T extends string>(slug: string, options: readonly { slug: T }[]): slug is T {
  return options.some((option) => option.slug === slug);
}

function toggle<T extends string>(selected: readonly T[], value: T, order: readonly T[]): T[] {
  const next = new Set(selected);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return order.filter((slug) => next.has(slug));
}

export function toggleFilter(filters: GalleryFilters, group: FilterGroup, slug: string): GalleryFilters {
  if (group === 'motion' && isListedSlug(slug, MOTIONS)) {
    return { ...filters, motion: toggle(filters.motion, slug, MOTIONS.map((item) => item.slug)) };
  }
  if (group === 'stack' && isListedSlug(slug, STACKS)) {
    return { ...filters, stack: toggle(filters.stack, slug, STACKS.map((item) => item.slug)) };
  }
  if (group === 'source' && isListedSlug(slug, SOURCES)) {
    return { ...filters, source: toggle(filters.source, slug, SOURCES.map((item) => item.slug)) };
  }
  if (group === 'status' && isListedSlug(slug, STATUSES)) {
    return { ...filters, status: toggle(filters.status, slug, STATUSES.map((item) => item.slug)) };
  }
  return filters;
}

export function matchesGallery(item: TransitionItem, typeSlug: string | null, filters: GalleryFilters): boolean {
  const meta = ASSET_META[item.id];
  if (!meta) return false;
  if (typeSlug && meta.type !== typeSlug) return false;
  if (filters.motion.length && !filters.motion.includes(meta.motion)) return false;
  if (filters.stack.length && !filters.stack.includes(meta.stack)) return false;
  if (filters.source.length && (meta.source == null || !filters.source.includes(meta.source))) return false;
  if (filters.status.length && !filters.status.includes(meta.status)) return false;
  return matchesSearch(item, filters.q);
}

export function countGallery(typeSlug: string | null, filters: GalleryFilters): number {
  return TRANSITIONS.filter((item) => matchesGallery(item, typeSlug, filters)).length;
}

export function facetLine(id: string): string | null {
  const meta = ASSET_META[id];
  if (!meta) return null;
  const motion = MOTIONS.find((item) => item.slug === meta.motion);
  const stack = STACKS.find((item) => item.slug === meta.stack);
  if (!motion || !stack) return null;
  return `${motion.line} · ${stack.label}`;
}

export function chipSelected(filters: GalleryFilters, group: FilterGroup, slug: string): boolean {
  if (group === 'motion' && isListedSlug(slug, MOTIONS)) return filters.motion.includes(slug);
  if (group === 'stack' && isListedSlug(slug, STACKS)) return filters.stack.includes(slug);
  if (group === 'source' && isListedSlug(slug, SOURCES)) return filters.source.includes(slug);
  if (group === 'status' && isListedSlug(slug, STATUSES)) return filters.status.includes(slug);
  return false;
}
