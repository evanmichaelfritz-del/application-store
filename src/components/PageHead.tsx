import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/src/theme';

export function PageHead({ title, count }: { title: string; count: number }) {
  const noun = count === 1 ? 'asset' : 'assets';
  return (
    <View style={styles.wrap}>
      <Text style={styles.crumb}>Components / {title}</Text>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.count}>
        {count} {noun}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 0,
  },
  crumb: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSubtle,
    marginBottom: 8,
  },
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
});
