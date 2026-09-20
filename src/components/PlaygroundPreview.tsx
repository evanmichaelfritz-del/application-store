import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/src/theme';

/** Native fallback — HTML iframe preview is web-only. */
export function PlaygroundPreview({ html: _html }: { html: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Preview is web-only</Text>
      <Text style={styles.body}>
        Open Application Store on web to run closed-network HTML recreations in the iframe
        playground.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 220,
    borderRadius: 14,
    backgroundColor: colors.stage,
    borderWidth: 1,
    borderColor: colors.stageBorder,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  title: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
  body: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSubtle,
    textAlign: 'center',
  },
});
