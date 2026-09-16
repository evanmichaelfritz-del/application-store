import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Stage } from '../components/Stage';
import { useReduceMotion } from '../context/ReduceMotionContext';
import { springs, sprung } from '../motion';
import { colors, fonts } from '../theme';

export function DragDropDemo() {
  const { reduceMotion } = useReduceMotion();
  const [dropped, setDropped] = useState(false);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const scale = useSharedValue(1);
  const zone = useSharedValue(0);

  const snapHome = () => {
    x.value = sprung(0, springs.default, reduceMotion);
    y.value = sprung(0, springs.default, reduceMotion);
    scale.value = withTiming(1, { duration: reduceMotion ? 0 : 180 });
  };

  const gesture = Gesture.Pan()
    .onBegin(() => {
      scale.value = withTiming(1.06, { duration: reduceMotion ? 0 : 160 });
    })
    .onChange((e) => {
      x.value += e.changeX;
      y.value += e.changeY;
      const over = Math.abs(x.value) < 70 && y.value < -40;
      zone.value = withTiming(over ? 1 : 0, { duration: reduceMotion ? 0 : 180 });
    })
    .onEnd(() => {
      const over = Math.abs(x.value) < 70 && y.value < -40;
      if (over) {
        runOnJS(setDropped)(true);
        x.value = sprung(0, springs.default, reduceMotion);
        y.value = sprung(-72, springs.default, reduceMotion);
        scale.value = withTiming(0, { duration: reduceMotion ? 0 : 220 });
      } else {
        runOnJS(snapHome)();
      }
    });

  const chip = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }],
    opacity: dropped ? 0 : 1,
  }));
  const well = useAnimatedStyle(() => ({
    borderRadius: 14 + zone.value * 18,
    transform: [{ scale: 1 + zone.value * 0.04 }],
    backgroundColor: dropped ? '#d7e6ff' : '#fff',
  }));

  return (
    <Stage>
      <View style={styles.scene}>
        <Animated.View style={[styles.zone, well]}>
          <Text style={styles.zoneText}>{dropped ? 'Dropped' : 'Drag & drop it here'}</Text>
        </Animated.View>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.chip, chip]}>
            <View style={styles.thumb} />
            <Text style={styles.chipText}>Image</Text>
          </Animated.View>
        </GestureDetector>
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  scene: { width: 230, height: 180, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 16 },
  zone: {
    width: 200,
    height: 86,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSubtle },
  chip: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 36,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  thumb: { width: 18, height: 18, borderRadius: 4, backgroundColor: '#8cb4ff' },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
});
