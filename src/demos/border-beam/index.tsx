import { StyleSheet, Text, View } from 'react-native';
import { Stage } from '@/src/components/Stage';
import { colors, fonts } from '@/src/theme';

/** Native fallback — border-beam is DOM/CSS only. */
export function BorderBeamDemo() {
  return (
    <Stage>
      <View style={styles.card}>
        <Text style={styles.label}>Border Beam</Text>
        <Text style={styles.hint}>Open on web for the beam</Text>
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 168,
    height: 120,
    borderRadius: 20,
    backgroundColor: colors.stage,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 16,
  },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textFaint,
    textAlign: 'center',
  },
});
