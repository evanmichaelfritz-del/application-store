import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { type SharedValue, useSharedValue } from 'react-native-reanimated';

import { DEBUG_GOOEY_HIT } from './constants';
import { createGooeyPan } from '@/src/libdev/gooeyPan';

/**
 * Bare overlay Gesture.Pan (no Exclusive / blocksExternalGesture).
 * The detector child is the positioned hit box so pointer capture lands
 * on a real element (not RNGH's display:contents wrap).
 */
export function GooeyHitOverlay({
  dragX,
  dragY,
}: {
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
}) {
  const snapped = useSharedValue(false);

  const pan = useMemo(() => createGooeyPan(dragX, dragY, snapped, null), [dragX, dragY, snapped]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const el =
      document.getElementById('gooey-drag') ?? document.querySelector('[data-testid="gooey-drag"]');
    if (el && !el.getAttribute('data-onbegin')) {
      el.setAttribute('data-onbegin', '0');
    }
    if (el && !el.getAttribute('data-tx')) {
      el.setAttribute('data-tx', '0');
    }
  }, []);

  return (
    <GestureDetector gesture={pan} touchAction="none" userSelect="none">
      <View
        nativeID="gooey-drag"
        collapsable={false}
        testID="gooey-drag"
        pointerEvents="auto"
        style={[styles.hit, hitWeb]}
        accessibilityLabel="Drag the lower Gooey tile"
      />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hit: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
    zIndex: 40,
    pointerEvents: 'auto',
    backgroundColor: DEBUG_GOOEY_HIT ? 'rgba(255, 0, 0, 0.45)' : 'rgba(255,255,255,0.001)',
  },
});

const hitWeb = { touchAction: 'none', userSelect: 'none' } as Record<string, string>;
