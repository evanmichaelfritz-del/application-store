import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { countSection } from '@/src/catalog';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { springs, sprung } from '@/src/motion';
import { NAV_SECTIONS, type NavSection } from '@/src/sections';
import { colors, fonts } from '@/src/theme';

type RowBox = { y: number; height: number };
type RailHover = NavSection | 'add';

const NAV_ROW_HOVER = '#f1f1f1';
const NAV_SELECTED = '#e0e0e0';
const NAV_SELECTED_HOVER = '#d4d4d4';

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
  const [boxes, setBoxes] = useState<Partial<Record<NavSection, RowBox>>>({});
  const [railHover, setRailHover] = useState<RailHover | null>(null);
  const pillY = useSharedValue(0);
  const pillH = useSharedValue(36);

  useEffect(() => {
    const box = boxes[value];
    if (!box) return;
    pillY.value = sprung(box.y, springs.layout, reduceMotion);
    pillH.value = sprung(box.height, springs.layout, reduceMotion);
  }, [boxes, pillH, pillY, reduceMotion, value]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pillY.value }],
    height: pillH.value,
  }));

  const onRowLayout = (key: NavSection) => (e: LayoutChangeEvent) => {
    const { y, height } = e.nativeEvent.layout;
    setBoxes((prev) => {
      const last = prev[key];
      if (last && last.y === y && last.height === height) return prev;
      return { ...prev, [key]: { y, height } };
    });
  };

  return (
    <View
      style={[styles.rail, compact && styles.railStacked]}
      accessibilityRole="tablist"
    >
      <Text style={styles.railEyebrow}>Store</Text>
      <View style={styles.railStack}>
        <Animated.View
          style={[styles.railPill, railHover === value && styles.railPillHover, pillStyle]}
        />
        {NAV_SECTIONS.map((section) => {
          const active = section.key === value;
          const count = countSection(section.key);
          return (
            <Pressable
              key={section.key}
              onPress={() => onChange(section.key)}
              onLayout={onRowLayout(section.key)}
              onHoverIn={() =>
                setRailHover((current) => (current === section.key ? current : section.key))
              }
              onHoverOut={() =>
                setRailHover((current) => (current === section.key ? null : current))
              }
              style={[
                styles.row,
                !active && railHover === section.key && styles.rowHover,
                styles.pointer,
                { zIndex: 1 },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={section.label}
            >
              <Text style={[styles.rowLabel, active && styles.labelOn]}>{section.label}</Text>
              <Text style={[styles.count, active && styles.countOn]}>{count}</Text>
            </Pressable>
          );
        })}
        <Pressable
          accessibilityLabel="Add section slot"
          onHoverIn={() => setRailHover((current) => (current === 'add' ? current : 'add'))}
          onHoverOut={() => setRailHover((current) => (current === 'add' ? null : current))}
          style={[styles.rowSlot, railHover === 'add' && styles.rowSlotHover, styles.pointer]}
        >
          <Text style={styles.slotLabel}>+ Add</Text>
        </Pressable>
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
  railStacked: {
    width: '100%',
    borderRightWidth: 0,
    paddingTop: 4,
    paddingBottom: 12,
    paddingHorizontal: 8,
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
    backgroundColor: NAV_SELECTED,
  },
  railPillHover: {
    backgroundColor: NAV_SELECTED_HOVER,
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
  rowHover: {
    backgroundColor: NAV_ROW_HOVER,
  },
  pointer: {
    cursor: 'pointer',
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
  rowSlotHover: {
    backgroundColor: NAV_ROW_HOVER,
    borderColor: 'rgba(0, 0, 0, 0.22)',
  },
  slotLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textFaint,
  },
});
