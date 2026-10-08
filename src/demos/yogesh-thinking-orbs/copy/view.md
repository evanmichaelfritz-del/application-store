/* Dependencies. Install only these, then run `npx setup-skia-web public`.
 * Web loads CanvasKit itself. No custom index.html.
 * locateFile: (file) => `/${file}` assumes the site root. A sub-path host must change that prefix.
 * Babel: plugins: ['react-native-worklets/plugin']
 * Mount: put these files under src/ and replace App.tsx with `export { default } from './src/ThinkingOrbs'`.
 * expo ~57.0.23
 * react 19.2.3
 * react-dom 19.2.3
 * react-native 0.86.3
 * react-native-web ~0.21.0
 * @shopify/react-native-skia 2.6.2
 * react-native-reanimated 4.5.1
 * react-native-worklets 0.10.1
 * react-native-gesture-handler ~2.32.0
 * expo-constants ~57.0.18
 * @expo-google-fonts/geist ^0.4.2
 * @expo-google-fonts/geist-mono ^0.4.3
 */

/* FILE src/ThinkingOrbs.web.tsx */
import "react-native-gesture-handler";
import "react-native-reanimated";
import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";
import { View } from "react-native";

export function ThinkingOrbs() {
  return (
    <WithSkiaWeb
      getComponent={() => import("./ThinkingOrbsApp")}
      fallback={<View style={{ flex: 1, backgroundColor: "#000" }} />}
      opts={{ locateFile: (file) => `/${file}` }}
    />
  );
}

export default ThinkingOrbs;

/* FILE src/ThinkingOrbs.tsx */
export { ThinkingOrbs } from "./ThinkingOrbsApp";
export { default } from "./ThinkingOrbsApp";

/* FILE src/ThinkingOrbsApp.tsx */
import "react-native-gesture-handler";
import "react-native-reanimated";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Showcase } from "./Showcase";
import { ThemeProvider } from "./theme/theme";

export function ThinkingOrbs() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <ThemeProvider>
          <Showcase />
        </ThemeProvider>
      </View>
    </GestureHandlerRootView>
  );
}

export default ThinkingOrbs;

/* FILE src/Showcase.tsx */
import { useCallback, useState } from 'react';
import { Platform, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { SliderRow } from './components/SliderRow';
import { PLAYGROUND } from './content/cards';
import { useArrowKeys } from './hooks/useArrowKeys';
import { OrbView } from './orb/OrbView';
import { fonts, useTheme } from './theme/theme';

/**
 * Effects showcase: one live orb, the 15 playground looks, and Size.
 * The Tools creator keeps Tuner.tsx; this host does not mount that panel.
 */
export function Showcase() {
  const { width } = useWindowDimensions();
  const wide = width >= 1280;
  const { colors } = useTheme();
  const [index, setIndex] = useState(1);
  const [size, setSize] = useState(320);
  const onIndex = useCallback((next: number) => setIndex(next), []);
  useArrowKeys(PLAYGROUND.length, index, onIndex);
  const look = PLAYGROUND[index];

  return (
    <View
      testID="yogesh-orb-tuner"
      style={{
        width: '100%',
        backgroundColor: colors.page,
        flexDirection: wide ? 'row' : 'column',
        alignItems: 'center',
        paddingLeft: wide ? 32 : 16,
        paddingRight: wide ? 42 : 16,
        paddingVertical: 24,
        gap: 24,
      }}
    >
      <View
        testID="yogesh-orb-states"
        role="navigation"
        accessibilityLabel="States"
        style={{ width: wide ? 280 : '100%', justifyContent: 'center' }}
      >
        <View
          role={Platform.OS === 'web' ? 'list' : undefined}
          style={{
            flexDirection: wide ? 'column' : 'row',
            flexWrap: wide ? 'nowrap' : 'wrap',
            columnGap: 16,
            rowGap: 8,
          }}
        >
          {PLAYGROUND.map((item, i) => {
            const on = i === index;
            const itemText = (
              <Text style={{ color: on ? colors.fg : colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>
                {item.playground}
              </Text>
            );
            const press = (
              <Pressable
                accessibilityRole="button"
                aria-current={on ? 'true' : undefined}
                onPress={() => setIndex(i)}
                hitSlop={{ top: 12, bottom: 12 }}
                style={{ height: 20, justifyContent: 'center' }}
              >
                {itemText}
              </Pressable>
            );
            return Platform.OS === 'web' ? (
              <View key={item.id} role="listitem">
                {press}
              </View>
            ) : (
              <View key={item.id}>{press}</View>
            );
          })}
        </View>
        {wide ? (
          <Text style={{ color: colors.muted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, marginTop: 24, marginBottom: -8 }}>
            ↑ ↓ to switch
          </Text>
        ) : null}
      </View>
      <View style={{ alignItems: 'center', gap: 16 }}>
        <View
          testID="yogesh-orb-stage"
          accessibilityLabel={Platform.OS === 'web' ? undefined : 'Orb playground'}
          accessibilityElementsHidden={Platform.OS === 'web' ? true : undefined}
          importantForAccessibility={Platform.OS === 'web' ? 'no-hide-descendants' : undefined}
          aria-hidden={Platform.OS === 'web' ? true : undefined}
        >
          <OrbView state={look.state} variant={look.variant} size={size} color={colors.orb} />
        </View>
        <View style={{ width: wide ? 256 : '100%' }}>
          <SliderRow label="Size" min={16} max={480} step={1} value={size} decimals={0} onChange={setSize} />
        </View>
      </View>
    </View>
  );
}

/* FILE src/orb/OrbView.tsx */
import { Canvas, Picture, Skia, useCanvasRef, type SkPicture } from "@shopify/react-native-skia";
import { createElement, memo, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, AppState, Platform, View } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { useFrameCallback, useSharedValue, runOnUI, type SharedValue } from "react-native-reanimated";
import {
  ORB_DEFAULT_COLOR,
  ORB_DEFAULT_DENSITY,
  ORB_DEFAULT_DOT_SIZE,
  ORB_DEFAULT_PAUSED,
  ORB_DEFAULT_SIZE,
  ORB_DEFAULT_SPEED,
  ORB_DEFAULT_STATE,
  ORB_DEFAULT_TILT,
} from "./orbProps";
import { parseColor, toExtendedSrgb, toSrgb } from "../color/color";
import { clocks, tick } from "./clock";
import { drawOrb } from "./draw";
import { buildInput, type OrbInput, type RenderName, type ShapeName } from "./model";
import { makeLocal, step, type OrbLocal } from "./simulate";

export type OrbLive = {
  size: number;
  speed: number;
  density: number;
  dotSize: number;
  tilt: number;
  r: number;
  g: number;
  b: number;
  a: number;
};

/**
 * Extended-sRGB floats can sit outside 0–1. Stock JsiSkColor::fromValue
 * (JsiSkColor.h) packs r*255 with no clamp, so a component above 1 paints
 * black. canUseExtendedColor() is the gate: true only where those floats
 * survive. Android's GL surface is sRGB, so it always clamps. iOS Expo Go
 * (ExecutionEnvironment.StoreClient) ships an unpatched Skia binary and
 * clamps too. Other iOS builds compile cpp/api/JsiSkPaint.h after
 * postinstall, and that patch calls setColor4f, so they keep the floats.
 * Web is unchanged.
 */
export function canUseExtendedColor(): boolean {
  if (Platform.OS === "android") return false;
  if (Platform.OS === "ios") return Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
  return true;
}

export function colorToRgba(color: string): { r: number; g: number; b: number; a: number } {
  const parsed = parseColor(color);
  if (!parsed) return { r: 1, g: 1, b: 1, a: 1 };
  if (!canUseExtendedColor()) return toSrgb(parsed);
  return toExtendedSrgb(parsed);
}

function blankPicture(): SkPicture {
  const recorder = Skia.PictureRecorder();
  recorder.beginRecording(Skia.XYWHRect(0, 0, 1, 1));
  return recorder.finishRecordingAsPicture();
}

function usePicture() {
  const initial = useRef<SkPicture | null>(null);
  if (initial.current === null) initial.current = blankPicture();
  const picture = useSharedValue<SkPicture>(initial.current);
  const retire = useSharedValue<SkPicture | null>(null);
  return { picture, retire };
}

export type OrbViewProps = {
  /** Omitted state is npm's `base`. Unknown ids resolve inside `buildInput`. */
  state?: string;
  variant?: string;
  /** npm default is 20. */
  size?: number;
  speed?: number;
  density?: number;
  dotSize?: number;
  tilt?: number;
  shape?: ShapeName;
  render?: RenderName;
  /** Omitted color paints the dark-store stand-in for npm `currentColor`. */
  color?: string;
  /** When false the canvas stays mounted but does not tick. */
  active?: boolean;
  /** npm `paused`: hold the frame and do not tick. */
  paused?: boolean;
  /** Screen-reader name. Without one the orb is hidden from assistive tech. */
  label?: string;
  /** Web className passthrough on the orb box. */
  className?: string;
  /** Playground sliders write here. Landing orbs leave it unset. */
  live?: SharedValue<OrbLive>;
  /** Last rasterized frame, for a card that has scrolled its canvas away. */
  onFrame?: (uri: string) => void;
};

function useDocumentActive(): boolean {
  const [active, setActive] = useState(() => {
    if (Platform.OS === "web") {
      return typeof document === "undefined" || document.visibilityState !== "hidden";
    }
    return AppState.currentState === "active";
  });
  useEffect(() => {
    if (Platform.OS === "web") {
      const onChange = () => setActive(document.visibilityState !== "hidden");
      document.addEventListener("visibilitychange", onChange);
      return () => document.removeEventListener("visibilitychange", onChange);
    }
    const sub = AppState.addEventListener("change", (next) => setActive(next === "active"));
    return () => sub.remove();
  }, []);
  return active;
}

function useOrbReduced(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduced(enabled);
    });
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return reduced;
}

function paint(
  picture: SharedValue<SkPicture>,
  retire: SharedValue<SkPicture | null>,
  input: OrbInput,
  local: OrbLocal,
  tune: OrbLive,
  time: number,
) {
  "worklet";
  step(input, local, time, tune.tilt, 1);
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, input.size, input.size));
  drawOrb(canvas, input, local, { r: tune.r, g: tune.g, b: tune.b, a: tune.a });
  const next = recorder.finishRecordingAsPicture();
  const old = retire.value;
  retire.value = picture.value;
  picture.value = next;
  if (old) old.dispose();
}

function CanvasHost({
  size,
  picture,
  onFrame,
}: {
  size: number;
  picture: SharedValue<SkPicture>;
  onFrame?: (uri: string) => void;
}) {
  const ref = useCanvasRef();
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;
  useEffect(() => {
    return () => {
      const report = onFrameRef.current;
      const canvas = ref.current;
      if (!report || !canvas) return;
      try {
        const image = canvas.makeImageSnapshot();
        const b64 = image.encodeToBase64();
        image.dispose();
        if (b64) report(`data:image/png;base64,${b64}`);
      } catch {
        // The surface can already be gone while the view unmounts.
      }
    };
  }, [ref]);
  return (
    <Canvas ref={ref} style={{ width: size, height: size }} pointerEvents="none" colorSpace="p3">
      <Picture picture={picture} />
    </Canvas>
  );
}

function OrbFrame({
  size,
  label,
  className,
  children,
}: {
  size: number;
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  if (Platform.OS === "web") {
    return createElement(
      "div",
      {
        className,
        role: label ? "img" : undefined,
        "aria-label": label,
        "aria-hidden": label ? undefined : true,
        style: { width: size, height: size, lineHeight: 0 },
      },
      children,
    );
  }
  return (
    <View
      accessibilityRole={label ? "image" : undefined}
      accessibilityLabel={label}
      accessibilityElementsHidden={label ? undefined : true}
      importantForAccessibility={label ? "auto" : "no-hide-descendants"}
      style={{ width: size, height: size }}
    >
      {children}
    </View>
  );
}

function OrbCanvas({
  state = ORB_DEFAULT_STATE,
  variant,
  size = ORB_DEFAULT_SIZE,
  speed = ORB_DEFAULT_SPEED,
  density = ORB_DEFAULT_DENSITY,
  dotSize = ORB_DEFAULT_DOT_SIZE,
  tilt = ORB_DEFAULT_TILT,
  shape = "sphere",
  render = "dots",
  color = ORB_DEFAULT_COLOR,
  active = true,
  paused = ORB_DEFAULT_PAUSED,
  label,
  className,
  live,
  onFrame,
  reduced,
}: OrbViewProps & { reduced: boolean }) {
  const { picture, retire } = usePicture();
  const inputSV = useSharedValue<OrbInput | null>(null);
  const localSV = useSharedValue<OrbLocal | null>(null);
  const running = active && !paused && !reduced;
  const activeSV = useSharedValue(running);
  const fallback = useSharedValue<OrbLive>({
    size,
    speed,
    density,
    dotSize,
    tilt,
    ...colorToRgba(color),
  });
  const built = useMemo(
    () => buildInput({ state, variant, size, density, dotSize, shape, render }),
    [state, variant, size, density, dotSize, shape, render],
  );

  useEffect(() => {
    inputSV.value = built;
    localSV.value = null;
  }, [built, inputSV, localSV]);

  useLayoutEffect(() => {
    activeSV.value = running;
    if (!live) {
      fallback.value = { size, speed, density, dotSize, tilt, ...colorToRgba(color) };
    }
  }, [running, color, size, speed, density, dotSize, tilt, live, activeSV, fallback]);

  // Reduced motion paints from props at t=0. Entering pause holds the current picture.
  // A later state, size, or colour edit while paused repaints that same time.
  const wasPaused = useRef(paused);
  const heldT = useRef(0);
  useLayoutEffect(() => {
    const tune: OrbLive = { size, speed, density, dotSize, tilt, ...colorToRgba(color) };
    const enteredPause = paused && !wasPaused.current;
    wasPaused.current = paused;
    if (enteredPause && !reduced) {
      const clock = clocks.value[`${built.state}@${tune.speed}`];
      heldT.current = clock ? clock.t : heldT.current;
      return;
    }
    if (!reduced && !paused) return;
    const time = reduced ? 0 : heldT.current;
    const input = built;
    runOnUI(() => {
      "worklet";
      paint(picture, retire, input, makeLocal(input), tune, time);
    })();
  }, [reduced, paused, built, color, density, dotSize, picture, retire, size, speed, tilt]);

  const frameCallback = useFrameCallback((frame) => {
    "worklet";
    const input = inputSV.value;
    if (!input || !activeSV.value) return;
    const tune = live ? live.value : fallback.value;
    const clockKey = `${input.state}@${tune.speed}`;
    const now = frame.timestamp;
    const t = tick(clockKey, now, tune.speed);
    let local = localSV.value;
    const speedKey = `${input.key}@${tune.speed}`;
    if (!local || local.key !== speedKey || local.dots.length !== input.count * 6) {
      local = makeLocal(input);
      local.key = speedKey;
      localSV.value = local;
    }
    paint(picture, retire, input, local, tune, t);
  }, running);

  useLayoutEffect(() => {
    frameCallback.setActive(running);
  }, [running, frameCallback]);

  return (
    <OrbFrame size={size} label={label} className={className}>
      <CanvasHost size={size} picture={picture} onFrame={onFrame} />
    </OrbFrame>
  );
}

export const OrbView = memo(function OrbView(props: OrbViewProps) {
  const focused = useDocumentActive();
  const reduced = useOrbReduced();
  if (!focused) return null;
  return <OrbCanvas {...props} reduced={reduced} active={props.active !== false} />;
});

/* FILE src/components/SliderRow.tsx */
import { GeistMono_500Medium } from "@expo-google-fonts/geist-mono/500Medium";
import { useFonts } from "expo-font";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Platform, Text, View, type TextStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring, withTiming, type SharedValue } from "react-native-reanimated";
import { runOnJS } from "react-native-reanimated";

import type { OrbLive } from "../orb/OrbView";
import { fonts, useTheme } from "../theme/theme";

const SLIDER_SANS = 'system-ui, -apple-system, "SF Pro Display", sans-serif';
const SLIDER_MONO = "GeistMono_500Medium, ui-monospace, monospace";

function injectSmoothing() {
  if (Platform.OS !== "web" || typeof document === "undefined") return;
  if (document.getElementById("orb-font-smoothing")) return;
  const style = document.createElement("style");
  style.id = "orb-font-smoothing";
  style.textContent = `[data-testid="yogesh-orb-tuner"],[data-testid="yogesh-orb-tuner"] *,.orb-cp-pop,.orb-cp-pop *{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}`;
  document.head.appendChild(style);
}

const FILL = { stiffness: 300, damping: 25, mass: 0.8 };
const BACK = { stiffness: 224, damping: 25.4, mass: 1 };
const HANDLE_X = { stiffness: 439, damping: 35.6, mass: 1 };
const HANDLE_Y = { stiffness: 685, damping: 47.1, mass: 1 };
const PUSH_MS = 32;

export type SliderField = "size" | "speed" | "density" | "dotSize" | "tilt";

function snap(value: number, min: number, max: number, step: number) {
  "worklet";
  const clamped = Math.min(max, Math.max(min, value));
  const steps = Math.round((clamped - min) / step);
  const nearest = Math.min(max, Math.max(min, min + steps * step));
  return Number(nearest.toFixed(4));
}

function writeLive(live: SharedValue<OrbLive>, field: SliderField, next: number) {
  "worklet";
  const cur = live.value;
  if (field === "size") live.value = { ...cur, size: next };
  else if (field === "speed") live.value = { ...cur, speed: next };
  else if (field === "density") live.value = { ...cur, density: next };
  else if (field === "dotSize") live.value = { ...cur, dotSize: next };
  else live.value = { ...cur, tilt: next };
}

export function SliderRow({
  label,
  min,
  max,
  step,
  value,
  decimals,
  onChange,
  live,
  field,
  onDrag,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  decimals: number;
  onChange: (value: number) => void;
  /** Playground orb reads this every frame. Landing sliders omit it. */
  live?: SharedValue<OrbLive>;
  field?: SliderField;
  /** JS-thread drag flag so a state sync does not clobber the shared value. */
  onDrag?: (active: boolean) => void;
}) {
  const { colors, mode } = useTheme();
  useFonts({ GeistMono_500Medium });
  useLayoutEffect(() => {
    injectSmoothing();
  }, []);
  const [width, setWidth] = useState(1);
  const [focused, setFocused] = useState(false);
  const [labelText, setLabelText] = useState(value.toFixed(decimals));
  const fill = useSharedValue((value - min) / (max - min));
  const over = useSharedValue(0);
  const dragging = useSharedValue(false);
  const hover = useSharedValue(0);
  const handleOp = useSharedValue(0);
  const scaleX = useSharedValue(0.25);
  const scaleY = useSharedValue(1);
  const marksOp = useSharedValue(0);
  const cfg = useSharedValue({ min, max, step, width, decimals });
  const tapAnim = useSharedValue(false);
  const dragged = useSharedValue(false);
  const ended = useSharedValue(false);
  const savedFill = useSharedValue(0);
  const pending = useSharedValue(0);
  const panDone = useSharedValue(false);
  const tapDone = useSharedValue(false);
  const labelW = useSharedValue(0);
  const valueW = useSharedValue(0);
  const gen = useSharedValue(0);
  const lastPush = useSharedValue(0);
  const onChangeRef = useRef(onChange);
  const decimalsRef = useRef(decimals);
  const onDragRef = useRef(onDrag);
  const jsGen = useRef(0);
  const skipSync = useRef(false);
  onChangeRef.current = onChange;
  decimalsRef.current = decimals;
  onDragRef.current = onDrag;

  useEffect(() => {
    cfg.value = { min, max, step, width, decimals };
  }, [min, max, step, width, decimals, cfg]);

  const publish = useCallback((next: number, token: number) => {
    if (token !== jsGen.current) return;
    onDragRef.current?.(true);
    setLabelText(next.toFixed(decimalsRef.current));
    onChangeRef.current(next);
  }, []);

  const commit = useCallback((next: number, token: number) => {
    jsGen.current = token;
    skipSync.current = true;
    onDragRef.current?.(false);
    setLabelText(next.toFixed(decimalsRef.current));
    onChangeRef.current(next);
  }, []);

  const showRatio = useCallback((ratio: number) => {
    const bounds = cfg.value;
    const raw = bounds.min + ratio * (bounds.max - bounds.min);
    setLabelText(raw.toFixed(bounds.decimals));
  }, [cfg]);

  const revertLabel = useCallback((ratio: number) => {
    const bounds = cfg.value;
    const raw = bounds.min + ratio * (bounds.max - bounds.min);
    setLabelText(raw.toFixed(bounds.decimals));
  }, [cfg]);

  useAnimatedReaction(
    () => {
      const trackW = width;
      const O = fill.value * 100;
      const ee = labelW.value > 0 && trackW > 1 ? ((10 + labelW.value + 8) / trackW) * 100 : 30;
      const et = valueW.value > 0 && trackW > 1 ? ((trackW - 12 - valueW.value - 8) / trackW) * 100 : 78;
      const near = O < ee || O > et;
      const visible = dragging.value || hover.value > 0;
      return {
        op: !visible ? 0 : near ? 0.1 : dragging.value ? 0.9 : 0.5,
        sx: visible ? 1 : 0.25,
        sy: near && visible ? 0.75 : 1,
        marks: visible ? 0.35 : 0,
      };
    },
    (next) => {
      handleOp.value = withTiming(next.op, { duration: 150 });
      scaleX.value = withSpring(next.sx, HANDLE_X);
      scaleY.value = withSpring(next.sy, HANDLE_Y);
      marksOp.value = withTiming(next.marks, { duration: 200 });
    },
  );

  useEffect(() => {
    const target = (value - min) / (max - min);
    if (dragging.value || tapAnim.value) {
      skipSync.current = false;
      return;
    }
    if (skipSync.current) {
      skipSync.current = false;
      setLabelText(value.toFixed(decimals));
      return;
    }
    if (Math.abs(fill.value - target) < 0.0001) {
      setLabelText(value.toFixed(decimals));
      return;
    }
    fill.value = withSpring(target, FILL);
    setLabelText(value.toFixed(decimals));
  }, [value, min, max, decimals, fill, dragging, tapAnim]);

  useAnimatedReaction(
    () => (tapAnim.value ? fill.value : -1),
    (ratio) => {
      if (ratio < 0) return;
      runOnJS(showRatio)(ratio);
    },
  );

  const publishNow = (next: number) => {
    if (live && field) writeLive(live, field, next);
    setLabelText(next.toFixed(decimals));
    onChange(next);
  };

  const move = (steps: number) => {
    publishNow(snap(value + steps * step, min, max, step));
  };

  useEffect(() => {
    if (!focused || Platform.OS !== "web") return;
    const onKey = (event: KeyboardEvent) => {
      const key = event.key;
      let steps: number | null = null;
      const big = event.shiftKey ? 10 : 1;
      if (key === "ArrowRight" || key === "ArrowUp") steps = big;
      else if (key === "ArrowLeft" || key === "ArrowDown") steps = -big;
      else if (key === "PageUp") steps = 10;
      else if (key === "PageDown") steps = -10;
      else if (key === "Home") steps = 0;
      else if (key === "End") steps = 0;
      else return;
      event.preventDefault();
      event.stopPropagation();
      if (key === "Home") publishNow(min);
      else if (key === "End") publishNow(max);
      else if (steps !== null) move(steps);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [decimals, field, focused, live, max, min, onChange, step, value]);

  const gesture = useMemo(() => {
    const revertIfAbandoned = () => {
      "worklet";
      if (!panDone.value || !tapDone.value || ended.value) return;
      const ratio = savedFill.value;
      tapAnim.value = false;
      dragging.value = false;
      over.value = withSpring(0, BACK);
      fill.value = withSpring(ratio, FILL);
      ended.value = false;
      panDone.value = false;
      tapDone.value = false;
      runOnJS(revertLabel)(ratio);
    };
    const pan = Gesture.Pan()
      .activeOffsetX([-4, 4])
      .failOffsetY([-6, 6])
      .onBegin((e) => {
        ended.value = false;
        panDone.value = false;
        tapDone.value = false;
        dragged.value = false;
        savedFill.value = fill.value;
        const bounds = cfg.value;
        const x = Math.min(bounds.width, Math.max(0, e.x));
        const raw = bounds.min + (x / Math.max(1, bounds.width)) * (bounds.max - bounds.min);
        const next = snap(raw, bounds.min, bounds.max, bounds.step);
        const ratio = (next - bounds.min) / (bounds.max - bounds.min);
        pending.value = next;
        tapAnim.value = true;
        fill.value = withSpring(ratio, FILL);
      })
      .onUpdate((e) => {
        if (!dragged.value) {
          if (Math.abs(e.translationX) < 4 && Math.abs(e.translationY) < 4) return;
          dragged.value = true;
          dragging.value = true;
          tapAnim.value = false;
        }
        const bounds = cfg.value;
        const x = e.x;
        let rubber = 0;
        let ratio = x / bounds.width;
        if (x < 0) {
          rubber = -Math.min(18, Math.abs(x) * 0.25);
          ratio = 0;
        } else if (x > bounds.width) {
          rubber = Math.min(18, (x - bounds.width) * 0.25);
          ratio = 1;
        }
        over.value = rubber;
        fill.value = ratio;
        const raw = bounds.min + ratio * (bounds.max - bounds.min);
        const next = snap(raw, bounds.min, bounds.max, bounds.step);
        pending.value = next;
        if (live && field) writeLive(live, field, next);
        const now = Date.now();
        if (now - lastPush.value >= PUSH_MS) {
          lastPush.value = now;
          runOnJS(publish)(next, gen.value);
        }
      })
      .onEnd((e) => {
        ended.value = true;
        dragging.value = false;
        over.value = withSpring(0, BACK);
        const bounds = cfg.value;
        const raw = bounds.min + (Math.min(bounds.width, Math.max(0, e.x)) / bounds.width) * (bounds.max - bounds.min);
        const next = snap(raw, bounds.min, bounds.max, bounds.step);
        pending.value = next;
        fill.value = withSpring((next - bounds.min) / (bounds.max - bounds.min), FILL);
        if (live && field) writeLive(live, field, next);
        gen.value = gen.value + 1;
        runOnJS(commit)(next, gen.value);
      })
      .onFinalize(() => {
        panDone.value = true;
        revertIfAbandoned();
      });
    const tap = Gesture.Tap()
      .maxDistance(6)
      .maxDuration(10000)
      .onEnd(() => {
        ended.value = true;
        tapAnim.value = false;
        const next = pending.value;
        if (live && field) writeLive(live, field, next);
        gen.value = gen.value + 1;
        runOnJS(commit)(next, gen.value);
      })
      .onFinalize(() => {
        tapDone.value = true;
        revertIfAbandoned();
      });
    return Gesture.Race(pan, tap);
  }, [cfg, commit, dragged, dragging, ended, field, fill, gen, lastPush, live, over, panDone, pending, publish, revertLabel, savedFill, tapAnim, tapDone]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${Math.min(100, Math.max(0, fill.value * 100))}%` }));
  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: over.value }] }));
  const markStyle = useAnimatedStyle(() => ({ opacity: marksOp.value }));
  const handleStyle = useAnimatedStyle(() => ({
    opacity: handleOp.value,
    transform: [{ translateX: fill.value * width }, { scaleX: scaleX.value }, { scaleY: scaleY.value }],
  }));
  const marks = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  const web = Platform.OS === "web";
  const ink = mode === "light" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)";
  const sliderLabel: TextStyle = web
    ? {
        position: "absolute",
        top: "50%",
        left: 10,
        color: ink,
        fontFamily: SLIDER_SANS,
        fontSize: 13,
        fontWeight: "500",
        lineHeight: 19.5,
        transform: [{ translateY: "-50%" }, { translateY: -0.5 }],
      }
    : { position: "absolute", top: 8, left: 10, color: colors.fg, fontFamily: fonts.regular, fontSize: 13 };
  const sliderValue: TextStyle = web
    ? {
        position: "absolute",
        top: "50%",
        right: 12,
        paddingBottom: 1,
        borderBottomWidth: 1,
        borderBottomColor: "transparent",
        color: ink,
        fontFamily: SLIDER_MONO,
        fontSize: 13,
        fontWeight: "500",
        lineHeight: 19.5,
        transform: [{ translateY: "-50%" }, { translateY: 0.5 }],
      }
    : { position: "absolute", top: 8, right: 12, color: colors.fg, fontFamily: fonts.mono, fontSize: 13 };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: value, text: labelText }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === "increment") move(1);
          if (event.nativeEvent.actionName === "decrement") move(-1);
        }}
        focusable
        tabIndex={0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={labelText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onLayout={(e) => setWidth(Math.max(1, e.nativeEvent.layout.width))}
        onPointerEnter={() => {
          hover.value = 1;
        }}
        onPointerLeave={() => {
          hover.value = 0;
        }}
        style={[
          {
            height: 36,
            borderRadius: 8,
            backgroundColor: colors.row,
            overflow: "hidden",
            justifyContent: "center",
          },
          rowStyle,
        ]}
      >
        <Animated.View style={[{ position: "absolute", left: 0, top: 0, bottom: 0, backgroundColor: colors.slider }, fillStyle]} />
        {marks.map((mark) => (
          <Animated.View key={mark} style={[{ position: "absolute", left: `${mark * 100}%`, top: 8, bottom: 8, width: 1, backgroundColor: colors.fg }, markStyle]} />
        ))}
        <Animated.View
          pointerEvents="none"
          style={[{ position: "absolute", top: 8, width: 3, height: 20, marginLeft: -1.5, borderRadius: 1, backgroundColor: colors.fg }, handleStyle]}
        />
        <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}>
          <Text onLayout={(e) => { labelW.value = e.nativeEvent.layout.width; }} style={sliderLabel}>{label}</Text>
          <Text onLayout={(e) => { valueW.value = e.nativeEvent.layout.width; }} style={sliderValue}>{labelText}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
