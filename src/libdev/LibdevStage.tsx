import { StyleSheet, View } from 'react-native';
import { Stage } from '@/src/components/Stage';
import { libdevColors } from './tokens';

/** Dark demo slot from the libraries.dev recreate, hosted in the store Stage. */
export function LibdevStage({ children }: { children: React.ReactNode }) {
  return (
    <Stage>
      <View style={styles.fill}>{children}</View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  fill: {
    width: '100%',
    height: '100%',
    backgroundColor: libdevColors.demo,
  },
});
