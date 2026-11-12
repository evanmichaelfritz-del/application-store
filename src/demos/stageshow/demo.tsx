import { CatalogMedia } from '@/src/components/CatalogMedia';
import { stageshowMedia } from './media';

/** Native stand-in. Web plays the recording from demo.web.tsx. */
export function StageshowDemo() {
  return <CatalogMedia media={stageshowMedia} testID="stageshow-demo" stageID="stageshow-stage" fill />;
}
