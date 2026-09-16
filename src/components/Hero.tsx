import { StyleSheet, Text, View } from 'react-native';
import { SECTION_COPY, type NavSection } from '@/src/sections';
import { colors, fonts } from '../theme';

export function Hero({ section }: { section: NavSection }) {
  const copy = SECTION_COPY[section];
  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>Application Store</Text>
      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.sub}>{copy.subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    maxWidth: 720,
  },
  kicker: {
    fontFamily: fonts.medium,
    fontSize: 12,
    letterSpacing: 0.4,
    color: colors.textFaint,
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -1.2,
    color: colors.text,
    marginBottom: 12,
  },
  sub: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
  },
});
