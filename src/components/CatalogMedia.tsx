import { Image, View } from 'react-native';
import type { CatalogMedia as Media } from '@/src/catalog';

const frame = {
  width: '100%' as const,
  height: '100%' as const,
  backgroundColor: '#f9f9f9',
};

function aspectNumber(aspect: string): number {
  const [w, h] = aspect.split('/').map((part) => Number(part.trim()));
  if (!Number.isFinite(w) || !Number.isFinite(h) || h === 0) return 16 / 10;
  return w / h;
}

/** Native stand-in. Web plays the recording from CatalogMedia.web.tsx. */
export function CatalogMedia({
  media,
  testID,
  fill = false,
}: {
  media: Media;
  testID?: string;
  stageID?: string;
  fill?: boolean;
}) {
  const ratio = aspectNumber(media.aspect);
  const maxWidth = fill ? undefined : Math.round((420 * ratio));
  return (
    <View
      testID={testID}
      style={{
        width: '100%',
        maxWidth,
        maxHeight: 420,
        aspectRatio: ratio,
        alignSelf: fill ? 'auto' : 'center',
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#f9f9f9',
      }}
    >
      <Image
        source={{ uri: media.poster }}
        style={frame}
        resizeMode="cover"
        accessibilityLabel={media.alt}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}
