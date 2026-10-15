import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { ThumbStill } from '@/src/components/AssetStill';
import { ASSET_META, assetHref, typeLabel } from '@/src/library/taxonomy';
import {
  addedGroups,
  COLLAPSED_DAYS,
  COLLAPSED_ITEMS,
  type AddedDay,
} from '@/src/library/recentlyAdded';
import { pressableWeb, textWeb, viewWeb } from '@/src/library/webProps';
import { colors, fonts, radii } from '@/src/theme';
import type { TransitionItem } from '@/src/catalog';

const EXPAND_KEY = 'store.addedExpanded';

function readExpanded(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  try {
    return sessionStorage.getItem(EXPAND_KEY) === '1';
  } catch {
    return false;
  }
}

function writeExpanded(open: boolean) {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(EXPAND_KEY, open ? '1' : '0');
  } catch {
    // Ignore a full or blocked session store. The toggle still applies in memory.
  }
}

export function RecentlyAdded() {
  const [open, setOpen] = useState(readExpanded);
  const [opened, setOpened] = useState<Readonly<Record<string, true>>>({});
  const [viewHover, setViewHover] = useState(false);
  const groups = addedGroups();
  const visible = open ? groups : groups.slice(0, COLLAPSED_DAYS);
  const initialKey = groups.length > 0 ? groups[groups.length - 1].key : '';
  const grown = open || Object.keys(opened).length > 0;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    writeExpanded(next);
  };

  return (
    <View testID="recently-added" style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.heading}>Recently added</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={open ? 'Show less' : 'View all'}
          accessibilityState={{ expanded: open }}
          testID="added-view-all"
          onPress={toggle}
          onHoverIn={() => setViewHover(true)}
          onHoverOut={() => setViewHover(false)}
          {...pressableWeb({ dataSet: { focusRing: 'true', addedView: 'true' } })}
          style={styles.viewAll}
        >
          <Text
            style={[styles.viewAllText, viewHover && styles.viewAllTextHover]}
            {...textWeb({ dataSet: { addedViewLabel: 'true' } })}
          >
            {open ? 'Show less' : 'View all'}
          </Text>
          <View {...viewWeb({ dataSet: { addedChevron: open ? 'open' : 'closed' } })}>
            <Ionicons name="chevron-down" size={14} color={viewHover ? colors.text : colors.textSubtle} />
          </View>
        </Pressable>
      </View>
      <View {...viewWeb({ dataSet: { addedStrip: grown ? 'open' : 'closed' } })} style={styles.box}>
        {visible.map((group, index) => (
          <DayRow
            key={group.key}
            group={group}
            first={index === 0}
            open={open}
            initial={group.key === initialKey}
            expanded={opened[group.key] === true}
            onMore={() => setOpened((current) => ({ ...current, [group.key]: true }))}
          />
        ))}
      </View>
    </View>
  );
}

function DayRow({
  group,
  first,
  open,
  initial,
  expanded,
  onMore,
}: {
  group: AddedDay;
  first: boolean;
  open: boolean;
  initial: boolean;
  expanded: boolean;
  onMore: () => void;
}) {
  const library = open && initial;
  const showAll = open || expanded;
  const items = showAll ? group.items : group.items.slice(0, COLLAPSED_ITEMS);
  const hidden = group.items.length - items.length;
  return (
    <View style={[styles.row, showAll && !library && styles.rowTop, !first && styles.rowRule]}>
      <View style={styles.rail}>
        <Text style={styles.date}>{group.rail}</Text>
        <Text style={styles.detail}>{group.detail}</Text>
      </View>
      {library ? (
        <Link href="/" asChild>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Initial library: ${group.items.length} assets`}
            testID={`added-library-${group.key}`}
            {...pressableWeb({ dataSet: { focusRing: 'true' } })}
            style={styles.library}
          >
            <Text style={styles.libraryText}>Initial library: {group.items.length} assets</Text>
          </Pressable>
        </Link>
      ) : (
        <View style={[styles.items, showAll && styles.itemsWrap]}>
          {items.map((item) => (
            <StripItem key={item.id} item={item} />
          ))}
          {hidden > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Show ${hidden} more`}
              testID={`added-more-${group.key}`}
              onPress={onMore}
              {...pressableWeb({ dataSet: { focusRing: 'true' } })}
              style={(state) => {
                const hover = Boolean((state as { hovered?: boolean }).hovered);
                return [styles.more, hover && styles.moreHover, state.pressed && styles.morePressed];
              }}
            >
              <Text style={styles.moreText}>+{hidden} more</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

function StripItem({ item }: { item: TransitionItem }) {
  const label = typeLabel(ASSET_META[item.id]?.type ?? null) ?? '';
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <Link href={assetHref(item.id)} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={item.title}
        testID={`added-item-${item.id}`}
        onHoverIn={() => setHover(true)}
        onHoverOut={() => {
          setHover(false);
          setPressed(false);
        }}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        {...pressableWeb({ dataSet: { focusRing: 'true' } })}
        style={StyleSheet.flatten([
          styles.item,
          hover && !pressed && styles.itemHover,
          pressed && styles.itemPressed,
        ])}
      >
        <View style={styles.thumb}>
          <ThumbStill item={item} size={44} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.name} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.type} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  header: { height: 24, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20, color: colors.text },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 4, cursor: 'pointer' },
  viewAllText: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.textSubtle },
  viewAllTextHover: { color: colors.text },
  box: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.card,
    backgroundColor: colors.card,
    paddingVertical: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, gap: 0 },
  rowTop: { alignItems: 'flex-start' },
  rowRule: { borderTopWidth: 1, borderTopColor: colors.cardBorder },
  rail: { width: 120, paddingRight: 8, flexShrink: 0 },
  date: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, color: colors.textMuted },
  detail: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 14, color: colors.textFaint, marginTop: 2 },
  items: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 0 },
  itemsWrap: { flexWrap: 'wrap' },
  item: {
    width: 180,
    height: 56,
    flexGrow: 0,
    flexShrink: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
    borderRadius: radii.material,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    padding: 6,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer',
  },
  itemHover: { backgroundColor: colors.stage, borderColor: 'rgba(0,0,0,0.12)' },
  itemPressed: { backgroundColor: '#f1f1f1' },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.stage,
    borderWidth: 1,
    borderColor: colors.stageBorder,
  },
  copy: { flex: 1, minWidth: 0 },
  name: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.text },
  type: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14, color: colors.textMuted },
  more: {
    height: 56,
    flexGrow: 0,
    flexShrink: 0,
    paddingHorizontal: 12,
    borderRadius: radii.material,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  moreHover: { backgroundColor: colors.stage },
  morePressed: { backgroundColor: '#f1f1f1' },
  moreText: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
  library: { flex: 1, minHeight: 32, justifyContent: 'center', cursor: 'pointer' },
  libraryText: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.text },
});
