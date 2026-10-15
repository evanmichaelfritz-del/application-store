import { Pressable, StyleSheet, Text, View } from 'react-native';
import { pressableWeb, textWeb } from '@/src/library/webProps';
import { colors, fonts } from '@/src/theme';

export function EmptyResults({ onClear }: { onClear: () => void }) {
  return (
    <View style={styles.panel} testID="empty-results">
      <Text style={styles.title}>No assets match</Text>
      <Text style={styles.line}>Try removing a filter.</Text>
      <Pressable
        onPress={onClear}
        accessibilityRole="button"
        accessibilityLabel="Clear all"
        testID="empty-clear"
        {...pressableWeb({ dataSet: { focusRing: 'true' } })}
        style={(state) => {
          const hover = Boolean((state as { hovered?: boolean }).hovered);
          return [
            styles.button,
            styles.pointer,
            hover && !state.pressed && styles.buttonHover,
            state.pressed && styles.buttonPressed,
          ];
        }}
      >
        <Text style={styles.buttonText} {...textWeb({ dataSet: { focusRing: 'true' } })}>
          Clear all
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    height: 240,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.12)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    boxSizing: 'border-box',
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  line: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSubtle,
    marginBottom: 8,
  },
  button: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  buttonHover: {
    backgroundColor: '#f1f1f1',
    borderColor: 'rgba(0, 0, 0, 0.12)',
  },
  buttonPressed: {
    backgroundColor: '#e0e0e0',
    borderColor: '#e0e0e0',
  },
  buttonText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.text,
  },
  pointer: {
    cursor: 'pointer',
  },
});
