import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { fonts } from '@/src/theme';
import { TILT, TILT_GLARE_IMAGE } from '@/src/demos/tiltMotion';

const HALF_GLARE = TILT.glareRadius;

function finite(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

type MoveEvent = {
  currentTarget?: { getBoundingClientRect?: () => { left: number; top: number } };
  nativeEvent?: {
    clientX?: number;
    clientY?: number;
    locationX?: number;
    locationY?: number;
    currentTarget?: { getBoundingClientRect?: () => { left: number; top: number } };
  };
  clientX?: number;
  clientY?: number;
};

function localPoint(event: MoveEvent): { x: number; y: number } | null {
  const native = event.nativeEvent;
  const clientX = native?.clientX ?? event.clientX;
  const clientY = native?.clientY ?? event.clientY;
  const node = event.currentTarget?.getBoundingClientRect
    ? event.currentTarget
    : native?.currentTarget?.getBoundingClientRect
      ? native.currentTarget
      : null;
  const measure = node?.getBoundingClientRect;
  if (node && measure && finite(clientX) && finite(clientY)) {
    const rect = measure.call(node);
    return { x: clientX - rect.left, y: clientY - rect.top };
  }
  if (finite(native?.locationX) && finite(native?.locationY)) {
    return { x: native.locationX, y: native.locationY };
  }
  return null;
}

export function TiltCardDemo() {
  const { reduceMotion } = useReduceMotion();
  const reduced = useSharedValue(reduceMotion);
  const hovering = useSharedValue(0);
  const targetRx = useSharedValue(0);
  const targetRy = useSharedValue(0);
  const targetGx = useSharedValue(TILT.cardW / 2);
  const targetGy = useSharedValue(TILT.cardH / 2);
  const targetOp = useSharedValue(0);
  const rx = useSharedValue(0);
  const ry = useSharedValue(0);
  const gx = useSharedValue(TILT.cardW / 2);
  const gy = useSharedValue(TILT.cardH / 2);
  const glareOpacity = useSharedValue(0);
  const isWeb = useSharedValue(Platform.OS === 'web');

  useEffect(() => {
    reduced.value = reduceMotion;
    if (!reduceMotion) return;
    hovering.value = 0;
    targetRx.value = 0;
    targetRy.value = 0;
    targetGx.value = TILT.cardW / 2;
    targetGy.value = TILT.cardH / 2;
    targetOp.value = 0;
    rx.value = 0;
    ry.value = 0;
    gx.value = TILT.cardW / 2;
    gy.value = TILT.cardH / 2;
    glareOpacity.value = 0;
  }, [
    glareOpacity,
    gx,
    gy,
    hovering,
    reduceMotion,
    reduced,
    rx,
    ry,
    targetGx,
    targetGy,
    targetOp,
    targetRx,
    targetRy,
  ]);

  const aim = (x: number, y: number) => {
    'worklet';
    if (reduced.value || !Number.isFinite(x) || !Number.isFinite(y)) return;
    const px = Math.min(TILT.cardW, Math.max(0, x));
    const py = Math.min(TILT.cardH, Math.max(0, y));
    const nx = px / TILT.cardW;
    const ny = py / TILT.cardH;
    const entered = hovering.value === 0;
    hovering.value = 1;
    targetRx.value = (0.5 - ny) * TILT.maxRx;
    targetRy.value = (nx - 0.5) * TILT.maxRy;
    targetGx.value = px;
    targetGy.value = py;
    targetOp.value = 1;
    if (entered) {
      gx.value = px;
      gy.value = py;
    }
  };

  const rest = () => {
    'worklet';
    hovering.value = 0;
    targetRx.value = 0;
    targetRy.value = 0;
    targetGx.value = TILT.cardW / 2;
    targetGy.value = TILT.cardH / 2;
    targetOp.value = 0;
  };

  useFrameCallback((frame) => {
    if (reduced.value) {
      rx.value = 0;
      ry.value = 0;
      glareOpacity.value = 0;
      return;
    }
    const dt = frame.timeSincePreviousFrame ?? 16.7;
    const tiltTau = hovering.value ? TILT.followMs : TILT.returnMs;
    const glareTau = hovering.value ? TILT.glareMs : TILT.returnMs;
    const tiltT = 1 - Math.exp(-dt / tiltTau);
    const glareT = 1 - Math.exp(-dt / glareTau);
    rx.value += (targetRx.value - rx.value) * tiltT;
    ry.value += (targetRy.value - ry.value) * tiltT;
    gx.value += (targetGx.value - gx.value) * glareT;
    gy.value += (targetGy.value - gy.value) * glareT;
    glareOpacity.value += (targetOp.value - glareOpacity.value) * glareT;
  });

  // Pan is the native press path. Web hover owns the pointer so a click
  // cannot spring the card flat while the cursor is still on it.
  const gesture = Gesture.Pan()
    .minDistance(0)
    .maxPointers(1)
    .onBegin((e) => {
      if (!isWeb.value) aim(e.x, e.y);
    })
    .onChange((e) => {
      if (!isWeb.value) aim(e.x, e.y);
    })
    .onFinalize(() => {
      if (!isWeb.value) rest();
    });

  const tiltStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: TILT.perspective },
      { rotateX: `${rx.value}deg` },
      { rotateY: `${ry.value}deg` },
    ],
  }));

  const glareStyle = useAnimatedStyle(() => ({
    opacity: reduced.value ? 0 : glareOpacity.value,
    transform: [{ translateX: gx.value - HALF_GLARE }, { translateY: gy.value - HALF_GLARE }],
  }));

  const onWebMove = (event: MoveEvent) => {
    try {
      const point = localPoint(event);
      if (!point) return;
      aim(point.x, point.y);
    } catch {
      /* web hover path — never throw over the gallery */
    }
  };

  const webGlare =
    Platform.OS === 'web'
      ? ({
          backgroundColor: 'transparent',
          backgroundImage: TILT_GLARE_IMAGE,
          mixBlendMode: 'screen',
        } as const)
      : null;

  return (
    <Stage>
      <GestureDetector gesture={gesture}>
        <View
          collapsable={false}
          testID="tilt-hit"
          style={styles.hit}
          {...({
            onMouseMove: onWebMove,
            onMouseLeave: rest,
          } as Record<string, unknown>)}
        >
          <Animated.View pointerEvents="none" style={[styles.card, tiltStyle]}>
            <Text style={styles.brand}>Credit</Text>
            <Text style={styles.visa}>VISA</Text>
            <Text style={styles.name}>John Smith</Text>
            <Text style={styles.num}>4111 - 1111 - 1111 - 1111</Text>
            <Animated.View pointerEvents="none" style={[styles.glare, webGlare, glareStyle]} />
          </Animated.View>
        </View>
      </GestureDetector>
    </Stage>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: TILT.cardW,
    height: TILT.cardH,
    backgroundColor: 'rgba(255,255,255,0.001)',
  },
  card: {
    width: TILT.cardW,
    height: TILT.cardH,
    borderRadius: 16,
    backgroundColor: '#16171c',
    padding: 16,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  brand: { fontFamily: fonts.medium, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  visa: {
    position: 'absolute',
    right: 16,
    top: 16,
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: '#fff',
  },
  name: { fontFamily: fonts.medium, fontSize: 13, color: '#fff' },
  num: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.78)',
    letterSpacing: 0.4,
  },
  glare: {
    position: 'absolute',
    width: TILT.glareRadius * 2,
    height: TILT.glareRadius * 2,
    borderRadius: TILT.glareRadius,
    left: 0,
    top: 0,
    backgroundColor: 'rgba(255,255,255,0.42)',
  },
});
