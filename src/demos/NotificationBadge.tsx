import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { AnimateButton } from '@/src/components/AnimateButton';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { springs, sprung, timed } from '@/src/motion';
import { colors, fonts } from '@/src/theme';

export function NotificationBadgeDemo() {
  const { reduceMotion } = useReduceMotion();
  const [on, setOn] = useState(false);
  const x = useSharedValue(-8.2);
  const y = useSharedValue(12.4);
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0);

  useEffect(() => {
    x.value = sprung(on ? 0 : -8.2, springs.pop, reduceMotion);
    y.value = sprung(on ? 0 : 12.4, springs.pop, reduceMotion);
    scale.value = sprung(on ? 1 : 0.4, springs.pop, reduceMotion);
    opacity.value = timed(on ? 1 : 0, 180, undefined, reduceMotion);
  }, [on, opacity, reduceMotion, scale, x, y]);

  const badge = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }],
  }));

  return (
    <Stage>
      <View style={styles.bellWrap}>
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6 9a6 6 0 1 1 12 0c0 3.2.8 4.8 1.6 6H4.4C5.2 13.8 6 12.2 6 9Z"
            stroke={colors.text}
            strokeWidth={1.7}
          />
          <Path d="M10 18a2 2 0 0 0 4 0" stroke={colors.text} strokeWidth={1.7} strokeLinecap="round" />
        </Svg>
        <Animated.View style={[styles.badge, badge]}>
          <Text style={styles.count}>1</Text>
        </Animated.View>
      </View>
      <AnimateButton onPress={() => setOn((v) => !v)} />
    </Stage>
  );
}

const styles = StyleSheet.create({
  bellWrap: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#e23d2d',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  count: { color: '#fff', fontFamily: fonts.semibold, fontSize: 10 },
});
