import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { ease, springs, sprung, tokens } from '@/src/motion';
import { colors, fonts, shadows } from '@/src/theme';

const TRIGGERS = [
  { id: 'edit', label: 'Aa', tip: 'Edit' },
  { id: 'share', label: '↗', tip: 'Share' },
  { id: 'more', label: '···', tip: 'More' },
];

export function TooltipDemo() {
  const { reduceMotion } = useReduceMotion();
  const [tip, setTip] = useState(TRIGGERS[0].tip);
  const shown = useSharedValue(0);
  const slot = useSharedValue(0);

  const show = (index: number, label: string) => {
    setTip(label);
    slot.value = sprung(index, springs.layout, reduceMotion);
    shown.value = reduceMotion
      ? withTiming(1, { duration: 0 })
      : withDelay(tokens.tooltipDelay, withTiming(1, { duration: 180, easing: ease.outEase }));
  };

  const hide = () => {
    shown.value = withTiming(0, { duration: 0 });
  };

  const bubble = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateX: slot.value * 44 }, { scale: 0.98 + shown.value * 0.02 }],
  }));

  return (
    <Stage>
      <View>
        <Animated.View style={[styles.tt, bubble]}>
          <Text style={styles.ttText}>{tip}</Text>
        </Animated.View>
        <View style={styles.row}>
          {TRIGGERS.map((item, i) => (
            <Pressable
              key={item.id}
              onHoverIn={() => show(i, item.tip)}
              onHoverOut={hide}
              onPressIn={() => show(i, item.tip)}
              onPressOut={hide}
              style={styles.hit}
            >
              <Text style={styles.icon}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  hit: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  icon: { fontFamily: fonts.medium, fontSize: 13, color: colors.text },
  tt: {
    position: 'absolute',
    top: -36,
    left: 0,
    minWidth: 36,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.material,
  },
  ttText: { fontFamily: fonts.medium, fontSize: 12, color: '#2f2f2f' },
});
