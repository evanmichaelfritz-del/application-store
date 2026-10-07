import { useState } from 'react';
import { View } from 'react-native';
import { Stage } from '@/src/components/Stage';
import { ThemeProvider } from './theme/theme';
import { Tuner } from './Tuner';

/**
 * Gallery host for the ported playground tuner. The stage grows to the tuner
 * and does not clip the select menus.
 */
export function YogeshThinkingOrbsDemo() {
  const [height, setHeight] = useState(640);

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
          <Tuner />
        </ThemeProvider>
      </View>
    </Stage>
  );
}
