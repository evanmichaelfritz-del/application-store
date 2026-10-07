import { useState } from 'react';
import { View } from 'react-native';
import { Stage } from '@/src/components/Stage';
import { ThemeProvider } from '@/src/demos/yogesh-thinking-orbs/theme/theme';
import { Tuner } from '@/src/demos/yogesh-thinking-orbs/Tuner';

/**
 * Orb Creator. Same playground tuner and orb engine as the Effects card,
 * spanning the tools grid so the controls stay usable.
 */
export function YogeshOrbCreatorDemo() {
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
        testID="yogesh-orb-creator-preview"
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
