import { StyleSheet, Text, View } from 'react-native';
import { Stage } from '@/src/components/Stage';
import { colors, fonts } from '@/src/theme';

/** Native fallback. The physics board is the web card. */
export function DragDropDemo() {
  return (
    <Stage>
      <View style={styles.board}>
        <View style={styles.zone}>
          <Text style={styles.label}>Drag & drop</Text>
          <Text style={styles.label}>it here</Text>
        </View>
        <View style={styles.chip} />
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  board: { width: 213, height: 192, position: 'relative' },
  zone: {
    position: 'absolute',
    left: 0,
    top: 88,
    width: 104,
    height: 104,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'rgba(234,234,234,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 15, color: 'rgba(0,0,0,0.45)', textAlign: 'center' },
  chip: {
    position: 'absolute',
    left: 141,
    top: 0,
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: colors.skeleton,
  },
});
