import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../theme';

export function AnimateButton({ onPress, label = 'Animate' }: { onPress: () => void; label?: string }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, pressed && styles.pressed]} accessibilityRole="button">
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.animateBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: '#eae9e9' },
  label: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.animateText,
  },
});
