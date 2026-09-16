import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Blur, Canvas, Circle, ColorMatrix, Group, Paint, Path, Skia } from '@shopify/react-native-skia';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { ease, springs, sprung } from '@/src/motion';
import { colors, fonts } from '@/src/theme';
import { neckWidth } from './gooeyMath';

const W = 200;
const H = 160;
const CX = 100;
const CY = 90;
const HUB_R = 24;
const DOT_R = 18;
const REACH_STRETCH = 40;
const REACH_SNAP = 74;

const ACTIONS = [
  { label: 'F', angle: -50 },
  { label: 'I', angle: -10 },
  { label: 'L', angle: 30 },
  { label: 'N', angle: 70 },
];

/** Alpha contrast so blurred overlap reads as a solid ≥12–20px neck. */
const GOO_MATRIX = [
  1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 36, -18,
];

function fanDistance(travel: number) {
  'worklet';
  if (travel <= 0.52) return (travel / 0.52) * REACH_STRETCH;
  return REACH_STRETCH + ((travel - 0.52) / 0.48) * (REACH_SNAP - REACH_STRETCH);
}

export default function GooeySkia() {
  const { reduceMotion } = useReduceMotion();
  const [open, setOpen] = useState(false);
  const plus = useSharedValue(0);
  const p0 = useSharedValue(0);
  const p1 = useSharedValue(0);
  const p2 = useSharedValue(0);
  const p3 = useSharedValue(0);
  const progresses = [p0, p1, p2, p3];

  useEffect(() => {
    plus.value = sprung(open ? 1 : 0, springs.layout, reduceMotion);
    progresses.forEach((slot, index) => {
      const to = open ? 1 : 0;
      if (reduceMotion) {
        slot.value = withTiming(to, { duration: 0 });
        return;
      }
      if (open) {
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
  }, [open, plus, reduceMotion]);

  const plusStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${plus.value * 45}deg` }],
  }));

  return (
    <View style={styles.scene}>
      <Canvas style={styles.canvas}>
        <Group
          layer={
            <Paint>
              <Blur blur={18} />
              <ColorMatrix matrix={GOO_MATRIX} />
            </Paint>
          }
        >
          <Circle cx={CX} cy={CY} r={HUB_R} color={colors.text} />
          {ACTIONS.map((action, i) => (
            <GooeyDot key={action.label} action={action} progress={progresses[i]} />
          ))}
        </Group>
        {ACTIONS.map((action, i) => (
          <GooeyNeck key={`n-${action.label}`} action={action} progress={progresses[i]} />
        ))}
      </Canvas>
      {ACTIONS.map((action, i) => (
        <DotLabel key={`l-${action.label}`} action={action} progress={progresses[i]} />
      ))}
      <Pressable onPress={() => setOpen((v) => !v)} style={styles.plusHit} accessibilityRole="button">
        <Animated.View style={[styles.plus, plusStyle]}>
          <Text style={styles.plusText}>+</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

function GooeyNeck({
  action,
  progress,
}: {
  action: { label: string; angle: number };
  progress: SharedValue<number>;
}) {
  const rad = (action.angle * Math.PI) / 180;
  const path = useDerivedValue(() => {
    const p = Skia.Path.Make();
    const travel = progress.value;
    const nw = neckWidth(travel);
    if (nw < 12) return p;
    const d = fanDistance(travel);
    const x2 = CX + Math.cos(rad) * d;
    const y2 = CY + Math.sin(rad) * d;
    const ang = Math.atan2(y2 - CY, x2 - CX);
    const ox = Math.cos(ang + Math.PI / 2) * (nw / 2);
    const oy = Math.sin(ang + Math.PI / 2) * (nw / 2);
    p.moveTo(CX + ox, CY + oy);
    p.lineTo(x2 + ox, y2 + oy);
    p.lineTo(x2 - ox, y2 - oy);
    p.lineTo(CX - ox, CY - oy);
    p.close();
    return p;
  });
  return <Path path={path} color={colors.text} />;
}

function GooeyDot({
  action,
  progress,
}: {
  action: { label: string; angle: number };
  progress: SharedValue<number>;
}) {
  const rad = (action.angle * Math.PI) / 180;
  const cx = useDerivedValue(() => CX + Math.cos(rad) * fanDistance(progress.value));
  const cy = useDerivedValue(() => CY + Math.sin(rad) * fanDistance(progress.value));
  return <Circle cx={cx} cy={cy} r={DOT_R} color={colors.text} />;
}

function DotLabel({
  action,
  progress,
}: {
  action: { label: string; angle: number };
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
  scene: { width: W, height: H },
  canvas: { width: W, height: H },
  plusHit: {
    position: 'absolute',
    width: 48,
    height: 48,
    left: CX - 24,
    top: CY - 24,
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
    left: CX - 17,
    top: CY - 17,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  labelText: { color: '#fff', fontFamily: fonts.semibold, fontSize: 12 },
});
