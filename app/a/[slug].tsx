import { usePathname } from 'expo-router';
import NotFound from '../+not-found';
import { TRANSITIONS } from '@/src/catalog';
import { AssetPage } from '@/src/components/AssetPage';

function readSlug(pathname: string): string {
  const raw = pathname.split('/').filter(Boolean).slice(1).join('/');
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export default function AssetRoute() {
  const pathname = usePathname();
  const slug = readSlug(pathname);
  if (!TRANSITIONS.some((entry) => entry.id === slug)) return <NotFound />;
  return <AssetPage slug={slug} />;
}
