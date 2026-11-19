import { StyleSheet, Text, View } from 'react-native';
import { Stage } from '@/src/components/Stage';
import { colors, fonts } from '@/src/theme';

/** Native stand-in. The glass runs on web. */
export function GlisseDemo() {
  return (
    <Stage>
      <View style={styles.card} testID="glisse-native">
        <Text style={styles.label}>Glisse</Text>
        <Text style={styles.hint}>Open on web to drag the glass</Text>
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#0c0c0c',
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
