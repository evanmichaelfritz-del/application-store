import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SECTION_COPY, type NavSection } from '@/src/sections';
import { colors, fonts } from '../theme';

export function Hero({ section }: { section: NavSection }) {
  const { width } = useWindowDimensions();
  const phone = width < 640;
  const copy = SECTION_COPY[section];
  return (
    <View style={[styles.wrap, phone && styles.wrapPhone]}>
      {phone ? null : <Text style={styles.kicker}>Application Store</Text>}
      <Text style={[styles.title, phone && styles.titlePhone]}>{copy.title}</Text>
      <Text style={[styles.sub, phone && styles.subPhone]}>{copy.subtitle}</Text>
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
  wrapPhone: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
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
  titlePhone: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.8,
  },
  sub: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
  },
  subPhone: {
    fontSize: 15,
    lineHeight: 22,
  },
});
