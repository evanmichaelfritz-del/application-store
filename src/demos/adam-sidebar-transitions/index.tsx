import { StyleSheet, Text, View } from 'react-native';
import { Stage } from '@/src/components/Stage';
import { colors, fonts } from '@/src/theme';

/** Native stand-in. The drag sidebar runs on web. */
export function SidebarTransitionsDemo() {
  return (
    <Stage>
      <View style={styles.card} testID="adam-sidebar-native">
        <Text style={styles.label}>Sidebar transitions</Text>
        <Text style={styles.hint}>Open on web to drag the sidebar</Text>
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    height: 120,
    borderRadius: 16,
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
