import { Image, View } from 'react-native';
import type { CatalogMedia as Media } from '@/src/catalog';

const frame = {
  width: '100%' as const,
  maxHeight: 420,
  backgroundColor: '#f9f9f9',
};

/** Native stand-in. Web plays the recording from CatalogMedia.web.tsx. */
export function CatalogMedia({ media, testID }: { media: Media; testID?: string; stageID?: string }) {
  return (
    <View
      testID={testID}
      style={{
        width: '100%',
        maxHeight: 420,
        aspectRatio: 16 / 10,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#f9f9f9',
      }}
    >
      <Image
        source={{ uri: media.poster }}
        style={frame}
        resizeMode="contain"
        accessibilityLabel={media.alt}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}
