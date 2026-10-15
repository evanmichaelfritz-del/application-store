import { useEffect, useRef, type ComponentRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  chipSelected,
  countGallery,
  filtersActive,
  resultLine,
  STATUSES,
  STACKS,
  toggleFilter,
  VISIBLE_MOTIONS,
  VISIBLE_SOURCES,
  type FilterGroup,
  type GalleryFilters,
} from '@/src/library/taxonomy';
import { pressableWeb, textInputWeb, textWeb } from '@/src/library/webProps';
import { colors, fonts } from '@/src/theme';

const CHIP_HOVER = '#f1f1f1';
const CHIP_PRESSED = '#e0e0e0';
const CHIP_ON = '#0d0d0d';
const CHIP_ON_HOVER = '#4a4a4a';
const CHIP_ON_PRESSED = '#000000';

const GROUPS: { key: FilterGroup; label: string; chips: readonly { slug: string; label: string }[] }[] = [
  { key: 'motion', label: 'Motion', chips: VISIBLE_MOTIONS },
  { key: 'stack', label: 'Stack', chips: STACKS },
  { key: 'source', label: 'Source', chips: VISIBLE_SOURCES },
  { key: 'status', label: 'Status', chips: STATUSES },
];

export function FilterBar({
  typeSlug,
  typeName,
  total,
  filters,
  onChange,
}: {
  typeSlug: string | null;
  typeName: string | null;
  total: number;
  filters: GalleryFilters;
  onChange: (next: GalleryFilters) => void;
}) {
  const matched = countGallery(typeSlug, filters);
  const line = resultLine(matched, total, typeName, filters);
  const showClear = filtersActive(filters);

  return (
    <View style={styles.wrap}>
      <TextInput
        value={filters.q}
        onChangeText={(q) => onChange({ ...filters, q })}
        placeholder="Search title, subtitle, tags"
        placeholderTextColor={colors.textFaint}
        autoCorrect={false}
        autoCapitalize="none"
        accessibilityLabel="Search title, subtitle, tags"
        {...textInputWeb({ dataSet: { focusRing: 'true', storeSearch: 'true' } })}
        style={styles.search}
      />
      <View style={styles.groups}>
        {GROUPS.map((group) => (
          <View key={group.key} style={styles.groupRow}>
            <Text style={styles.groupLabel}>{group.label}</Text>
            <View style={styles.chips}>
              {group.chips.map((chip) => {
                const selected = chipSelected(filters, group.key, chip.slug);
                const next = toggleFilter(filters, group.key, chip.slug);
                const muted = !selected && countGallery(typeSlug, next) === 0;
                return (
                  <FilterChip
                    key={chip.slug}
                    label={chip.label}
                    selected={selected}
                    muted={muted}
                    testID={`chip-${group.key}-${chip.slug}`}
                    accessibilityLabel={`${group.label} ${chip.label}`}
                    onToggle={() => onChange(next)}
                  />
                );
              })}
            </View>
          </View>
        ))}
      </View>
      <View style={styles.result}>
        <Text style={styles.resultText} testID="result-line">
          {line}
        </Text>
        {showClear ? (
          <Pressable
            onPress={() => onChange({ motion: [], stack: [], source: [], status: [], q: '' })}
            accessibilityRole="button"
            accessibilityLabel="Clear all"
            testID="clear-all"
            {...pressableWeb({ dataSet: { focusRing: 'true', clearLink: 'true' } })}
            style={styles.pointer}
          >
            <Text style={styles.clear} {...textWeb({ dataSet: { focusRing: 'true', clearLink: 'true' } })}>
              Clear all
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

type KeyEvent = {
  key: string;
  preventDefault: () => void;
};

type KeyTarget = {
  addEventListener: (type: 'keydown', listener: (event: KeyEvent) => void) => void;
  removeEventListener: (type: 'keydown', listener: (event: KeyEvent) => void) => void;
};

function isKeyTarget(node: object | null): node is KeyTarget {
  if (node === null) return false;
  if (!('addEventListener' in node) || !('removeEventListener' in node)) return false;
  return typeof node.addEventListener === 'function' && typeof node.removeEventListener === 'function';
}

function FilterChip({
  label,
  selected,
  muted,
  onToggle,
  testID,
  accessibilityLabel,
}: {
  label: string;
  selected: boolean;
  muted: boolean;
  onToggle: () => void;
  testID: string;
  accessibilityLabel: string;
}) {
  const ref = useRef<ComponentRef<typeof Pressable>>(null);
  const toggleRef = useRef(onToggle);
  toggleRef.current = onToggle;

  useEffect(() => {
    const el = ref.current;
    if (!isKeyTarget(el)) return;
    const onKeyDown = (event: KeyEvent) => {
      if (event.key !== ' ' && event.key !== 'Spacebar') return;
      event.preventDefault();
      toggleRef.current();
    };
    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <Pressable
      ref={ref}
      onPress={onToggle}
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: selected }}
      aria-checked={selected}
      {...pressableWeb({ dataSet: { focusRing: 'true' } })}
      style={(state) => {
        const hover = Boolean((state as { hovered?: boolean }).hovered);
        return [
          styles.chip,
          styles.pointer,
          hover && !selected && styles.chipHover,
          selected && styles.chipOn,
          selected && hover && !state.pressed && styles.chipOnHover,
          state.pressed && !selected && styles.chipPressed,
          state.pressed && selected && styles.chipOnPressed,
        ];
      }}
    >
      <Text
        style={[styles.chipLabel, muted && styles.chipLabelMuted, selected && styles.chipLabelOn]}
        {...textWeb({ dataSet: { focusRing: 'true' } })}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 0,
  },
  search: {
    height: 40,
    marginBottom: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    boxSizing: 'border-box',
  },
  groups: {
    gap: 8,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupLabel: {
    width: 64,
    flexShrink: 0,
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textFaint,
  },
  chips: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  chipHover: {
    backgroundColor: CHIP_HOVER,
  },
  chipPressed: {
    backgroundColor: CHIP_PRESSED,
    borderColor: CHIP_PRESSED,
  },
  chipOn: {
    backgroundColor: CHIP_ON,
    borderColor: CHIP_ON,
  },
  chipOnHover: {
    backgroundColor: CHIP_ON_HOVER,
    borderColor: CHIP_ON_HOVER,
  },
  chipOnPressed: {
    backgroundColor: CHIP_ON_PRESSED,
    borderColor: CHIP_ON_PRESSED,
  },
  chipLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: 'rgba(15, 15, 15, 0.8)',
  },
  chipLabelMuted: {
    color: colors.textFaint,
  },
  chipLabelOn: {
    color: '#ffffff',
  },
  pointer: {
    cursor: 'pointer',
  },
  result: {
    marginTop: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 16,
  },
  resultText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSubtle,
  },
  clear: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.text,
    textDecorationLine: 'underline',
  },
});
