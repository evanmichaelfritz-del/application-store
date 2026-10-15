import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { TRANSITIONS } from '@/src/catalog';
import { EmptyResults } from '@/src/components/EmptyResults';
import { FilterBar } from '@/src/components/FilterBar';
import { LeftNav } from '@/src/components/LeftNav';
import { PageHead } from '@/src/components/PageHead';
import { TopNav } from '@/src/components/TopNav';
import { TransitionCard } from '@/src/components/TransitionCard';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { installStoreChromeCss } from '@/src/library/storeChromeCss';
import {
  EMPTY_FILTERS,
  matchesGallery,
  readFilters,
  replaceGalleryQuery,
  sameFilters,
  totalAssets,
  typeCount,
  typeLabel,
  type ComponentType,
  type GalleryFilters,
} from '@/src/library/taxonomy';
import { layoutTransition } from '@/src/motion';
import { colors } from '@/src/theme';

export function StoreGallery({ typeSlug }: { typeSlug: ComponentType | null }) {
  installStoreChromeCss();
  const { reduceMotion } = useReduceMotion();
  const { width } = useWindowDimensions();
  const phone = width < 640;
  const compact = width < 880;
  const columns = width >= 1180 ? 3 : width >= 880 ? 2 : 1;
  const [filters, setFilters] = useState<GalleryFilters>(readFilters);
  const title = typeSlug ? (typeLabel(typeSlug) ?? 'All assets') : 'All assets';
  const total = typeSlug ? typeCount(typeSlug) : totalAssets();
  const items = TRANSITIONS.filter((item) => matchesGallery(item, typeSlug, filters));

  const syncFromUrl = useCallback(() => {
    const next = readFilters();
    setFilters((prev) => (sameFilters(prev, next) ? prev : next));
  }, []);

  useFocusEffect(
    useCallback(() => {
      syncFromUrl();
    }, [syncFromUrl]),
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPop = () => syncFromUrl();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [syncFromUrl]);

  const onFilters = (next: GalleryFilters) => {
    setFilters(next);
    replaceGalleryQuery(next);
  };

  const clearFilters = () => onFilters(EMPTY_FILTERS);

  const nav = <LeftNav typeSlug={typeSlug} filters={filters} compact={compact} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <TopNav />
      <View style={styles.body}>
        {compact ? null : nav}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.page, phone && styles.pagePhone]}
          showsVerticalScrollIndicator={false}
        >
          {compact ? nav : null}
          <PageHead title={title} count={total} />
          <FilterBar
            typeSlug={typeSlug}
            typeName={typeSlug ? title : null}
            total={total}
            filters={filters}
            onChange={onFilters}
          />
          {items.length === 0 ? (
            <EmptyResults onClear={clearFilters} />
          ) : (
            <View style={styles.grid}>
              {items.map((item) => (
                <Animated.View
                  key={item.id}
                  layout={layoutTransition(reduceMotion)}
                  style={[styles.cell, cellStyle(columns, Boolean(item.fullRow))]}
                >
                  <TransitionCard item={item} />
                </Animated.View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function cellStyle(columns: number, fullRow: boolean): ViewStyle {
  if (fullRow || columns <= 1) return { width: '100%' };
  const gaps = (columns - 1) * 16;
  // 1280 viewport: 240 sidebar and 32px page padding each side. The grid is 976px,
  // so this percent matches calc((100% - gaps) / columns) at that width.
  const gridAt1280 = 976;
  const share = ((gridAt1280 - gaps) / columns / gridAt1280) * 100;
  return { width: `${share}%` };
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
  body: { flex: 1, flexDirection: 'row', minHeight: 0 },
  scroll: { flex: 1, minWidth: 0 },
  page: {
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'flex-start',
    paddingTop: 24,
    paddingHorizontal: 32,
    paddingBottom: 80,
    boxSizing: 'border-box',
  },
  pagePhone: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cell: {
    maxWidth: '100%',
  },
});
