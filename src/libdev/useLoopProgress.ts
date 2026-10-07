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
import { useSkiaRuntime } from '@/src/skia/liveBudget';

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
  const runtime = useSkiaRuntime();
  const progress = useSharedValue(reducedMotion ? frozen : 0);
  const gate = useSharedValue(runtime.running ? 1 : 0);

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
    gate.value = runtime.running ? 1 : 0;
  }, [gate, runtime.running]);

  useEffect(() => {
    if (reducedMotion) {
      stop();
      progress.value = frozen;
      return;
    }
    if (!runtime.running) {
      stop();
      return;
    }
    if (running && running.value === 0) {
      stop();
      progress.value = frozen;
      return;
    }
    start();
    return stop;
  }, [frozen, progress, reducedMotion, running, runtime.running, start, stop]);

  useAnimatedReaction(
    () => (running ? running.value : 1),
    (run, prev) => {
      if (reducedMotion || !gate.value) return;
      if (prev === undefined || run === prev) return;
      if (!run) runOnJS(stop)();
      else runOnJS(start)();
    },
    [gate, reducedMotion, running, start, stop],
  );

  return progress;
}
