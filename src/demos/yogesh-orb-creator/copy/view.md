/* Dependencies. Install only these, then run `npx setup-skia-web public`.
 * Web loads CanvasKit itself. No custom index.html.
 * locateFile: (file) => `/${file}` assumes the site root. A sub-path host must change that prefix.
 * Babel: plugins: ['react-native-worklets/plugin']
 * Mount: put these files under src/ and replace App.tsx with `export { default } from './src/Playground'`.
 * expo ~57.0.23
 * react 19.2.3
 * react-dom 19.2.3
 * react-native 0.86.3
 * react-native-web ~0.21.0
 * @shopify/react-native-skia 2.6.2
 * react-native-reanimated 4.5.1
 * react-native-worklets 0.10.1
 * react-native-gesture-handler ~2.32.0
 * react-native-svg 15.15.4
 * expo-constants ~57.0.18
 * expo-clipboard ~57.0.2
 * react-native-safe-area-context ~5.7.0
 * @expo-google-fonts/geist ^0.4.2
 * @expo-google-fonts/geist-mono ^0.4.3
 * @types/react-dom ~19.2.2 (dev)
 */

/* FILE src/Playground.web.tsx */
import "react-native-gesture-handler";
import "react-native-reanimated";
import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";
import { View } from "react-native";

export function PlaygroundScreen() {
  return (
    <WithSkiaWeb
      getComponent={() => import("./PlaygroundApp")}
      fallback={<View style={{ flex: 1, backgroundColor: "#000" }} />}
      opts={{ locateFile: (file) => `/${file}` }}
    />
  );
}

export default PlaygroundScreen;

/* FILE src/Playground.tsx */
export { PlaygroundScreen } from "./PlaygroundApp";
export { default } from "./PlaygroundApp";

/* FILE src/PlaygroundApp.tsx */
import "react-native-gesture-handler";
import "react-native-reanimated";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Tuner } from "./Tuner";
import { ThemeProvider } from "./theme/theme";

export function PlaygroundScreen() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <ThemeProvider>
            <Tuner />
          </ThemeProvider>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default PlaygroundScreen;

/* FILE src/Tuner.tsx */
import { setStringAsync } from 'expo-clipboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSharedValue } from 'react-native-reanimated';

import { ColorPicker } from './components/ColorPicker';
import { SelectRow } from './components/SelectRow';
import { Shimmer } from './components/Shimmer';
import { SliderRow } from './components/SliderRow';
import { PLAYGROUND } from './content/cards';
import { orbSnippet } from './content/snippet';
import { useArrowKeys } from './hooks/useArrowKeys';
import { parseColor, toExtendedSrgb, toSrgb, type Oklch } from './color/color';
import { canUseExtendedColor, OrbView, type OrbLive } from './orb/OrbView';
import { isFlat, RENDERS, type RenderName, type ShapeName } from './orb/model';
import { fonts, useTheme } from './theme/theme';

/**
 * Playground tuner from 9bef3b1 `app/playground.tsx`, without the site header.
 * Layout width is the card, so the same wide / tablet / phone branches run in
 * the space the store actually gives the asset.
 */

const SHAPES: { id: ShapeName; label: string }[] = [
  { id: 'sphere', label: 'Sphere' },
  { id: 'cube', label: 'Cube' },
  { id: 'octahedron', label: 'Octahedron' },
  { id: 'tetrahedron', label: 'Tetrahedron' },
  { id: 'torus', label: 'Torus' },
];

const RENDER_LABEL: Record<RenderName, string> = {
  dots: 'Dots',
  crosses: 'Crosses',
  dashes: 'Dashes',
  halftone: 'Halftone',
  lines: 'Lines',
  mesh: 'Mesh',
  squares: 'Squares',
  verticalLines: 'Vertical Lines',
};

export function Tuner() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wide = width >= 1280;
  const { colors, playgroundColor, setPlaygroundColor } = useTheme();
  const [index, setIndex] = useState(1);
  const onIndex = useCallback((next: number) => setIndex(next), []);
  useArrowKeys(PLAYGROUND.length, index, onIndex);
  const look = PLAYGROUND[index];
  const [shape, setShape] = useState<ShapeName>('sphere');
  const [render, setRender] = useState<RenderName>('dots');
  const [size, setSize] = useState(320);
  const [speed, setSpeed] = useState(1);
  const [density, setDensity] = useState(1);
  const [dotSize, setDotSize] = useState(1);
  const [tilt, setTilt] = useState(20);
  const [exact, setExact] = useState<{ color: Oklch; text: string } | null>(null);
  const [menu, setMenu] = useState<null | 'shape' | 'render'>(null);
  const [picker, setPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);
  const wasFlat = useRef(false);
  const flat = isFlat(render);
  const phone = width < 768;
  const headerH = width >= 768 ? 48 : 72;
  const maxOrb = Math.max(96, height - headerH - 120);
  const shown = Math.min(size, wide ? maxOrb : Math.min(maxOrb, Math.max(96, width - 32)));
  const parsed: Oklch =
    (exact && exact.text === playgroundColor ? exact.color : null) ??
    parseColor(playgroundColor) ?? { l: 1, c: 0, h: 0, a: 1 };
  const rgba = canUseExtendedColor() ? toExtendedSrgb(parsed) : toSrgb(parsed);
  const remember = (color: Oklch, text: string) => {
    setExact({ color, text });
    setPlaygroundColor(text);
  };
  const live = useSharedValue<OrbLive>({ size: shown, speed, density, dotSize, tilt, ...rgba });
  const sliding = useRef(false);

  useEffect(
    () => () => {
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    if (wasFlat.current && !flat) setTilt(20);
    wasFlat.current = flat;
  }, [flat]);

  useEffect(() => {
    if (sliding.current) return;
    live.value = { size: shown, speed, density, dotSize, tilt, ...rgba };
  }, [shown, speed, density, dotSize, tilt, rgba.r, rgba.g, rgba.b, rgba.a, live]);

  const copy = () => {
    const text = orbSnippet({
      state: look.state,
      variant: look.variant,
      size,
      speed,
      density,
      dotSize,
      tilt,
      shape,
      render,
      color: playgroundColor,
      themeDefault: colors.orb,
      flat,
    });
    void setStringAsync(text).then(() => {
      if (!alive.current) return;
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (alive.current) setCopied(false);
      }, 1500);
    });
  };

  const panel = (
    <View
      testID="yogesh-orb-panel"
      role={Platform.OS === 'web' ? 'complementary' : undefined}
      style={{ width: wide ? 256 : '100%', gap: 6, zIndex: 5 }}
    >
      <SelectRow
        label="Shape"
        value={shape}
        display={SHAPES.find((item) => item.id === shape)?.label ?? 'Sphere'}
        options={SHAPES}
        open={menu === 'shape'}
        onToggle={() => {
          setPicker(false);
          setMenu((current) => (current === 'shape' ? null : 'shape'));
        }}
        onPick={(id) => {
          setShape(id);
          setMenu(null);
        }}
      />
      <SelectRow
        label="Render"
        value={render}
        display={RENDER_LABEL[render]}
        options={RENDERS.map((id) => ({ id, label: RENDER_LABEL[id] }))}
        open={menu === 'render'}
        onToggle={() => {
          setPicker(false);
          setMenu((current) => (current === 'render' ? null : 'render'));
        }}
        onPick={(id) => {
          setRender(id);
          setMenu(null);
        }}
      />
      <ColorPicker
        text={playgroundColor}
        color={parsed}
        open={picker}
        onOpenChange={(next) => {
          if (next) setMenu(null);
          setPicker(next);
        }}
        onCommit={(next) => {
          setExact(null);
          setPlaygroundColor(next.trim());
        }}
        onChange={remember}
      />
      <SliderRow
        label="Size"
        min={16}
        max={480}
        step={1}
        value={size}
        decimals={0}
        onChange={setSize}
        live={live}
        field="size"
        onDrag={(active) => {
          sliding.current = active;
        }}
      />
      <SliderRow
        label="Speed"
        min={0.05}
        max={3}
        step={0.05}
        value={speed}
        decimals={2}
        onChange={setSpeed}
        live={live}
        field="speed"
        onDrag={(active) => {
          sliding.current = active;
        }}
      />
      <SliderRow
        label="Density"
        min={0.25}
        max={3}
        step={0.05}
        value={density}
        decimals={2}
        onChange={setDensity}
        live={live}
        field="density"
        onDrag={(active) => {
          sliding.current = active;
        }}
      />
      <SliderRow
        label="Dot Size"
        min={0.25}
        max={3}
        step={0.05}
        value={dotSize}
        decimals={2}
        onChange={setDotSize}
        live={live}
        field="dotSize"
        onDrag={(active) => {
          sliding.current = active;
        }}
      />
      {flat ? null : (
        <SliderRow
          label="Tilt"
          min={-90}
          max={90}
          step={1}
          value={tilt}
          decimals={0}
          onChange={setTilt}
          live={live}
          field="tilt"
          onDrag={(active) => {
            sliding.current = active;
          }}
        />
      )}
      <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Pressable
          testID="yogesh-orb-export"
          onPress={copy}
          hitSlop={8}
          accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}
        >
          <Text style={{ color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>
            {copied ? 'Copied' : 'Copy'}
          </Text>
        </Pressable>
        {playgroundColor.trim().toLowerCase() !== colors.orb.toLowerCase() ||
        size !== 320 ||
        speed !== 1 ||
        density !== 1 ||
        dotSize !== 1 ||
        tilt !== 20 ? (
          <Pressable
            onPress={() => {
              setSize(320);
              setSpeed(1);
              setDensity(1);
              setDotSize(1);
              setTilt(20);
              setExact(null);
              setPlaygroundColor(colors.orb);
            }}
            hitSlop={8}
            accessibilityLabel="Reset"
          >
            <Text style={{ color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>Reset</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  const list = (
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
          return Platform.OS === 'web' ? (
            <View key={item.id} role="listitem">
              <Pressable
                accessibilityRole="button"
                aria-current={on ? 'true' : undefined}
                onPress={() => setIndex(i)}
                hitSlop={{ top: 12, bottom: 12 }}
                style={{ height: 20, justifyContent: 'center' }}
              >
                <Text style={{ color: on ? colors.fg : colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>
                  {item.playground}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              aria-current={on ? 'true' : undefined}
              onPress={() => setIndex(i)}
              hitSlop={{ top: 12, bottom: 12 }}
              style={{ height: 20, justifyContent: 'center' }}
            >
              <Text style={{ color: on ? colors.fg : colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>
                {item.playground}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {wide ? (
        <Text style={{ color: colors.muted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, marginTop: 24, marginBottom: -8 }}>
          ↑ ↓ to switch
        </Text>
      ) : null}
    </View>
  );

  const stage = (
    <View
      testID="yogesh-orb-stage"
      accessibilityLabel={Platform.OS === 'web' ? undefined : 'Orb playground'}
      accessibilityElementsHidden={Platform.OS === 'web' ? true : undefined}
      importantForAccessibility={Platform.OS === 'web' ? 'no-hide-descendants' : undefined}
      aria-hidden={Platform.OS === 'web' ? true : undefined}
      style={{
        flex: wide ? 1 : undefined,
        minHeight: phone ? height * 0.6 : wide ? 0 : shown,
        padding: phone ? 32 : 0,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: phone ? 24 : 0,
      }}
    >
      <View style={wide ? { marginRight: 24 } : undefined}>
        <OrbView
          state={look.state}
          variant={look.variant}
          size={shown}
          speed={speed}
          density={density}
          dotSize={dotSize}
          tilt={tilt}
          shape={shape}
          render={render}
          color={playgroundColor}
          live={live}
        />
      </View>
    </View>
  );

  const status = (
    <View
      testID="yogesh-orb-status"
      pointerEvents="none"
      style={
        wide
          ? {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 22 + insets.bottom,
              zIndex: 6,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transform: [{ translateX: -4.6 }],
            }
          : { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, alignSelf: 'center' }
      }
    >
      <OrbView
        state={look.state}
        variant={look.variant}
        size={24}
        speed={speed}
        density={density}
        dotSize={dotSize}
        tilt={tilt}
        shape={shape}
        render={render}
        color={playgroundColor}
        live={live}
      />
      <Shimmer key={index} text={look.status} style={phone ? { lineHeight: 20 } : undefined} />
    </View>
  );

  return (
    <View
      testID="yogesh-orb-tuner"
      style={{ width: '100%', backgroundColor: colors.page, minHeight: wide ? Math.max(560, shown + 160) : undefined }}
    >
      {menu && Platform.OS !== 'web' ? (
        <Pressable
          onPress={() => setMenu(null)}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 4 }}
        />
      ) : null}
      {wide ? (
        <View style={{ minHeight: Math.max(520, shown + 120), flexDirection: 'row', alignItems: 'stretch', paddingLeft: 32, paddingRight: 42, zIndex: 5 }}>
          <View style={{ alignSelf: 'center', marginBottom: 8 }}>{list}</View>
          {stage}
          <View style={{ alignSelf: 'center' }}>{panel}</View>
        </View>
      ) : (
        <ScrollView
          style={{ zIndex: 5 }}
          contentContainerStyle={{
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: width < 768 ? 24 : 0,
            paddingBottom: (width < 768 ? 24 : 32) + insets.bottom,
          }}
        >
          {list}
          <View>
            {stage}
            {phone ? <View style={{ position: 'absolute', left: 0, right: 0, bottom: 24 }}>{status}</View> : null}
          </View>
          {phone ? null : status}
          <View style={{ marginTop: phone ? 24 : 20 }}>{panel}</View>
        </ScrollView>
      )}
      {wide ? status : null}
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

/* FILE src/components/ColorPicker.tsx */
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { detectFormat, formatColor, parseColor, type Oklch } from "../color/color";
import { fonts, useTheme } from "../theme/theme";

const INVALID_TITLE = "Enter a hex, RGB, HSL, OKLCH, or Display P3 color";

export type ColorPickerProps = {
  text: string;
  color: Oklch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommit: (text: string) => void;
  onChange: (color: Oklch, text: string) => void;
};

/**
 * Native stand-in. Desktop web uses ColorPicker.web.tsx.
 * Mobile layout is a known gap; this keeps the card from crashing.
 */
export function ColorPicker({ text, color, open, onOpenChange, onCommit, onChange }: ColorPickerProps) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState(text);
  const [invalid, setInvalid] = useState(false);
  useEffect(() => {
    setDraft(text);
    setInvalid(false);
  }, [text]);
  const commit = () => {
    const trimmed = draft.trim();
    const parsed = parseColor(trimmed);
    if (!parsed) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    onCommit(trimmed);
    onChange(parsed, formatColor(parsed, detectFormat(trimmed)));
  };
  return (
    <View style={{ gap: 6 }}>
      <View
        style={{
          height: 36,
          borderRadius: 8,
          backgroundColor: "rgba(255,255,255,0.08)",
          paddingHorizontal: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: fonts.regular, fontSize: 13 }}>Color</Text>
        <TextInput
          value={draft}
          onChangeText={(value) => {
            setDraft(value);
            setInvalid(false);
          }}
          onSubmitEditing={commit}
          accessibilityLabel="Color color value"
          aria-invalid={invalid}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            flex: 1,
            minWidth: 0,
            color: invalid ? "#ef7777" : "rgba(255,255,255,0.7)",
            fontFamily: fonts.mono,
            fontSize: 13,
            textAlign: "right",
            paddingVertical: 4,
          }}
        />
        <Pressable
          testID="yogesh-orb-color-swatch"
          accessibilityRole="button"
          accessibilityLabel="Pick color color"
          onPress={() => onOpenChange(!open)}
          style={{
            width: 20,
            height: 20,
            borderRadius: 5,
            backgroundColor: formatColor(color, "hex"),
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.26)",
          }}
        />
      </View>
      {open ? (
        <View accessibilityLabel="Color color picker" style={{ borderRadius: 14, backgroundColor: colors.pop, padding: 10, gap: 8 }}>
          <Text style={{ color: colors.muted, fontFamily: fonts.regular, fontSize: 13 }}>{INVALID_TITLE}</Text>
          <Pressable onPress={() => onOpenChange(false)} accessibilityRole="button">
            <Text style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 13 }}>Close</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

/* FILE src/components/ColorPicker.web.tsx */
import { GeistMono_500Medium } from "@expo-google-fonts/geist-mono/500Medium";
import { useFonts } from "expo-font";
import React, { createElement, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";

import {
  detectFormat,
  displayP3GammaToSrgb,
  formatColor,
  maxChroma,
  oklchToRgb,
  parseColor,
  srgbGammaToDisplayP3,
  type ColorFormat,
  type Oklch,
} from "../color/color";

const TABS: { id: ColorFormat; label: string }[] = [
  { id: "hex", label: "Hex" },
  { id: "oklch", label: "OKLCH" },
  { id: "p3", label: "Display P3" },
];

const SANS = 'system-ui, -apple-system, "SF Pro Display", sans-serif';
const MONO = "GeistMono_500Medium, ui-monospace, monospace";

type FieldSpace = "srgb" | "p3";

type FieldCanvas = {
  width: number;
  height: number;
  getContext: (kind: "2d", opts?: { colorSpace?: string }) => FieldContext | null;
};

type FieldContext = {
  createImageData: (w: number, h: number) => { data: Uint8ClampedArray };
  putImageData: (data: { data: Uint8ClampedArray }, x: number, y: number) => void;
  getContextAttributes?: () => { colorSpace?: string };
};

type BitmapSpace = "srgb" | "display-p3";

const bitmapSpace = new WeakMap<object, BitmapSpace>();

function isFieldCanvas(node: object | null): node is FieldCanvas {
  return !!node && "getContext" in node && "width" in node && "height" in node;
}

function fieldSpace(format: ColorFormat): FieldSpace {
  return format === "p3" ? "p3" : "srgb";
}

function chromaRatio(color: Oklch, space: FieldSpace) {
  const cap = maxChroma(color.l, color.h, space);
  if (cap <= 0) return 0;
  return Math.min(1, Math.max(0, color.c / cap));
}

function paintField(node: object | null, hue: number, space: FieldSpace) {
  if (!isFieldCanvas(node)) return;
  const ctx = node.getContext("2d", { colorSpace: "display-p3" });
  if (!ctx) return;
  let bitmap = bitmapSpace.get(node);
  if (!bitmap) {
    const reported = ctx.getContextAttributes?.().colorSpace;
    bitmap = reported === "display-p3" ? "display-p3" : "srgb";
    bitmapSpace.set(node, bitmap);
  }
  const w = node.width;
  const h = node.height;
  const image = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const l = h <= 1 ? 1 : 1 - y / (h - 1);
    const cap = maxChroma(l, hue, space);
    for (let x = 0; x < w; x++) {
      const c = (w <= 1 ? 0 : x / (w - 1)) * cap;
      let rgb = oklchToRgb({ l, c, h: hue, a: 1 }, space);
      if (bitmap === "display-p3" && space === "srgb") rgb = srgbGammaToDisplayP3(rgb);
      else if (bitmap === "srgb" && space === "p3") rgb = displayP3GammaToSrgb(rgb);
      const i = (y * w + x) * 4;
      image.data[i] = Math.round(255 * Math.min(1, Math.max(0, rgb[0])));
      image.data[i + 1] = Math.round(255 * Math.min(1, Math.max(0, rgb[1])));
      image.data[i + 2] = Math.round(255 * Math.min(1, Math.max(0, rgb[2])));
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

function hueTrack(color: Oklch, ratio: number, space: FieldSpace) {
  const stops: string[] = [];
  for (let i = 0; i < 73; i++) {
    const h = i * 5;
    stops.push(formatColor({ l: color.l, c: ratio * maxChroma(color.l, h, space), h, a: 1 }, "oklch"));
  }
  return `linear-gradient(to right in oklab, ${stops.join(", ")})`;
}

let injected = false;
function injectStyles() {
  if (injected || typeof document === "undefined") return;
  injected = true;
  const style = document.createElement("style");
  style.setAttribute("data-orb-color", "");
  style.textContent = `
.orb-cp-control{box-sizing:border-box;height:36px;width:100%;background:rgba(255,255,255,.08);border-radius:8px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 12px;transition:background .15s,box-shadow .15s;font-family:${SANS}}
.orb-cp-control[data-open=true]{background:rgba(255,255,255,.18);box-shadow:inset 0 0 0 1px rgba(255,255,255,.26)}
.orb-cp-label{color:rgba(255,255,255,.7);flex-shrink:0;font-size:13px;font-weight:500;line-height:19.5px;transform:translateY(-.5px)}
.orb-cp-control[data-open=true] .orb-cp-label,.orb-cp-control[data-open=true] .orb-cp-value{color:#fffffff2}
.orb-cp-inputs{flex:1;min-width:0;display:flex;justify-content:flex-end;align-items:center;gap:8px}
.orb-cp-value{width:100%;min-width:0;height:25px;box-sizing:border-box;color:rgba(255,255,255,.7);text-align:right;text-overflow:ellipsis;background:transparent;border:0;outline:none;padding:4px 0;font:500 13px ${MONO};caret-color:rgba(255,255,255,.7)}
.orb-cp-value:focus,.orb-cp-control[data-open=true] .orb-cp-value:focus{color:#fff;caret-color:#fff;outline:none;box-shadow:inset 0 -1px 0 0 rgba(255,255,255,.6)}
.orb-cp-value[aria-invalid=true],.orb-cp-control[data-open=true] .orb-cp-value[aria-invalid=true]{color:#ef7777;caret-color:#ef7777}
.orb-cp-swatch{box-sizing:border-box;border:1px solid rgba(255,255,255,.26);background-color:transparent;background-image:linear-gradient(var(--orb-cp-color),var(--orb-cp-color)),repeating-conic-gradient(#aaa 0% 25%,#eee 0% 50%);background-size:auto,8px 8px;background-position:0 0,0 50%;cursor:pointer;border-radius:5px;flex:0 0 20px;width:20px;height:20px;padding:0;transition:transform .15s;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
.orb-cp-swatch:hover{transform:scale(1.08)}
.orb-cp-swatch:focus{outline:none}
.orb-cp-swatch:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:-2px}
.orb-cp-pop{box-sizing:border-box;width:280px;height:350px;z-index:10002;position:fixed;margin:0;padding:10px;display:grid;grid-template-rows:36px 160px auto 36px;gap:6px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:#212121;box-shadow:0 8px 32px rgba(0,0,0,.5);color:rgba(255,255,255,.7);font:500 13px/19.5px ${SANS};animation:orb-cp-enter .16s ease-out;overflow:hidden}
.orb-cp-pop *,.orb-cp-pop *::before,.orb-cp-pop *::after{box-sizing:border-box}
@keyframes orb-cp-enter{from{opacity:0;transform:translateY(3px) scale(.98)}to{opacity:1;transform:none}}
.orb-cp-formats{height:36px;background:rgba(255,255,255,.08);border-radius:8px;padding:2px;display:flex;align-items:center}
.orb-cp-seg{position:relative;display:flex;flex:1;min-width:0;padding:2px;border-radius:8px}
.orb-cp-pill{position:absolute;left:2px;top:2px;bottom:2px;width:calc(33.3333% - 1.33333px);border-radius:6px;background:rgba(255,255,255,.18);pointer-events:none;z-index:0;transition:transform .2s cubic-bezier(.25,1,.5,1)}
.orb-cp-format{position:relative;z-index:1;flex:1 1 0;min-width:0;white-space:nowrap;cursor:pointer;background:transparent;border:0;padding:6px 8px;font-family:inherit;font-size:13px;font-weight:500;line-height:19.5px;color:rgba(255,255,255,.7);transition:color .15s}
.orb-cp-format:hover,.orb-cp-format[data-active=true]{color:#fffffff2}
.orb-cp-plane{position:relative;height:160px;border-radius:8px;touch-action:none;cursor:crosshair;user-select:none}
.orb-cp-plane::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)}
.orb-cp-plane:focus{outline:none}
.orb-cp-plane:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:-2px}
.orb-cp-canvas{width:100%;height:100%;display:block;border-radius:inherit;pointer-events:none}
.orb-cp-marker{position:absolute;z-index:1;width:12px;height:12px;margin:-6px;border:2px solid #fff;border-radius:50%;pointer-events:none;box-shadow:0 2px 4px rgba(0,0,0,.3)}
.orb-cp-tracks{display:grid;gap:6px}
.orb-cp-track-row{height:36px;border-radius:8px;background:rgba(255,255,255,.08);display:flex;align-items:center;gap:12px;padding:0 12px;font-size:13px;font-weight:500}
.orb-cp-track-row>span{flex:0 0 52px;color:rgba(255,255,255,.7)}
.orb-cp-track{appearance:none;-webkit-appearance:none;background:transparent;border:0;flex:1;min-width:0;height:100%;margin:0;padding:0;cursor:pointer;touch-action:none}
.orb-cp-track::-webkit-slider-runnable-track{height:16px;border-radius:4px;background:var(--orb-cp-track)}
.orb-cp-track::-moz-range-track{height:16px;border:0;border-radius:4px;background:var(--orb-cp-track)}
.orb-cp-track::-webkit-slider-thumb{-webkit-appearance:none;box-sizing:border-box;width:16px;height:24px;margin-top:-4px;border:2px solid #fff;border-radius:5px;background:var(--orb-cp-thumb);background-clip:padding-box;box-shadow:0 2px 4px rgba(0,0,0,.3)}
.orb-cp-track::-moz-range-thumb{box-sizing:border-box;width:16px;height:24px;border:2px solid #fff;border-radius:5px;background:var(--orb-cp-thumb);background-clip:padding-box;box-shadow:0 2px 4px rgba(0,0,0,.3)}
.orb-cp-track:focus{outline:none}
.orb-cp-track:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:-2px}
.orb-cp-format:focus{outline:none}
.orb-cp-format:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:-2px}
[data-testid="yogesh-orb-panel"] [aria-haspopup="listbox"]:focus-visible,[data-testid="yogesh-orb-panel"] [role="slider"]:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:-2px}
.orb-cp-css{width:100%;height:36px;box-sizing:border-box;border:0;border-radius:8px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);padding:0 12px;font:500 13px/19.5px ${MONO};outline:none;caret-color:rgba(255,255,255,.7)}
.orb-cp-css:focus{color:#fff;caret-color:#fff;outline:none}
.orb-cp-css[aria-invalid=true]{color:#ef7777;caret-color:#ef7777}
@media (prefers-reduced-motion:reduce){.orb-cp-pop{animation:none}.orb-cp-pill{transition:none}}
`;
  document.head.appendChild(style);
}

export type ColorPickerProps = {
  text: string;
  color: Oklch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Commit the typed string unchanged. Uppercase hex stays uppercase. */
  onCommit: (text: string) => void;
  onChange: (color: Oklch, text: string) => void;
};

type DomInput = HTMLInputElement;
type DomButton = HTMLButtonElement;

function isFormatButton(node: Element): node is HTMLButtonElement {
  return node instanceof HTMLButtonElement;
}

type FieldPoint = { clientX: number; clientY: number };

export function ColorPicker({ text, color, open, onOpenChange, onCommit, onChange }: ColorPickerProps) {
  useFonts({ GeistMono_500Medium });
  const popId = useId();
  const [format, setFormat] = useState<ColorFormat>(() => detectFormat(text));
  const [rowDraft, setRowDraft] = useState(text);
  const [cssDraft, setCssDraft] = useState(text);
  const [rowInvalid, setRowInvalid] = useState(false);
  const [cssInvalid, setCssInvalid] = useState(false);
  const rowInvalidRef = useRef(false);
  const [heldHue, setHeldHue] = useState(color.h);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const rowInputRef = useRef<DomInput | null>(null);
  const cssInputRef = useRef<DomInput | null>(null);
  const swatchRef = useRef<DomButton | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<FieldCanvas | null>(null);
  const wasOpen = useRef(false);
  const commitRef = useRef<(raw: string) => boolean>(() => false);
  const textRef = useRef(text);
  const onOpenChangeRef = useRef(onOpenChange);
  textRef.current = text;
  onOpenChangeRef.current = onOpenChange;
  const hue = color.c > 1e-7 ? color.h : heldHue;
  const space = fieldSpace(format);
  const ratio = chromaRatio(color, space);
  const opaque = formatColor({ ...color, a: 1 }, "oklch");
  const withAlpha = formatColor(color, "oklch");
  const swatchColor = parseColor(text) ? text.trim() : formatColor(color, "hex");

  commitRef.current = (raw: string) => {
    const trimmed = raw.trim();
    const parsed = parseColor(trimmed);
    if (!parsed) return false;
    setFormat(detectFormat(trimmed));
    rowInvalidRef.current = false;
    setRowInvalid(false);
    setCssInvalid(false);
    setRowDraft(trimmed);
    setCssDraft(trimmed);
    onCommit(trimmed);
    return true;
  };

  useEffect(() => {
    injectStyles();
  }, []);

  useEffect(() => {
    const row = rowInputRef.current;
    const css = cssInputRef.current;
    if (document.activeElement !== row) {
      setRowDraft(text);
      rowInvalidRef.current = false;
      setRowInvalid(false);
    }
    if (document.activeElement !== css) {
      setCssDraft(text);
      setCssInvalid(false);
    }
    if (document.activeElement !== row && document.activeElement !== css && parseColor(text)) {
      setFormat(detectFormat(text));
    }
  }, [text]);

  useEffect(() => {
    if (color.c > 1e-7) setHeldHue(color.h);
  }, [color.c, color.h]);

  useLayoutEffect(() => {
    if (!open) return;
    paintField(canvasRef.current, hue, space);
  }, [open, hue, space]);

  const place = () => {
    const row = rowRef.current;
    const pop = popRef.current;
    if (!row || !pop) return;
    const rect = row.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const edge = vw < 768 ? 16 : 8;
    let top = rect.top - 32;
    const maxTop = Math.max(edge, vh - edge - 350);
    if (top < edge) top = edge;
    if (top > maxTop) top = maxTop;
    let left = rect.left - 288;
    const maxLeft = Math.max(edge, vw - edge - 280);
    if (left < edge) left = edge;
    if (left > maxLeft) left = maxLeft;
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  };

  const closeToSwatch = () => {
    flushSync(() => onOpenChange(false));
    swatchRef.current?.focus({ preventScroll: true });
  };

  useLayoutEffect(() => {
    if (!open) {
      wasOpen.current = false;
      return;
    }
    place();
    if (!wasOpen.current) {
      const checked = popRef.current?.querySelector('[role="radio"][aria-checked="true"]');
      if (checked && isFormatButton(checked)) checked.focus({ preventScroll: true });
    }
    wasOpen.current = true;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rowRef.current?.contains(target) || popRef.current?.contains(target)) return;
      flushSync(() => onOpenChangeRef.current(false));
    };
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rowRef.current?.contains(target) || popRef.current?.contains(target)) return;
      flushSync(() => onOpenChangeRef.current(false));
    };
    const onMove = () => place();
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    window.addEventListener("resize", onMove);
    document.addEventListener("scroll", onMove, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("resize", onMove);
      document.removeEventListener("scroll", onMove, true);
    };
  }, [open]);

  const apply = (next: Oklch, nextFormat = format) => {
    onChange(next, formatColor(next, nextFormat));
  };

  const onFieldPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const node = event.currentTarget;
    event.preventDefault();
    node.focus({ preventScroll: true });
    if (node.setPointerCapture) node.setPointerCapture(event.pointerId);
    const read = (e: FieldPoint) => {
      const rect = node.getBoundingClientRect();
      const l = Math.min(1, Math.max(0, 1 - (e.clientY - rect.top) / Math.max(1, rect.height)));
      const nextRatio = Math.min(1, Math.max(0, (e.clientX - rect.left) / Math.max(1, rect.width)));
      apply({ l, c: nextRatio * maxChroma(l, hue, space), h: hue, a: color.a });
    };
    read(event);
    const move = (e: globalThis.PointerEvent) => {
      if (!node.hasPointerCapture?.(e.pointerId)) return;
      read(e);
    };
    const end = (e: globalThis.PointerEvent) => {
      if (node.hasPointerCapture?.(e.pointerId)) node.releasePointerCapture(e.pointerId);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", end);
      node.removeEventListener("pointercancel", end);
    };
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", end);
    node.addEventListener("pointercancel", end);
  };

  const onFieldKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const key = event.key;
    if (key !== "ArrowUp" && key !== "ArrowDown" && key !== "ArrowLeft" && key !== "ArrowRight") return;
    event.preventDefault();
    const step = event.shiftKey ? 0.1 : 0.01;
    let l = color.l;
    let nextRatio = ratio;
    if (key === "ArrowUp") l += step;
    else if (key === "ArrowDown") l -= step;
    else if (key === "ArrowRight") nextRatio += step;
    else nextRatio -= step;
    l = Math.min(1, Math.max(0, l));
    nextRatio = Math.min(1, Math.max(0, nextRatio));
    apply({ l, c: nextRatio * maxChroma(l, hue, space), h: hue, a: color.a });
  };

  const onPopKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      closeToSwatch();
      return;
    }
    if (event.key !== "Tab" || !popRef.current) return;
    const checked = popRef.current.querySelector('[role="radio"][aria-checked="true"]');
    const first = checked && isFormatButton(checked) ? checked : null;
    const last = cssInputRef.current;
    const leave = (event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last);
    if (!leave) return;
    // Focus the swatch, then let the browser Tab onward. Preventing default is what stopped on the swatch.
    swatchRef.current?.focus({ preventScroll: true });
    flushSync(() => onOpenChange(false));
  };

  const onFormatKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.metaKey || event.ctrlKey || !popRef.current) return;
    const buttons = [...popRef.current.querySelectorAll(".orb-cp-format")].filter(isFormatButton);
    const index = buttons.findIndex((b) => b === document.activeElement);
    if (index < 0) return;
    let next = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % buttons.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + buttons.length) % buttons.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = buttons.length - 1;
    else return;
    event.preventDefault();
    event.stopPropagation();
    buttons[next].focus({ preventScroll: true });
    buttons[next].click();
  };

  const bindChange = (node: DomInput | null, setInvalid: (invalid: boolean) => void) => {
    if (!node) return;
    const onChange = () => {
      if (node.value === textRef.current) {
        setInvalid(false);
        return;
      }
      if (!commitRef.current(node.value)) setInvalid(true);
    };
    node.addEventListener("change", onChange);
    return () => node.removeEventListener("change", onChange);
  };

  useEffect(
    () =>
      bindChange(rowInputRef.current, (invalid) => {
        rowInvalidRef.current = invalid;
        setRowInvalid(invalid);
      }),
    [text],
  );
  useEffect(() => {
    if (!open) return;
    return bindChange(cssInputRef.current, setCssInvalid);
  }, [open, text]);

  const pop = open
    ? createElement(
        "div",
        {
          ref: popRef,
          className: "orb-cp-pop",
          role: "dialog",
          id: popId,
          "aria-label": "Color color picker",
          "data-testid": "yogesh-orb-color-popover",
          onKeyDown: onPopKey,
        },
        createElement(
          "div",
          { className: "orb-cp-formats" },
          createElement(
            "div",
            { className: "orb-cp-seg", role: "radiogroup", "aria-label": "Color format", onKeyDown: onFormatKey },
            createElement("div", {
              className: "orb-cp-pill",
              "aria-hidden": true,
              style: { transform: `translateX(${TABS.findIndex((tab) => tab.id === format) * 100}%)` },
            }),
            ...TABS.map((tab) => {
              const on = tab.id === format;
              return createElement(
                "button",
                {
                  key: tab.id,
                  type: "button",
                  className: "orb-cp-format",
                  role: "radio",
                  "aria-checked": on,
                  "data-active": String(on),
                  tabIndex: on ? 0 : -1,
                  onClick: () => {
                    setFormat(tab.id);
                    onChange(color, formatColor({ ...color, h: hue }, tab.id));
                  },
                },
                tab.label,
              );
            }),
          ),
        ),
        createElement(
          "div",
          {
            className: "orb-cp-plane",
            role: "group",
            "aria-label": "Color field; use arrow keys to adjust saturation and lightness",
            tabIndex: 0,
            onPointerDown: onFieldPointer,
            onKeyDown: onFieldKey,
          },
          createElement("canvas", {
            ref: canvasRef,
            className: "orb-cp-canvas",
            width: 252,
            height: 160,
            "aria-hidden": true,
          }),
          createElement("span", {
            className: "orb-cp-marker",
            "aria-hidden": true,
            style: {
              left: `${ratio * 100}%`,
              top: `${(1 - color.l) * 100}%`,
              background: opaque,
            },
          }),
        ),
        createElement(
          "div",
          { className: "orb-cp-tracks" },
          createElement(
            "label",
            { className: "orb-cp-track-row" },
            createElement("span", null, "Hue"),
            createElement("input", {
              className: "orb-cp-track",
              type: "range",
              min: 0,
              max: 360,
              step: 0.1,
              value: hue,
              "aria-label": "Hue",
              "aria-valuetext": `${Math.round(hue)} degrees`,
              style: {
                "--orb-cp-track": hueTrack({ ...color, h: hue }, ratio, space),
                "--orb-cp-thumb": opaque,
              },
              onInput: (event: React.FormEvent<HTMLInputElement>) => {
                const h = Number(event.currentTarget.value);
                setHeldHue(h);
                const l = color.l;
                const nextRatio = chromaRatio(color, space);
                apply({ l, c: nextRatio * maxChroma(l, h, space), h, a: color.a });
              },
            }),
          ),
          createElement(
            "label",
            { className: "orb-cp-track-row" },
            createElement("span", null, "Opacity"),
            createElement("input", {
              className: "orb-cp-track orb-cp-op",
              type: "range",
              min: 0,
              max: 100,
              step: 1,
              value: Math.round(color.a * 100),
              "aria-label": "Opacity",
              "aria-valuetext": `${Math.round(color.a * 100)} percent`,
              style: {
                "--orb-cp-track": `linear-gradient(to right, transparent, ${opaque}), repeating-conic-gradient(#aaa 0% 25%, #eee 0% 50%) 0 / 8px 8px`,
                "--orb-cp-thumb": `linear-gradient(${withAlpha}, ${withAlpha}), repeating-conic-gradient(#aaa 0% 25%, #eee 0% 50%) 0 / 8px 8px`,
              },
              onInput: (event: React.FormEvent<HTMLInputElement>) => {
                apply({ l: color.l, c: color.c, h: hue, a: Number(event.currentTarget.value) / 100 });
              },
            }),
          ),
        ),
        createElement("input", {
          ref: cssInputRef,
          className: "orb-cp-css",
          type: "text",
          spellCheck: false,
          autoComplete: "off",
          "aria-label": "CSS color",
          "aria-invalid": cssInvalid ? true : undefined,
          title: text,
          value: cssDraft,
          onInput: (event: React.FormEvent<HTMLInputElement>) => {
            setCssDraft(event.currentTarget.value);
            setCssInvalid(false);
          },
          onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            const value = event.currentTarget.value;
            if (!commitRef.current(value)) setCssInvalid(true);
          },
        }),
      )
    : null;

  return createElement(
    "div",
    null,
    createElement(
      "div",
      { ref: rowRef, className: "orb-cp-control", "data-open": open ? "true" : "false", "data-testid": "yogesh-orb-color-row" },
      createElement("span", { className: "orb-cp-label" }, "Color"),
      createElement(
        "div",
        { className: "orb-cp-inputs" },
        createElement("input", {
          ref: rowInputRef,
          className: "orb-cp-value",
          type: "text",
          spellCheck: false,
          autoComplete: "off",
          "aria-label": "Color color value",
          "aria-invalid": rowInvalid ? true : undefined,
          title: text,
          value: rowDraft,
          onInput: (event: React.FormEvent<HTMLInputElement>) => {
            setRowDraft(event.currentTarget.value);
            rowInvalidRef.current = false;
            setRowInvalid(false);
          },
          onBlur: () => {
            if (!rowInvalidRef.current) return;
            rowInvalidRef.current = false;
            flushSync(() => {
              setRowDraft(textRef.current);
              setRowInvalid(false);
            });
          },
          onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
            event.stopPropagation();
            const input = event.currentTarget;
            if (event.key === "Escape") {
              event.preventDefault();
              input.value = text;
              rowInvalidRef.current = false;
              setRowDraft(text);
              setRowInvalid(false);
              if (open) {
                closeToSwatch();
                return;
              }
              input.blur();
              return;
            }
            if (event.key === "Enter") {
              if (commitRef.current(input.value)) input.blur();
              else {
                rowInvalidRef.current = true;
                setRowInvalid(true);
              }
            }
          },
        }),
        createElement("button", {
          ref: swatchRef,
          type: "button",
          className: "orb-cp-swatch",
          "data-testid": "yogesh-orb-color-swatch",
          "aria-label": "Pick color color",
          "aria-haspopup": "dialog",
          "aria-controls": popId,
          "aria-expanded": open,
          style: { "--orb-cp-color": swatchColor },
          onClick: () => onOpenChange(!open),
        }),
      ),
    ),
    pop && typeof document !== "undefined" ? createPortal(pop, document.body) : null,
  );
}

/* FILE src/components/SelectRow.tsx */
import { createElement, startTransition, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Platform, Pressable, Text, useWindowDimensions, View, type TextStyle, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { useTheme } from "../theme/theme";
import { Chevron } from "./icons";

type WebKeyEvent = {
  key?: string;
  repeat?: boolean;
  preventDefault: () => void;
  stopPropagation: () => void;
  nativeEvent?: {
    key?: string;
    repeat?: boolean;
    preventDefault?: () => void;
    stopPropagation?: () => void;
  };
};

declare module "react-native" {
  interface ViewProps {
    onKeyDown?: (event: WebKeyEvent) => void;
    onKeyDownCapture?: (event: WebKeyEvent) => void;
    onContextMenu?: () => void;
    onPointerCancel?: () => void;
    dataSet?: Record<string, string>;
  }
}

function pointerButton(event: { button?: number; nativeEvent?: object }): number {
  if (typeof event.button === "number") return event.button;
  const native = event.nativeEvent;
  if (native && "button" in native && typeof native.button === "number") return native.button;
  return 0;
}

function keyName(event: WebKeyEvent): string {
  return event.key ?? event.nativeEvent?.key ?? "";
}

const MENU_FONT = 'system-ui, -apple-system, "SF Pro Display", sans-serif';

/** Dark hover/focus is DialKit `--dial-surface-hover` (#ffffff1f) and `--dial-focus-ring` (#fff9). Selected stays `--dial-surface-active` (#ffffff2e). */
const OPTION_CSS = `[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-option"]{background-color:transparent;color:#ffffffb3;font-family:${MENU_FONT};font-size:13px;font-weight:500;line-height:19.5px;transition:background-color .15s,color .15s}
[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-label"]{color:#ffffffb3;opacity:1}
[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-option"]:hover{background-color:#ffffff1f}
[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-option"][aria-selected="true"]{background-color:#ffffff2e;color:#fffffff2}
[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-option"][aria-selected="true"] [data-testid="orb-select-label"]{color:#fffffff2}
[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-option"]:focus-visible{background-color:#ffffff1f;color:#fff;outline:2px solid #fff9;outline-offset:-2px}
[data-testid="yogesh-orb-panel"] .orb-select-menu [data-testid="orb-select-option"]:focus-visible [data-testid="orb-select-label"]{color:#fff;opacity:1}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-option"]{color:#0009}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-label"]{color:#0009}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-option"]:hover{background-color:#00000014}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-option"][aria-selected="true"]{background-color:#0000001a;color:#000000e6}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-option"][aria-selected="true"] [data-testid="orb-select-label"]{color:#000000e6}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-option"]:focus-visible{background-color:#00000014;color:#000;outline:2px solid #0000008c;outline-offset:-2px}
[data-testid="yogesh-orb-panel"] .orb-select-menu.is-light [data-testid="orb-select-option"]:focus-visible [data-testid="orb-select-label"]{color:#000}
[data-testid="yogesh-orb-panel"] [aria-haspopup="listbox"]{transition:background-color .15s ease}
[data-testid="yogesh-orb-panel"] [data-orb-trigger="dark"][aria-expanded="false"]:hover{background-color:rgba(255,255,255,.12)!important}`;

function injectOptionStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("orb-select-option-css")) return;
  const style = document.createElement("style");
  style.id = "orb-select-option-css";
  style.textContent = OPTION_CSS;
  document.head.appendChild(style);
}

const MENU_TEXT: TextStyle = {
  fontFamily: MENU_FONT,
  fontSize: 13,
  fontWeight: "500",
  lineHeight: 19.5,
};
const OPTION_BOX: ViewStyle = {
  height: 36,
  borderRadius: 6,
  paddingVertical: 8,
  paddingHorizontal: 10,
};

const MENU = { stiffness: 1218, damping: 69.8, mass: 1 };
const CHEV = { stiffness: 685, damping: 44.5, mass: 1 };
const OUTSIDE_CLOSE_EVENT: "pointerdown" | "click" = "pointerdown";
/** Web close only (dismissWeb, onEnd web close). Same stiffness, damping, and mass as MENU; energyThreshold is the only difference. Native close stays on MENU. */
const CLOSE_MENU = { stiffness: MENU.stiffness, damping: MENU.damping, mass: MENU.mass, energyThreshold: 1.8e-7 };

export function SelectRow<T extends string>({
  label,
  value,
  options,
  open,
  onToggle,
  onPick,
  display,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  open: boolean;
  onToggle: () => void;
  onPick: (id: T) => void;
  display: string;
}) {
  const { colors, mode } = useTheme();
  const { height: windowH } = useWindowDimensions();
  const rowRef = useRef<View>(null);
  const menuRef = useRef<View>(null);
  const [above, setAbove] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, options.findIndex((option) => option.id === value)));
  const focusOnOpen = useRef(false);
  const typed = useRef({ buf: "", at: 0 });
  const aboveSV = useSharedValue(0);
  const shown = useSharedValue(open ? 1 : 0);
  const chevron = useSharedValue(open ? 1 : 0);
  const openSV = useSharedValue(open ? 1 : 0);
  const goal = useSharedValue(open ? 1 : 0);
  const armed = useRef(false);
  const sawOpen = useRef(false);
  const primary = useSharedValue(0);
  const openRef = useRef(open);
  const committedOpen = useRef(open);
  const epoch = useRef(0);
  const appliedEpoch = useRef(0);
  const closeDelivered = useRef(false);
  const toggleRef = useRef(onToggle);
  const openFrame = useRef(0);
  const closeFrame = useRef(0);
  const requestClose = () => {
    epoch.current += 1;
    openRef.current = false;
  };
  const cancelOpenFrame = () => {
    if (openFrame.current === 0) return;
    cancelAnimationFrame(openFrame.current);
    openFrame.current = 0;
  };
  const cancelCloseFrame = () => {
    if (closeFrame.current === 0) return;
    cancelAnimationFrame(closeFrame.current);
    closeFrame.current = 0;
  };
  const commitRef = useRef((opening: boolean) => {
    if (opening) {
      if (!openRef.current) return;
      appliedEpoch.current = epoch.current;
      armed.current = true;
      onToggle();
      return;
    }
    const gen = epoch.current;
    startTransition(() => {
      if (gen !== epoch.current || openRef.current || !committedOpen.current) return;
      closeDelivered.current = true;
      appliedEpoch.current = gen;
      armed.current = true;
      onToggle();
    });
  });
  const commitJS = useCallback(() => {
    requestClose();
    commitRef.current(false);
  }, []);
  const web = Platform.OS === "web";
  useLayoutEffect(() => {
    if (web) injectOptionStyles();
  }, [web]);
  const optionsInRow = (): HTMLElement[] => {
    const host: unknown = rowRef.current;
    if (typeof host !== "object" || host === null || !("querySelectorAll" in host)) return [];
    const query = host.querySelectorAll;
    if (typeof query !== "function") return [];
    const raw: unknown = query.call(host, '[role="option"]');
    if (typeof raw !== "object" || raw === null || !("length" in raw) || typeof raw.length !== "number") return [];
    if (!("item" in raw) || typeof raw.item !== "function") return [];
    const nodes: HTMLElement[] = [];
    for (let i = 0; i < raw.length; i++) {
      const item: unknown = raw.item(i);
      if (item instanceof HTMLElement) nodes.push(item);
    }
    return nodes;
  };
  const focusTrigger = () => {
    const host: unknown = rowRef.current;
    if (typeof host !== "object" || host === null || !("querySelector" in host)) return;
    const query = host.querySelector;
    if (typeof query !== "function") return;
    const node: unknown = query.call(host, '[aria-haspopup="listbox"]');
    if (node instanceof HTMLElement) node.focus({ preventScroll: true });
  };
  const menuEl = (): HTMLElement | null => {
    const node: unknown = menuRef.current;
    return node instanceof HTMLElement ? node : null;
  };
  const sealClosed = () => {
    if (openRef.current) return;
    cancelOpenFrame();
    const menu = menuEl();
    if (!menu) return;
    if (typeof document !== "undefined" && document.activeElement instanceof Node && menu.contains(document.activeElement)) focusTrigger();
    menu.setAttribute("inert", "");
    menu.setAttribute("aria-hidden", "true");
    for (const node of optionsInRow()) node.tabIndex = -1;
  };
  const unseal = () => {
    const menu = menuEl();
    menu?.removeAttribute("inert");
    menu?.removeAttribute("aria-hidden");
  };
  const unsealForPointer = () => {
    unseal();
    focusOnOpen.current = true;
  };
  const sealRef = useRef(sealClosed);
  const unsealPtrRef = useRef(unsealForPointer);
  useLayoutEffect(() => {
    toggleRef.current = onToggle;
    commitRef.current = (opening: boolean) => {
      if (opening) {
        if (!openRef.current) return;
        appliedEpoch.current = epoch.current;
        armed.current = true;
        onToggle();
        return;
      }
      const gen = epoch.current;
      startTransition(() => {
        if (gen !== epoch.current || openRef.current || !committedOpen.current) return;
        closeDelivered.current = true;
        appliedEpoch.current = gen;
        armed.current = true;
        onToggle();
      });
    };
    sealRef.current = sealClosed;
    unsealPtrRef.current = unsealForPointer;
  });
  const sealJS = useCallback(() => {
    requestClose();
    sealRef.current();
  }, []);
  const unsealPtrJS = useCallback(() => unsealPtrRef.current(), []);
  const focusSelected = () => {
    focusOnOpen.current = false;
    const nodes = optionsInRow();
    const selected = nodes.find((node) => node.getAttribute("aria-selected") === "true");
    const target = selected ?? nodes[0];
    for (const node of nodes) node.tabIndex = node === target ? 0 : -1;
    target?.focus({ preventScroll: true });
  };
  const commitOpen = useCallback(() => {
    cancelCloseFrame();
    epoch.current += 1;
    openRef.current = true;
    const delivered = closeDelivered.current;
    let committed = false;
    if (delivered && committedOpen.current) {
      const gen = epoch.current;
      let countered = false;
      startTransition(() => {
        if (gen !== epoch.current || !openRef.current) return;
        closeDelivered.current = false;
        countered = true;
        toggleRef.current();
      });
      if (countered) armed.current = false;
    } else if (delivered || !committedOpen.current) {
      closeDelivered.current = false;
      flushSync(() => commitRef.current(true));
      committed = true;
    }
    if (committedOpen.current && !committed) focusSelected();
    openSV.value = 1;
    goal.value = 1;
    cancelOpenFrame();
    openFrame.current = requestAnimationFrame(() => {
      openFrame.current = 0;
      if (openSV.value !== 1) return;
      shown.value = withSpring(1, MENU);
      chevron.value = withSpring(1, CHEV);
    });
  }, [chevron, goal, openSV, shown]);
  const commitNextFrame = useCallback(() => {
    cancelCloseFrame();
    const gen = epoch.current;
    closeFrame.current = requestAnimationFrame(() => {
      closeFrame.current = 0;
      if (gen !== epoch.current || openRef.current) return;
      commitRef.current(false);
    });
  }, []);
  const dismissWeb = useCallback(() => {
    if (openSV.value !== 1) return;
    requestClose();
    cancelOpenFrame();
    sealClosed();
    openSV.value = 0;
    goal.value = 0;
    shown.value = withSpring(0, CLOSE_MENU);
    chevron.value = withSpring(0, CHEV);
    commitNextFrame();
  }, [chevron, commitNextFrame, goal, openSV, shown]);
  useEffect(() => {
    if (!web || !open || typeof document === "undefined") return;
    const inside = (target: EventTarget | null) => {
      const host: unknown = rowRef.current;
      if (typeof host !== "object" || host === null || !("contains" in host) || typeof host.contains !== "function") return false;
      return target instanceof Node && host.contains(target) === true;
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      dismissWeb();
      focusTrigger();
    };
    const onOutside = (event: Event) => {
      if (inside(event.target)) return;
      dismissWeb();
    };
    document.addEventListener("keydown", onKey, { passive: true });
    document.addEventListener(OUTSIDE_CLOSE_EVENT, onOutside, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener(OUTSIDE_CLOSE_EVENT, onOutside);
    };
  }, [dismissWeb, open, web]);
  useLayoutEffect(() => {
    committedOpen.current = open;
    if (open === openRef.current) {
      closeDelivered.current = false;
      appliedEpoch.current = epoch.current;
      return;
    }
    if (!open && closeDelivered.current && openRef.current) {
      closeDelivered.current = false;
      appliedEpoch.current = epoch.current;
      armed.current = true;
      onToggle();
      return;
    }
    if (!open && epoch.current === appliedEpoch.current && !closeDelivered.current) openRef.current = false;
  }, [open, onToggle]);
  useLayoutEffect(() => {
    if (!open && openRef.current) return;
    openSV.value = open ? 1 : 0;
  }, [open, openSV]);
  useLayoutEffect(() => {
    if (!sawOpen.current) {
      sawOpen.current = true;
      return;
    }
    if (armed.current) {
      armed.current = false;
      return;
    }
    goal.value = open ? 1 : 0;
    shown.value = withSpring(open ? 1 : 0, web && !open ? CLOSE_MENU : MENU);
    chevron.value = withSpring(open ? 1 : 0, CHEV);
  }, [open, chevron, goal, shown, web]);
  useLayoutEffect(() => {
    if (open) return;
    setActive(Math.max(0, options.findIndex((option) => option.id === value)));
  }, [open, options, value]);
  useLayoutEffect(() => {
    if (!web || !open || !focusOnOpen.current) return;
    focusSelected();
  }, [open, options, value, web]);
  const place = () => {
    rowRef.current?.measureInWindow((_x, y, _w, h) => {
      const menuH = 8 + options.length * 36;
      const next = y + h + menuH + 8 > windowH;
      aboveSV.value = next ? 1 : 0;
      setAbove(next);
    });
  };
  useEffect(() => {
    place();
  }, [windowH, options.length]);
  useEffect(() => {
    return () => {
      if (openFrame.current !== 0) {
        cancelAnimationFrame(openFrame.current);
        openFrame.current = 0;
      }
      if (closeFrame.current !== 0) {
        cancelAnimationFrame(closeFrame.current);
        closeFrame.current = 0;
      }
    };
  }, []);
  const mountOnPress = (event: { button?: number; nativeEvent?: object }) => {
    primary.value = pointerButton(event) === 0 ? 1 : 0;
  };
  const cancelClosed = () => {
    primary.value = 0;
    if (openSV.value === 1) return;
    goal.value = 0;
    shown.value = 0;
  };
  const tap = useMemo(() => {
    const spring = (next: number) => {
      "worklet";
      goal.value = next;
      shown.value = withSpring(next, MENU);
      chevron.value = withSpring(next, CHEV);
    };
    return Gesture.Tap()
      .maxDistance(6)
      .maxDuration(10000)
      .onEnd(() => {
        const next = openSV.value === 1 ? 0 : 1;
        if (web) {
          const fromPointer = primary.value === 1;
          primary.value = 0;
          if (!fromPointer) return;
          openSV.value = next;
          goal.value = next;
          if (next === 1) {
            runOnJS(unsealPtrJS)();
            runOnJS(commitOpen)();
            return;
          }
          runOnJS(sealJS)();
          shown.value = withSpring(0, CLOSE_MENU);
          chevron.value = withSpring(0, CHEV);
          runOnJS(commitNextFrame)();
          return;
        }
        spring(next);
        runOnJS(commitJS)();
      });
  }, [chevron, commitJS, commitNextFrame, commitOpen, goal, openSV, primary, sealJS, shown, unsealPtrJS, web]);
  const menuStyle = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (1 - shown.value) * (aboveSV.value ? 8 : -8) }, { scale: 0.95 + shown.value * 0.05 }],
  }));
  const chevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${chevron.value * 180}deg` }] }));
  const openFromKeys = () => {
    const index = Math.max(0, options.findIndex((option) => option.id === value));
    setActive(index);
    focusOnOpen.current = true;
    unseal();
    commitOpen();
  };
  const moveTo = (index: number, nodes: HTMLElement[]) => {
    const next = Math.max(0, Math.min(nodes.length - 1, index));
    setActive(next);
    nodes[next]?.focus({ preventScroll: true });
  };
  const onKeyDownCapture = (event: WebKeyEvent) => {
    const key = keyName(event);
    if (key === "Tab") {
      if (openSV.value !== 1) return;
      sealClosed();
      dismissWeb();
      return;
    }
    if (key === "Escape") {
      if (openSV.value !== 1) return;
      event.preventDefault();
      event.nativeEvent?.preventDefault?.();
      dismissWeb();
      focusTrigger();
      return;
    }
    if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      event.nativeEvent?.preventDefault?.();
      event.stopPropagation();
      if (openSV.value === 1) {
        const nodes = optionsInRow();
        nodes[active]?.focus();
        return;
      }
      openFromKeys();
      return;
    }
    if (key !== "Enter" && key !== " " && key !== "Spacebar") return;
    event.preventDefault();
    event.nativeEvent?.preventDefault?.();
    event.stopPropagation();
    event.nativeEvent?.stopPropagation?.();
    if (event.repeat || event.nativeEvent?.repeat) return;
    if (openSV.value === 1) {
      dismissWeb();
      return;
    }
    openFromKeys();
  };
  const onOptionKey = (event: WebKeyEvent & { altKey?: boolean; metaKey?: boolean; ctrlKey?: boolean }, index: number) => {
    if (!open) return;
    const nodes = optionsInRow();
    const key = keyName(event);
    if (key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End") {
      event.preventDefault();
      event.stopPropagation();
      if (key === "ArrowDown") moveTo(index + 1, nodes);
      else if (key === "ArrowUp") moveTo(index - 1, nodes);
      else if (key === "Home") moveTo(0, nodes);
      else moveTo(nodes.length - 1, nodes);
      return;
    }
    if (key === "Enter" || key === " " || key === "Spacebar") {
      event.preventDefault();
      event.stopPropagation();
      requestClose();
      sealClosed();
      onPick(options[index].id);
      focusTrigger();
      return;
    }
    if (key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      dismissWeb();
      focusTrigger();
      return;
    }
    if (key === "Tab") {
      event.stopPropagation();
      sealClosed();
      dismissWeb();
      focusTrigger();
      return;
    }
    if (key.length !== 1 || key === " " || event.altKey || event.metaKey || event.ctrlKey) return;
    event.preventDefault();
    event.stopPropagation();
    const now = Date.now();
    const t = typed.current;
    t.buf = now - t.at < 700 ? t.buf + key.toLowerCase() : key.toLowerCase();
    t.at = now;
    const q = [...t.buf].every((c) => c === t.buf[0]) ? t.buf[0] : t.buf;
    for (let n = q.length > 1 ? 0 : 1; n <= options.length; n++) {
      const i = (index + n) % options.length;
      if (options[i].label.toLowerCase().startsWith(q)) {
        moveTo(i, nodes);
        return;
      }
    }
  };
  const menuInk = mode === "light" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)";
  const triggerText: TextStyle = {
    ...MENU_TEXT,
    color: menuInk,
    transform: [{ translateY: -0.5 }],
  };
  return (
    <View ref={rowRef} onLayout={place} style={{ zIndex: open ? 20 : 1 }}>
      <GestureDetector gesture={tap} touchAction="pan-y">
        <View
          accessible
          accessibilityRole="button"
          aria-haspopup={web ? "listbox" : undefined}
          aria-expanded={web ? open : undefined}
          dataSet={{ orbTrigger: mode }}
          collapsable={false}
          onPointerDown={web ? mountOnPress : undefined}
          onContextMenu={web ? cancelClosed : undefined}
          onPointerCancel={web ? cancelClosed : undefined}
          onKeyDownCapture={Platform.OS === "web" ? onKeyDownCapture : undefined}
          style={{
            height: 36,
            borderRadius: 8,
            backgroundColor: open
              ? mode === "dark"
                ? "rgba(255,255,255,0.18)"
                : "rgba(0,0,0,0.10)"
              : mode === "dark"
                ? "rgba(255,255,255,0.08)"
                : colors.row,
            paddingHorizontal: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={triggerText}>{label}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={triggerText}>{display}</Text>
            <Animated.View style={chevronStyle}>
              <Chevron color={menuInk} />
            </Animated.View>
          </View>
        </View>
      </GestureDetector>
      <Animated.View
          ref={menuRef}
          pointerEvents={open ? "auto" : "none"}
          focusable={false}
          accessibilityElementsHidden={!open}
          importantForAccessibility={open ? "auto" : "no-hide-descendants"}
          aria-hidden={!open}
          style={[
            {
              position: "absolute",
              top: above ? undefined : 40,
              bottom: above ? 40 : undefined,
              left: 0,
              right: 0,
              backgroundColor: mode === "light" ? "#fafafa" : colors.pop,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: mode === "light" ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.14)",
              padding: 4,
              zIndex: 30,
              boxShadow: mode === "dark" ? "0 8px 24px rgba(0,0,0,0.4)" : "0 4px 16px rgba(0,0,0,0.08)",
            },
            menuStyle,
          ]}
        >
          {web
            ? createElement(
                "div",
                { role: "listbox", "aria-label": label, className: mode === "light" ? "orb-select-menu is-light" : "orb-select-menu", inert: open ? undefined : true },
                options.map((option, index) => {
                  const on = option.id === value;
                  const tabbable = open && index === active;
                  return (
                    <Pressable key={option.id} role="option" tabIndex={tabbable ? 0 : -1} focusable={tabbable} accessibilityState={{ selected: on }} aria-selected={on} testID="orb-select-option" onKeyDown={(event) => onOptionKey(event, index)} onPress={() => { requestClose(); sealClosed(); onPick(option.id); focusTrigger(); }} style={OPTION_BOX}>
                      <Text testID="orb-select-label" style={MENU_TEXT}>{option.label}</Text>
                    </Pressable>
                  );
                }),
              )
            : options.map((option) => {
                const on = option.id === value;
                return (
                  <Pressable key={option.id} accessibilityRole="menuitem" accessibilityState={{ selected: on }} aria-selected={on} onPress={() => onPick(option.id)} style={[OPTION_BOX, { backgroundColor: on ? (mode === "dark" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.10)") : "transparent" }]}>
                    <Text style={{ ...MENU_TEXT, color: colors.fg, opacity: mode === "light" ? (on ? 0.9 : 0.6) : on ? 0.95 : 0.7 }}>{option.label}</Text>
                  </Pressable>
                );
              })}
        </Animated.View>
    </View>
  );
}

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

/* FILE src/components/Shimmer.tsx */
import { Geist_400Regular } from "@expo-google-fonts/geist/400Regular";
import { Canvas, LinearGradient, Mask, Rect, Text, useFont, vec } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { Text as RNText, type TextStyle } from "react-native";
import Animated, {
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { fonts, useTheme } from "../theme/theme";

/** Native sweep. Web keeps the CSS version in Shimmer.web.tsx. Not an orb canvas. */
export function Shimmer({ text, style }: { text: string; style?: TextStyle }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const size = typeof style?.fontSize === "number" ? style.fontSize : 14;
  const font = useFont(Geist_400Regular, size);
  const shift = useSharedValue(0);
  const width = font ? Math.max(1, Math.ceil(font.getTextWidth(text))) : Math.max(1, Math.ceil(text.length * size * 0.56));
  const height = Math.ceil(size * 1.45);

  useEffect(() => {
    if (reduced) return;
    shift.value = -width * 2;
    shift.value = withRepeat(withTiming(width * 2, { duration: 2000, easing: Easing.linear }), -1, false);
  }, [reduced, shift, text, width]);

  const start = useDerivedValue(() => vec(shift.value, 0));
  const end = useDerivedValue(() => vec(shift.value + width * 2, 0));

  if (reduced || !font) {
    return (
      <RNText style={[{ color: colors.muted, fontFamily: style?.fontFamily ?? fonts.regular, fontSize: size, fontStyle: style?.fontStyle }, style]}>
        {text}
      </RNText>
    );
  }

  return (
    <Animated.View>
      <Canvas style={{ width, height }}>
        <Mask mode="alpha" mask={<Text x={0} y={size} text={text} font={font} color="white" />}>
          <Rect x={0} y={0} width={width} height={height}>
            <LinearGradient
              start={start}
              end={end}
              mode="repeat"
              colors={[colors.muted, colors.muted, colors.fg, colors.muted, colors.muted]}
              positions={[0, 0.35, 0.5, 0.65, 1]}
            />
          </Rect>
        </Mask>
      </Canvas>
    </Animated.View>
  );
}

/* FILE src/components/Shimmer.web.tsx */
import { useEffect } from "react";
import { Platform, type TextStyle } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { useTheme, fonts } from "../theme/theme";

let injected = false;
function injectKeyframes() {
  if (injected || Platform.OS !== "web" || typeof document === "undefined") return;
  injected = true;
  const style = document.createElement("style");
  style.textContent = `@keyframes orb-shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}`;
  document.head.appendChild(style);
}

/** Status label. Full opacity on the first frame. Remount (key by look index) restarts the sweep. */
export function Shimmer({ text, style }: { text: string; style?: TextStyle }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  useEffect(() => {
    injectKeyframes();
  }, []);
  const sweep = !reduced;
  return (
    <span
      style={{
        fontFamily: typeof style?.fontFamily === "string" ? style.fontFamily : fonts.regular,
        fontSize: typeof style?.fontSize === "number" ? style.fontSize : 14,
        fontStyle: style?.fontStyle,
        lineHeight: typeof style?.lineHeight === "number" ? `${style.lineHeight}px` : "20px",
        display: "inline-block",
        opacity: 1,
        backgroundImage: sweep
          ? `linear-gradient(90deg, ${colors.muted} 35%, ${colors.fg} 50%, ${colors.muted} 65%)`
          : undefined,
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: sweep ? "transparent" : colors.muted,
        animation: sweep ? "orb-shimmer 2s linear infinite" : undefined,
      }}
    >
      {text}
    </span>
  );
}

/* FILE src/components/icons.tsx */
import { createElement } from "react";
import { Platform } from "react-native";
import Svg, { Path } from "react-native-svg";

const decorative = Platform.OS === "web" ? { "aria-hidden": true } : {};

export function GithubIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} {...decorative}>
      <Path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3" />
    </Svg>
  );
}

export function DrayIcon({ color, height = 12 }: { color: string; height?: number }) {
  const width = (height * 76) / 96;
  return (
    <Svg width={width} height={height} viewBox="0 0 76 96" fill={color} {...decorative}>
      <Path d="M48.2787 0C49.9989 5.053e-08 51.3934 1.4046 51.3934 3.13726V8.78431C51.3934 17.4476 58.3661 24.4706 66.9672 24.4706H72.8852C74.6055 24.4706 76 25.8752 76 27.6078V68.3922C76 70.1248 74.6055 71.5294 72.8852 71.5294H66.9672C58.3661 71.5294 51.3934 78.5524 51.3934 87.2157V92.8627C51.3934 94.5954 49.9989 96 48.2787 96H0.155738C0.0697261 96 0 95.9298 0 95.8431V64.7843C0 64.6977 0.0697261 64.6275 0.155738 64.6275H29.2787C37.8798 64.6275 44.8525 57.6045 44.8525 48.9412V47.0588C44.8525 38.3955 37.8798 31.3726 29.2787 31.3726H0.155738C0.0697261 31.3726 0 31.3023 0 31.2157V0.156863C0 0.0702299 0.0697261 0 0.155738 0H48.2787Z" />
    </Svg>
  );
}

export function Chevron({ color, size = 20 }: { color: string; size?: number }) {
  if (Platform.OS === "web") {
    return createElement(
      "svg",
      {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2.5,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
        style: { width: size, height: size, padding: 2, opacity: 0.6, boxSizing: "border-box", color },
      },
      createElement("path", { d: "M6 9.5L12 15.5L18 9.5" }),
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 9.5L12 15.5L18 9.5" />
    </Svg>
  );
}
