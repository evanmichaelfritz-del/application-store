import { StyleSheet, Text, View } from 'react-native';
import { Stage } from '@/src/components/Stage';
import { colors, fonts } from '@/src/theme';

/** Native stand-in. The arc runs on web. */
export function ArcChargeDemo() {
  return (
    <Stage>
      <View style={styles.card} testID="arc-charge-native">
        <Text style={styles.label}>Arc Charge</Text>
        <Text style={styles.hint}>Open on web to play the arc</Text>
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#070503',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 16,
  },
  label: { fontFamily: fonts.medium, fontSize: 14, color: colors.proFg },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    color: '#8d8d92',
    textAlign: 'center',
  },
});
