import { useLocalSearchParams } from 'expo-router';
import NotFound from '../+not-found';
import { AppsGallery } from '@/src/components/AppsGallery';
import { StoreGallery } from '@/src/components/StoreGallery';
import { CRAFT_CATEGORY_SLUG } from '@/src/library/craftApps';
import { isComponentType } from '@/src/library/taxonomy';

function firstString(value: string | string[] | undefined): string {
  if (typeof value === 'string') return value;
  if (!Array.isArray(value)) return '';
  for (const part of value) {
    if (part.length > 0) return part;
  }
  return '';
}

export default function TypeGallery() {
  // The route param, not the global pathname. A gallery kept under an asset
  // still renders, and the pathname then names the asset — reading it here
  // redirected Back onto `/` and dropped the filtered screen.
  const slug = firstString(useLocalSearchParams().type);
  if (slug === CRAFT_CATEGORY_SLUG) return <AppsGallery />;
  if (!isComponentType(slug)) return <NotFound />;
  return <StoreGallery typeSlug={slug} />;
}
