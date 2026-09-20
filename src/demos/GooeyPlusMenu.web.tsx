import { useId, useState, type CSSProperties } from 'react';
import { StyleSheet, View } from 'react-native';
import { Liquid } from 'liquid-gooey';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { colors } from '@/src/theme';

const W = 200;
const H = 160;
const CX = 100;
const CY = 96;
const HUB = 48;
const DOT = 36;

/** Fan mostly up/sideways so discs stay inside the 160px stage. */
const ACTIONS = [
  { label: 'F', x: -54, y: -34, delay: 0 },
  { label: 'I', x: -18, y: -62, delay: 40 },
  { label: 'L', x: 28, y: -58, delay: 80 },
  { label: 'N', x: 56, y: -28, delay: 120 },
];

const btnBase: CSSProperties = {
  margin: 0,
  padding: 0,
  border: 'none',
  background: 'transparent',
  color: '#fff',
  fontFamily: 'Inter_600SemiBold, Inter, system-ui, sans-serif',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  WebkitTapHighlightColor: 'transparent',
};

/**
 * Web showcase: liquid-gooey Morph menu (Libraries.dev).
 * Native keeps Skia metaballs in GooeyPlusMenu.tsx → GooeySkia.
 */
export function GooeyPlusMenuDemo() {
  const { reduceMotion } = useReduceMotion();
  const [open, setOpen] = useState(false);
  const uid = useId().replace(/:/g, '');
  const transition = reduceMotion ? { duration: 0 } : ('bouncy' as const);

  return (
    <Stage>
      <View style={styles.wrap}>
        <Liquid
          blur={12}
          contrast={22}
          fill={colors.text}
          shadow="0 4px 14px rgba(0,0,0,.16)"
          filterPadding={64}
          waviness={1.2}
          data-testid="gooey-liquid"
          style={{
            width: W,
            height: H,
            position: 'relative',
          }}
        >
          {ACTIONS.map((action) => (
            <Liquid.Item
              key={action.label}
              x={open ? action.x : 0}
              y={open ? action.y : 0}
              transition={transition}
              delay={reduceMotion ? 0 : action.delay}
              radius={DOT / 2}
              style={anchorStyle(DOT)}
            >
              <button
                type="button"
                className="t-gooey-action"
                aria-hidden={!open}
                tabIndex={open ? 0 : -1}
                style={{
                  ...btnBase,
                  width: DOT,
                  height: DOT,
                  borderRadius: DOT / 2,
                  fontSize: 12,
                  lineHeight: '12px',
                }}
              >
                {action.label}
              </button>
            </Liquid.Item>
          ))}
          <Liquid.Item transition={transition} radius={HUB / 2} style={anchorStyle(HUB)}>
            <button
              type="button"
              className="t-gooey-hub"
              aria-expanded={open}
              aria-controls={`${uid}-actions`}
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
              style={{
                ...btnBase,
                width: HUB,
                height: HUB,
                borderRadius: HUB / 2,
                fontSize: 26,
                lineHeight: '28px',
                fontFamily: 'Inter_500Medium, Inter, system-ui, sans-serif',
                fontWeight: 500,
                transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
                transition: reduceMotion
                  ? 'none'
                  : 'transform 420ms cubic-bezier(0.34, 1.25, 0.64, 1)',
              }}
            >
              +
            </button>
          </Liquid.Item>
          <span id={`${uid}-actions`} hidden>
            Fan actions
          </span>
        </Liquid>
      </View>
    </Stage>
  );
}

function anchorStyle(size: number): CSSProperties {
  return {
    position: 'absolute',
    left: CX - size / 2,
    top: CY - size / 2,
    width: size,
    height: size,
  };
}

const styles = StyleSheet.create({
  wrap: { width: W, height: H },
});
