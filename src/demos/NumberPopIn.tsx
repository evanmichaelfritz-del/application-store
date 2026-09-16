import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay } from 'react-native-reanimated';
import { AnimateButton } from '@/src/components/AnimateButton';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { springs, sprung, tokens, webFilter } from '@/src/motion';
import { colors, fonts } from '@/src/theme';

const SETS = ['6 5. 7 8', '1 4. 0 2', '9 3. 6 1'];

function FlipDigit({ ch, delay, tick, reduced }: { ch: string; delay: number; tick: number; reduced: boolean }) {
  const rot = useSharedValue(reduced ? 0 : 80);
  const op = useSharedValue(reduced ? 1 : 0);
  const blur = useSharedValue(reduced ? 0 : 2);

  useEffect(() => {
    if (reduced) {
      rot.value = 0;
      op.value = 1;
      blur.value = 0;
      return;
    }
    rot.value = 80;
    op.value = 0;
    blur.value = 2;
    rot.value = withDelay(delay, sprung(0, springs.default, reduced));
    op.value = withDelay(delay, sprung(1, springs.default, reduced));
    blur.value = withDelay(delay, sprung(0, springs.default, reduced));
  }, [blur, delay, op, reduced, rot, tick]);

  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ perspective: 400 }, { rotateX: `${rot.value}deg` }],
    ...(webFilter(blur.value) ?? {}),
  }));

  return (
    <Animated.View style={style}>
      <Text style={[styles.digit, ch === '.' && styles.dot, ch === ' ' && styles.gap]}>{ch}</Text>
    </Animated.View>
  );
}

export function NumberPopInDemo() {
  const { reduceMotion } = useReduceMotion();
  const [index, setIndex] = useState(0);
  const chars = SETS[index].split('');

  return (
    <Stage>
      <View style={styles.row}>
        {chars.map((ch, i) => (
          <FlipDigit key={`${index}-${i}`} ch={ch} delay={i * tokens.digitStagger} tick={index} reduced={reduceMotion} />
        ))}
      </View>
      <AnimateButton onPress={() => setIndex((i) => (i + 1) % SETS.length)} />
    </Stage>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  digit: {
    fontFamily: fonts.semibold,
    fontSize: 42,
    lineHeight: 46,
    color: colors.text,
    letterSpacing: -1,
  },
  dot: { fontSize: 32, marginBottom: 2 },
  gap: { width: 6 },
});
