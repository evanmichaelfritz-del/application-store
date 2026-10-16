import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { LeftNav } from '@/src/components/LeftNav';
import { TopNav } from '@/src/components/TopNav';
import {
  CRAFT_APPS,
  CRAFT_CATEGORY_LABEL,
  CRAFT_CATEGORY_SLUG,
  EARLY_ALPHA,
} from '@/src/library/craftApps';
import { installStoreChromeCss } from '@/src/library/storeChromeCss';
import { assetHref, EMPTY_FILTERS } from '@/src/library/taxonomy';
import { pressableWeb } from '@/src/library/webProps';
import { colors, fonts, radii } from '@/src/theme';

export function AppsGallery() {
  installStoreChromeCss();
  const { width } = useWindowDimensions();
  const phone = width < 640;
  const compact = width < 880;
  const columns = width >= 1180 ? 3 : width >= 880 ? 2 : 1;
  const nav = <LeftNav typeSlug={CRAFT_CATEGORY_SLUG} filters={EMPTY_FILTERS} compact={compact} />;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = `${CRAFT_CATEGORY_LABEL} · Application Store`;
  }, []);

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
          <View style={styles.head}>
            <Text style={styles.title} accessibilityRole="header" testID="apps-heading">
              {CRAFT_CATEGORY_LABEL}
            </Text>
            <Text style={styles.count} testID="apps-count">
              {CRAFT_APPS.length} apps
            </Text>
          </View>
          <View style={styles.grid} testID="apps-grid">
            {CRAFT_APPS.map((app) => (
              <View key={app.slug} style={cellStyle(columns)}>
                <Link href={assetHref(app.slug)} asChild>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={`${app.title}. ${EARLY_ALPHA}`}
                    testID={`app-card-${app.slug}`}
                    {...pressableWeb({ dataSet: { focusRing: 'true' } })}
                    style={styles.card}
                  >
                    <Text style={styles.badge}>{EARLY_ALPHA}</Text>
                    <Text style={styles.cardTitle}>{app.title}</Text>
                    <Text style={styles.cardBody}>{app.description}</Text>
                    <Text style={styles.cardMeta}>
                      {app.releaseTag} · {app.publishedOn}
                    </Text>
                  </Pressable>
                </Link>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function cellStyle(columns: number): ViewStyle {
  if (columns <= 1) return { width: '100%' };
  const gaps = (columns - 1) * 16;
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
  pagePhone: { paddingHorizontal: 16, paddingTop: 16 },
  head: { marginBottom: 8 },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.4,
    color: colors.text,
    marginBottom: 6,
  },
  count: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    marginBottom: 18,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radii.card,
    padding: 16,
    gap: 8,
    cursor: 'pointer',
    boxSizing: 'border-box',
    minHeight: 148,
  },
  badge: {
    alignSelf: 'flex-start',
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
    backgroundColor: '#f1f1f1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  cardTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },
  cardBody: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  cardMeta: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSubtle,
    marginTop: 4,
  },
});
