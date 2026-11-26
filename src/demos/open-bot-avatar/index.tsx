import { StyleSheet, Text, View } from 'react-native';
import { Stage } from '@/src/components/Stage';
import { colors, fonts } from '@/src/theme';

/** Native stand-in. The avatar runs on web. */
export function OpenBotAvatarDemo() {
  return (
    <Stage>
      <View style={styles.card} testID="oba-native">
        <Text style={styles.label}>Open Bot Avatar</Text>
        <Text style={styles.hint}>Open on web to see the avatar</Text>
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#f3f3f4',
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
    color: '#8d8d92',
    textAlign: 'center',
  },
});
