import {
  Blur,
  Group,
  Paint,
  RoundedRect,
  SweepGradient,
  vec,
} from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';
import { useDerivedValue } from 'react-native-reanimated';

const METAL = ['#5CE1FF', '#FF4ECD', '#FFD166', '#7CFFB2', '#7AA2FF', '#5CE1FF'];

export function LiquidMetalBorder({
  x,
  y,
  width,
  height,
  r,
  progress,
  thickness = 5,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  r: number;
  progress: SharedValue<number>;
  thickness?: number;
}) {
  const stroke = useDerivedValue(
    () => thickness + Math.sin(progress.value * Math.PI * 2) * 1.4,
  );
  const start = useDerivedValue(() => progress.value * Math.PI * 2);
  const cx = x + width / 2;
  const cy = y + height / 2;

  return (
    <Group>
      <Group>
        <Paint>
          <Blur blur={8} />
        </Paint>
        <RoundedRect
          x={x}
          y={y}
          width={width}
          height={height}
          r={r}
          style="stroke"
          strokeWidth={stroke}
        >
          <SweepGradient c={vec(cx, cy)} colors={METAL} start={start} />
        </RoundedRect>
      </Group>
      <RoundedRect
        x={x}
        y={y}
        width={width}
        height={height}
        r={r}
        style="stroke"
        strokeWidth={stroke}
      >
        <SweepGradient c={vec(cx, cy)} colors={METAL} start={start} />
      </RoundedRect>
    </Group>
  );
}
