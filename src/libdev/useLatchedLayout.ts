import { useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

/**
 * Latch a positive layout box. Once `ready` is true it never goes false, so
 * callers can mount a Skia Canvas once and never `{size && <Canvas/>}` remount.
 */
export function useLatchedLayout(initial: { w: number; h: number }) {
  const [box, setBox] = useState(initial);
  const [ready, setReady] = useState(false);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width <= 0 || height <= 0) return;
    setBox((prev) => (prev.w === width && prev.h === height ? prev : { w: width, h: height }));
    setReady(true);
  }, []);

  return { box, ready, onLayout };
}
