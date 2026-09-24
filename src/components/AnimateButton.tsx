import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../theme';

export function AnimateButton({ onPress, label = 'Animate' }: { onPress: () => void; label?: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={(state) => {
        const hover = Boolean((state as { hovered?: boolean }).hovered);
        return [
          styles.btn,
          styles.pointer,
          hover && styles.hover,
          state.pressed && styles.pressed,
        ];
      }}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pointer: { cursor: 'pointer' },
  btn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: colors.animateBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hover: { backgroundColor: '#d9d9e2', borderColor: 'rgba(0,0,0,0.35)' },
  pressed: { backgroundColor: '#b7b7c2', borderColor: 'rgba(0,0,0,0.5)' },
  label: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.animateText,
  },
});
