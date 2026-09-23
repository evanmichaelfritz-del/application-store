import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radii } from '../theme';
import { useReduceMotion } from '../context/ReduceMotionContext';

export function TopNav() {
  const { forceReduceMotion, setForceReduceMotion } = useReduceMotion();
  const { width } = useWindowDimensions();
  const phone = width < 640;
  const touch = width < 880;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!phone) setMenuOpen(false);
  }, [phone]);

  if (phone) {
    return (
      <>
        <View style={[styles.bar, styles.barPhone]}>
          <View style={[styles.brandRow, styles.brandRowPhone]}>
            <View style={styles.mark} />
            <Text style={[styles.brand, styles.brandPhone]} numberOfLines={1}>
              Application Store
            </Text>
          </View>
          <Pressable
            onPress={() => setMenuOpen(true)}
            style={styles.menuBtn}
            accessibilityRole="button"
            accessibilityLabel="Menu"
          >
            <Text style={styles.menuGlyph}>⋯</Text>
          </Pressable>
        </View>
        <Modal
          visible={menuOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuOpen(false)}
        >
          <View style={styles.menuBackdrop}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setMenuOpen(false)}
              accessibilityLabel="Close menu"
            />
            <View style={[styles.menuSheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
              <Pressable
                onPress={() => {
                  setMenuOpen(false);
                  router.push('/playground');
                }}
                style={styles.menuItem}
                accessibilityRole="link"
                accessibilityLabel="Playground"
              >
                <Text style={styles.menuItemText}>Playground</Text>
              </Pressable>
              <Pressable
                onPress={() => setForceReduceMotion(!forceReduceMotion)}
                style={[styles.menuItem, forceReduceMotion && styles.menuItemOn]}
                accessibilityRole="switch"
                accessibilityState={{ checked: forceReduceMotion }}
                accessibilityLabel="Reduce Motion"
              >
                <Text style={[styles.menuItemText, forceReduceMotion && styles.menuItemTextOn]}>
                  Reduce Motion
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMenuOpen(false)}
                style={styles.menuItem}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text style={styles.menuItemText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <View style={styles.bar}>
      <View style={styles.brandRow}>
        <View style={styles.mark} />
        <Text style={styles.brand}>Application Store</Text>
      </View>
      <View style={styles.links}>
        <Text style={styles.link}>Master storefront</Text>
        <Link href="/playground" asChild>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Playground"
            style={touch ? styles.linkHit : undefined}
          >
            <Text style={styles.linkStrong}>Playground</Text>
          </Pressable>
        </Link>
        <Pressable
          onPress={() => setForceReduceMotion(!forceReduceMotion)}
          style={[styles.toggle, touch && styles.toggleTouch, forceReduceMotion && styles.toggleOn]}
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
    backgroundColor: colors.bg,
  },
  barPhone: {
    flexWrap: 'nowrap',
    paddingHorizontal: 16,
    paddingVertical: 0,
    minHeight: 44,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandRowPhone: { flexShrink: 1, minWidth: 0 },
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
  brandPhone: { flexShrink: 1 },
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
  linkHit: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
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
  toggleTouch: { height: 44, minWidth: 44 },
  toggleOn: { backgroundColor: colors.text, borderColor: colors.text },
  toggleText: { fontFamily: fonts.medium, fontSize: 12, color: colors.text },
  toggleTextOn: { color: colors.proFg },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuGlyph: {
    fontFamily: fonts.medium,
    fontSize: 22,
    lineHeight: 26,
    color: colors.text,
    marginTop: -2,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(13, 13, 13, 0.28)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    paddingTop: 12,
    paddingHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.cardBorder,
  },
  menuItem: {
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.copyBg,
  },
  menuItemOn: { backgroundColor: colors.text, borderColor: colors.text },
  menuItemText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  menuItemTextOn: { color: colors.proFg },
});
