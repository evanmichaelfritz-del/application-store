import { useMemo, useState } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { hexRows } from '../data/overview';
import { colors } from '../theme';

const FILL: Record<string, string> = {
  g: colors.grey200,
  B: colors.blue,
  O: colors.orange,
  T: colors.teal,
  P: colors.purple,
};

const ORDER = ['g', 'B', 'O', 'T', 'P'] as const;
const SIZE = 10;
/** Display scale so the field is about 70% of the card and the legend stays on screen. */
const DISPLAY_SCALE = 0.75;

function hexSubpath(cx: number, cy: number, size: number) {
  let d = '';
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = (cx + size * Math.cos(angle)).toFixed(2);
    const y = (cy + size * Math.sin(angle)).toFixed(2);
    d += i === 0 ? `M${x} ${y}` : `L${x} ${y}`;
  }
  return `${d}Z`;
}

export function HexCluster() {
  const model = useMemo(() => {
    const dx = Math.sqrt(3) * SIZE;
    const dy = SIZE * 1.5;
    const byFill: Record<string, string[]> = { g: [], B: [], O: [], T: [], P: [] };
    let maxX = 0;
    let maxY = 0;
    hexRows.forEach((row, r) => {
      const offset = r % 2 === 1 ? dx / 2 : 0;
      for (let c = 0; c < row.length; c += 1) {
        const ch = row[c];
        if (!ch || ch === '.' || !FILL[ch]) continue;
        const cx = offset + c * dx + SIZE;
        const cy = r * dy + SIZE;
        maxX = Math.max(maxX, cx + SIZE);
        maxY = Math.max(maxY, cy + SIZE);
        byFill[ch].push(hexSubpath(cx, cy, SIZE * 0.92));
      }
    });
    return {
      width: maxX + 2,
      height: maxY + 2,
      paths: ORDER.filter((key) => byFill[key].length > 0).map((key) => ({
        key,
        fill: FILL[key],
        d: byFill[key].join(''),
      })),
    };
  }, []);

  const [box, setBox] = useState(0);
  const width = box > 0 ? Math.round(box * DISPLAY_SCALE) : 0;
  const height = width > 0 ? Math.round(width * (model.height / model.width)) : 180;

  return (
    <View
      style={{ width: '100%', alignItems: 'center' }}
      onLayout={(event) => {
        const next = Math.round(event.nativeEvent.layout.width);
        if (next > 0 && next !== box) setBox(next);
      }}
    >
      <Svg
        testID="hex-cluster"
        width={width > 0 ? width : '75%'}
        height={height}
        viewBox={`0 0 ${model.width} ${model.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {model.paths.map((path) => (
          <Path key={path.key} d={path.d} fill={path.fill} />
        ))}
      </Svg>
    </View>
  );
}
