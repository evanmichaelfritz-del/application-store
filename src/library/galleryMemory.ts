import { EMPTY_FILTERS, parseGallerySearch, serializeFilters, type GalleryFilters } from '@/src/library/taxonomy';

const KEY = 'application-store-gallery';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Remember the gallery type page's query so an asset back link can restore it. */
export function rememberGallery(typeSlug: string | null, filters: GalleryFilters) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(KEY, JSON.stringify({ type: typeSlug, search: serializeFilters(filters) }));
}

export function recallGallery(): GalleryFilters {
  if (typeof sessionStorage === 'undefined') return EMPTY_FILTERS;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return EMPTY_FILTERS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || typeof parsed.search !== 'string') return EMPTY_FILTERS;
    return parseGallerySearch(parsed.search);
  } catch {
    return EMPTY_FILTERS;
  }
}
