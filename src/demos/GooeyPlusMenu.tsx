import { StyleSheet, View } from 'react-native';
import { Stage } from '@/src/components/Stage';
import GooeySkia from './GooeySkia';

export function GooeyPlusMenuDemo() {
  return (
    <Stage>
      <View style={styles.wrap}>
        <GooeySkia />
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 200, height: 160 },
});
