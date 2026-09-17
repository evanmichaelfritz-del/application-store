import { StyleSheet, View } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import type { DemoProps } from '@/src/libdev/tokens';
import { useLatchedLayout } from '@/src/libdev/useLatchedLayout';

import { NECK_MIN, REST_X, REST_Y, TILE_H, TILE_RADIUS, TILE_W } from './constants';
import { GooeyHitSurface } from './GooeyHitSurface';

/**
 * Web Gooey: two Views + translateX/Y only. No Skia, no CSS filter/blur/shadow.
 * Pink neck is a sibling bar: layout height = tile-center span (not scaleY paint,
 * which stays 16×16 and hides under the tiles), thickness floored at NECK_MIN.
 */
function DragTile({
  dragX,
  dragY,
  originX,
  originY,
}: {
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  originX: number;
  originY: number;
}) {
  const tileStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: dragX.value }, { translateY: dragY.value }],
    };
  }, [dragX, dragY]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.lower, { left: originX + REST_X, top: originY + REST_Y }, tileStyle]}
    />
  );
}

function ThinNeck({
  dragX,
  dragY,
  originX,
  originY,
}: {
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  originX: number;
  originY: number;
}) {
  const neckStyle = useAnimatedStyle(() => {
    const ax = REST_X + dragX.value;
    const ay = REST_Y + dragY.value;
    const span = Math.hypot(ax, ay);
    // 16px thickness (12–20px band). Layout height = span so the bar is a
    // real box between tile centers — scaleY on a 16×16 paint hid under tiles.
    const thick = NECK_MIN;
    const length = Math.max(NECK_MIN, span);
    const deg = (Math.atan2(ay, ax) * 180) / Math.PI - 90;
    return {
      width: thick,
      height: length,
      opacity: 1,
      transform: [{ rotate: `${deg}deg` }],
    };
  }, [dragX, dragY]);

  return (
    <Animated.View
      pointerEvents="none"
      collapsable={false}
      testID="gooey-neck"
      style={[
        styles.neck,
        {
          left: originX + TILE_W / 2 - NECK_MIN / 2,
          top: originY + TILE_H / 2,
        },
        neckStyle,
      ]}
    />
  );
}

export default function GooeyViews({
  reducedMotion,
  dragX: dragXProp,
  dragY: dragYProp,
}: DemoProps & {
  dragX?: SharedValue<number>;
  dragY?: SharedValue<number>;
}) {
  const { box, ready, onLayout } = useLatchedLayout({ w: 0, h: 0 });
  const fallbackX = useSharedValue(0);
  const fallbackY = useSharedValue(0);
  const dragX = dragXProp ?? fallbackX;
  const dragY = dragYProp ?? fallbackY;

  const upperX = box.w / 2 - TILE_W / 2 - 12;
  const upperY = Math.max(12, box.h / 2 - TILE_H + 4);

  return (
    <View style={styles.root} onLayout={onLayout} pointerEvents="box-none">
      {ready ? (
        <>
          <View style={[styles.upper, { left: upperX, top: upperY }]} />
          <DragTile dragX={dragX} dragY={dragY} originX={upperX} originY={upperY} />
          <ThinNeck dragX={dragX} dragY={dragY} originX={upperX} originY={upperY} />
        </>
      ) : null}
      {ready && !reducedMotion ? <GooeyHitSurface dragX={dragX} dragY={dragY} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 64,
    width: '100%',
    overflow: 'visible',
  },
  upper: {
    position: 'absolute',
    width: TILE_W,
    height: TILE_H,
    borderRadius: TILE_RADIUS,
    backgroundColor: '#7c2bff',
    zIndex: 2,
  },
  lower: {
    position: 'absolute',
    width: TILE_W,
    height: TILE_H,
    borderRadius: TILE_RADIUS,
    backgroundColor: '#e11d48',
    zIndex: 2,
  },
  neck: {
    position: 'absolute',
    width: NECK_MIN,
    minWidth: NECK_MIN,
    minHeight: NECK_MIN,
    backgroundColor: '#ff4ad2',
    borderRadius: NECK_MIN / 2,
    zIndex: 3,
    overflow: 'visible',
    transformOrigin: '8px 0px',
  },
});
