import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radii, shadows } from '@/src/theme';

export function StoreSheet({
  visible,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const phone = width < 640;
  const touch = width < 880;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, phone && styles.backdropPhone]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={[styles.sheet, phone && styles.sheetPhone, phone && { paddingBottom: insets.bottom }]}>
          <View style={styles.head}>
            <View style={styles.titles}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={({ pressed }) => [
                styles.close,
                touch && styles.closeTouch,
                pressed && styles.closePressed,
              ]}
            >
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyInner}>
            {children}
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(13, 13, 13, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  backdropPhone: {
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    padding: 0,
  },
  sheet: {
    width: '100%',
    maxWidth: 640,
    maxHeight: '86%',
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.material,
    overflow: 'hidden',
  },
  sheetPhone: {
    width: '100%',
    maxWidth: '100%',
    maxHeight: '92%',
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  titles: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSubtle,
    marginTop: 4,
  },
  close: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.copyBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeTouch: { height: 44, minHeight: 44, minWidth: 44 },
  closePressed: { backgroundColor: '#f1f1f1' },
  closeText: { fontFamily: fonts.medium, fontSize: 12, color: colors.text },
  body: { flexGrow: 1, flexShrink: 1 },
  bodyInner: { padding: 18 },
  footer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
