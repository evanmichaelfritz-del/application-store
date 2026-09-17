import { Gesture, type PanGesture } from 'react-native-gesture-handler';
import { withSpring, type SharedValue } from 'react-native-reanimated';

import { SNAP_DRAG } from '@/src/demos/gooey/constants';
import { SNAP_SPRING } from '@/src/libdev/tokens';
import { DRAG_STEP, clampDrag, markGooeyOnBegin } from '@/src/libdev/gooeyDrag';

function stampTx(x: number, y = 0) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('gooey-drag');
  if (!el) return;
  const mag = Math.hypot(x, y);
  if (mag < 1) return;
  el.setAttribute('data-tx', String(Math.round(mag)));
}

/**
 * Web: runOnJS so onUpdate writes the same JS shared values that
 * useAnimatedStyle reads. Mid-drag: translateX/Y only, few-px threshold
 * so we do not rewrite styles every pointer frame. No Exclusive /
 * blocksExternalGesture. Settle SNAP_SPRING.
 */
export function createGooeyPan(
  dragX: SharedValue<number>,
  dragY: SharedValue<number>,
  snapped: SharedValue<boolean>,
  gooeyBlocking: SharedValue<number> | null,
): PanGesture {
  return Gesture.Pan()
    .runOnJS(true)
    .enabled(true)
    .shouldCancelWhenOutside(false)
    .maxPointers(1)
    .minDistance(0)
    .onBegin(() => {
      if (gooeyBlocking) gooeyBlocking.value = 1;
      snapped.value = false;
      markGooeyOnBegin();
    })
    .onStart(() => {
      if (gooeyBlocking) gooeyBlocking.value = 1;
    })
    .onUpdate((event) => {
      if (gooeyBlocking) gooeyBlocking.value = 1;
      const x = clampDrag(event.translationX);
      const y = clampDrag(event.translationY);
      const dist = Math.hypot(x, y);
      stampTx(x, y);
      if (dist > SNAP_DRAG) {
        if (!snapped.value) {
          snapped.value = true;
          dragX.value = withSpring(0, SNAP_SPRING);
          dragY.value = withSpring(0, SNAP_SPRING);
        }
        return;
      }
      snapped.value = false;
      if (Math.abs(x - dragX.value) < DRAG_STEP && Math.abs(y - dragY.value) < DRAG_STEP) {
        return;
      }
      dragX.value = x;
      dragY.value = y;
    })
    .onEnd((event) => {
      stampTx(clampDrag(event.translationX), clampDrag(event.translationY));
      stampTx(dragX.value, dragY.value);
      snapped.value = true;
      dragX.value = withSpring(0, SNAP_SPRING);
      dragY.value = withSpring(0, SNAP_SPRING);
    })
    .onFinalize((event) => {
      stampTx(clampDrag(event.translationX), clampDrag(event.translationY));
      if (gooeyBlocking) gooeyBlocking.value = 0;
    });
}
