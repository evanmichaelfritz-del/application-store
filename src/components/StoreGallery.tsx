import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { TRANSITIONS, type TransitionItem } from '@/src/catalog';
import { EmptyResults } from '@/src/components/EmptyResults';
import { FilterBar } from '@/src/components/FilterBar';
import { LeftNav } from '@/src/components/LeftNav';
import { PageHead } from '@/src/components/PageHead';
import { RecentlyAdded } from '@/src/components/RecentlyAdded';
import { TopNav } from '@/src/components/TopNav';
import { TransitionCard } from '@/src/components/TransitionCard';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import {
  arrivalStamp,
  clearGalleryScroll,
  isPopArrival,
  recallGalleryScroll,
  rememberGallery,
  rememberGalleryScroll,
} from '@/src/library/galleryMemory';
import { installStoreChromeCss } from '@/src/library/storeChromeCss';
import { viewWeb } from '@/src/library/webProps';
import {
  EMPTY_FILTERS,
  filtersActive,
  filtersFromParams,
  galleryPath,
  matchesGallery,
  replaceGalleryQuery,
  serializeFilters,
  totalAssets,
  typeCount,
  typeLabel,
  type ComponentType,
  type GalleryFilters,
} from '@/src/library/taxonomy';
import { layoutTransition } from '@/src/motion';
import { colors, radii } from '@/src/theme';

export function StoreGallery({ typeSlug }: { typeSlug: ComponentType | null }) {
  installStoreChromeCss();
  const { reduceMotion } = useReduceMotion();
  const { width } = useWindowDimensions();
  const phone = width < 640;
  const compact = width < 880;
  const columns = width >= 1180 ? 3 : width >= 880 ? 2 : 1;
  const routed = filtersFromParams(useLocalSearchParams());
  const routedKey = serializeFilters(routed);
  const [routeKey, setRouteKey] = useState(routedKey);
  const [filters, setFilters] = useState<GalleryFilters>(routed);
  if (routeKey !== routedKey) {
    setRouteKey(routedKey);
    setFilters(routed);
  }
  const title = typeSlug ? (typeLabel(typeSlug) ?? 'All assets') : 'All assets';
  const total = typeSlug ? typeCount(typeSlug) : totalAssets();
  const items = TRANSITIONS.filter((item) => matchesGallery(item, typeSlug, filters));
  const galleryUrl = galleryPath(typeSlug, filters);
  const gridKey = items.map((item) => item.id).join('|');
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);
  const settled = useRef(false);
  const restoreVisit = useRef(false);
  const acceptScroll = useRef(false);
  const restoredUrl = useRef<string | null>(null);
  const seenArrival = useRef('');
  const seenGrid = useRef(gridKey);
  if (seenGrid.current !== gridKey) {
    seenGrid.current = gridKey;
    settled.current = false;
  }

  const restoreScroll = useCallback((url: string) => {
    const y = recallGalleryScroll(url);
    acceptScroll.current = false;
    restoredUrl.current = url;
    scrollRef.current?.scrollTo({ y, animated: false });
    requestAnimationFrame(() => {
      if (restoredUrl.current === url) acceptScroll.current = true;
    });
  }, []);

  const applyArrival = useCallback(() => {
    if (!navigation.isFocused()) return;
    const arrival = arrivalStamp(galleryUrl);
    if (seenArrival.current === arrival) return;
    seenArrival.current = arrival;
    if (isPopArrival(galleryUrl)) {
      restoreVisit.current = true;
      if (settled.current) restoreScroll(galleryUrl);
      return;
    }
    restoreVisit.current = false;
    clearGalleryScroll(galleryUrl);
    acceptScroll.current = false;
    restoredUrl.current = galleryUrl;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    requestAnimationFrame(() => {
      if (restoredUrl.current === galleryUrl && !restoreVisit.current) acceptScroll.current = true;
    });
  }, [galleryUrl, navigation, restoreScroll]);

  useLayoutEffect(() => {
    applyArrival();
    return navigation.addListener('focus', applyArrival);
  }, [applyArrival, navigation]);

  useFocusEffect(
    useCallback(() => {
      const frame = requestAnimationFrame(() => {
        replaceGalleryQuery(filters);
        rememberGallery(typeSlug, filters);
      });
      return () => cancelAnimationFrame(frame);
    }, [filters, typeSlug]),
  );

  const onGridSettled = useCallback(() => {
    settled.current = true;
    if (restoreVisit.current) restoreScroll(galleryUrl);
  }, [galleryUrl, restoreScroll]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!acceptScroll.current || restoredUrl.current !== galleryUrl) return;
    rememberGalleryScroll(galleryUrl, event.nativeEvent.contentOffset.y);
  };

  const onFilters = (next: GalleryFilters) => {
    setFilters(next);
    replaceGalleryQuery(next);
    rememberGallery(typeSlug, next);
  };

  const clearFilters = () => onFilters(EMPTY_FILTERS);
  const showStrip = typeSlug == null && !filtersActive(filters);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);

  const nav = <LeftNav typeSlug={typeSlug} filters={filters} compact={compact} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <TopNav />
      <View style={styles.body}>
        {compact ? null : nav}
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.page, phone && styles.pagePhone]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
        >
          {compact ? nav : null}
          <PageHead title={title} count={total} />
          {ready ? (showStrip ? <RecentlyAdded /> : null) : showStrip ? <StripSkeleton /> : null}
          <FilterBar
            typeSlug={typeSlug}
            typeName={typeSlug ? title : null}
            total={total}
            filters={filters}
            onChange={onFilters}
          />
          {ready ? (
            items.length === 0 ? (
              <EmptyResults onClear={clearFilters} />
            ) : (
              <ProgressiveGrid
                key={gridKey}
                items={items}
                columns={columns}
                reduceMotion={reduceMotion}
                onSettled={onGridSettled}
              />
            )
          ) : (
            <GridSkeleton columns={columns} />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const SYNC_COUNT = 12;
const CHUNK_COUNT = 6;

function scheduleIdle(work: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(() => work(), { timeout: 400 });
    return () => window.cancelIdleCallback(id);
  }
  const timer = setTimeout(work, 16);
  return () => clearTimeout(timer);
}

function ProgressiveGrid({
  items,
  columns,
  reduceMotion,
  onSettled,
}: {
  items: readonly TransitionItem[];
  columns: number;
  reduceMotion: boolean;
  onSettled: () => void;
}) {
  const total = items.length;
  const [count, setCount] = useState(() => Math.min(SYNC_COUNT, total));
  const told = useRef(false);

  useLayoutEffect(() => {
    if (told.current || count < total) return;
    told.current = true;
    onSettled();
  }, [count, onSettled, total]);

  useEffect(() => {
    if (count >= total) return;
    return scheduleIdle(() => {
      setCount((current) => Math.min(total, current + CHUNK_COUNT));
    });
  }, [count, total]);

  return (
    <View style={styles.grid}>
      {items.slice(0, count).map((item) => (
        <Animated.View
          key={item.id}
          layout={layoutTransition(reduceMotion)}
          style={[styles.cell, cellStyle(columns, Boolean(item.fullRow))]}
        >
          <TransitionCard item={item} />
        </Animated.View>
      ))}
    </View>
  );
}

function bone(style: ViewStyle) {
  return <View style={style} {...viewWeb({ dataSet: { gallerySkeleton: 'true' } })} />;
}

function StripSkeleton() {
  return (
    <View style={styles.skelSection} testID="gallery-skeleton">
      {bone(styles.skelHeader)}
      {[0, 1, 2].map((row) => (
        <View key={row} style={styles.skelRow}>
          {[0, 1, 2].map((col) => (
            <View key={col}>{bone(styles.skelItem)}</View>
          ))}
        </View>
      ))}
    </View>
  );
}

function GridSkeleton({ columns }: { columns: number }) {
  return (
    <View style={styles.grid} testID="gallery-grid-skeleton">
      {Array.from({ length: 6 }, (_, index) => (
        <View key={index} style={[styles.cell, cellStyle(columns, false), styles.skelCard]}>
          {bone(styles.skelStage)}
          {bone(styles.skelBarWide)}
          {bone(styles.skelBarNarrow)}
        </View>
      ))}
    </View>
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
  skelSection: { marginBottom: 24, gap: 12 },
  skelHeader: { width: 120, height: 14, borderRadius: 6 },
  skelRow: { flexDirection: 'row', gap: 8 },
  skelItem: { width: 180, height: 56, borderRadius: 12 },
  skelCard: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    gap: 10,
  },
  skelStage: { height: 150, borderRadius: radii.stage },
  skelBarWide: { width: '60%', height: 12, borderRadius: 6 },
  skelBarNarrow: { width: '40%', height: 12, borderRadius: 6 },
});
