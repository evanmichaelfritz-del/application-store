import { useState } from 'react';
import { View } from 'react-native';
import { Stage } from '@/src/components/Stage';
import { Showcase } from './Showcase';
import { ThemeProvider } from './theme/theme';

/** One live orb plus the state list and Size. The stage grows to that host. */
export function YogeshThinkingOrbsDemo() {
  const [height, setHeight] = useState(520);

  return (
    <Stage
      style={{
        height,
        overflow: 'visible',
        backgroundColor: '#000000',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        borderColor: 'transparent',
      }}
    >
      <View
        testID="yogesh-thinking-orbs-preview"
        onLayout={(event) => {
          const next = Math.ceil(event.nativeEvent.layout.height);
          if (next > 0 && Math.abs(next - height) > 1) setHeight(next);
        }}
      >
        <ThemeProvider>
          <Showcase />
        </ThemeProvider>
      </View>
    </Stage>
  );
}
