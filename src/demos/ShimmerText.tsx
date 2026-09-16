import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Stage } from '../components/Stage';
import { useReduceMotion } from '../context/ReduceMotionContext';
import { fonts } from '../theme';

const WINDOW = 56;
const LABEL = 'Generating reply';

export function ShimmerTextDemo() {
  const { reduceMotion } = useReduceMotion();
  const x = useSharedValue(-WINDOW);
  const textW = useSharedValue(180);

  useEffect(() => {
    cancelAnimation(x);
    if (reduceMotion) {
      x.value = 0;
      return;
    }
    x.value = -WINDOW;
    x.value = withRepeat(
      withTiming(textW.value + WINDOW, { duration: 1200, easing: Easing.linear }),
      -1,
      false,
    );
  }, [reduceMotion, textW, x]);

  const windowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));
  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -x.value }],
  }));

  return (
    <Stage>
      <View
        style={styles.clip}
        onLayout={(e) => {
          textW.value = e.nativeEvent.layout.width;
        }}
      >
        <Text style={[styles.word, reduceMotion ? styles.hot : styles.base]}>{LABEL}</Text>
        {reduceMotion ? null : (
          <Animated.View style={[styles.mask, windowStyle]}>
            <Animated.View style={innerStyle}>
              <Text style={[styles.word, styles.hot]}>{LABEL}</Text>
            </Animated.View>
          </Animated.View>
        )}
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  word: {
    fontFamily: fonts.medium,
    fontSize: 20,
  },
  base: { color: '#7c7c7c' },
  hot: { color: '#0d0d0d' },
  mask: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: WINDOW,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
});
