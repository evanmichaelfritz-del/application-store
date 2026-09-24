import { useMemo, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';
import {
  REVENUE_PITCH,
  REVENUE_SQUARE,
  revenueByDay,
  revenuePlotHeight,
  revenuePlotWidth,
  revenueSquares,
  revenueXTicks,
  revenueYLabels,
} from '../data/overview';
import { colors } from '../theme';
import { Tx } from './ui';

const ASPECT = revenuePlotHeight / revenuePlotWidth;

/**
 * Faint dot grid is a single <Pattern> (one circle tiled).
 * Every orange square is one subpath of a single <Path>.
 * The SVG box matches the viewBox aspect so the squares stay square.
 */
export function RevenueChart() {
  const [plotWidth, setPlotWidth] = useState(0);
  const plotHeight = plotWidth > 0 ? plotWidth * ASPECT : 168;
  const barPath = useMemo(
    () =>
      revenueSquares
        .map(
          (square) =>
            `M${square.x} ${square.y}h${REVENUE_SQUARE}v${REVENUE_SQUARE}h${-REVENUE_SQUARE}Z`,
        )
        .join(''),
    [],
  );

  return (
    <View testID="revenue-chart">
      <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
        <View style={{ width: 40, height: plotHeight, justifyContent: 'space-between' }}>
          {revenueYLabels.map((label) => (
            <Tx key={label} size={11} weight={400} color={colors.muted} numeric style={{ textAlign: 'right' }}>
              {label}
            </Tx>
          ))}
        </View>
        <View
          style={{ flex: 1, height: plotHeight }}
          onLayout={(event) => {
            const next = Math.round(event.nativeEvent.layout.width);
            if (next > 0 && next !== plotWidth) setPlotWidth(next);
          }}
        >
          {plotWidth > 0 ? (
            <Svg
              width={plotWidth}
              height={plotHeight}
              viewBox={`0 0 ${revenuePlotWidth} ${revenuePlotHeight}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <Defs>
                <Pattern
                  id="revenueDotGrid"
                  x="0"
                  y="0"
                  width={REVENUE_PITCH}
                  height={REVENUE_PITCH}
                  patternUnits="userSpaceOnUse"
                >
                  <Circle cx={REVENUE_PITCH / 2} cy={REVENUE_PITCH / 2} r={1.15} fill="#D5D5DC" />
                </Pattern>
              </Defs>
              <Rect
                x={0}
                y={0}
                width={revenuePlotWidth}
                height={revenuePlotHeight}
                fill="url(#revenueDotGrid)"
              />
              <Path d={barPath} fill={colors.orange} />
            </Svg>
          ) : null}
        </View>
      </View>
      <View
        style={{
          marginLeft: 40,
          width: plotWidth || undefined,
          height: 16,
          position: 'relative',
          marginTop: 6,
        }}
      >
        {revenueXTicks.map((tick) => (
          <View
            key={tick.label}
            style={{
              position: 'absolute',
              left: plotWidth > 0 ? ((tick.day + 0.5) / revenueByDay.length) * plotWidth - 22 : 0,
              width: 44,
              alignItems: 'center',
            }}
          >
            <Tx size={11} weight={500} color={colors.muted}>
              {tick.label}
            </Tx>
          </View>
        ))}
      </View>
    </View>
  );
}
