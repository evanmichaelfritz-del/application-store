import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { springs, sprung } from '@/src/motion';
import { fonts } from '@/src/theme';

const CARD_W = 210;
const CARD_H = 128;

function finite(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

export function TiltCardDemo() {
  const { reduceMotion } = useReduceMotion();
  const rx = useSharedValue(0);
  const ry = useSharedValue(0);
  const gx = useSharedValue(0.5);
  const gy = useSharedValue(0.5);

  const follow = (x: number, y: number) => {
    'worklet';
    if (reduceMotion || !finite(x) || !finite(y)) return;
    const nx = Math.min(1, Math.max(0, x / CARD_W));
    const ny = Math.min(1, Math.max(0, y / CARD_H));
    rx.value = (0.5 - ny) * 14;
    ry.value = (nx - 0.5) * 18;
    gx.value = nx;
    gy.value = ny;
  };

  const followJs = (x: unknown, y: unknown) => {
    if (reduceMotion || !finite(x) || !finite(y)) return;
    const nx = Math.min(1, Math.max(0, x / CARD_W));
    const ny = Math.min(1, Math.max(0, y / CARD_H));
    rx.value = (0.5 - ny) * 14;
    ry.value = (nx - 0.5) * 18;
    gx.value = nx;
    gy.value = ny;
  };

  const reset = () => {
    'worklet';
    rx.value = sprung(0, springs.default, reduceMotion);
    ry.value = sprung(0, springs.default, reduceMotion);
    gx.value = sprung(0.5, springs.default, reduceMotion);
    gy.value = sprung(0.5, springs.default, reduceMotion);
  };

  const resetJs = () => {
    rx.value = sprung(0, springs.default, reduceMotion);
    ry.value = sprung(0, springs.default, reduceMotion);
    gx.value = sprung(0.5, springs.default, reduceMotion);
    gy.value = sprung(0.5, springs.default, reduceMotion);
  };

  // Pan only — Gesture.Hover + Exclusive was calling setPointerCapture without an active pointer on web.
  const gesture = Gesture.Pan()
    .minDistance(0)
    .maxPointers(1)
    .onBegin((e) => follow(e.x, e.y))
    .onChange((e) => follow(e.x, e.y))
    .onFinalize(reset);

  const card = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateX: `${rx.value}deg` }, { rotateY: `${ry.value}deg` }],
  }));
  const glare = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0 : 0.32,
    transform: [{ translateX: (gx.value - 0.5) * 80 }, { translateY: (gy.value - 0.5) * 50 }],
  }));

  const onWebMove = (e: { nativeEvent?: { offsetX?: number; offsetY?: number; locationX?: number; locationY?: number } }) => {
    try {
      const n = e.nativeEvent ?? {};
      const x = n.offsetX ?? n.locationX;
      const y = n.offsetY ?? n.locationY;
      followJs(x, y);
    } catch {
      /* web hover path — never throw overlay */
    }
  };

  return (
    <Stage>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.card, card]}
          // RN-web hover follow without RNGH Hover / setPointerCapture.
          {...({
            onMouseMove: onWebMove,
            onMouseLeave: resetJs,
          } as Record<string, unknown>)}
        >
          <Text style={styles.brand}>Credit</Text>
          <Text style={styles.visa}>VISA</Text>
          <Text style={styles.name}>John Smith</Text>
          <Text style={styles.num}>4111 - 1111 - 1111 - 1111</Text>
          <View pointerEvents="none">
            <Animated.View style={[styles.glare, glare]} />
          </View>
        </Animated.View>
      </GestureDetector>
    </Stage>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 16,
    backgroundColor: '#16171c',
    padding: 16,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  brand: { fontFamily: fonts.medium, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  visa: { position: 'absolute', right: 16, top: 16, fontFamily: fonts.semibold, fontSize: 16, color: '#fff' },
  name: { fontFamily: fonts.medium, fontSize: 13, color: '#fff' },
  num: { fontFamily: fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.78)', letterSpacing: 0.4 },
  glare: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.35)',
    top: -20,
    left: 40,
  },
});
