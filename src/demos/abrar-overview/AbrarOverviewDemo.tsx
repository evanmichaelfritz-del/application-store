import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stage } from '@/src/components/Stage';
import { OverviewShell } from './OverviewShell';

const CANVAS_WIDTH = 1440;

/**
 * Static gallery preview: the Overview shell laid out at 1440px and scaled
 * to the card width. No motion, replay, or reveal control.
 */
export function AbrarOverviewDemo() {
  const [width, setWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const scale = width > 0 ? width / CANVAS_WIDTH : 0;
  const scaledHeight = scale > 0 && canvasHeight > 0 ? Math.round(canvasHeight * scale) : 0;

  return (
    <Stage
      style={
        scaledHeight > 0
          ? { height: scaledHeight, alignItems: 'stretch', justifyContent: 'flex-start' }
          : undefined
      }
    >
      <View
        testID="abrar-overview-preview"
        style={[styles.clip, scaledHeight > 0 ? { height: scaledHeight } : null]}
        onLayout={(event) => {
          const next = Math.round(event.nativeEvent.layout.width);
          if (next > 0 && Math.abs(next - width) > 1) setWidth(next);
        }}
      >
        <View
          style={[
            styles.canvas,
            {
              transform: [{ scale: scale > 0 ? scale : 1 }],
              transformOrigin: 'top left',
            },
          ]}
        >
          <View
            onLayout={(event) => {
              const next = Math.round(event.nativeEvent.layout.height);
              if (next > 0 && Math.abs(next - canvasHeight) > 1) setCanvasHeight(next);
            }}
          >
            <OverviewShell />
          </View>
        </View>
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  clip: {
    width: '100%',
    overflow: 'hidden',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CANVAS_WIDTH,
  },
});
