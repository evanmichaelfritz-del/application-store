import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, Stack } from 'expo-router';
import { LeftNav } from '@/src/components/LeftNav';
import { TopNav } from '@/src/components/TopNav';
import { installStoreChromeCss } from '@/src/library/storeChromeCss';
import { EMPTY_FILTERS } from '@/src/library/taxonomy';
import { colors, fonts } from '@/src/theme';

export default function NotFound() {
  installStoreChromeCss();
  const { width } = useWindowDimensions();
  const compact = width < 880;
  const phone = width < 640;
  const nav = <LeftNav typeSlug={null} filters={EMPTY_FILTERS} compact={compact} idle />;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = 'Asset not found · Application Store';
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
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
            <Text style={styles.title} accessibilityRole="header" testID="asset-not-found">
              Asset not found
            </Text>
            <Link href="/" style={styles.link} testID="not-found-all">
              All assets
            </Link>
          </ScrollView>
        </View>
      </SafeAreaView>
    </>
  );
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
  title: {
    fontFamily: fonts.semibold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.4,
    color: colors.text,
    marginBottom: 12,
  },
  link: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    textDecorationLine: 'underline',
    alignSelf: 'flex-start',
  },
});
