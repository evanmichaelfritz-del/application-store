import { Component, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ImageGeneration, type ImageGenerationHandle } from 'img-fx';
import { AnimateButton } from '@/src/components/AnimateButton';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
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

/**
 * Web showcase: img-fx ImageGeneration loader
 * (`npm install img-fx three`).
 */
export function ImageGenerationLoaderDemo() {
  const { reduceMotion } = useReduceMotion();
  const ref = useRef<ImageGenerationHandle>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  return (
    <Stage>
      <View style={styles.wrap} collapsable={false}>
        <WebGlGate fallback={fallback}>
          {mounted ? (
            <ImageGeneration
              ref={ref}
              preset="pixels-organic"
              theme="light"
              cardBg={colors.card}
              images={IMAGES}
              autoReveal={!reduceMotion}
              paused={reduceMotion}
              revealDelayRange={[1.2, 2.4]}
              revealHoldMs={2200}
              revealFadeOutMs={320}
              borderRadius={20}
              pixelScale={1}
              data-testid="img-fx-loader"
              style={{ display: 'block', lineHeight: 0 }}
            >
              <div className="t-img-fx-card" style={cardStyle} />
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
