import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { colors, fonts } from '../theme';
import { useReduceMotion } from '../context/ReduceMotionContext';

export function TopNav() {
  const { forceReduceMotion, setForceReduceMotion } = useReduceMotion();

  return (
    <View style={styles.bar}>
      <View style={styles.brandRow}>
        <View style={styles.mark} />
        <Text style={styles.brand}>Application Store</Text>
      </View>
      <View style={styles.links}>
        <Text style={styles.link}>Master storefront</Text>
        <Link href="/playground" asChild>
          <Pressable accessibilityRole="link" accessibilityLabel="Playground">
            <Text style={styles.linkStrong}>Playground</Text>
          </Pressable>
        </Link>
        <Pressable
          onPress={() => setForceReduceMotion(!forceReduceMotion)}
          style={[styles.toggle, forceReduceMotion && styles.toggleOn]}
          accessibilityRole="switch"
          accessibilityState={{ checked: forceReduceMotion }}
          accessibilityLabel="Reduce Motion"
        >
          <Text style={[styles.toggleText, forceReduceMotion && styles.toggleTextOn]}>
            Reduce Motion
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mark: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.text,
  },
  brand: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
    letterSpacing: -0.3,
  },
  links: { flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  link: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  linkStrong: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.text,
  },
  toggle: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: colors.text, borderColor: colors.text },
  toggleText: { fontFamily: fonts.medium, fontSize: 12, color: colors.text },
  toggleTextOn: { color: colors.proFg },
});
