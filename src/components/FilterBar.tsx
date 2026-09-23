import { useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { FILTERS, type FilterKey } from '@/src/catalog';
import { EdgeFade } from '@/src/components/EdgeFade';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { springs, sprung } from '@/src/motion';
import { colors, fonts } from '@/src/theme';

type ChipBox = { x: number; width: number };

export function FilterBar({
  value,
  onChange,
  query,
  onQueryChange,
}: {
  value: FilterKey;
  onChange: (key: FilterKey) => void;
  query: string;
  onQueryChange: (next: string) => void;
}) {
  const { reduceMotion } = useReduceMotion();
  const { width } = useWindowDimensions();
  const phone = width < 640;
  const touch = width < 880;
  const chipH = touch ? 44 : 36;
  const [boxes, setBoxes] = useState<Partial<Record<FilterKey, ChipBox>>>({});
  const [searchFocused, setSearchFocused] = useState(false);
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
    const { x, width: layoutWidth } = e.nativeEvent.layout;
    setBoxes((prev) => {
      const last = prev[key];
      if (last && last.x === x && last.width === layoutWidth) return prev;
      return { ...prev, [key]: { x, width: layoutWidth } };
    });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.rowWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.rowScroll, { height: chipH, maxHeight: chipH }]}
          contentContainerStyle={[styles.row, phone && styles.rowPhone]}
          accessibilityRole="tablist"
        >
          <Animated.View style={[styles.pill, { height: chipH }, pillStyle]} />
          {FILTERS.map((filter) => {
            const active = filter.key === value;
            return (
              <Pressable
                key={filter.key}
                onPress={() => onChange(filter.key)}
                onLayout={onChipLayout(filter.key)}
                style={[styles.chip, { height: chipH, zIndex: 1 }]}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.label, active && styles.labelOn]}>{filter.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {touch ? <EdgeFade /> : null}
      </View>
      <TextInput
        value={query}
        onChangeText={onQueryChange}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        placeholder="Search title, subtitle, categories, tags"
        placeholderTextColor={colors.textFaint}
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel="Search pieces by title, subtitle, id, categories, or tags"
        style={[
          styles.search,
          touch && styles.searchTouch,
          phone && styles.searchPhone,
          searchFocused && styles.searchFocus,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 14,
  },
  rowWrap: {
    position: 'relative',
    flexGrow: 0,
    marginBottom: 12,
  },
  rowScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 20,
    position: 'relative',
    flexGrow: 0,
  },
  rowPhone: { paddingHorizontal: 16 },
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
  search: {
    marginHorizontal: 20,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    ...(Platform.OS === 'web'
      ? { outlineWidth: 0, outlineStyle: 'none' as const }
      : null),
  },
  searchTouch: {
    height: 44,
    borderColor: colors.cardBorder,
  },
  searchPhone: {
    marginHorizontal: 16,
  },
  searchFocus: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
});
