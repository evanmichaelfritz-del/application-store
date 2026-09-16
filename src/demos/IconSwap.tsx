import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { ease, timed, tokens, webFilter } from '@/src/motion';
import { colors, shadows } from '@/src/theme';

export function IconSwapDemo() {
  const { reduceMotion } = useReduceMotion();
  const [menu, setMenu] = useState(true);
  const t = useDerivedValue(() => timed(menu ? 0 : 1, tokens.fade, ease.inOut, reduceMotion));
  const a = useAnimatedStyle(() => ({
    opacity: 1 - t.value,
    transform: [{ scale: 0.25 + (1 - t.value) * 0.75 }],
    ...(webFilter(t.value * 2) ?? {}),
  }));
  const b = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ scale: 0.25 + t.value * 0.75 }],
    ...(webFilter((1 - t.value) * 2) ?? {}),
  }));

  return (
    <Stage>
      <Pressable onPress={() => setMenu((v) => !v)} style={styles.hit}>
        <View style={styles.slot}>
          <Animated.View style={[styles.icon, a]}>
            <View style={styles.line} />
            <View style={styles.line} />
            <View style={styles.line} />
          </Animated.View>
          <Animated.View style={[styles.icon, styles.abs, b]}>
            <View style={[styles.x, { transform: [{ rotate: '45deg' }] }]} />
            <View style={[styles.x, { transform: [{ rotate: '-45deg' }] }]} />
          </Animated.View>
        </View>
      </Pressable>
    </Stage>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.material,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.material,
  },
  slot: { width: 20, height: 16 },
  icon: { width: 20, height: 16, justifyContent: 'space-between' },
  abs: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  line: { height: 2, backgroundColor: colors.text, borderRadius: 1 },
  x: { position: 'absolute', width: 20, height: 2, backgroundColor: colors.text, borderRadius: 1 },
});
