import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { ease, tokens } from '@/src/motion';
import { colors, fonts } from '@/src/theme';

export function ErrorShakeDemo() {
  const { reduceMotion } = useReduceMotion();
  const [value, setValue] = useState('hello@');
  const [error, setError] = useState(false);
  const x = useSharedValue(0);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const shake = () => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (valid) {
      setError(false);
      return;
    }
    setError(true);
    if (reduceMotion) return;
    const px = tokens.shakePx;
    const step = tokens.shake / 5;
    x.value = withSequence(
      withTiming(px, { duration: step, easing: ease.shake }),
      withTiming(-px, { duration: step, easing: ease.shake }),
      withTiming(px * 0.6, { duration: step, easing: ease.shake }),
      withTiming(-px * 0.35, { duration: step, easing: ease.shake }),
      withTiming(0, { duration: step, easing: ease.shake }),
    );
  };

  return (
    <Stage>
      <View style={styles.wrap}>
        <Animated.View style={style}>
          <TextInput
            value={value}
            onChangeText={(t) => {
              setValue(t);
              if (error) setError(false);
            }}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, error && styles.inputErr]}
          />
        </Animated.View>
        {error ? <Text style={styles.msg}>Please enter a valid email.</Text> : <View style={styles.spacer} />}
        <Pressable onPress={shake} style={styles.btn}>
          <Text style={styles.btnText}>Submit</Text>
        </Pressable>
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 220 },
  input: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.text,
  },
  inputErr: { borderColor: colors.danger },
  msg: { fontFamily: fonts.regular, fontSize: 11, color: colors.danger, marginTop: 6 },
  spacer: { height: 20 },
  btn: {
    marginTop: 8,
    alignSelf: 'flex-end',
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.animateBg,
    justifyContent: 'center',
  },
  btnText: { fontFamily: fonts.medium, fontSize: 12, color: colors.animateText },
});
