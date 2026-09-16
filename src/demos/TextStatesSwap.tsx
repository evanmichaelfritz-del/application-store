import { useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { AnimateButton } from '@/src/components/AnimateButton';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { ease, timed, tokens, webFilter } from '@/src/motion';
import { colors, fonts } from '@/src/theme';

const MESSAGES = ['Transaction processing...', 'Transaction completed'];

export function TextStatesSwapDemo() {
  const { reduceMotion } = useReduceMotion();
  const [index, setIndex] = useState(0);
  const busy = useRef(false);
  const y = useSharedValue(0);
  const opacity = useSharedValue(1);
  const blur = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
    ...(webFilter(blur.value) ?? {}),
  }));

  const swap = () => {
    if (busy.current) return;
    busy.current = true;
    const dur = reduceMotion ? 0 : tokens.fade;
    y.value = timed(-4, dur, ease.inOut, reduceMotion);
    opacity.value = timed(0, dur, ease.inOut, reduceMotion);
    blur.value = timed(2, dur, ease.inOut, reduceMotion);
    setTimeout(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
      y.value = 4;
      blur.value = 2;
      opacity.value = 0;
      y.value = timed(0, dur, ease.inOut, reduceMotion);
      opacity.value = timed(1, dur, ease.inOut, reduceMotion);
      blur.value = timed(0, dur, ease.inOut, reduceMotion);
      busy.current = false;
    }, dur);
  };

  return (
    <Stage>
      <Animated.View style={style}>
        <Text style={styles.text}>{MESSAGES[index]}</Text>
      </Animated.View>
      <AnimateButton onPress={swap} />
    </Stage>
  );
}

const styles = StyleSheet.create({
  text: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
});
