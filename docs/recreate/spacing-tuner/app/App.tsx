import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { SpacingTuner } from './src/spacing-tuner';

export default function App() {
  const { width, height } = useWindowDimensions();
  // Fit the 4:3 stage inside the viewport.
  const w = Math.min(width, (height * 4) / 3);
  return (
    <View style={styles.page}>
      <View style={{ width: w, height: (w * 3) / 4 }}>
        <SpacingTuner />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F3F3F3', alignItems: 'center', justifyContent: 'center' },
});
