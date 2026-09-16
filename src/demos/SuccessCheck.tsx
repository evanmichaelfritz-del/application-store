import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { AnimateButton } from '@/src/components/AnimateButton';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { springs, sprung, timed } from '@/src/motion';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function SuccessCheckDemo() {
  const { reduceMotion } = useReduceMotion();
  const [on, setOn] = useState(false);
  const t = useSharedValue(0);
  const dash = useSharedValue(0);

  useEffect(() => {
    t.value = sprung(on ? 1 : 0, springs.pop, reduceMotion);
    dash.value = reduceMotion
      ? timed(on ? 1 : 0, 0)
      : on
        ? withDelay(80, sprung(1, springs.pop, false))
        : timed(0, 120);
  }, [dash, on, reduceMotion, t]);

  const wrap = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [
      { translateY: (1 - t.value) * 28 },
      { rotate: `${(1 - t.value) * 80}deg` },
      { scale: 0.86 + t.value * 0.14 },
    ],
  }));
  const pathProps = useAnimatedProps(() => ({
    strokeDashoffset: 28 * (1 - dash.value),
  }));

  return (
    <Stage>
      <Animated.View style={wrap}>
        <View style={styles.badge}>
          <Svg width={36} height={36} viewBox="0 0 36 36">
            <Circle cx={18} cy={18} r={16} fill="#1f8a4c" />
            <AnimatedPath
              d="M11 18.5 L16 23.5 L25 13.5"
              stroke="#fff"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray="28"
              animatedProps={pathProps}
            />
          </Svg>
        </View>
      </Animated.View>
      <AnimateButton onPress={() => setOn((v) => !v)} />
    </Stage>
  );
}

const styles = StyleSheet.create({
  badge: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
});
