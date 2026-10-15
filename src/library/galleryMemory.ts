import {
  EMPTY_FILTERS,
  isComponentType,
  parseGallerySearch,
  serializeFilters,
  type ComponentType,
  type GalleryFilters,
} from '@/src/library/taxonomy';

const KEY = 'application-store-gallery';

/** True only after a gallery mounted in this document. A full load of /a/<slug> starts false. */
let fromGallery = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export type GalleryTarget = {
  /** `null` is All assets (`/`). */
  type: ComponentType | null;
  filters: GalleryFilters;
};

type GalleryRecord = {
  type: string | null;
  search: string;
  scroll: Record<string, number>;
};

function readScroll(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  const scroll: Record<string, number> = {};
  for (const [url, entry] of Object.entries(value)) {
    if (typeof entry === 'number' && Number.isFinite(entry) && entry > 0) scroll[url] = entry;
  }
  return scroll;
}

function readRecord(): GalleryRecord | null {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !('type' in parsed)) return null;
    const typeValue = parsed.type;
    let type: string | null = null;
    if (typeof typeValue === 'string') type = typeValue;
    else if (typeValue !== null) return null;
    const search = typeof parsed.search === 'string' ? parsed.search : '';
    return { type, search, scroll: readScroll(parsed.scroll) };
  } catch {
    return null;
  }
}

function writeRecord(record: GalleryRecord) {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ type: record.type, search: record.search, scroll: record.scroll }),
    );
  } catch {
    // Private browsing can reject the write. The in-memory fromGallery flag still stands.
  }
}

/** Remember the gallery the user was on, including All assets, so Back can return there. */
export function rememberGallery(typeSlug: string | null, filters: GalleryFilters) {
  fromGallery = true;
  const current = readRecord();
  writeRecord({
    type: typeSlug,
    search: serializeFilters(filters),
    scroll: current?.scroll ?? {},
  });
}

/** Scroll offset for one gallery URL (`/` or `/c/<type>` plus its query). */
export function rememberGalleryScroll(url: string, y: number) {
  const current = readRecord();
  // No gallery target yet. Writing one here would look like All assets to a later deep link.
  if (!current) return;
  const scroll = { ...(current?.scroll ?? {}) };
  if (Number.isFinite(y) && y > 0) scroll[url] = Math.round(y);
  else delete scroll[url];
  writeRecord({ type: current.type, search: current.search, scroll });
}

export function recallGalleryScroll(url: string): number {
  const y = readRecord()?.scroll[url];
  return typeof y === 'number' ? y : 0;
}

/**
 * Where the asset-page back link goes.
 * A gallery visited in this document always wins. A stored query from an earlier
 * load is reused only when it is All assets or this asset's own type.
 */
export function galleryBackTarget(assetType: ComponentType): GalleryTarget {
  const remembered = recallGalleryTarget();
  if (remembered && (fromGallery || remembered.type === null || remembered.type === assetType)) {
    return remembered;
  }
  return { type: assetType, filters: EMPTY_FILTERS };
}

/** `null` means this tab never opened a gallery (a deep link). Fall back to the asset type. */
export function recallGalleryTarget(): GalleryTarget | null {
  const record = readRecord();
  if (!record) return null;
  if (record.type === null) return { type: null, filters: parseGallerySearch(record.search) };
  if (!isComponentType(record.type)) return null;
  return { type: record.type, filters: parseGallerySearch(record.search) };
}
