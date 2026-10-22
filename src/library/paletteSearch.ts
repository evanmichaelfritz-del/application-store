import { TRANSITIONS, type TransitionItem } from '@/src/catalog';
import { CRAFT_APPS, CRAFT_CATEGORY_LABEL, CRAFT_CATEGORY_SLUG } from '@/src/library/craftApps';
import { creditFor } from '@/src/library/credits';
import { newestAssets } from '@/src/library/recentlyAdded';
import {
  ASSET_META,
  SOURCES,
  VISIBLE_TYPES,
  totalAssets,
  typeCount,
  typeLabel,
  type Source,
} from '@/src/library/taxonomy';
import { NAV_SECTIONS } from '@/src/sections';

const ASSET_CAP = 8;
const FACET_CAP = 3;

const AUTHORS = [
  { label: 'Jakub Antalik', source: 'libraries-dev' },
  { label: 'Yogesh', source: 'yogesh' },
  { label: 'Abrar Karim', source: 'abrar' },
  { label: 'Michael Filipiuk', source: 'michael-filipiuk' },
] as const;

export type AssetOption = {
  kind: 'asset';
  id: string;
  title: string;
  typeLabel: string;
  hint: string | null;
  mark: { start: number; end: number } | null;
};

export type TypeOption = {
  kind: 'type';
  slug: string;
  label: string;
  count: number;
};

export type SourceOption = {
  kind: 'source';
  slug: Source;
  label: string;
  count: number;
};

export type MoreOption = { kind: 'more'; total: number };

export type PaletteOption = AssetOption | TypeOption | SourceOption | MoreOption;

export type PaletteGroup = { heading: string; options: PaletteOption[] };

function norm(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();
}

function sourceLabel(slug: Source | null): string | null {
  if (!slug) return null;
  return SOURCES.find((item) => item.slug === slug)?.label ?? null;
}

function sourceCount(slug: Source): number {
  return Object.values(ASSET_META).filter((meta) => meta.source === slug).length;
}

function sectionLabels(item: TransitionItem): string[] {
  const labels: string[] = [];
  for (const key of item.sections) {
    const found = NAV_SECTIONS.find((section) => section.key === key);
    if (found) labels.push(found.label);
  }
  return labels;
}

function authorCount(label: string): number {
  return TRANSITIONS.filter((item) => creditFor(item.id)?.label === label).length;
}

function markIn(title: string, query: string): { start: number; end: number } | null {
  const at = title.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
  if (at < 0) return null;
  return { start: at, end: at + query.length };
}

function wordStart(name: string, query: string): boolean {
  return name.split(/[^a-z0-9]+/).some((part) => part.length > 0 && part.startsWith(query));
}

function subsequence(name: string, query: string): boolean {
  let index = 0;
  for (const ch of name) {
    if (ch === query[index]) index += 1;
    if (index >= query.length) return true;
  }
  return false;
}

type Scored = { item: TransitionItem; index: number; rank: number; hint: string | null; mark: { start: number; end: number } | null };

function scoreAsset(item: TransitionItem, index: number, query: string): Scored | null {
  const name = norm(item.title);
  const meta = ASSET_META[item.id];
  const type = typeLabel(meta?.type ?? null);
  let rank = 0;
  let hint: string | null = null;
  let mark: { start: number; end: number } | null = null;

  if (name === query) rank = 1;
  else if (name.startsWith(query)) rank = 2;
  else if (wordStart(name, query)) rank = 3;
  else if (name.includes(query)) rank = 4;

  if (rank > 0) mark = markIn(item.title, query);

  const tags = item.tags ?? [];
  const exactTag = tags.find((tag) => norm(tag) === query);
  const prefixTag = tags.find((tag) => norm(tag).startsWith(query));
  if (rank === 0 && exactTag) {
    rank = 5;
    hint = `tag: ${exactTag}`;
  } else if (rank === 0 && prefixTag) {
    rank = 6;
    hint = `tag: ${prefixTag}`;
  }

  const credit = creditFor(item.id);
  const listed = sourceLabel(meta?.source ?? null);
  if (rank === 0 && credit) {
    const person = !credit.label.includes('.');
    const authorHit = person && norm(credit.label).includes(query);
    const sourceHit = listed != null && norm(listed).includes(query);
    const siteHit = !person && norm(credit.label).includes(query);
    if (authorHit) {
      rank = 7;
      hint = `author: ${credit.label}`;
    } else if (sourceHit || siteHit) {
      rank = 7;
      hint = `source: ${listed ?? credit.label}`;
    }
  }

  if (rank === 0 && type && norm(type).includes(query)) {
    rank = 8;
    hint = `category: ${type}`;
  }
  if (rank === 0) {
    const section = sectionLabels(item).find((label) => norm(label).includes(query));
    if (section) {
      rank = 8;
      hint = `section: ${section}`;
    }
  }
  if (rank === 0) return null;
  return { item, index, rank, hint, mark };
}

function rankAssets(query: string): Scored[] {
  const scored: Scored[] = [];
  TRANSITIONS.forEach((item, index) => {
    const hit = scoreAsset(item, index, query);
    if (hit) scored.push(hit);
  });
  scored.sort((a, b) => a.rank - b.rank || a.index - b.index);
  if (scored.length >= 3 || query.length < 2) return scored;
  const seen = new Set(scored.map((hit) => hit.item.id));
  const fuzzy: Scored[] = [];
  TRANSITIONS.forEach((item, index) => {
    if (seen.has(item.id)) return;
    if (!subsequence(norm(item.title), query)) return;
    fuzzy.push({ item, index, rank: 9, hint: null, mark: markIn(item.title, query) });
  });
  return [...scored, ...fuzzy].sort((a, b) => a.rank - b.rank || a.index - b.index);
}

function assetOption(hit: Scored): AssetOption {
  return {
    kind: 'asset',
    id: hit.item.id,
    title: hit.item.title,
    typeLabel: typeLabel(ASSET_META[hit.item.id]?.type ?? null) ?? '',
    hint: hit.hint,
    mark: hit.mark,
  };
}

function typeOptions(query: string): TypeOption[] {
  const hits: TypeOption[] = [];
  for (const type of VISIBLE_TYPES) {
    if (query && !norm(type.label).includes(query)) continue;
    hits.push({ kind: 'type', slug: type.slug, label: type.label, count: typeCount(type.slug) });
  }
  if (!query || norm(CRAFT_CATEGORY_LABEL).includes(query)) {
    hits.push({
      kind: 'type',
      slug: CRAFT_CATEGORY_SLUG,
      label: CRAFT_CATEGORY_LABEL,
      count: CRAFT_APPS.length,
    });
  }
  const allAssets = norm('All assets');
  if (query.length >= 3 && (allAssets.startsWith(query) || wordStart(allAssets, query))) {
    hits.unshift({ kind: 'type', slug: 'all', label: 'All assets', count: totalAssets() });
  }
  return query ? hits.slice(0, FACET_CAP) : hits;
}

type CraftHit = {
  id: string;
  title: string;
  index: number;
  rank: number;
  mark: { start: number; end: number } | null;
};

function rankCraft(query: string): CraftHit[] {
  const hits: CraftHit[] = [];
  CRAFT_APPS.forEach((app, index) => {
    const name = norm(app.title);
    let rank = 0;
    if (name === query) rank = 1;
    else if (name.startsWith(query)) rank = 2;
    else if (wordStart(name, query)) rank = 3;
    else if (name.includes(query)) rank = 4;
    else if (norm(app.description).includes(query)) rank = 8;
    if (rank === 0 && query.length >= 2 && subsequence(name, query)) rank = 9;
    if (rank === 0) return;
    hits.push({
      id: app.slug,
      title: app.title,
      index: TRANSITIONS.length + index,
      rank,
      mark: markIn(app.title, query),
    });
  });
  return hits;
}

function sourceOptions(query: string): SourceOption[] {
  if (!query) return [];
  const hits: SourceOption[] = [];
  const seen = new Set<string>();
  const push = (row: SourceOption) => {
    const key = norm(row.label);
    if (!key.includes(query) || seen.has(key)) return;
    seen.add(key);
    hits.push(row);
  };
  for (const source of SOURCES) {
    const count = sourceCount(source.slug);
    if (count === 0 || !norm(source.label).includes(query)) continue;
    push({ kind: 'source', slug: source.slug, label: source.label, count });
  }
  for (const author of AUTHORS) {
    const count = authorCount(author.label);
    if (count === 0 || !norm(author.label).includes(query)) continue;
    push({ kind: 'source', slug: author.source, label: author.label, count });
  }
  return hits.slice(0, FACET_CAP);
}

function assetGroup(heading: string, items: readonly TransitionItem[]): PaletteGroup {
  return {
    heading,
    options: items.map((item) => ({
      kind: 'asset',
      id: item.id,
      title: item.title,
      typeLabel: typeLabel(ASSET_META[item.id]?.type ?? null) ?? '',
      hint: null,
      mark: null,
    })),
  };
}

/** Empty query lists recent opens, or the five newest assets, then every type. */
export function paletteGroups(query: string, recentIds: readonly string[], showAll: boolean): PaletteGroup[] {
  const q = norm(query.trim());
  if (!q) {
    const recent = recentIds
      .map((id) => TRANSITIONS.find((item) => item.id === id))
      .filter((item): item is TransitionItem => item != null)
      .slice(0, 5);
    const assets = recent.length > 0 ? assetGroup('Recent', recent) : assetGroup('Recently added', newestAssets(5));
    const types = typeOptions('');
    return types.length ? [assets, { heading: 'Types', options: types }] : [assets];
  }

  const ranked = [
    ...rankAssets(q).map((hit) => ({ rank: hit.rank, index: hit.index, option: assetOption(hit) })),
    ...rankCraft(q).map((hit) => ({
      rank: hit.rank,
      index: hit.index,
      option: {
        kind: 'asset' as const,
        id: hit.id,
        title: hit.title,
        typeLabel: CRAFT_CATEGORY_LABEL,
        hint: null,
        mark: hit.mark,
      },
    })),
  ].sort((a, b) => a.rank - b.rank || a.index - b.index);
  const shown = showAll ? ranked : ranked.slice(0, ASSET_CAP);
  const assetOptions: PaletteOption[] = shown.map((hit) => hit.option);
  if (!showAll && ranked.length > ASSET_CAP) assetOptions.push({ kind: 'more', total: ranked.length });

  const groups: PaletteGroup[] = [];
  if (assetOptions.length) groups.push({ heading: 'Assets', options: assetOptions });
  const types = typeOptions(q);
  if (types.length) groups.push({ heading: 'Types', options: types });
  const sources = sourceOptions(q);
  if (sources.length) groups.push({ heading: 'Sources', options: sources });
  return groups;
}
