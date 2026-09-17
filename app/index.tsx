import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FilterBar } from '@/src/components/FilterBar';
import { Hero } from '@/src/components/Hero';
import { LeftNav } from '@/src/components/LeftNav';
import { PlaceholderCard } from '@/src/components/PlaceholderCard';
import { TopNav } from '@/src/components/TopNav';
import { TransitionCard } from '@/src/components/TransitionCard';
import {
  matchesFilter,
  matchesSearch,
  matchesSection,
  TRANSITIONS,
  type FilterKey,
} from '@/src/catalog';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { layoutTransition } from '@/src/motion';
import { SECTION_COPY, type NavSection } from '@/src/sections';
import { colors } from '@/src/theme';

export default function StoreScreen() {
  const [section, setSection] = useState<NavSection>('transitions');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');
  const { reduceMotion } = useReduceMotion();
  const { width } = useWindowDimensions();
  const compact = width < 880;
  const columns = width >= 1180 ? 3 : width >= 880 ? 2 : 1;
  const sectionItems = useMemo(
    () => TRANSITIONS.filter((item) => matchesSection(item, section)),
    [section],
  );
  const items = useMemo(
    () => sectionItems.filter((item) => matchesFilter(item, filter) && matchesSearch(item, query)),
    [filter, query, sectionItems],
  );
  const empty = SECTION_COPY[section].empty;
  const filteredOut = sectionItems.length > 0 && items.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <TopNav />
      <View style={[styles.body, compact && styles.bodyStack]}>
        <LeftNav value={section} onChange={setSection} compact={compact} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.page}
          showsVerticalScrollIndicator={false}
        >
          <Hero section={section} />
          <FilterBar value={filter} onChange={setFilter} query={query} onQueryChange={setQuery} />
          <View style={styles.grid}>
            {items.map((item) => (
              <Animated.View
                key={item.id}
                layout={layoutTransition(reduceMotion)}
                style={[styles.cell, { width: `${100 / columns}%` as `${number}%` }]}
              >
                <TransitionCard item={item} />
              </Animated.View>
            ))}
            {items.length === 0 ? (
              <View style={[styles.cell, { width: `${100 / Math.min(columns, 2)}%` as `${number}%` }]}>
                <PlaceholderCard
                  title={
                    filteredOut ? 'No matches' : section === 'manual' ? 'Add a piece' : 'Empty section'
                  }
                  body={
                    filteredOut
                      ? 'No pieces match this filter or search in this section.'
                      : empty
                  }
                  actionLabel={!filteredOut && section === 'manual' ? 'Manual add slot' : undefined}
                />
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, overflow: 'visible' },
  body: { flex: 1, flexDirection: 'row' },
  bodyStack: { flexDirection: 'column' },
  scroll: { flex: 1 },
  page: {
    maxWidth: 1120,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 80,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  cell: { padding: 8 },
});
