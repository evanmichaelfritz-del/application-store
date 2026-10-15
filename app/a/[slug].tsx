import { usePathname } from 'expo-router';
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
  return <AssetPage slug={readSlug(pathname)} />;
}
