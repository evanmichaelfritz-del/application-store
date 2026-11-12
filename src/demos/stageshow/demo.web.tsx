import { CatalogMedia } from '@/src/components/CatalogMedia';
import { stageshowMedia } from './media';

/** The card stage. Paths live on the catalog media field. */
export function StageshowDemo() {
  return <CatalogMedia media={stageshowMedia} testID="stageshow-demo" stageID="stageshow-stage" fill />;
}
