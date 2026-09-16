import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { springs, sprung } from '@/src/motion';
import { colors, fonts, shadows } from '@/src/theme';

const CARDS = ['Card 1', 'Card 2', 'Card 3'];

export function CardStackHoverDemo() {
  const { reduceMotion } = useReduceMotion();
  const [spread, setSpread] = useState(false);
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = sprung(spread ? 1 : 0, springs.layout, reduceMotion);
  }, [reduceMotion, spread, t]);

  return (
    <Stage>
      <Pressable
        onHoverIn={() => setSpread(true)}
        onHoverOut={() => setSpread(false)}
        onPress={() => setSpread((v) => !v)}
        style={styles.hit}
      >
        <View style={styles.stack}>
          {CARDS.map((label, i) => (
            <FanCard key={label} i={i} label={label} progress={t} />
          ))}
        </View>
      </Pressable>
    </Stage>
  );
}

function FanCard({
  i,
  label,
  progress,
}: {
  i: number;
  label: string;
  progress: { value: number };
}) {
  const style = useAnimatedStyle(() => {
    const x = [-28, 0, 28][i] * progress.value;
    const y = [10, -6, 10][i] * progress.value;
    const r = [-8, 0, 8][i] * progress.value;
    return { transform: [{ translateX: x }, { translateY: y }, { rotate: `${r}deg` }] };
  });
  return (
    <Animated.View style={[styles.card, { zIndex: i + 1 }, style]}>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hit: { width: 180, height: 120, alignItems: 'center', justifyContent: 'center' },
  stack: { width: 110, height: 74 },
  card: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 110,
    height: 74,
    borderRadius: 12,
    backgroundColor: colors.material,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.material,
  },
  label: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
});
