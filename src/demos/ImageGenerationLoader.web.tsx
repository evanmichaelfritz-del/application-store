import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MutableRefObject } from 'react';
import { StyleSheet, View } from 'react-native';
import { AnimateButton } from '@/src/components/AnimateButton';
import { Stage } from '@/src/components/Stage';
import { canvasKitPending } from '@/src/skia/ensureCanvasKit';

const IMAGES = ['/img-fx/1.png', '/img-fx/2.png', '/img-fx/3.png'];
const MOSAIC_STILL = '/img-fx/organic-still@2x.png';
/** pixels-organic light preset `cardBg`. */
const CARD_BG = '#f5f5f5';

const cardStyle: CSSProperties = {
  width: 168,
  height: 168,
  borderRadius: 20,
  background: CARD_BG,
};

let mosaicStill: HTMLImageElement | null = null;

/** Start the 2× still fetch as soon as the card mounts, off the bundle. */
function preloadMosaicStill(): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  if (!mosaicStill) {
    const img = new Image();
    img.decoding = 'sync';
    img.src = MOSAIC_STILL;
    void img.decode?.().catch(() => {});
    mosaicStill = img;
  }
  return mosaicStill;
}

function drawMosaicStill(canvas: HTMLCanvasElement) {
  const img = mosaicStill;
  if (!img || !img.complete || !img.naturalWidth) return false;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return true;
}

/** Sync paint so the card is never empty while the 2× still is loading. */
function paintPlaceholder(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = CARD_BG;
  ctx.fillRect(0, 0, w, h);
}

function hostElement(node: View | null): HTMLElement | null {
  if (typeof HTMLElement !== 'undefined' && node instanceof HTMLElement) return node;
  return null;
}

type LoaderPhase = 'idle' | 'reveal' | 'visible' | 'hide';

function imageActive(phase: LoaderPhase) {
  return phase === 'reveal' || phase === 'visible' || phase === 'hide';
}

/**
 * The page creates no img-fx WebGL context. The worker compiles the
 * pixels-organic light field and runs the photo reveal.
 */
function WorkerLoader({
  inViewRef,
  workerRef,
  onPhase,
}: {
  inViewRef: MutableRefObject<boolean>;
  workerRef: MutableRefObject<Worker | null>;
  onPhase: (phase: LoaderPhase) => void;
}) {
  const stillRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef<HTMLCanvasElement>(null);
  const onPhaseRef = useRef(onPhase);
  onPhaseRef.current = onPhase;

  useLayoutEffect(() => {
    const canvas = stillRef.current;
    if (!canvas) return;
    const img = preloadMosaicStill();
    if (drawMosaicStill(canvas)) return;
    paintPlaceholder(canvas);
    if (!img) return;
    const onLoad = () => {
      drawMosaicStill(canvas);
    };
    img.addEventListener('load', onLoad);
    return () => img.removeEventListener('load', onLoad);
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const cssW = view.clientWidth || 168;
    const cssH = view.clientHeight || cssW;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const canvasDpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(cssW * dpr));
    const h = Math.max(1, Math.floor(cssH * dpr));
    const displayW = Math.max(1, Math.floor(cssW * canvasDpr));
    const displayH = Math.max(1, Math.floor(cssH * canvasDpr));
    view.width = displayW;
    view.height = displayH;

    const worker = new Worker('/img-fx/organic-worker.js');
    workerRef.current = worker;
    let dead = false;
    let raf = 0;
    worker.onmessage = (ev: MessageEvent<{ bmp?: ImageBitmap; phase?: LoaderPhase }>) => {
      const data = ev.data || {};
      if (data.bmp && viewRef.current) {
        const ctx = viewRef.current.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(data.bmp, 0, 0, viewRef.current.width, viewRef.current.height);
          viewRef.current.style.visibility = 'visible';
          if (stillRef.current) stillRef.current.style.visibility = 'hidden';
        }
        data.bmp.close();
      }
      if (data.phase) onPhaseRef.current(data.phase);
    };

    let lastHold: boolean | null = null;
    let lastAuto: boolean | null = null;
    const sync = () => {
      if (dead) return;
      const live = inViewRef.current && !document.hidden && !canvasKitPending();
      const hold = !live;
      const auto = live;
      if (hold !== lastHold) {
        lastHold = hold;
        worker.postMessage({ type: 'hold', hold });
      }
      if (auto !== lastAuto) {
        lastAuto = auto;
        worker.postMessage({ type: 'auto', on: auto });
      }
      raf = requestAnimationFrame(sync);
    };
    const boot = () => {
      if (dead) return;
      if (canvasKitPending()) {
        raf = requestAnimationFrame(boot);
        return;
      }
      worker.postMessage({
        type: 'start',
        w,
        h,
        dpr,
        cssW,
        cssH,
        displayW,
        displayH,
      });
      sync();
    };

    const loadPhotos = async () => {
      const bitmaps = await Promise.all(
        IMAGES.map(async (src) => {
          const res = await fetch(src);
          return createImageBitmap(await res.blob());
        }),
      );
      if (dead) {
        bitmaps.forEach((bitmap) => bitmap.close());
        return;
      }
      worker.postMessage({ type: 'photos', bitmaps }, bitmaps);
    };

    boot();
    loadPhotos().catch(() => {
      /* reveal retries until the bitmaps arrive */
    });
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      worker.terminate();
      if (workerRef.current === worker) workerRef.current = null;
    };
  }, [inViewRef, workerRef]);

  return (
    <div data-testid="img-fx-loader" style={{ position: 'relative', width: '100%', height: '100%', ...cardStyle }}>
      <canvas
        ref={stillRef}
        width={336}
        height={336}
        aria-hidden
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
      <canvas
        ref={viewRef}
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          visibility: 'hidden',
        }}
      />
    </div>
  );
}

/**
 * Web showcase of the pixels-organic light mosaic.
 * The worker is the closed-network program. Copy runs that same source.
 */
export function ImageGenerationLoaderDemo() {
  const hostRef = useRef<View>(null);
  const workerRef = useRef<Worker | null>(null);
  const canObserve = typeof IntersectionObserver === 'function';
  const [seen, setSeen] = useState(!canObserve);
  const [inView, setInView] = useState(!canObserve);
  const [tabHidden, setTabHidden] = useState(false);
  const [phase, setPhase] = useState<LoaderPhase>('idle');
  const inViewRef = useRef(inView);
  inViewRef.current = inView && !tabHidden;

  useLayoutEffect(() => {
    preloadMosaicStill();
  }, []);

  useEffect(() => {
    if (!canObserve) return;
    const el = hostElement(hostRef.current);
    if (!el) {
      setSeen(true);
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((entry) => entry.isIntersecting);
        setInView(hit);
        if (hit) setSeen(true);
      },
      { root: null, rootMargin: '0px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [canObserve]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onVis = () => setTabHidden(document.visibilityState === 'hidden');
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return (
    <Stage>
      <View ref={hostRef} style={styles.wrap} collapsable={false}>
        {seen ? (
          <WorkerLoader inViewRef={inViewRef} workerRef={workerRef} onPhase={setPhase} />
        ) : (
          <div style={cardStyle} />
        )}
      </View>
      <AnimateButton
        label="Reveal"
        onPress={() => {
          workerRef.current?.postMessage({ type: imageActive(phase) ? 'hide' : 'reveal' });
        }}
      />
    </Stage>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 168,
    height: 168,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
