import { Suspense, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { View, type ViewStyle } from 'react-native';
import { Stage } from '@/src/components/Stage';
import { warmSkiaDemo, type TransitionItem } from '@/src/catalog';
import { LibdevStage } from '@/src/libdev/LibdevStage';
import { viewWeb } from '@/src/library/webProps';
import { retainCardState } from '@/src/skia/cardState';
import { canvasKitReady, ensureCanvasKit } from '@/src/skia/ensureCanvasKit';

retainCardState();
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

function FrameSkeleton() {
  return <View style={styles.frameSkeleton} {...viewWeb({ dataSet: { previewSkeleton: 'true' } })} />;
}

function PreviewLive({ onLive }: { onLive: () => void }) {
  useEffect(() => {
    onLive();
  }, [onLive]);
  return null;
}

/** Mount a Skia demo once it is within 200px, after the shared CanvasKit load. */
export function DeferredSkiaDemo({
  item,
  appearance = 'card',
  onUnavailable,
  onLive,
}: {
  item: TransitionItem;
  appearance?: 'card' | 'frame';
  /** Asset preview: CanvasKit / LoadSkiaWeb rejected. */
  onUnavailable?: () => void;
  /** Asset preview: the demo committed, so a load timeout can stand down. */
  onLive?: () => void;
}) {
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
    let current = true;
    warmSkiaDemo(item.id);
    ensureCanvasKit().then(
      () => {
        if (current) setKit(true);
      },
      () => {
        if (current) onUnavailable?.();
      },
    );
    return () => {
      current = false;
    };
  }, [armed, item.id, onUnavailable]);

  const budget = useSyncExternalStore(subscribeSkiaBudget, getSkiaBudget, getSkiaBudget);
  const live = !canObserve || untracked || budget.live.has(reactId);
  const runtime = useMemo(
    () => ({ mount: live, running: live && !budget.hidden }),
    [budget.hidden, live],
  );
  const show = armed && kit;
  const placeholder = appearance === 'frame' ? <FrameSkeleton /> : <SkiaPlaceholder cardId={item.id} />;
  const frameStyle: ViewStyle | undefined =
    appearance === 'frame'
      ? {
          width: '100%',
          minHeight: 420,
          alignItems: item.fullRow ? 'stretch' : 'center',
          justifyContent: item.fullRow ? 'flex-start' : 'center',
        }
      : undefined;

  return (
    <View id={domId} ref={ref} collapsable={false} style={frameStyle}>
      <SkiaRuntimeContext.Provider value={runtime}>
        {show ? (
          <Suspense fallback={placeholder}>
            <item.Demo />
            {onLive ? <PreviewLive onLive={onLive} /> : null}
          </Suspense>
        ) : (
          placeholder
        )}
      </SkiaRuntimeContext.Provider>
    </View>
  );
}

const styles = {
  frameSkeleton: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#eeeeef',
  },
} as const;
