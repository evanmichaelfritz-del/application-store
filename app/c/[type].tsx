import { Redirect, usePathname } from 'expo-router';
import { StoreGallery } from '@/src/components/StoreGallery';
import { isComponentType } from '@/src/library/taxonomy';

export default function TypeGallery() {
  const pathname = usePathname();
  const slug = pathname.split('/').filter(Boolean).pop() ?? '';
  if (!slug || !isComponentType(slug)) {
    return <Redirect href="/" />;
  }
  return <StoreGallery typeSlug={slug} />;
}
