import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { AnimateButton } from '@/src/components/AnimateButton';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { timed, tokens } from '@/src/motion';
import { colors, shadows } from '@/src/theme';

export function CardResizeDemo() {
  const { reduceMotion } = useReduceMotion();
  const [small, setSmall] = useState(false);
  const width = useSharedValue(148);
  const height = useSharedValue(100);

  useEffect(() => {
    width.value = timed(small ? 88 : 148, tokens.morph, undefined, reduceMotion);
    height.value = timed(small ? 64 : 100, tokens.morph, undefined, reduceMotion);
  }, [height, reduceMotion, small, width]);

  const style = useAnimatedStyle(() => ({ width: width.value, height: height.value }));

  return (
    <Stage>
      <Animated.View style={[styles.card, style]}>
        <View style={styles.bar} />
        <View style={[styles.bar, styles.short]} />
      </Animated.View>
      <AnimateButton onPress={() => setSmall((v) => !v)} />
    </Stage>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.material,
    borderRadius: 14,
    padding: 14,
    justifyContent: 'center',
    gap: 8,
    ...shadows.material,
  },
  bar: { height: 8, borderRadius: 4, backgroundColor: '#ececec', width: '100%' },
  short: { width: '62%' },
});
