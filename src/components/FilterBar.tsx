import { useEffect, useRef, useState, type ComponentRef } from 'react';
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
import { pressableWeb, textInputWeb, textWeb, viewWeb } from '@/src/library/webProps';
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

type SourceFade = 'none' | 'left' | 'right' | 'both';

type ScrollNode = HTMLElement;

function isScrollNode(node: object | null): node is ScrollNode {
  return node !== null && 'scrollWidth' in node && 'addEventListener' in node;
}

const SOURCE_FADE_PAD = 8;

function revealInSourceRow(node: HTMLElement): void {
  node.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  const scroller = node.closest('[data-source-chips]');
  if (!(scroller instanceof HTMLElement)) return;
  if (scroller.scrollWidth - scroller.clientWidth <= 1) return;
  const chip = node.getBoundingClientRect();
  const box = scroller.getBoundingClientRect();
  if (chip.right > box.right - SOURCE_FADE_PAD) {
    scroller.scrollLeft += chip.right - (box.right - SOURCE_FADE_PAD);
  } else if (chip.left < box.left + SOURCE_FADE_PAD) {
    scroller.scrollLeft -= box.left + SOURCE_FADE_PAD - chip.left;
  }
}

function useSourceFade(): { ref: { current: ComponentRef<typeof View> | null }; fade: SourceFade } {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const [fade, setFade] = useState<SourceFade>('none');
  useEffect(() => {
    const el = ref.current;
    if (!isScrollNode(el)) return;
    const node = el;
    const update = () => {
      const overflow = node.scrollWidth - node.clientWidth > 1;
      if (!overflow) {
        setFade('none');
        return;
      }
      const left = node.scrollLeft > 1;
      const right = node.scrollLeft + node.clientWidth < node.scrollWidth - 1;
      const next: SourceFade = left && right ? 'both' : right ? 'right' : left ? 'left' : 'none';
      setFade(next);
    };
    update();
    node.addEventListener('scroll', update);
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null;
    observer?.observe(node);
    return () => {
      node.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, []);
  return { ref, fade };
}

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
  const sourceRow = useSourceFade();

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
            <View
              ref={group.key === 'source' ? sourceRow.ref : undefined}
              style={[styles.chips, group.key === 'source' && styles.chipsNowrap]}
              {...(group.key === 'source'
                ? viewWeb({ dataSet: { sourceChips: 'true', sourceFade: sourceRow.fade } })
                : {})}
            >
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
                    reveal={group.key === 'source'}
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
  reveal,
  onToggle,
  testID,
  accessibilityLabel,
}: {
  label: string;
  selected: boolean;
  muted: boolean;
  reveal: boolean;
  onToggle: () => void;
  testID: string;
  accessibilityLabel: string;
}) {
  const ref = useRef<ComponentRef<typeof Pressable>>(null);
  const toggleRef = useRef(onToggle);
  toggleRef.current = onToggle;

  useEffect(() => {
    const el = ref.current;
    if (!isScrollNode(el)) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Spacebar') return;
      event.preventDefault();
      toggleRef.current();
    };
    const onFocus = () => {
      if (reveal) revealInSourceRow(el);
    };
    el.addEventListener('keydown', onKeyDown);
    el.addEventListener('focus', onFocus);
    return () => {
      el.removeEventListener('keydown', onKeyDown);
      el.removeEventListener('focus', onFocus);
    };
  }, [reveal]);

  return (
    <Pressable
      ref={ref}
      onPress={() => {
        onToggle();
        if (reveal && isScrollNode(ref.current)) revealInSourceRow(ref.current);
      }}
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
  chipsNowrap: {
    flexWrap: 'nowrap',
    minWidth: 0,
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
