import { createElement, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { ease, springs, sprung } from '@/src/motion';
import { fonts } from '@/src/theme';
import {
  ACTIONS,
  DOT_R,
  GOO_CX,
  GOO_CY,
  GOO_FILL,
  GOO_H,
  GOO_W,
  HUB_R,
  fanDistance,
  neckWidth,
} from './gooeyMath';

function paint(ctx: CanvasRenderingContext2D, travels: number[]) {
  ctx.clearRect(0, 0, GOO_W, GOO_H);
  ctx.fillStyle = GOO_FILL;
  ctx.beginPath();
  ctx.arc(GOO_CX, GOO_CY, HUB_R, 0, Math.PI * 2);
  ctx.fill();

  ACTIONS.forEach((action, i) => {
    const travel = travels[i] ?? 0;
    const rad = (action.angle * Math.PI) / 180;
    const d = fanDistance(travel);
    const x2 = GOO_CX + Math.cos(rad) * d;
    const y2 = GOO_CY + Math.sin(rad) * d;
    const nw = neckWidth(travel);
    if (nw >= 12) {
      const ang = Math.atan2(y2 - GOO_CY, x2 - GOO_CX);
      const ox = Math.cos(ang + Math.PI / 2) * (nw / 2);
      const oy = Math.sin(ang + Math.PI / 2) * (nw / 2);
      ctx.beginPath();
      ctx.moveTo(GOO_CX + ox, GOO_CY + oy);
      ctx.lineTo(x2 + ox, y2 + oy);
      ctx.lineTo(x2 - ox, y2 - oy);
      ctx.lineTo(GOO_CX - ox, GOO_CY - oy);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(GOO_CX, GOO_CY, nw / 2, 0, Math.PI * 2);
      ctx.arc(x2, y2, nw / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x2, y2, DOT_R, 0, Math.PI * 2);
    ctx.fill();
  });
}

/** Expo-web gooey: Canvas 2D paints a ≥12–20px neck. Does not need WebGL/Skia. */
export default function GooeyWeb() {
  const { reduceMotion } = useReduceMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const plus = useSharedValue(0);
  const p0 = useSharedValue(0);
  const p1 = useSharedValue(0);
  const p2 = useSharedValue(0);
  const p3 = useSharedValue(0);
  const slots = [p0, p1, p2, p3];
  const [open, setOpen] = useState(false);

  const drive = (next: boolean) => {
    setOpen(next);
    plus.value = sprung(next ? 1 : 0, springs.layout, reduceMotion);
    slots.forEach((slot, index) => {
      if (reduceMotion) {
        slot.value = withTiming(next ? 1 : 0, { duration: 0 });
        return;
      }
      if (next) {
        slot.value = withDelay(
          index * 28,
          withSequence(
            withTiming(0.52, { duration: 350, easing: ease.outEase }),
            withTiming(1, { duration: 150, easing: ease.outEase }),
          ),
        );
      } else {
        slot.value = withDelay(index * 20, withTiming(0, { duration: 360, easing: ease.outEase }));
      }
    });
  };

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const node = canvasRef.current;
      const ctx = node?.getContext('2d');
      if (ctx) paint(ctx, [p0.value, p1.value, p2.value, p3.value]);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [p0, p1, p2, p3]);

  const plusStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${plus.value * 45}deg` }],
  }));

  return (
    <View style={styles.scene}>
      {createElement('canvas', {
        ref: canvasRef,
        width: GOO_W,
        height: GOO_H,
        'data-testid': 'gooey-web-canvas',
        style: { width: GOO_W, height: GOO_H, display: 'block' },
      })}
      {ACTIONS.map((action, i) => (
        <DotLabel key={action.label} action={action} progress={slots[i]} />
      ))}
      <Pressable
        onPress={() => drive(!open)}
        style={styles.plusHit}
        accessibilityRole="button"
      >
        <Animated.View style={[styles.plus, plusStyle]}>
          <Text style={styles.plusText}>+</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

function DotLabel({
  action,
  progress,
}: {
  action: (typeof ACTIONS)[number];
  progress: SharedValue<number>;
}) {
  const rad = (action.angle * Math.PI) / 180;
  const style = useAnimatedStyle(() => {
    const d = fanDistance(progress.value);
    return {
      opacity: progress.value < 0.18 ? 0 : 1,
      transform: [{ translateX: Math.cos(rad) * d }, { translateY: Math.sin(rad) * d }],
    };
  });
  return (
    <Animated.View style={[styles.label, style]} pointerEvents="none">
      <Text style={styles.labelText}>{action.label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { width: GOO_W, height: GOO_H },
  plusHit: {
    position: 'absolute',
    width: 48,
    height: 48,
    left: GOO_CX - 24,
    top: GOO_CY - 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  plus: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  plusText: { color: '#fff', fontSize: 26, lineHeight: 28, fontFamily: fonts.medium, marginTop: -2 },
  label: {
    position: 'absolute',
    width: 34,
    height: 34,
    left: GOO_CX - 17,
    top: GOO_CY - 17,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  labelText: { color: '#fff', fontFamily: fonts.semibold, fontSize: 12 },
});
