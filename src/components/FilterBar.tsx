import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { FILTERS, type FilterKey } from '@/src/catalog';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { springs, sprung } from '@/src/motion';
import { colors, fonts } from '@/src/theme';

type ChipBox = { x: number; width: number };

export function FilterBar({
  value,
  onChange,
}: {
  value: FilterKey;
  onChange: (key: FilterKey) => void;
}) {
  const { reduceMotion } = useReduceMotion();
  const [boxes, setBoxes] = useState<Partial<Record<FilterKey, ChipBox>>>({});
  const pillX = useSharedValue(0);
  const pillW = useSharedValue(48);

  useEffect(() => {
    const box = boxes[value];
    if (!box) return;
    pillX.value = sprung(box.x, springs.layout, reduceMotion);
    pillW.value = sprung(box.width, springs.layout, reduceMotion);
  }, [boxes, pillW, pillX, reduceMotion, value]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: pillW.value,
  }));

  const onChipLayout = (key: FilterKey) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setBoxes((prev) => {
      const last = prev[key];
      if (last && last.x === x && last.width === width) return prev;
      return { ...prev, [key]: { x, width } };
    });
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist"
    >
      <Animated.View style={[styles.pill, pillStyle]} />
      {FILTERS.map((filter) => {
        const active = filter.key === value;
        return (
          <Pressable
            key={filter.key}
            onPress={() => onChange(filter.key)}
            onLayout={onChipLayout(filter.key)}
            style={[styles.chip, { zIndex: 1 }]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelOn]}>{filter.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 20,
    marginBottom: 22,
    position: 'relative',
    flexGrow: 1,
  },
  pill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 36,
    borderRadius: 48,
    backgroundColor: colors.chipActive,
  },
  chip: {
    height: 36,
    paddingHorizontal: 15,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.chipText,
  },
  labelOn: { color: colors.chipTextActive },
});
