import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas, PaintStyle, Picture, Skia, type SkCanvas, type SkPaint, type SkPicture } from "@shopify/react-native-skia";
import { MODE_FRAMES, resolvePreset } from "./engine";
import {
  motionsourceSize,
  resolveMotionsource,
  type MotionsourceKey,
} from "./motionsource";
import { nowSeconds, subscribeOrbFrame, useReducedMotion } from "./clock";
import { orbTime } from "./time";
import type { OrbFrame, OrbSize, OrbState } from "./types";

export interface ThinkingOrbProps {
  /** Playground / identity prop. Do not use for Motionsource chrome labels. */
  state?: OrbState;
  /** MOTION_LOCK Motionsource key — paints recipe without chrome state= rename. */
  motionsource?: MotionsourceKey;
  size?: OrbSize;
  /** Multiplies the preset baked speed. Default 1. Do not use 0 to pause. */
  speed?: number;
  /** Freeze the last t. Does not clear the picture. */
  paused?: boolean;
  /**
   * Ink polarity from the package painter (`dark` → light dots).
   * The demo UI is dark-only; this prop does not switch chrome.
   */
  dark?: boolean;
  /**
   * When false, leave the canvas mounted but drop the frame subscription.
   * Coming back uses wall-clock t (in phase), not a private elapsed clock.
   */
  active?: boolean;
}

function ink(white: number | undefined, alpha: number | undefined, dark: boolean) {
  const channelSource = Math.min(1, Math.max(0, white ?? 0));
  const channel = dark ? 1 - channelSource : channelSource;
  const a = alpha ?? 1;
  return Skia.Color([channel, channel, channel, a]);
}

function drawFrame(canvas: SkCanvas, frame: OrbFrame, paint: SkPaint, dark: boolean) {
  paint.setAntiAlias(true);
  if (frame.lines.length > 0) {
    paint.setStyle(PaintStyle.Stroke);
    for (const line of frame.lines) {
      paint.setStrokeWidth(line.w);
      paint.setColor(ink(line.white, line.a, dark));
      canvas.drawLine(line.x1, line.y1, line.x2, line.y2, paint);
    }
  }
  paint.setStyle(PaintStyle.Fill);
  for (const dot of frame.dots) {
    if (dot.r <= 0) continue;
    paint.setColor(ink(dot.white, dot.a, dark));
    canvas.drawCircle(dot.x, dot.y, dot.r, paint);
  }
}

/** Draw one engine frame with its origin at (x, y). `frameTime` is the engine `t`, not wall seconds. */
export function drawOrbAt(
  canvas: SkCanvas,
  paint: SkPaint,
  input: {
    state?: OrbState;
    motionsource?: MotionsourceKey;
    size: OrbSize;
    frameTime: number;
    x: number;
    y: number;
    dark?: boolean;
  },
) {
  const ms = input.motionsource
    ? resolveMotionsource(input.motionsource)
    : null;
  const preset = ms ?? resolvePreset(input.state!, input.size);
  const size = ms ? ms.size : input.size;
  const frame = MODE_FRAMES[preset.mode](size, input.frameTime, preset.opts);
  canvas.save();
  canvas.translate(input.x, input.y);
  drawFrame(canvas, frame, paint, input.dark ?? true);
  canvas.restore();
}

export function frameTimeForState(state: OrbState, size: OrbSize, reducedMotion: boolean): number {
  const preset = resolvePreset(state, size);
  return orbTime({
    nowSeconds: nowSeconds(),
    bakedSpeed: preset.speed,
    speed: 1,
    paused: false,
    reducedMotion,
    frozen: null,
  }).t;
}

export function frameTimeForMotionsource(key: MotionsourceKey, reducedMotion: boolean): number {
  const preset = resolveMotionsource(key);
  return orbTime({
    nowSeconds: nowSeconds(),
    bakedSpeed: preset.speed,
    speed: 1,
    paused: false,
    reducedMotion,
    frozen: null,
  }).t;
}

/** @deprecated Prefer frameTimeForState / frameTimeForMotionsource */
export function frameTimeFor(state: OrbState, size: OrbSize, reducedMotion: boolean): number {
  return frameTimeForState(state, size, reducedMotion);
}

function recordPicture(size: number, frame: OrbFrame, paint: SkPaint, dark: boolean): SkPicture {
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, size, size));
  drawFrame(canvas, frame, paint, dark);
  return recorder.finishRecordingAsPicture();
}

/**
 * Skia paint of vendored `MODE_FRAMES`. One Canvas for the life of the row —
 * state and size change the preset, they do not remount the canvas.
 */
export function ThinkingOrb({
  state,
  motionsource,
  size: sizeProp,
  speed = 1,
  paused = false,
  dark = true,
  active = true,
}: ThinkingOrbProps) {
  const reducedMotion = useReducedMotion();
  // Do NOT memoize resolveMotionsource() into effect deps — fresh object each
  // render → Maximum update depth (setPicture ↔ effect re-fire).
  const size = motionsource
    ? motionsourceSize(motionsource)
    : (sizeProp ?? 64);
  const resolvedState = motionsource ? null : (state ?? "working");
  const frozenRef = useRef<number | null>(null);
  const heldRef = useRef<SkPicture | null>(null);
  // Skia web draws Picture on a later turn than React commit. Any mid-flight
  // dispose() → BindingError sk_sp<Picture> (ring-of-24 still raced). Keep all
  // pictures alive until unmount, then delay dispose a few frames.
  const recentRef = useRef<SkPicture[]>([]);
  const [picture, setPicture] = useState<SkPicture | null>(null);

  useEffect(() => {
    return () => {
      const leftover = recentRef.current.slice();
      recentRef.current = [];
      heldRef.current = null;
      let n = 0;
      const tick = () => {
        n += 1;
        if (n < 3) {
          requestAnimationFrame(tick);
          return;
        }
        leftover.forEach((pic) => {
          try {
            pic.dispose();
          } catch {
            /* already gone */
          }
        });
      };
      requestAnimationFrame(tick);
    };
  }, []);

  useLayoutEffect(() => {
    const paint = Skia.Paint();
    let alive = true;

    const paintNow = () => {
      if (!alive) return;
      const preset = motionsource
        ? resolveMotionsource(motionsource)
        : resolvePreset(resolvedState!, size);
      const timed = orbTime({
        nowSeconds: nowSeconds(),
        bakedSpeed: preset.speed,
        speed,
        paused,
        reducedMotion,
        frozen: frozenRef.current,
      });
      frozenRef.current = timed.frozen;
      const frame = MODE_FRAMES[preset.mode](size, timed.t, preset.opts);
      const next = recordPicture(size, frame, paint, dark);
      recentRef.current.push(next);
      heldRef.current = next;
      setPicture(next);
    };

    paintNow();
    const unsubscribe =
      reducedMotion || paused || !active ? null : subscribeOrbFrame(paintNow);

    return () => {
      alive = false;
      unsubscribe?.();
      paint.dispose();
    };
  }, [active, dark, motionsource, paused, reducedMotion, resolvedState, size, speed]);

  return (
    <Canvas style={{ width: size, height: size, pointerEvents: "none" }}>
      {picture ? <Picture picture={picture} /> : null}
    </Canvas>
  );
}
