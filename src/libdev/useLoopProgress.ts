import { useCallback, useEffect } from 'react';
import {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/**
 * Loop clock. When `running` is 0 the animation is cancelled in place —
 * the Canvas stays mounted; we do not remount Skia on focus/drag.
 */
export function useLoopProgress(
  durationMs: number,
  reducedMotion: boolean,
  frozen = 0.18,
  running?: { value: number },
) {
  const progress = useSharedValue(reducedMotion ? frozen : 0);

  const start = useCallback(() => {
    cancelAnimation(progress);
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration: durationMs, easing: Easing.linear }),
      -1,
      false,
    );
  }, [durationMs, progress]);

  const stop = useCallback(() => {
    cancelAnimation(progress);
  }, [progress]);

  useEffect(() => {
    if (reducedMotion) {
      stop();
      progress.value = frozen;
      return;
    }
    if (running && running.value === 0) {
      stop();
      progress.value = frozen;
      return;
    }
    start();
    return stop;
  }, [frozen, progress, reducedMotion, running, start, stop]);

  useAnimatedReaction(
    () => (running ? running.value : 1),
    (run, prev) => {
      if (reducedMotion) return;
      if (prev === undefined || run === prev) return;
      if (!run) runOnJS(stop)();
      else runOnJS(start)();
    },
    [reducedMotion, running, start, stop],
  );

  return progress;
}
