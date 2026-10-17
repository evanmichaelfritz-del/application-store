import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { SpacingTuner } from './src/spacing-tuner';

// Test harness only: freezes the scene at the time given after '#t='.
export default function ParityApp() {
  const { width, height } = useWindowDimensions();
  const m = typeof window !== 'undefined' ? /t=([\d.]+)/.exec(window.location.hash) : null;
  const t = m ? parseFloat(m[1]) : undefined;
  const w = Math.min(width, (height * 4) / 3);
  return (
    <View style={{ flex: 1, backgroundColor: '#F3F3F3', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: w, height: (w * 3) / 4 }}>
        <SpacingTuner time={t} autoPlay={t === undefined} interactive={typeof window !== "undefined" && window.location.hash.includes("i=1")} />
      </View>
    </View>
  );
}
