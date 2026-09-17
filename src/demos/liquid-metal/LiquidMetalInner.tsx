import { Canvas } from '@shopify/react-native-skia';
import { StyleSheet, View } from 'react-native';

import { AutoPill, SendButton } from '@/src/libdev/Controls';
import type { DemoProps } from '@/src/libdev/tokens';
import { useLatchedLayout } from '@/src/libdev/useLatchedLayout';
import { useLoopProgress } from '@/src/libdev/useLoopProgress';

import { LiquidMetalBorder } from './LiquidMetalBorder';

export default function LiquidMetalInner({ reducedMotion, clockRunning }: DemoProps) {
  const progress = useLoopProgress(3400, reducedMotion, 0.28, clockRunning);
  const auto = useLatchedLayout({ w: 78, h: 36 });

  return (
    <View style={[styles.root, { pointerEvents: 'none' }]}>
      <View style={styles.row}>
        <View collapsable={false} style={styles.autoWrap} onLayout={auto.onLayout}>
          <Canvas collapsable={false} style={styles.canvasFill}>
            <LiquidMetalBorder
              x={3}
              y={3}
              width={Math.max(4, auto.box.w - 6)}
              height={Math.max(4, auto.box.h - 6)}
              r={(auto.box.h - 6) / 2}
              progress={progress}
              thickness={4.5}
            />
          </Canvas>
          <View style={styles.autoInner}>
            <AutoPill />
          </View>
        </View>

        <View style={styles.sendWrap}>
          <Canvas collapsable={false} style={styles.canvasFill}>
            <LiquidMetalBorder
              x={3}
              y={3}
              width={46}
              height={46}
              r={23}
              progress={progress}
              thickness={5.5}
            />
          </Canvas>
          <View style={styles.sendInner}>
            <SendButton size={34} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  autoWrap: {
    padding: 8,
  },
  autoInner: {
    padding: 4,
  },
  sendWrap: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
});
