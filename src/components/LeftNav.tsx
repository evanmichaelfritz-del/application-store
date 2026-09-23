import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { countSection } from '@/src/catalog';
import { EdgeFade } from '@/src/components/EdgeFade';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { springs, sprung } from '@/src/motion';
import { NAV_SECTIONS, type NavSection } from '@/src/sections';
import { colors, fonts } from '@/src/theme';

type ChipBox = { y: number; height: number; x: number; width: number };

const CHIP_H = 44;

export function LeftNav({
  value,
  onChange,
  compact,
}: {
  value: NavSection;
  onChange: (key: NavSection) => void;
  compact: boolean;
}) {
  const { reduceMotion } = useReduceMotion();
  const { width } = useWindowDimensions();
  const phone = width < 640;
  const [boxes, setBoxes] = useState<Partial<Record<NavSection, ChipBox>>>({});
  const pillX = useSharedValue(0);
  const pillY = useSharedValue(0);
  const pillW = useSharedValue(48);
  const pillH = useSharedValue(36);

  useEffect(() => {
    const box = boxes[value];
    if (!box) return;
    if (compact) {
      pillX.value = sprung(box.x, springs.layout, reduceMotion);
      pillW.value = sprung(box.width, springs.layout, reduceMotion);
      return;
    }
    pillY.value = sprung(box.y, springs.layout, reduceMotion);
    pillH.value = sprung(box.height, springs.layout, reduceMotion);
  }, [boxes, compact, pillH, pillW, pillX, pillY, reduceMotion, value]);

  const pillStyle = useAnimatedStyle(() =>
    compact
      ? {
          transform: [{ translateX: pillX.value }],
          width: pillW.value,
          height: CHIP_H,
        }
      : {
          transform: [{ translateY: pillY.value }],
          height: pillH.value,
        },
  );

  const onChipLayout = (key: NavSection) => (e: LayoutChangeEvent) => {
    const { x, y, width: layoutWidth, height } = e.nativeEvent.layout;
    setBoxes((prev) => {
      const last = prev[key];
      if (
        last &&
        last.x === x &&
        last.y === y &&
        last.width === layoutWidth &&
        last.height === height
      ) {
        return prev;
      }
      return { ...prev, [key]: { x, y, width: layoutWidth, height } };
    });
  };

  const items = NAV_SECTIONS.map((section) => {
    const active = section.key === value;
    const count = countSection(section.key);
    return (
      <Pressable
        key={section.key}
        onPress={() => onChange(section.key)}
        onLayout={onChipLayout(section.key)}
        style={[compact ? styles.chip : styles.row, { zIndex: 1 }]}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={section.label}
      >
        <Text style={[compact ? styles.chipLabel : styles.rowLabel, active && styles.labelOn]}>
          {section.label}
        </Text>
        {!compact ? (
          <Text style={[styles.count, active && styles.countOn]}>{count}</Text>
        ) : null}
      </Pressable>
    );
  });

  if (compact) {
    return (
      <View style={styles.chipWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={[styles.chipRow, phone && styles.chipRowPhone]}
          accessibilityRole="tablist"
        >
          <Animated.View style={[styles.chipPill, pillStyle]} />
          {items}
          <View style={styles.chipSlot} accessibilityLabel="Add section slot">
            <Text style={styles.slotLabel}>+ Add</Text>
          </View>
        </ScrollView>
        <EdgeFade />
      </View>
    );
  }

  return (
    <View style={styles.rail} accessibilityRole="tablist">
      <Text style={styles.railEyebrow}>Store</Text>
      <View style={styles.railStack}>
        <Animated.View style={[styles.railPill, pillStyle]} />
        {items}
        <View style={styles.rowSlot} accessibilityLabel="Add section slot">
          <Text style={styles.slotLabel}>+ Add</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: 220,
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: colors.cardBorder,
  },
  railEyebrow: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textFaint,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  railStack: {
    position: 'relative',
  },
  railPill: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 10,
    backgroundColor: colors.chipActive,
  },
  row: {
    minHeight: 40,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.chipText,
  },
  count: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textFaint,
  },
  countOn: { color: colors.chipTextActive },
  labelOn: { color: colors.chipTextActive },
  chipWrap: {
    position: 'relative',
    flexGrow: 0,
    flexShrink: 0,
    width: '100%',
    marginBottom: 8,
    backgroundColor: colors.bg,
  },
  chipScroll: {
    flexGrow: 0,
    flexShrink: 0,
    height: CHIP_H,
    maxHeight: CHIP_H,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 20,
    position: 'relative',
    flexGrow: 0,
  },
  chipRowPhone: { paddingHorizontal: 16 },
  chipPill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: CHIP_H,
    borderRadius: 48,
    backgroundColor: colors.chipActive,
  },
  chip: {
    height: CHIP_H,
    paddingHorizontal: 16,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  chipLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.chipText,
  },
  chipSlot: {
    height: CHIP_H,
    paddingHorizontal: 16,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.12)',
    zIndex: 1,
  },
  rowSlot: {
    minHeight: 40,
    marginTop: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.12)',
    justifyContent: 'center',
  },
  slotLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textFaint,
  },
});
