import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View, type ViewStyle } from 'react-native';
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
import { tokens } from '../motion';
import { fonts } from '../theme';

/** Clip window only. The highlight line must stay the full string width. */
const WINDOW = 72;
const LABEL = 'Generating reply';

const nowrap: ViewStyle | null =
  Platform.OS === 'web' ? ({ whiteSpace: 'nowrap' } as ViewStyle) : null;

const maskFade: ViewStyle | null =
  Platform.OS === 'web'
    ? ({
        maskImage: 'linear-gradient(90deg, transparent 0%, #000 28%, #000 72%, transparent 100%)',
      } as ViewStyle)
    : null;

export function ShimmerTextDemo() {
  const { reduceMotion } = useReduceMotion();
  const x = useSharedValue(-WINDOW);
  const [textW, setTextW] = useState(0);

  useEffect(() => {
    cancelAnimation(x);
    if (reduceMotion || textW <= 0) {
      x.value = 0;
      return;
    }
    x.value = -WINDOW;
    x.value = withRepeat(
      withTiming(textW, { duration: tokens.shimmer, easing: Easing.linear }),
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
        testID="shimmer-text"
        style={styles.clip}
        onLayout={(e) => {
          const next = Math.round(e.nativeEvent.layout.width);
          setTextW((prev) => (Math.abs(prev - next) <= 1 ? prev : next));
        }}
      >
        <Text style={[styles.word, nowrap, reduceMotion ? styles.hot : styles.base]}>{LABEL}</Text>
        {reduceMotion || textW <= 0 ? null : (
          <Animated.View pointerEvents="none" style={[styles.mask, maskFade, windowStyle]}>
            <Animated.View style={[styles.line, { width: textW }, innerStyle]}>
              <Text style={[styles.word, nowrap, styles.hot]}>{LABEL}</Text>
            </Animated.View>
          </Animated.View>
        )}
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
    alignSelf: 'center',
  },
  word: {
    fontFamily: fonts.medium,
    fontSize: 20,
    lineHeight: 26,
  },
  base: { color: '#7c7c7c' },
  hot: { color: '#0d0d0d' },
  line: {
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  mask: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 26,
    width: WINDOW,
    overflow: 'hidden',
  },
});
