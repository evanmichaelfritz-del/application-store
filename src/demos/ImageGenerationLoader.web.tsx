import { Component, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ImageGeneration, type ImageGenerationHandle } from 'img-fx';
import { AnimateButton } from '@/src/components/AnimateButton';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { getImgFxShaderReady, subscribeImgFxReady } from '@/src/shims/imgFxGate';
import { colors } from '@/src/theme';

const IMAGES = ['/img-fx/1.png', '/img-fx/2.png', '/img-fx/3.png'];

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

const STILL_URL = '/img-fx/organic-still@2x.png';

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

function OrganicStill() {
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
    img.src = STILL_URL;
    return () => {
      cancelled = true;
    };
  }, []);
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

/**
 * Web showcase: img-fx ImageGeneration loader
 * (`npm install img-fx three`).
 *
 * The shader stays unmounted until the card enters the viewport. A static frame
 * is painted at mount; a real GPU replaces it from a worker once that frame is ready.
 */
export function ImageGenerationLoaderDemo() {
  const { reduceMotion } = useReduceMotion();
  const ref = useRef<ImageGenerationHandle>(null);
  const hostRef = useRef<View>(null);
  const canObserve = typeof IntersectionObserver === 'function';
  const [seen, setSeen] = useState(!canObserve);
  const [inView, setInView] = useState(!canObserve);
  const [tabHidden, setTabHidden] = useState(false);
  const [revealLatched, setRevealLatched] = useState(false);
  const shaderReady = useSyncExternalStore(subscribeImgFxReady, getImgFxShaderReady, () => false);

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
    if (!reduceMotion && shaderReady && inView && !tabHidden) setRevealLatched(true);
  }, [inView, reduceMotion, shaderReady, tabHidden]);

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
                <OrganicStill />
              </div>
            </ImageGeneration>
          ) : (
            <div style={cardStyle} />
          )}
        </WebGlGate>
      </View>
      <AnimateButton
        label="Reveal"
        onPress={() => {
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
