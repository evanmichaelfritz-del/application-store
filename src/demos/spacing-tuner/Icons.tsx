import React from 'react';
import { View } from 'react-native';
import { COLORS, ICON_FILL_ALPHA, VarKey } from './tokens';

/** Hex '#RRGGBB' + alpha -> 'rgba(...)'. */
export function withAlpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

const SIZE = 36;
const abs = { position: 'absolute' as const };

function Chevron({ x, y, dir, color }: { x: number; y: number; dir: 'left' | 'right'; color: string }) {
  // A 6x6 square showing two borders, rotated 45deg, reads as an arrow head.
  return (
    <View
      style={{
        ...abs, left: x - 3, top: y - 3, width: 6, height: 6,
        borderColor: color,
        borderLeftWidth: dir === 'left' ? 2.5 : 0,
        borderBottomWidth: dir === 'left' ? 2.5 : 0,
        borderRightWidth: dir === 'right' ? 2.5 : 0,
        borderTopWidth: dir === 'right' ? 2.5 : 0,
        transform: [{ rotate: '45deg' }],
      }}
    />
  );
}

function SidebarIcon({ accent }: { accent: string }) {
  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <View style={{ ...abs, left: 0, top: 4, width: 36, height: 28, borderRadius: 6, borderWidth: 2, borderColor: COLORS.iconOutline }} />
      <View style={{ ...abs, left: 9, top: 16.75, width: 18, height: 2.5, borderRadius: 1.25, backgroundColor: accent }} />
      <Chevron x={10.5} y={18} dir="left" color={accent} />
      <Chevron x={25.5} y={18} dir="right" color={accent} />
    </View>
  );
}

function BoxIcon({ accent }: { accent: string }) {
  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <View style={{ ...abs, left: 0, top: 0, width: 36, height: 36, borderRadius: 8, borderWidth: 2.5, borderColor: accent, backgroundColor: withAlpha(accent, ICON_FILL_ALPHA) }} />
      <View style={{ ...abs, left: 10, top: 10, width: 16, height: 16, borderRadius: 3, borderWidth: 1, borderColor: COLORS.iconInnerBorder, backgroundColor: '#FFFFFF' }} />
    </View>
  );
}

function RowGapIcon({ accent }: { accent: string }) {
  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <View style={{ ...abs, left: 3, top: 2, width: 30, height: 10, borderRadius: 2, backgroundColor: COLORS.iconGrey }} />
      <View style={{ ...abs, left: 3, top: 14, width: 30, height: 8, borderRadius: 2, backgroundColor: accent }} />
      <View style={{ ...abs, left: 3, top: 24, width: 30, height: 10, borderRadius: 2, backgroundColor: COLORS.iconGrey }} />
    </View>
  );
}

function ColGapIcon({ accent }: { accent: string }) {
  return (
    <View style={{ width: SIZE, height: SIZE }}>
      <View style={{ ...abs, left: 2, top: 4, width: 10, height: 28, borderRadius: 2, backgroundColor: COLORS.iconGrey }} />
      <View style={{ ...abs, left: 14, top: 4, width: 8, height: 28, borderRadius: 2, backgroundColor: accent }} />
      <View style={{ ...abs, left: 24, top: 4, width: 10, height: 28, borderRadius: 2, backgroundColor: COLORS.iconGrey }} />
    </View>
  );
}

export function VariableIcon({ kind, accent }: { kind: VarKey; accent: string }) {
  switch (kind) {
    case 'sidebar': return <SidebarIcon accent={accent} />;
    case 'padding': return <BoxIcon accent={accent} />;
    case 'rowGap': return <RowGapIcon accent={accent} />;
    case 'colGap': return <ColGapIcon accent={accent} />;
    case 'cardPadding': return <BoxIcon accent={accent} />;
  }
}
