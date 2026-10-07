import { LinearGradient } from "expo-linear-gradient";
import { createElement, useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { runOnJS } from "react-native-reanimated";

import { detectFormat, formatColor, maxChroma, oklchToRgb, parseColor, toSrgb, type ColorFormat, type Oklch } from "../color/color";
import { fonts, useTheme } from "../theme/theme";

declare module "react-native" {
  interface ViewProps {
    dataSet?: { arrowKeys?: string };
  }
}

const TABS: { id: ColorFormat; label: string }[] = [
  { id: "hex", label: "Hex" },
  { id: "oklch", label: "OKLCH" },
  { id: "p3", label: "Display P3" },
];

function hsvToOklch(h: number, s: number, v: number, a: number): Oklch {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const parsed = parseColor(`rgb(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)})`);
  return { ...(parsed ?? { l: v, c: 0, h, a: 1 }), a };
}

function rgbToHsv(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

type FieldSpace = "srgb" | "p3";

type FieldCanvas = {
  width: number;
  height: number;
  getContext: (kind: "2d", opts?: { colorSpace?: string }) => FieldContext | null;
};

type FieldContext = {
  createImageData: (w: number, h: number) => { data: Uint8ClampedArray };
  putImageData: (data: { data: Uint8ClampedArray }, x: number, y: number) => void;
};

function isFieldCanvas(node: object): node is FieldCanvas {
  return "getContext" in node && "width" in node && "height" in node;
}

function fieldSpace(format: ColorFormat): FieldSpace {
  return format === "p3" ? "p3" : "srgb";
}

function chromaRatio(color: Oklch, space: FieldSpace) {
  const cap = maxChroma(color.l, color.h, space);
  if (cap <= 0) return 0;
  return Math.min(1, Math.max(0, color.c / cap));
}

// Live paints the plane in OKLCH: x is chroma / max in-gamut chroma, y is lightness from 1 to 0.
function paintField(node: object | null, hue: number, space: FieldSpace) {
  if (!node || !isFieldCanvas(node)) return;
  const ctx = node.getContext("2d", { colorSpace: space === "p3" ? "display-p3" : "srgb" });
  if (!ctx) return;
  const w = node.width;
  const h = node.height;
  const image = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const l = h <= 1 ? 1 : 1 - y / (h - 1);
    const cap = maxChroma(l, hue, space);
    for (let x = 0; x < w; x++) {
      const c = (w <= 1 ? 0 : x / (w - 1)) * cap;
      const rgb = oklchToRgb({ l, c, h: hue, a: 1 }, space);
      const i = (y * w + x) * 4;
      image.data[i] = Math.round(255 * Math.min(1, Math.max(0, rgb[0])));
      image.data[i + 1] = Math.round(255 * Math.min(1, Math.max(0, rgb[1])));
      image.data[i + 2] = Math.round(255 * Math.min(1, Math.max(0, rgb[2])));
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

function pureHue(h: number) {
  const { r, g, b } = toSrgb(hsvToOklch(h, 1, 1, 1));
  const byte = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 255).toString(16).padStart(2, "0");
  return `#${byte(r)}${byte(g)}${byte(b)}`;
}

export function ColorPicker({
  color,
  onChange,
  wide,
}: {
  color: Oklch;
  onChange: (color: Oklch, text: string) => void;
  wide: boolean;
}) {
  const { colors, mode } = useTheme();
  const [format, setFormat] = useState<ColorFormat>("hex");
  const [draft, setDraft] = useState(formatColor(color, "hex"));
  const progress = useSharedValue(0);
  const [heldHue, setHeldHue] = useState(0);
  const hsv = rgbToHsv(toSrgb(color).r, toSrgb(color).g, toSrgb(color).b);
  const hue = hsv.s > 0.01 ? hsv.h : heldHue;
  const [box, setBox] = useState({ w: 1, h: 1 });
  const [hueW, setHueW] = useState(1);
  const [opW, setOpW] = useState(1);
  const tabOn = mode === "dark" ? "#3a3a3a" : "#ffffff";
  const space = fieldSpace(format);
  const fieldCanvas = useRef<FieldCanvas | null>(null);
  useEffect(() => {
    paintField(fieldCanvas.current, color.h, space);
  }, [color.h, space]);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 160, easing: Easing.out(Easing.ease) });
  }, [progress]);
  useEffect(() => {
    setDraft(formatColor(color, format));
  }, [color, format]);
  useEffect(() => {
    if (hsv.s > 0.01) setHeldHue(hsv.h);
  }, [hsv.h, hsv.s]);

  const apply = (next: Oklch, nextFormat = format) => {
    const text = formatColor(next, nextFormat);
    setDraft(text);
    onChange(next, text);
  };

  const fromSquare = (x: number, y: number) => {
    if (Platform.OS === "web") {
      const space = fieldSpace(format);
      const l = Math.min(1, Math.max(0, 1 - y / box.h));
      const ratio = Math.min(1, Math.max(0, x / box.w));
      apply({ l, c: ratio * maxChroma(l, color.h, space), h: color.h, a: color.a });
      return;
    }
    const nx = Math.min(1, Math.max(0, x / box.w));
    const ny = Math.min(1, Math.max(0, y / box.h));
    apply(hsvToOklch(hue, nx, 1 - ny, color.a));
  };
  const onFieldKey = (event: { key?: string; shiftKey?: boolean; preventDefault: () => void; stopPropagation?: () => void; nativeEvent?: { key?: string; shiftKey?: boolean; preventDefault?: () => void; stopPropagation?: () => void } }) => {
    if (Platform.OS !== "web") return;
    const key = event.key ?? event.nativeEvent?.key ?? "";
    const shift = event.shiftKey ?? event.nativeEvent?.shiftKey ?? false;
    const step = shift ? 0.1 : 0.01;
    const space = fieldSpace(format);
    let l = color.l;
    let ratio = chromaRatio(color, space);
    if (key === "ArrowUp") l += step;
    else if (key === "ArrowDown") l -= step;
    else if (key === "ArrowRight") ratio += step;
    else if (key === "ArrowLeft") ratio -= step;
    else return;
    event.preventDefault();
    event.stopPropagation?.();
    event.nativeEvent?.preventDefault?.();
    event.nativeEvent?.stopPropagation?.();
    l = Math.min(1, Math.max(0, l));
    ratio = Math.min(1, Math.max(0, ratio));
    apply({ l, c: ratio * maxChroma(l, color.h, space), h: color.h, a: color.a });
  };
  const fromHue = (x: number) => {
    const h = Math.min(360, Math.max(0, (x / hueW) * 360));
    setHeldHue(h);
    apply(hsvToOklch(h, hsv.s, hsv.v, color.a));
  };
  const fromOp = (x: number) => apply({ ...color, a: Math.min(1, Math.max(0, x / opW)) });
  const onSliderKey = (which: "hue" | "opacity") => (event: { key?: string; preventDefault: () => void; nativeEvent?: { key?: string; preventDefault?: () => void } }) => {
    if (Platform.OS !== "web") return;
    const key = event.key ?? event.nativeEvent?.key ?? "";
    const span = which === "hue" ? 360 : 1;
    const step = which === "hue" ? 0.1 : 0.01;
    const page = Math.max(span / 10, step);
    const current = which === "hue" ? hue : color.a;
    let next = current;
    if (key === "ArrowRight" || key === "ArrowUp") next = current + step;
    else if (key === "ArrowLeft" || key === "ArrowDown") next = current - step;
    else if (key === "PageUp") next = current + page;
    else if (key === "PageDown") next = current - page;
    else if (key === "Home") next = 0;
    else if (key === "End") next = span;
    else return;
    event.preventDefault();
    event.nativeEvent?.preventDefault?.();
    next = Math.min(span, Math.max(0, next));
    if (which === "hue") {
      setHeldHue(next);
      apply(hsvToOklch(next, hsv.s, hsv.v, color.a));
      return;
    }
    apply({ ...color, a: next });
  };

  const square = Gesture.Pan()
    .onBegin((e) => runOnJS(fromSquare)(e.x, e.y))
    .onUpdate((e) => runOnJS(fromSquare)(e.x, e.y));
  const hueGesture = Gesture.Pan()
    .onBegin((e) => runOnJS(fromHue)(e.x))
    .onUpdate((e) => runOnJS(fromHue)(e.x));
  const opGesture = Gesture.Pan()
    .onBegin((e) => runOnJS(fromOp)(e.x))
    .onUpdate((e) => runOnJS(fromOp)(e.x));

  const pop = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 3 }, { scale: 0.98 + progress.value * 0.02 }],
  }));

  const swatch = formatColor(color, "hex");

  return (
    <Animated.View
      role="dialog"
      accessibilityLabel="Color color picker"
      style={[
        {
          width: wide ? 280 : "100%",
          height: 350,
          backgroundColor: mode === "light" ? "#fafafa" : colors.pop,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.ringSoft,
          padding: 8,
          gap: 8,
          boxShadow: mode === "light" ? "0 4px 20px rgba(0,0,0,0.08)" : "0 8px 32px rgba(0,0,0,0.5)",
        },
        pop,
      ]}
    >
      <View accessibilityRole="radiogroup" accessibilityLabel="Color format" style={{ flexDirection: "row", backgroundColor: colors.row, borderRadius: 8, padding: 2 }}>
        {TABS.map((tab) => {
          const on = tab.id === format;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              aria-checked={on}
              focusable={Platform.OS === "web" ? false : undefined}
              tabIndex={Platform.OS === "web" ? -1 : undefined}
              onPress={() => {
                const text = formatColor(color, tab.id);
                setFormat(tab.id);
                setDraft(text);
                onChange(color, text);
              }}
              style={{ flex: 1, height: 24, borderRadius: 6, alignItems: "center", justifyContent: "center", backgroundColor: on ? tabOn : "transparent" }}
            >
              <Text style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 11 }}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <GestureDetector gesture={square}>
        <View
          role="group"
          accessibilityLabel="Color field; use arrow keys to adjust saturation and lightness"
          dataSet={Platform.OS === "web" ? { arrowKeys: "own" } : undefined}
          focusable={Platform.OS === "web" ? true : undefined}
          tabIndex={Platform.OS === "web" ? 0 : undefined}
          onKeyDown={Platform.OS === "web" ? onFieldKey : undefined}
          onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
          style={{ flex: 1, borderRadius: 8, overflow: "hidden" }}
        >
          {Platform.OS === "web" ? (
            createElement("canvas", {
              key: space,
              width: 252,
              height: 160,
              "aria-hidden": true,
              style: { width: "100%", height: "100%", display: "block", pointerEvents: "none" },
              ref: fieldCanvas,
            })
          ) : (
            <>
              <LinearGradient colors={[ "#ffffff", pureHue(hue) ]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
              <LinearGradient colors={[ "rgba(0,0,0,0)", "#000000" ]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
            </>
          )}
          <View
            style={{
              position: "absolute",
              ...(Platform.OS === "web"
                ? { left: `${chromaRatio(color, fieldSpace(format)) * 100}%`, top: `${(1 - color.l) * 100}%` }
                : { left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }),
              width: 16,
              height: 16,
              marginLeft: -8,
              marginTop: -8,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: "#ffffff",
              backgroundColor: swatch,
              shadowColor: "#000000",
              shadowOpacity: 0.45,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 1 },
              elevation: 3,
            }}
          />
        </View>
      </GestureDetector>
      <GestureDetector gesture={hueGesture}>
        <View
          accessibilityRole={Platform.OS === "web" ? "adjustable" : undefined}
          accessibilityLabel="Hue"
          accessibilityValue={Platform.OS === "web" ? { min: 0, max: 360, now: Math.round(hue * 10) / 10 } : undefined}
          aria-valuemin={Platform.OS === "web" ? 0 : undefined}
          aria-valuemax={Platform.OS === "web" ? 360 : undefined}
          aria-valuenow={Platform.OS === "web" ? Math.round(hue * 10) / 10 : undefined}
          aria-valuetext={Platform.OS === "web" ? `${Math.round(hue)} degrees` : undefined}
          tabIndex={Platform.OS === "web" ? 0 : undefined}
          onKeyDown={Platform.OS === "web" ? onSliderKey("hue") : undefined}
          onLayout={(e) => setHueW(Math.max(1, e.nativeEvent.layout.width))}
          style={{ height: 36, borderRadius: 8, backgroundColor: colors.row, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 10 }}
        >
          <Text style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 13 }}>Hue</Text>
          <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.slider, justifyContent: "center" }}>
            <View style={{ position: "absolute", left: `${(hue / 360) * 100}%`, width: 8, height: 16, marginLeft: -4, borderRadius: 1, backgroundColor: colors.fg }} />
          </View>
        </View>
      </GestureDetector>
      <GestureDetector gesture={opGesture}>
        <View
          accessibilityRole={Platform.OS === "web" ? "adjustable" : undefined}
          accessibilityLabel="Opacity"
          accessibilityValue={Platform.OS === "web" ? { min: 0, max: 100, now: Math.round(color.a * 100) } : undefined}
          aria-valuemin={Platform.OS === "web" ? 0 : undefined}
          aria-valuemax={Platform.OS === "web" ? 100 : undefined}
          aria-valuenow={Platform.OS === "web" ? Math.round(color.a * 100) : undefined}
          aria-valuetext={Platform.OS === "web" ? `${Math.round(color.a * 100)} percent` : undefined}
          tabIndex={Platform.OS === "web" ? 0 : undefined}
          onKeyDown={Platform.OS === "web" ? onSliderKey("opacity") : undefined}
          onLayout={(e) => setOpW(Math.max(1, e.nativeEvent.layout.width))}
          style={{ height: 36, borderRadius: 8, backgroundColor: colors.row, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 10 }}
        >
          <Text style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 13 }}>Opacity</Text>
          <View style={{ flex: 1, height: 10, borderRadius: 4, overflow: "hidden", justifyContent: "center" }}>
            <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, flexDirection: "row" }}>
              {Array.from({ length: 16 }, (_, i) => (
                <View key={i} style={{ flex: 1, backgroundColor: i % 2 === 0 ? "#d8d8d8" : "#ffffff" }} />
              ))}
            </View>
            <View style={{ position: "absolute", left: `${color.a * 100}%`, width: 8, height: 16, marginLeft: -4, borderRadius: 1, backgroundColor: colors.fg }} />
          </View>
        </View>
      </GestureDetector>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={() => {
          const parsed = parseColor(draft);
          if (!parsed) {
            setDraft(formatColor(color, format));
            return;
          }
          const detected = detectFormat(draft);
          setFormat(detected);
          apply(parsed, detected);
        }}
        accessibilityLabel="CSS color"
        autoCapitalize="none"
        autoCorrect={false}
        style={{ height: 32, borderRadius: 8, backgroundColor: colors.row, color: colors.fg, fontFamily: fonts.mono, fontSize: 12, paddingHorizontal: 8 }}
      />
    </Animated.View>
  );
}
