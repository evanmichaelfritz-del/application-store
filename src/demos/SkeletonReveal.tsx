import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { AnimateButton } from '../components/AnimateButton';
import { Stage } from '../components/Stage';
import { useReduceMotion } from '../context/ReduceMotionContext';
import { ease, timed, webFilter } from '../motion';
import { colors, fonts } from '../theme';

export function SkeletonRevealDemo() {
  const { reduceMotion } = useReduceMotion();
  const [loaded, setLoaded] = useState(false);
  const pulse = useSharedValue(1);
  const reveal = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || loaded) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(withTiming(0.5, { duration: 1000 }), -1, true);
  }, [loaded, pulse, reduceMotion]);

  useEffect(() => {
    reveal.value = timed(loaded ? 1 : 0, 250, ease.inOut, reduceMotion);
  }, [loaded, reduceMotion, reveal]);

  const skel = useAnimatedStyle(() => ({
    opacity: (1 - reveal.value) * pulse.value,
    ...(webFilter((reveal.value) * 2) ?? {}),
  }));
  const content = useAnimatedStyle(() => ({
    opacity: reveal.value,
    ...(webFilter((1 - reveal.value) * 2) ?? {}),
  }));

  return (
    <Stage>
      <View style={styles.row}>
        <Animated.View style={[styles.avatar, styles.bone, skel]} />
        <Animated.View style={[styles.col, skel]}>
          <View style={[styles.line, { width: 108 }]} />
          <View style={[styles.line, { width: 150, marginTop: 8 }]} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, styles.loaded, content]}>
          <View style={[styles.avatar, styles.photo]}>
            <Text style={styles.ini}>JC</Text>
          </View>
          <View>
            <Text style={styles.name}>Jane Cooper</Text>
            <Text style={styles.mail}>jane.cooper@example.com</Text>
          </View>
        </Animated.View>
      </View>
      <AnimateButton onPress={() => setLoaded((v) => !v)} />
    </Stage>
  );
}

const styles = StyleSheet.create({
  row: { width: 230, height: 48, justifyContent: 'center' },
  col: { marginLeft: 52 },
  bone: { backgroundColor: colors.skeleton },
  avatar: { width: 40, height: 40, borderRadius: 20, position: 'absolute', left: 0 },
  line: { height: 10, borderRadius: 5, backgroundColor: colors.skeleton },
  loaded: { flexDirection: 'row', alignItems: 'center', paddingLeft: 52 },
  photo: { backgroundColor: '#d9b8a2', alignItems: 'center', justifyContent: 'center' },
  ini: { fontFamily: fonts.medium, fontSize: 11, color: '#2a2118' },
  name: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  mail: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSubtle },
});
