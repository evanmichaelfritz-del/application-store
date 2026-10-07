import { Canvas, Picture, Skia, useCanvasRef, type SkPicture } from "@shopify/react-native-skia";
import { memo, useEffect, useMemo, useRef } from "react";
import { Platform, View } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { useIsFocused } from "expo-router";
import { useFrameCallback, useReducedMotion, useSharedValue, runOnUI, type SharedValue } from "react-native-reanimated";
import { useReduceMotion as useStoreReduceMotion } from "@/src/context/ReduceMotionContext";
import { useSkiaRuntime } from "@/src/skia/liveBudget";

import { parseColor, toExtendedSrgb, toSrgb } from "../color/color";
import { tick } from "./clock";
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

type Props = {
  state: string;
  variant?: string;
  size: number;
  speed?: number;
  density?: number;
  dotSize?: number;
  tilt?: number;
  shape?: ShapeName;
  render?: RenderName;
  color: string;
  /** When false the canvas stays mounted but does not tick. */
  active?: boolean;
  /** Playground sliders write here. Landing orbs leave it unset. */
  live?: SharedValue<OrbLive>;
  /** Last rasterized frame, for a card that has scrolled its canvas away. */
  onFrame?: (uri: string) => void;
};

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

function LiveOrb({
  state,
  variant,
  size,
  speed = 1,
  density = 1,
  dotSize = 1,
  tilt = 20,
  shape = "sphere",
  render = "dots",
  color,
  active = true,
  live,
  onFrame,
}: Props) {
  const { picture, retire } = usePicture();
  const inputSV = useSharedValue<OrbInput | null>(null);
  const localSV = useSharedValue<OrbLocal | null>(null);
  const activeSV = useSharedValue(active);
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

  useEffect(() => {
    activeSV.value = active;
    if (!live) {
      fallback.value = { size, speed, density, dotSize, tilt, ...colorToRgba(color) };
    }
  }, [active, color, size, speed, density, dotSize, tilt, live, activeSV, fallback]);

  const frameCallback = useFrameCallback((frame) => {
    "worklet";
    const input = inputSV.value;
    if (!input || !activeSV.value) return;
    const tune = live ? live.value : fallback.value;
    const look = `${input.state}@${tune.speed}`;
    const now = frame.timestamp;
    const t = tick(look, now, tune.speed);
    let local = localSV.value;
    if (!local || local.key !== input.key || local.dots.length !== input.count * 6) {
      local = makeLocal(input);
      localSV.value = local;
    }
    paint(picture, retire, input, local, tune, t);
  }, active);

  useEffect(() => {
    frameCallback.setActive(active);
  }, [active, frameCallback]);

  return <CanvasHost size={size} picture={picture} onFrame={onFrame} />;
}

function StillOrb({
  state,
  variant,
  size,
  speed = 1,
  density = 1,
  dotSize = 1,
  tilt = 20,
  shape = "sphere",
  render = "dots",
  color,
  live,
  onFrame,
}: Props) {
  const { picture, retire } = usePicture();
  const built = useMemo(
    () => buildInput({ state, variant, size, density, dotSize, shape, render }),
    [state, variant, size, density, dotSize, shape, render],
  );

  useEffect(() => {
    const tune: OrbLive = live
      ? live.value
      : { size, speed, density, dotSize, tilt, ...colorToRgba(color) };
    const input = built;
    runOnUI(() => {
      "worklet";
      paint(picture, retire, input, makeLocal(input), tune, 0);
    })();
  }, [built, color, density, dotSize, live, picture, retire, size, speed, tilt]);

  return <CanvasHost size={size} picture={picture} onFrame={onFrame} />;
}

export const OrbView = memo(function OrbView(props: Props) {
  const focused = useIsFocused();
  const reduced = useReducedMotion() === true || useStoreReduceMotion().reduceMotion;
  const runtime = useSkiaRuntime();
  if (!focused) return null;
  if (!runtime.mount) return <View style={{ width: props.size, height: props.size }} />;
  if (reduced) return <StillOrb {...props} />;
  return <LiveOrb {...props} active={props.active !== false && runtime.running} />;
});
