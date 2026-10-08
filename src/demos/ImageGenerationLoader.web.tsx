import { Component, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type MutableRefObject, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ImageGeneration, type ImageGenerationHandle } from 'img-fx';
import { AnimateButton } from '@/src/components/AnimateButton';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { decideImgFxPath, getImgFxShaderReady, subscribeImgFxReady } from '@/src/shims/imgFxGate';
import { canvasKitPending } from '@/src/skia/ensureCanvasKit';
import { colors } from '@/src/theme';

const IMAGES = ['/img-fx/1.png', '/img-fx/2.png', '/img-fx/3.png'];
const MOSAIC_STILL = '/img-fx/organic-still@2x.png';
const SOFT_STILL = '/img-fx/organic-still-soft@2x.png';

const cardStyle: CSSProperties = {
  width: 168,
  height: 168,
  borderRadius: 20,
  background: colors.card,
};

class WebGlGate extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    /* WebGL unavailable */
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Sync paint so the card is never white while the 2× still is loading. */
function paintPlaceholder(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = '#d7d7d7';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#c4c4c4';
  ctx.beginPath();
  ctx.arc(w * 0.4, h * 0.46, w * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ececec';
  ctx.beginPath();
  ctx.arc(w * 0.68, h * 0.6, w * 0.18, 0, Math.PI * 2);
  ctx.fill();
}

function OrganicStill({ src }: { src: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    paintPlaceholder(canvas);
    const img = new Image();
    img.decoding = 'async';
    let cancelled = false;
    img.onload = () => {
      if (cancelled) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);
  return (
    <canvas
      ref={ref}
      width={336}
      height={336}
      aria-hidden
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
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
 * Real GPU: img-fx never mounts, so the page creates no img-fx WebGL context.
 * The worker compiles the organic field and runs the photo reveal.
 */
function WorkerLoader({
  inViewRef,
  reduceRef,
  workerRef,
  onPhase,
}: {
  inViewRef: MutableRefObject<boolean>;
  reduceRef: MutableRefObject<boolean>;
  workerRef: MutableRefObject<Worker | null>;
  onPhase: (phase: LoaderPhase) => void;
}) {
  const stillRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef<HTMLCanvasElement>(null);
  const onPhaseRef = useRef(onPhase);
  onPhaseRef.current = onPhase;

  useLayoutEffect(() => {
    const canvas = stillRef.current;
    if (canvas) paintPlaceholder(canvas);
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    const still = stillRef.current;
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
        }
        data.bmp.close();
        if (stillRef.current) stillRef.current.style.visibility = 'hidden';
      }
      if (data.phase) onPhaseRef.current(data.phase);
    };

    let lastHold: boolean | null = null;
    let lastAuto: boolean | null = null;
    const sync = () => {
      if (dead) return;
      const live = inViewRef.current && !document.hidden && !canvasKitPending();
      const hold = !live;
      const auto = live && !reduceRef.current;
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

    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (dead || !still) return;
      const ctx = still.getContext('2d');
      ctx?.drawImage(img, 0, 0, still.width, still.height);
    };
    img.src = MOSAIC_STILL;

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
  }, [inViewRef, reduceRef, workerRef]);

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
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}

/**
 * Web showcase: img-fx ImageGeneration loader
 * (`npm install img-fx three`).
 *
 * Software GL paints the held still and does not compile. A real GPU draws
 * the same preset, including the photo reveal, from a worker.
 */
export function ImageGenerationLoaderDemo() {
  const { reduceMotion } = useReduceMotion();
  const path = useState(decideImgFxPath)[0];
  const ref = useRef<ImageGenerationHandle>(null);
  const hostRef = useRef<View>(null);
  const workerRef = useRef<Worker | null>(null);
  const canObserve = typeof IntersectionObserver === 'function';
  const [seen, setSeen] = useState(!canObserve);
  const [inView, setInView] = useState(!canObserve);
  const [tabHidden, setTabHidden] = useState(false);
  const [revealLatched, setRevealLatched] = useState(false);
  const [phase, setPhase] = useState<LoaderPhase>('idle');
  const shaderReady = useSyncExternalStore(subscribeImgFxReady, getImgFxShaderReady, () => false);
  const inViewRef = useRef(inView);
  const reduceRef = useRef(reduceMotion);
  inViewRef.current = inView && !tabHidden;
  reduceRef.current = reduceMotion;

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

  useEffect(() => {
    if (path === 'worker') return;
    if (!reduceMotion && shaderReady && inView && !tabHidden) setRevealLatched(true);
  }, [inView, path, reduceMotion, shaderReady, tabHidden]);

  const fallback = (
    <div
      style={{
        ...cardStyle,
        display: 'grid',
        placeItems: 'center',
        border: '1px solid rgba(0,0,0,.06)',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 13,
        color: '#0d0d0d',
      }}
    >
      Generating…
    </div>
  );

  // Pause without toggling autoReveal: img-fx's autoReveal effect calls stop(),
  // which clears a reveal that's already on screen. The latch keeps that effect
  // stable once the shader has actually started in view.
  const paused = reduceMotion || !inView || tabHidden || !shaderReady;
  const autoReveal = revealLatched;

  return (
    <Stage>
      <View ref={hostRef} style={styles.wrap} collapsable={false}>
        {path === 'worker' ? (
          seen ? (
            <WorkerLoader inViewRef={inViewRef} reduceRef={reduceRef} workerRef={workerRef} onPhase={setPhase} />
          ) : (
            <div style={cardStyle} />
          )
        ) : (
          <WebGlGate fallback={fallback}>
            {seen ? (
              <ImageGeneration
                ref={ref}
                preset="pixels-organic"
                theme="light"
                cardBg={colors.card}
                images={IMAGES}
                autoReveal={autoReveal}
                paused={paused}
                revealDelayRange={[1.2, 2.4]}
                revealHoldMs={2200}
                revealFadeOutMs={320}
                borderRadius={20}
                pixelScale={1}
                data-testid="img-fx-loader"
                style={{ display: 'block', lineHeight: 0 }}
              >
                <div className="t-img-fx-card" style={cardStyle}>
                  <OrganicStill src={SOFT_STILL} />
                </div>
              </ImageGeneration>
            ) : (
              <div style={cardStyle} />
            )}
          </WebGlGate>
        )}
      </View>
      <AnimateButton
        label="Reveal"
        onPress={() => {
          if (path === 'worker') {
            workerRef.current?.postMessage({ type: imageActive(phase) ? 'hide' : 'reveal' });
            return;
          }
          const h = ref.current;
          if (!h) return;
          if (h.isImageActive()) h.triggerHide();
          else h.triggerReveal({ hold: 'manual' });
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
