import {
  isComponentType,
  parseGallerySearch,
  serializeFilters,
  type ComponentType,
  type GalleryFilters,
} from '@/src/library/taxonomy';

const KEY = 'application-store-gallery';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export type GalleryTarget = {
  /** `null` is All assets (`/`). */
  type: ComponentType | null;
  filters: GalleryFilters;
};

/** Remember the gallery the user was on, including All assets, so Back can return there. */
export function rememberGallery(typeSlug: string | null, filters: GalleryFilters) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(KEY, JSON.stringify({ type: typeSlug, search: serializeFilters(filters) }));
}

/** `null` means this tab never opened a gallery (a deep link). Fall back to the asset type. */
export function recallGalleryTarget(): GalleryTarget | null {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !('type' in parsed)) return null;
    const typeValue = parsed.type;
    let type: ComponentType | null = null;
    if (typeof typeValue === 'string') {
      if (!isComponentType(typeValue)) return null;
      type = typeValue;
    } else if (typeValue !== null) {
      return null;
    }
    const search = typeof parsed.search === 'string' ? parsed.search : '';
    return { type, filters: parseGallerySearch(search) };
  } catch {
    return null;
  }
}
