import { Suspense, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { View } from 'react-native';
import { Stage } from '@/src/components/Stage';
import { warmSkiaDemo, type TransitionItem } from '@/src/catalog';
import { LibdevStage } from '@/src/libdev/LibdevStage';
import { canvasKitReady, ensureCanvasKit } from '@/src/skia/ensureCanvasKit';
import {
  getSkiaBudget,
  registerSkiaCard,
  SkiaRuntimeContext,
  subscribeSkiaBudget,
} from '@/src/skia/liveBudget';

function SkiaPlaceholder({ cardId }: { cardId: string }) {
  if (cardId === 'yogesh-thinking-orbs' || cardId === 'yogesh-orb-creator') {
    const height = cardId === 'yogesh-thinking-orbs' ? 520 : 640;
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
        {null}
      </Stage>
    );
  }
  return (
    <LibdevStage>
      <View />
    </LibdevStage>
  );
}

function hostElement(node: View | null, domId: string): HTMLElement | null {
  if (typeof HTMLElement !== 'undefined' && node instanceof HTMLElement) return node;
  if (typeof document === 'undefined') return null;
  return document.getElementById(domId);
}

/** Mount a Skia demo once it is within 200px, after the shared CanvasKit load. */
export function DeferredSkiaDemo({ item }: { item: TransitionItem }) {
  const reactId = useId();
  const domId = `skia-${item.id}-${reactId.replace(/:/g, '')}`;
  const ref = useRef<View>(null);
  const canObserve = typeof IntersectionObserver === 'function';
  const [armed, setArmed] = useState(!canObserve);
  const [untracked, setUntracked] = useState(false);
  const [kit, setKit] = useState(canvasKitReady);

  useEffect(() => {
    if (!canObserve) return;
    const el = hostElement(ref.current, domId);
    if (!el) {
      setUntracked(true);
      setArmed(true);
      return;
    }
    return registerSkiaCard(reactId, item.id, el, () => setArmed(true));
  }, [canObserve, domId, item.id, reactId]);

  useEffect(() => {
    if (!armed) return;
    let live = true;
    warmSkiaDemo(item.id);
    ensureCanvasKit().then(() => {
      if (live) setKit(true);
    });
    return () => {
      live = false;
    };
  }, [armed, item.id]);

  const budget = useSyncExternalStore(subscribeSkiaBudget, getSkiaBudget, getSkiaBudget);
  const live = !canObserve || untracked || budget.live.has(reactId);
  const runtime = useMemo(
    () => ({ mount: live, running: live && !budget.hidden }),
    [budget.hidden, live],
  );
  const show = armed && kit;

  return (
    <View id={domId} ref={ref} collapsable={false}>
      <SkiaRuntimeContext.Provider value={runtime}>
        {show ? (
          <Suspense fallback={<SkiaPlaceholder cardId={item.id} />}>
            <item.Demo />
          </Suspense>
        ) : (
          <SkiaPlaceholder cardId={item.id} />
        )}
      </SkiaRuntimeContext.Provider>
    </View>
  );
}
