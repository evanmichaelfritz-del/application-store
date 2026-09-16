import { StyleSheet, View } from 'react-native';
import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { Stage } from '@/src/components/Stage';

export function GooeyPlusMenuDemo() {
  return (
    <Stage>
      <View style={styles.wrap}>
        <WithSkiaWeb
          getComponent={() => require('./GooeySkia')}
          fallback={null}
          opts={{ locateFile: (file) => `/${file}` }}
        />
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 200, height: 160 },
});
