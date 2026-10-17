import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, LayoutChangeEvent, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { CHIPS, COLORS, INNER, OVERLAY_ALPHA, SIZES, STAGE, VARIABLES, VarKey, WINDOW } from './tokens';
import { frameAt, spring, LOOP_S, REDUCED_HOLD_S, REST_S, REVERT_S, VarMap, Frame } from './timeline';
import { computeScene, Rect } from './layout';
import { VariableIcon, withAlpha } from './Icons';

export interface SpacingTunerProps {
  /** Run the 10 s loop. Default true. Ignored when `time` is set. */
  autoPlay?: boolean;
  /** Freeze the scene at this loop time in seconds (0..10). */
  time?: number;
  /** ADDITION (not in the reference): chips become buttons; a press toggles that one
   *  variable between its before/after value and stops the autoplay loop. Default false. */
  interactive?: boolean;
  /** Force reduced motion on/off. Default: follow the OS setting. */
  reducedMotion?: boolean;
  /** Playback speed multiplier. Default 1. */
  speed?: number;
  style?: StyleProp<ViewStyle>;
}

const abs = { position: 'absolute' as const };
const FONT = 'Inter, -apple-system, "SF Pro Text", "Segoe UI", system-ui, sans-serif';

function Box({ r, color, radius = 0, style }: { r: Rect; color: string; radius?: number; style?: ViewStyle }) {
  return (
    <View
      pointerEvents="none"
      style={[{ ...abs, left: r.x, top: r.y, width: Math.max(0, r.w), height: Math.max(0, r.h), backgroundColor: color, borderRadius: radius }, style]}
    />
  );
}

/** Card: white box with a 2px ring drawn outside the layout box. */
function Card({ r }: { r: Rect }) {
  const k = SIZES.ring;
  return (
    <View
      pointerEvents="none"
      style={{
        ...abs, left: r.x - k, top: r.y - k, width: r.w + 2 * k, height: r.h + 2 * k,
        borderWidth: k, borderColor: COLORS.cardRing, borderRadius: SIZES.cardRadius + k, backgroundColor: COLORS.card,
      }}
    />
  );
}

function hostElement(node: View | null): HTMLElement | null {
  if (typeof HTMLElement !== 'undefined' && node instanceof HTMLElement) return node;
  return null;
}

function useReducedMotion(forced?: boolean): boolean {
  const [os, setOs] = useState(false);
  useEffect(() => {
    if (forced !== undefined) return;
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => alive && setOs(v)).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => setOs(v));
    return () => { alive = false; sub?.remove?.(); };
  }, [forced]);
  return forced ?? os;
}

/** True while the stage is on screen. Without IntersectionObserver, stay running. */
function useOnScreen(ref: React.RefObject<View | null>): boolean {
  const canObserve = typeof IntersectionObserver === 'function';
  const [onScreen, setOnScreen] = useState(!canObserve);
  useEffect(() => {
    if (!canObserve) return;
    const el = hostElement(ref.current);
    if (!el) {
      setOnScreen(true);
      return;
    }
    let intersecting = false;
    const publish = () => {
      const hidden = typeof document !== 'undefined' && document.hidden;
      const next = intersecting && !hidden;
      setOnScreen((current) => (current === next ? current : next));
    };
    const observer = new IntersectionObserver((entries) => {
      intersecting = entries.some((entry) => entry.isIntersecting);
      publish();
    });
    observer.observe(el);
    document.addEventListener('visibilitychange', publish);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', publish);
    };
  }, [canObserve, ref]);
  return onScreen;
}

/** rAF clock in seconds. Skips React renders through the 7.25–9.1 s rest. */
function useClock(running: boolean, speed: number): number {
  const [t, setT] = useState(0);
  const base = useRef<{ start: number; offset: number } | null>(null);
  const tRef = useRef(0);
  useEffect(() => {
    if (!running) { base.current = null; return; }
    let raf = 0;
    const tick = (now: number) => {
      if (!base.current) base.current = { start: now, offset: tRef.current };
      const next = (base.current.offset + ((now - base.current.start) / 1000) * speed) % LOOP_S;
      const prev = tRef.current;
      tRef.current = next;
      const resting = prev >= REST_S && prev < REVERT_S && next >= REST_S && next < REVERT_S;
      if (!resting) setT(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, speed]);
  return t;
}

interface Manual { key: VarKey; target: VarMap<number>; from: VarMap<number>; at: number }

function blankVars(): VarMap<number> {
  return { sidebar: 0, padding: 0, rowGap: 0, colGap: 0, cardPadding: 0 };
}

/** Manual (interactive) mode frame: each variable springs from where it was to its target. */
function manualFrame(m: Manual, now: number, reduced: boolean): Frame {
  const dt = (now - m.at) / 1000;
  const p = reduced ? 1 : spring(dt);
  const values = blankVars(), display = blankVars(), emphasis = blankVars();
  VARIABLES.forEach((v) => {
    const a = m.from[v.key], b = m.target[v.key];
    values[v.key] = a + (b - a) * p;
    display[v.key] = Math.round(a + (b - a) * Math.min(1, Math.max(0, p)));
    emphasis[v.key] = v.key === m.key ? (reduced ? 1 : Math.min(1, dt / 0.15)) : 0;
  });
  return { values, display, emphasis };
}

export default function SpacingTuner({ autoPlay = true, time, interactive = false, reducedMotion, speed = 1, style }: SpacingTunerProps) {
  const reduced = useReducedMotion(reducedMotion);
  const rootRef = useRef<View>(null);
  const onScreen = useOnScreen(rootRef);
  const [manual, setManual] = useState<Manual | null>(null);
  const [now, setNow] = useState(0);
  const loopT = useClock(time === undefined && autoPlay && !manual && !reduced && onScreen, speed);
  const [scale, setScale] = useState(0);

  // Drive re-renders while a manual spring settles.
  useEffect(() => {
    if (!manual) return;
    let raf = 0;
    const tick = (n: number) => { setNow(n); if (n - manual.at < 1200) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [manual]);

  const shown = time ?? (reduced ? REDUCED_HOLD_S : loopT);
  const frame = manual ? manualFrame(manual, now || manual.at, reduced) : frameAt(shown, false);
  const scene = useMemo(() => computeScene(frame.values), [frame.values]);

  const onPress = (key: VarKey) => {
    if (!interactive) return;
    const v = VARIABLES.find((x) => x.key === key)!;
    const from = { ...frame.values };
    const target = manual ? { ...manual.target } : { ...frame.values };
    if (!manual) VARIABLES.forEach((x) => { target[x.key] = Math.abs(frame.values[x.key] - x.to) < Math.abs(frame.values[x.key] - x.from) ? x.to : x.from; });
    target[key] = Math.abs(target[key] - v.to) < 0.5 ? v.from : v.to;
    const at = typeof performance !== 'undefined' ? performance.now() : Date.now();
    setManual({ key, target, from, at });
    setNow(at);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    const s = Math.min(width / STAGE.width, height > 0 ? height / STAGE.height : Infinity);
    if (Number.isFinite(s) && s > 0) setScale(s);
  };

  const { S, C } = scene;
  return (
    <View ref={rootRef} style={[{ width: '100%', aspectRatio: STAGE.width / STAGE.height, backgroundColor: COLORS.page, overflow: 'hidden' }, style]} onLayout={onLayout}>
      {scale > 0 && (
        <View
          style={{
            ...abs, left: '50%', top: '50%', width: STAGE.width, height: STAGE.height,
            marginLeft: -STAGE.width / 2, marginTop: -STAGE.height / 2,
            transform: [{ scale }],
          }}
        >
          {/* Window */}
          <View
            style={{
              ...abs, left: WINDOW.x, top: WINDOW.y, width: WINDOW.width, height: WINDOW.height,
              borderWidth: WINDOW.border, borderColor: COLORS.windowBorder, borderRadius: WINDOW.radius,
              backgroundColor: COLORS.window, overflow: 'hidden',
              boxShadow: '0px 18px 40px rgba(0,0,0,0.07)',
            }}
          >
            {/* Sidebar */}
            <Box r={{ x: 0, y: 0, w: S, h: INNER.height }} color={COLORS.sidebar} />
            <Box r={{ x: S - 1, y: 0, w: 1, h: INNER.height }} color={COLORS.sidebarEdge} />
            <Box r={{ x: 20, y: 18, w: 28, h: 28 }} color={COLORS.logo} radius={6} />
            <Box r={{ x: 58, y: 27, w: 72, h: 10 }} color={COLORS.navInk} radius={5} />
            <Box r={{ x: 12, y: 72, w: S - 24, h: 38 }} color={COLORS.navActiveBg} radius={8} />
            {SIZES.navLineW.map((w, i) => {
              const y = 72 + 38 * i;
              const ink = i === 0 ? COLORS.navInkActive : COLORS.navInk;
              return (
                <React.Fragment key={i}>
                  <Box r={{ x: 20, y: y + 10, w: 16, h: 16 }} color={ink} radius={4} />
                  <Box r={{ x: 46, y: y + 13, w, h: 10 }} color={ink} radius={5} />
                </React.Fragment>
              );
            })}
            <Box r={{ x: 20, y: 778, w: 28, h: 28 }} color={COLORS.navInk} radius={14} />
            <Box r={{ x: 58, y: 787, w: 80, h: 10 }} color={COLORS.navInk} radius={5} />

            {/* Header */}
            <Box r={scene.header.title} color={COLORS.dark} radius={8} />
            <Box r={scene.header.lightPill} color={COLORS.pillLight} radius={18} />
            <Box r={scene.header.darkPill} color={COLORS.pillDark} radius={18} />

            {/* Section labels */}
            {scene.sections.map((s, i) => (
              <React.Fragment key={i}>
                <Box r={s.label} color={COLORS.dark} radius={6} />
                <Box r={s.right} color={COLORS.light} radius={5} />
              </React.Fragment>
            ))}

            {/* Stat cards */}
            {scene.stats.map((c) => (
              <React.Fragment key={c.index}>
                <Card r={c} />
                <Box r={{ x: c.x + C, y: c.y + C, w: SIZES.statLabelW[c.index], h: 10 }} color={COLORS.light} radius={5} />
                <Box r={{ x: c.x + C, y: c.y + C + 22, w: SIZES.statValueW[c.index], h: 20 }} color={COLORS.dark} radius={10} />
                {Array.from({ length: 8 }, (_, j) => {
                  const h = SIZES.miniHeights[c.index + j];
                  return <Box key={j} r={{ x: c.x + C + 12 * j, y: c.y + C + SIZES.statInnerH - h, w: 8, h }} color={COLORS.light} radius={2} />;
                })}
              </React.Fragment>
            ))}

            {/* Bar chart card */}
            <Card r={scene.chart} />
            <Box r={{ x: scene.chart.x + C, y: scene.chart.y + C + 9, w: SIZES.chartTitle.w, h: SIZES.chartTitle.h }} color={COLORS.dark} radius={5} />
            <Box r={{ x: scene.chart.x + scene.chart.w - C - SIZES.chartPill.w, y: scene.chart.y + C, w: SIZES.chartPill.w, h: SIZES.chartPill.h }} color={COLORS.pillLight} radius={14} />
            {(() => {
              const inner = scene.chart.w - 2 * C;
              const bw = (inner - 11 * SIZES.chartBarGap) / 12;
              const plotH = scene.chart.h - 2 * C - SIZES.chartPill.h - SIZES.chartHeadGap;
              const bottom = scene.chart.y + scene.chart.h - C;
              return SIZES.chartPct.map((pct, i) => {
                const h = (plotH * pct) / 100;
                return <Box key={i} r={{ x: scene.chart.x + C + i * (bw + SIZES.chartBarGap), y: bottom - h, w: bw, h }} color={COLORS.bar} radius={4} />;
              });
            })()}

            {/* List card */}
            <Card r={scene.list} />
            <Box r={{ x: scene.list.x + C, y: scene.list.y + C, w: SIZES.listTitleW, h: 10 }} color={COLORS.dark} radius={5} />
            {SIZES.listLineW.map((w, i) => {
              const y = scene.list.y + C + 26 + 44 * i;
              return (
                <React.Fragment key={i}>
                  <Box r={{ x: scene.list.x + C, y, w: 28, h: 28 }} color={COLORS.bar} radius={14} />
                  <Box r={{ x: scene.list.x + C + 40, y: y + 9, w, h: 10 }} color={COLORS.light} radius={5} />
                  <Box r={{ x: scene.list.x + scene.list.w - C - 36, y: y + 9, w: 36, h: 10 }} color={COLORS.light} radius={5} />
                </React.Fragment>
              );
            })}

            {/* Overlays */}
            {VARIABLES.map((v) => {
              const e = frame.emphasis[v.key];
              if (e <= 0) return null;
              const fill = withAlpha(v.accent, OVERLAY_ALPHA);
              if (v.key === 'cardPadding') {
                // Padding ring follows the card's rounded corners.
                return [...scene.stats, scene.chart, scene.list].map((r, i) => (
                  <View
                    key={`${v.key}${i}`}
                    pointerEvents="none"
                    style={{
                      ...abs, left: r.x, top: r.y, width: r.w, height: r.h, opacity: e,
                      borderWidth: Math.max(0, C), borderColor: fill, borderRadius: SIZES.cardRadius,
                    }}
                  />
                ));
              }
              return scene.overlays[v.key].map((r, i) => (
                <Box key={`${v.key}${i}`} r={r} color={fill} style={{ opacity: e }} />
              ));
            })}
          </View>

          {/* Chips */}
          <View style={{ ...abs, left: 0, right: 0, top: CHIPS.top, height: CHIPS.height, flexDirection: 'row', justifyContent: 'center', gap: CHIPS.gap }}>
            {VARIABLES.map((v) => {
              const e = frame.emphasis[v.key];
              const Wrapper: React.ElementType = interactive ? Pressable : View;
              return (
                <Wrapper
                  key={v.key}
                  {...(interactive ? { onPress: () => onPress(v.key), accessibilityRole: 'button' } : {})}
                  accessibilityLabel={`${v.label} ${frame.display[v.key]}`}
                  style={{
                    height: CHIPS.height, borderRadius: CHIPS.height / 2, backgroundColor: COLORS.chip,
                    paddingLeft: CHIPS.padL, paddingRight: CHIPS.padR, flexDirection: 'row', alignItems: 'center',
                    boxShadow: '0px 1px 3px rgba(0,0,0,0.06)',
                    ...(interactive ? { cursor: 'pointer' } : null),
                  }}
                >
                  <View
                    pointerEvents="none"
                    style={{
                      ...abs, left: -CHIPS.ring, top: -CHIPS.ring, right: -CHIPS.ring, bottom: -CHIPS.ring,
                      borderRadius: CHIPS.height / 2 + CHIPS.ring, borderWidth: CHIPS.ring, borderColor: v.accent, opacity: e,
                    }}
                  />
                  <VariableIcon kind={v.key} accent={v.accent} />
                  <View style={{ marginLeft: CHIPS.iconGap, flexDirection: 'row' }}>
                    {String(frame.display[v.key]).split('').map((d, i) => (
                      <Text
                        key={i}
                        style={{
                          width: CHIPS.digitW, textAlign: 'center', fontSize: CHIPS.fontSize, lineHeight: 34,
                          color: COLORS.chipText, fontFamily: FONT, fontVariant: ['tabular-nums'], fontWeight: '400',
                        }}
                      >
                        {d}
                      </Text>
                    ))}
                  </View>
                </Wrapper>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}
