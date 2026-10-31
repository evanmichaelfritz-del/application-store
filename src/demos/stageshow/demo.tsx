import { Image, View } from 'react-native';

/** Native stand-in. Web plays the recording from demo.web.tsx. */
export function StageshowDemo() {
  return (
    <View
      testID="stageshow-demo"
      style={{
        width: '100%',
        maxHeight: 420,
        aspectRatio: 1546 / 1080,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#f9f9f9',
      }}
    >
      <Image
        source={{ uri: '/media/stageshow-poster.jpg' }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}
