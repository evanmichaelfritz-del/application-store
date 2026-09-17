import { Blur, Circle, Group, LinearGradient, RadialGradient, SweepGradient, vec } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

type Dot = { x: number; y: number; z: number };

function fibonacciSphere(count: number): Dot[] {
  const pts: Dot[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts.push({
      x: Math.cos(theta) * radius,
      y,
      z: Math.sin(theta) * radius,
    });
  }
  return pts;
}

function SphereDot({
  dot,
  rotation,
  cx,
  cy,
  radius,
}: {
  dot: Dot;
  rotation: SharedValue<number>;
  cx: number;
  cy: number;
  radius: number;
}) {
  const x = useDerivedValue(() => {
    const a = rotation.value;
    const rx = dot.x * Math.cos(a) + dot.z * Math.sin(a);
    return cx + rx * radius;
  });
  const y = useDerivedValue(() => cy + dot.y * radius);
  const r = useDerivedValue(() => {
    const a = rotation.value;
    const z = -dot.x * Math.sin(a) + dot.z * Math.cos(a);
    return 1.05 + ((z + 1) / 2) * 1.55;
  });
  const opacity = useDerivedValue(() => {
    const a = rotation.value;
    const z = -dot.x * Math.sin(a) + dot.z * Math.cos(a);
    return 0.18 + ((z + 1) / 2) * 0.82;
  });

  return <Circle cx={x} cy={y} r={r} color="#f4f4f4" opacity={opacity} />;
}

export function DottedSphere({
  cx,
  cy,
  radius,
  rotation,
}: {
  cx: number;
  cy: number;
  radius: number;
  rotation: SharedValue<number>;
}) {
  const dots = useMemo(() => fibonacciSphere(56), []);
  return (
    <Group>
      {dots.map((dot, index) => (
        <SphereDot
          key={index}
          dot={dot}
          rotation={rotation}
          cx={cx}
          cy={cy}
          radius={radius}
        />
      ))}
    </Group>
  );
}

export function MetallicOrb({
  cx,
  cy,
  radius,
  swirl,
}: {
  cx: number;
  cy: number;
  radius: number;
  swirl: SharedValue<number>;
}) {
  const transform = useDerivedValue(() => [{ rotate: swirl.value }]);
  const highlight = useDerivedValue(() => [{ rotate: swirl.value * 1.35 + 0.6 }]);

  return (
    <Group>
      <Circle cx={cx} cy={cy} r={radius + 3} color="rgba(255,255,255,0.05)" />
      <Circle cx={cx} cy={cy} r={radius}>
        <RadialGradient
          c={vec(cx - radius * 0.22, cy - radius * 0.28)}
          r={radius * 1.25}
          colors={['#6a6e78', '#2a2d34', '#0c0d10']}
        />
      </Circle>
      <Group origin={vec(cx, cy)} transform={transform}>
        <Circle cx={cx} cy={cy} r={radius}>
          <SweepGradient
            c={vec(cx, cy)}
            colors={[
              'rgba(255,255,255,0)',
              'rgba(220,230,245,0.38)',
              'rgba(255,255,255,0)',
              'rgba(90,100,120,0.28)',
              'rgba(255,255,255,0)',
            ]}
          />
        </Circle>
      </Group>
      <Group origin={vec(cx, cy)} transform={highlight}>
        <Circle
          cx={cx - radius * 0.28}
          cy={cy - radius * 0.34}
          r={radius * 0.16}
          color="rgba(255,255,255,0.22)"
        >
          <Blur blur={3} />
        </Circle>
        <Circle cx={cx} cy={cy} r={radius}>
          <LinearGradient
            start={vec(cx - radius, cy - radius)}
            end={vec(cx + radius, cy + radius)}
            colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.2)']}
          />
        </Circle>
      </Group>
    </Group>
  );
}
