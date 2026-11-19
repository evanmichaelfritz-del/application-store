import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { createRoot } from 'react-dom/client';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ReduceMotionProvider } from '@/src/context/ReduceMotionContext';
import { YogeshThinkingOrbsDemo } from '@/src/demos/yogesh-thinking-orbs';

const root = document.getElementById('parity-root');
if (root) {
  createRoot(root).render(
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ReduceMotionProvider>
          <YogeshThinkingOrbsDemo />
        </ReduceMotionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>,
  );
}
