import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { CRAFT_APPS, CRAFT_CATEGORY_LABEL, CRAFT_CATEGORY_SLUG } from '@/src/library/craftApps';
import {
  EMPTY_FILTERS,
  galleryHref,
  totalAssets,
  typeCount,
  VISIBLE_TYPES,
  type ComponentType,
  type GalleryFilters,
} from '@/src/library/taxonomy';
import { pressableWeb, textWeb, viewWeb } from '@/src/library/webProps';
import { colors, fonts } from '@/src/theme';

type RowKey = 'all' | 'apps' | ComponentType;

const NAV_ROW_HOVER = '#f1f1f1';
const NAV_SELECTED = '#e0e0e0';
const NAV_SELECTED_HOVER = '#d4d4d4';

export function LeftNav({
  typeSlug,
  filters,
  compact,
  idle = false,
}: {
  typeSlug: string | null;
  filters: GalleryFilters;
  compact: boolean;
  idle?: boolean;
}) {
  const matched = VISIBLE_TYPES.find((type) => type.slug === typeSlug)?.slug;
  const active: RowKey | null = idle ? null : typeSlug === CRAFT_CATEGORY_SLUG ? 'apps' : (matched ?? 'all');
  const [railHover, setRailHover] = useState<RowKey | null>(null);

  return (
    <View
      {...viewWeb(compact ? {} : { dataSet: { storeSidebar: 'dock' } })}
      style={[styles.rail, compact && styles.railStacked]}
    >
      <NavRow
        label="All assets"
        count={totalAssets()}
        active={active === 'all'}
        hovered={railHover === 'all'}
        href={galleryHref(null, filters)}
        testID="nav-count-all"
        onHoverIn={() => setRailHover((current) => (current === 'all' ? current : 'all'))}
        onHoverOut={() => setRailHover((current) => (current === 'all' ? null : current))}
      />
      <NavRow
        label={CRAFT_CATEGORY_LABEL}
        count={CRAFT_APPS.length}
        active={active === 'apps'}
        hovered={railHover === 'apps'}
        href={galleryHref(CRAFT_CATEGORY_SLUG, EMPTY_FILTERS)}
        testID="nav-count-apps"
        onHoverIn={() => setRailHover((current) => (current === 'apps' ? current : 'apps'))}
        onHoverOut={() => setRailHover((current) => (current === 'apps' ? null : current))}
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
          onHoverIn={() => setRailHover((current) => (current === type.slug ? current : type.slug))}
          onHoverOut={() => setRailHover((current) => (current === type.slug ? null : current))}
        />
      ))}
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
  onHoverIn,
  onHoverOut,
}: {
  label: string;
  count: number;
  active: boolean;
  hovered: boolean;
  href: ReturnType<typeof galleryHref>;
  testID: string;
  onHoverIn: () => void;
  onHoverOut: () => void;
}) {
  return (
    <Link href={href} asChild>
      <Pressable
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
          active && styles.rowOn,
          !active && hovered && styles.rowHover,
          active && hovered && styles.rowOnHover,
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
  row: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    boxSizing: 'border-box',
  },
  rowOn: {
    backgroundColor: NAV_SELECTED,
  },
  rowOnHover: {
    backgroundColor: NAV_SELECTED_HOVER,
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
