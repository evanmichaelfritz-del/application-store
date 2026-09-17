import { Blur, Circle, Group, Paint, RoundedRect } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { pointOnBottomStroke, pointOnRoundedRect } from '@/src/libdev/geometry';

const TAIL = 18;

type Box = { x: number; y: number; w: number; h: number; r: number };

function BeamDot({
  i,
  progress,
  box,
  color,
  alongBottom,
  dim,
}: {
  i: number;
  progress: SharedValue<number>;
  box: Box;
  color: string;
  alongBottom?: boolean;
  dim: number;
}) {
  const cx = useDerivedValue(() => {
    const t = progress.value - (i / TAIL) * 0.11;
    const p = alongBottom
      ? pointOnBottomStroke(t, box.x, box.y, box.w, box.h, box.r)
      : pointOnRoundedRect(t, box.x, box.y, box.w, box.h, box.r);
    return p.x;
  });
  const cy = useDerivedValue(() => {
    const t = progress.value - (i / TAIL) * 0.11;
    const p = alongBottom
      ? pointOnBottomStroke(t, box.x, box.y, box.w, box.h, box.r)
      : pointOnRoundedRect(t, box.x, box.y, box.w, box.h, box.r);
    return p.y;
  });

  const radius = Math.max(1.1, (5.8 - i * 0.26) * dim);
  const opacity = Math.max(0.08, (1 - i / TAIL) * dim);

  return <Circle cx={cx} cy={cy} r={radius} color={color} opacity={opacity} />;
}

export function BorderBeamStroke({
  progress,
  box,
  colors,
  dim = 1,
  alongBottom = false,
}: {
  progress: SharedValue<number>;
  box: Box;
  colors: string[];
  dim?: number;
  alongBottom?: boolean;
}) {
  return (
    <Group>
      <RoundedRect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        r={box.r}
        color="rgba(255,255,255,0.08)"
        style="stroke"
        strokeWidth={1}
      />
      <Group>
        <Paint>
          <Blur blur={7 * dim} />
        </Paint>
        {Array.from({ length: TAIL }, (_, i) => (
          <BeamDot
            key={`g-${i}`}
            i={i}
            progress={progress}
            box={box}
            color={colors[Math.min(colors.length - 1, Math.floor((i / TAIL) * colors.length))]}
            alongBottom={alongBottom}
            dim={dim * 0.85}
          />
        ))}
      </Group>
      {Array.from({ length: TAIL }, (_, i) => (
        <BeamDot
          key={i}
          i={i}
          progress={progress}
          box={box}
          color={colors[Math.min(colors.length - 1, Math.floor((i / TAIL) * colors.length))]}
          alongBottom={alongBottom}
          dim={dim}
        />
      ))}
    </Group>
  );
}
