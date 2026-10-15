import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Link } from 'expo-router';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import {
  galleryHref,
  totalAssets,
  typeCount,
  VISIBLE_TYPES,
  type ComponentType,
  type GalleryFilters,
} from '@/src/library/taxonomy';
import { pressableWeb, textWeb, viewWeb } from '@/src/library/webProps';
import { springs, sprung } from '@/src/motion';
import { colors, fonts } from '@/src/theme';

type RowKey = 'all' | ComponentType;
type RowBox = { y: number; height: number };

const NAV_ROW_HOVER = '#f1f1f1';
const NAV_SELECTED = '#e0e0e0';
const NAV_SELECTED_HOVER = '#d4d4d4';

export function LeftNav({
  typeSlug,
  filters,
  compact,
}: {
  typeSlug: string | null;
  filters: GalleryFilters;
  compact: boolean;
}) {
  const { reduceMotion } = useReduceMotion();
  const active: RowKey = VISIBLE_TYPES.find((type) => type.slug === typeSlug)?.slug ?? 'all';
  const [boxes, setBoxes] = useState<Partial<Record<RowKey, RowBox>>>({});
  const [railHover, setRailHover] = useState<RowKey | null>(null);
  const pillY = useSharedValue(0);
  const pillH = useSharedValue(32);

  useEffect(() => {
    const box = boxes[active];
    if (!box) return;
    pillY.value = sprung(box.y, springs.layout, reduceMotion);
    pillH.value = sprung(box.height, springs.layout, reduceMotion);
  }, [active, boxes, pillH, pillY, reduceMotion]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pillY.value }],
    height: pillH.value,
  }));

  const onRowLayout = (key: RowKey) => (e: LayoutChangeEvent) => {
    const { y, height } = e.nativeEvent.layout;
    setBoxes((prev) => {
      const last = prev[key];
      if (last && last.y === y && last.height === height) return prev;
      return { ...prev, [key]: { y, height } };
    });
  };

  return (
    <View
      {...viewWeb(compact ? {} : { dataSet: { storeSidebar: 'dock' } })}
      style={[styles.rail, compact && styles.railStacked]}
    >
      <View style={styles.railStack}>
        <Animated.View
          pointerEvents="none"
          {...viewWeb({ dataSet: { focusRing: 'true' } })}
          style={[styles.railPill, railHover === active && styles.railPillHover, pillStyle]}
        />
        <NavRow
          label="All assets"
          count={totalAssets()}
          active={active === 'all'}
          hovered={railHover === 'all'}
          href={galleryHref(null, filters)}
          testID="nav-count-all"
          onLayout={onRowLayout('all')}
          onHoverIn={() => setRailHover((current) => (current === 'all' ? current : 'all'))}
          onHoverOut={() => setRailHover((current) => (current === 'all' ? null : current))}
        />
        <Text style={styles.eyebrow}>Components</Text>
        {VISIBLE_TYPES.map((type) => (
          <NavRow
            key={type.slug}
            label={type.label}
            count={typeCount(type.slug)}
            active={type.slug === active}
            hovered={railHover === type.slug}
            href={galleryHref(type.slug, filters)}
            testID={`nav-count-${type.slug}`}
            onLayout={onRowLayout(type.slug)}
            onHoverIn={() => setRailHover((current) => (current === type.slug ? current : type.slug))}
            onHoverOut={() => setRailHover((current) => (current === type.slug ? null : current))}
          />
        ))}
      </View>
    </View>
  );
}

function NavRow({
  label,
  count,
  active,
  hovered,
  href,
  testID,
  onLayout,
  onHoverIn,
  onHoverOut,
}: {
  label: string;
  count: number;
  active: boolean;
  hovered: boolean;
  href: ReturnType<typeof galleryHref>;
  testID: string;
  onLayout: (event: LayoutChangeEvent) => void;
  onHoverIn: () => void;
  onHoverOut: () => void;
}) {
  return (
    <Link href={href} asChild>
      <Pressable
        onLayout={onLayout}
        onHoverIn={onHoverIn}
        onHoverOut={onHoverOut}
        accessibilityRole="link"
        accessibilityLabel={`${label} ${count}`}
        accessibilityState={{ selected: active }}
        {...pressableWeb({
          dataSet: { focusRing: 'true' },
          'aria-current': active ? 'page' : undefined,
        })}
        style={StyleSheet.flatten([
          styles.row,
          !active && hovered && styles.rowHover,
          styles.pointer,
        ])}
      >
        <Text
          style={[styles.rowLabel, active && styles.labelOn]}
          numberOfLines={1}
          {...textWeb({ dataSet: { focusRing: 'true' } })}
        >
          {label}
        </Text>
        <Text testID={testID} style={[styles.count, active && styles.countOn]} {...textWeb({ dataSet: { focusRing: 'true' } })}>
          {count}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: 240,
    flexShrink: 0,
    boxSizing: 'border-box',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: colors.cardBorder,
    backgroundColor: colors.bg,
  },
  railStacked: {
    width: '100%',
    borderRightWidth: 0,
    paddingTop: 4,
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  eyebrow: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textFaint,
    paddingHorizontal: 10,
    marginTop: 16,
    marginBottom: 6,
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
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    zIndex: 1,
    boxSizing: 'border-box',
  },
  rowHover: {
    backgroundColor: NAV_ROW_HOVER,
  },
  pointer: {
    cursor: 'pointer',
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.chipText,
  },
  count: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textFaint,
    fontVariant: ['tabular-nums'],
  },
  countOn: { color: colors.chipTextActive },
  labelOn: { color: colors.chipTextActive },
});
