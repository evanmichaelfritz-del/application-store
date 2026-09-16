import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { timed, tokens } from '@/src/motion';
import { colors, fonts, shadows } from '@/src/theme';

export function PageSideBySideDemo() {
  const { reduceMotion } = useReduceMotion();
  const [detail, setDetail] = useState(false);
  const t = useDerivedValue(() => timed(detail ? 1 : 0, tokens.page, undefined, reduceMotion));
  const list = useAnimatedStyle(() => ({
    opacity: 1 - t.value,
    transform: [{ translateX: t.value * -24 }],
  }));
  const amount = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateX: (1 - t.value) * 24 }],
  }));

  return (
    <Stage>
      <Pressable onPress={() => setDetail((v) => !v)} style={styles.card}>
        <Animated.View style={[styles.page, list]}>
          <View style={styles.row}>
            <View style={styles.token}>
              <Text style={styles.tokenMark}>B</Text>
            </View>
            <View>
              <Text style={styles.name}>BNB</Text>
              <Text style={styles.sub}>BNB</Text>
            </View>
            <Text style={styles.price}>$66.11</Text>
          </View>
        </Animated.View>
        <Animated.View style={[styles.page, styles.overlay, amount]}>
          <Text style={styles.amount}>$10</Text>
          <Text style={styles.avail}>$66.11 available</Text>
        </Animated.View>
      </Pressable>
    </Stage>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 210,
    height: 88,
    backgroundColor: colors.material,
    borderRadius: 14,
    overflow: 'hidden',
    ...shadows.material,
  },
  page: { ...StyleSheet.absoluteFill, padding: 16, justifyContent: 'center' },
  overlay: { alignItems: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  token: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3ba2f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenMark: { fontFamily: fonts.semibold, color: '#1a1200' },
  name: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  sub: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSubtle },
  price: { marginLeft: 'auto', fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  amount: { fontFamily: fonts.semibold, fontSize: 28, color: colors.text },
  avail: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSubtle },
});
