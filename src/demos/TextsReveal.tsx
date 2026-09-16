import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { AnimateButton } from '@/src/components/AnimateButton';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { colors, fonts } from '@/src/theme';

export function TextsRevealDemo() {
  const { reduceMotion } = useReduceMotion();
  const [tick, setTick] = useState(0);

  return (
    <Stage>
      <View style={styles.col} key={tick}>
        <Animated.Text
          entering={
            reduceMotion ? undefined : FadeInDown.duration(280).springify().damping(20).stiffness(280)
          }
          exiting={FadeOut.duration(reduceMotion ? 0 : 120)}
          style={styles.title}
        >
          Pull request opened
        </Animated.Text>
        <Animated.Text
          entering={
            reduceMotion
              ? undefined
              : FadeInDown.duration(280).delay(50).springify().damping(20).stiffness(280)
          }
          exiting={FadeOut.duration(reduceMotion ? 0 : 120)}
          style={styles.sub}
        >
          Review requested from 3 teammates
        </Animated.Text>
      </View>
      <AnimateButton onPress={() => setTick((n) => n + 1)} />
    </Stage>
  );
}

const styles = StyleSheet.create({
  col: { width: 230 },
  title: { fontFamily: fonts.medium, fontSize: 16, color: colors.text, marginBottom: 4 },
  sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSubtle },
});
