import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '@/src/theme';

export function PlaceholderCard({
  title,
  body,
  actionLabel,
}: {
  title: string;
  body: string;
  actionLabel?: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.stage}>
        <View style={styles.plus}>
          <Text style={styles.plusText}>+</Text>
        </View>
        <Text style={styles.stageLabel}>{title}</Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{body}</Text>
        {actionLabel ? (
          <Pressable
            disabled
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            style={styles.slot}
          >
            <Text style={styles.slotText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderStyle: 'dashed',
    padding: 12,
  },
  stage: {
    height: 220,
    borderRadius: radii.stage,
    backgroundColor: colors.stage,
    borderWidth: 1,
    borderColor: colors.stageBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  plus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    fontFamily: fonts.medium,
    fontSize: 20,
    color: colors.textMuted,
    marginTop: -2,
  },
  stageLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textFaint,
  },
  meta: { paddingHorizontal: 8, paddingTop: 14, paddingBottom: 6, gap: 4 },
  title: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSubtle,
  },
  slot: {
    alignSelf: 'flex-start',
    marginTop: 10,
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.copyBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotText: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted },
});
