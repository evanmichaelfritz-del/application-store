/* FILE app/playground.tsx */
import { setStringAsync } from "expo-clipboard";
import { useFocusEffect } from "expo-router";
import Head from "expo-router/head";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, TextInput, useWindowDimensions, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSharedValue } from "react-native-reanimated";

import { ColorPicker } from "../src/components/ColorPicker";
import { Header } from "../src/components/Header";
import { SelectRow } from "../src/components/SelectRow";
import { Shimmer } from "../src/components/Shimmer";
import { SliderRow } from "../src/components/SliderRow";
import { PLAYGROUND } from "../src/content/cards";
import { orbSnippet } from "../src/content/snippet";
import { useArrowKeys } from "../src/hooks/useArrowKeys";
import { parseColor, toExtendedSrgb, toSrgb, type Oklch } from "../src/color/color";
import { canUseExtendedColor, OrbView, type OrbLive } from "../src/orb/OrbView";
import { isFlat, RENDERS, type RenderName, type ShapeName } from "../src/orb/model";
import { fonts, useTheme } from "../src/theme/theme";

function bindTitle(title: string) {
  return (node: object | null) => {
    if (!node || !("setAttribute" in node)) return;
    const set = node.setAttribute;
    if (typeof set !== "function") return;
    set.call(node, "title", title);
  };
}

function swatchHexFrom(color: Oklch, fallback: string): string {
  if (!color) return fallback;
  const { r, g, b } = toSrgb(color);
  const byte = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 255).toString(16).padStart(2, "0");
  return `#${byte(r)}${byte(g)}${byte(b)}`;
}

const SHAPES: { id: ShapeName; label: string }[] = [
  { id: "sphere", label: "Sphere" },
  { id: "cube", label: "Cube" },
  { id: "octahedron", label: "Octahedron" },
  { id: "tetrahedron", label: "Tetrahedron" },
  { id: "torus", label: "Torus" },
];

const RENDER_LABEL: Record<RenderName, string> = {
  dots: "Dots",
  crosses: "Crosses",
  dashes: "Dashes",
  halftone: "Halftone",
  lines: "Lines",
  mesh: "Mesh",
  squares: "Squares",
  verticalLines: "Vertical Lines",
};

export default function PlaygroundScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wide = width >= 1280;
  const { colors, playgroundColor, setPlaygroundColor } = useTheme();
  const [index, setIndex] = useState(1);
  const onIndex = useCallback((next: number) => setIndex(next), []);
  useArrowKeys(PLAYGROUND.length, index, onIndex);
  const look = PLAYGROUND[index];
  const [shape, setShape] = useState<ShapeName>("sphere");
  const [render, setRender] = useState<RenderName>("dots");
  const [size, setSize] = useState(320);
  const [speed, setSpeed] = useState(1);
  const [density, setDensity] = useState(1);
  const [dotSize, setDotSize] = useState(1);
  const [tilt, setTilt] = useState(20);
  const [menu, setMenu] = useState<null | "shape" | "render">(null);
  const [picker, setPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState(playgroundColor);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);
  const wasFlat = useRef(false);
  const exact = useRef<{ color: Oklch; text: string } | null>(null);
  const flat = isFlat(render);
  const phone = width < 768;
  const headerH = width >= 768 ? 48 : 72;
  const maxOrb = Math.max(96, height - headerH - 120);
  const shown = Math.min(size, wide ? maxOrb : Math.min(maxOrb, Math.max(96, width - 32)));
  const parsed: Oklch = (exact.current && exact.current.text === playgroundColor ? exact.current.color : null) ?? parseColor(playgroundColor) ?? { l: 1, c: 0, h: 0, a: 1 };
  const rgba = canUseExtendedColor() ? toExtendedSrgb(parsed) : toSrgb(parsed);
  const remember = (color: Oklch, text: string) => {
    exact.current = { color, text };
    setPlaygroundColor(text);
  };
  const live = useSharedValue<OrbLive>({ size: shown, speed, density, dotSize, tilt, ...rgba });
  const sliding = useRef(false);

  useEffect(() => {
    setDraft(playgroundColor);
  }, [playgroundColor]);

  useEffect(() => () => {
    alive.current = false;
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useFocusEffect(useCallback(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []));

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

  const close = () => {
    setMenu(null);
    setPicker(false);
  };

  const panel = (
    <View testID="yogesh-orb-panel" role={Platform.OS === "web" ? "complementary" : undefined} style={{ width: wide ? 256 : "100%", gap: 6, zIndex: 5 }}>
      <SelectRow
        label="Shape"
        value={shape}
        display={SHAPES.find((item) => item.id === shape)?.label ?? "Sphere"}
        options={SHAPES}
        open={menu === "shape"}
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
        open={menu === "render"}
        onToggle={() => {
          setPicker(false);
          setMenu((current) => (current === 'render' ? null : 'render'));
        }}
        onPick={(id) => {
          setRender(id);
          setMenu(null);
        }}
      />
      <View style={{ height: 36, borderRadius: 8, backgroundColor: colors.row, borderWidth: picker ? 1 : 0, borderColor: colors.ring, paddingLeft: 12, paddingRight: 8, flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 13 }}>Color</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => {
            const next = parseColor(draft);
            if (next) {
              exact.current = null;
              setPlaygroundColor(draft.trim());
            } else setDraft(playgroundColor);
          }}
          accessibilityLabel="Color color value"
          ref={bindTitle(draft)}
          autoCapitalize="none"
          autoCorrect={false}
          style={{ flex: 1, color: colors.fg, fontFamily: fonts.mono, fontSize: 13, textAlign: "right", paddingVertical: 0 }}
        />
        <Pressable
          onPress={() => {
            setMenu(null);
            setPicker((v) => !v);
          }}
          accessibilityRole={Platform.OS === "web" ? "button" : undefined}
          accessibilityLabel="Pick color color"
          aria-haspopup={Platform.OS === "web" ? "dialog" : undefined}
          aria-expanded={Platform.OS === "web" ? picker : undefined}
          style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: swatchHexFrom(parsed, colors.fg), borderWidth: 1, borderColor: colors.ringSoft }}
        />
      </View>
      {picker && wide ? (
        <View style={{ position: "absolute", right: "100%", top: 0, marginRight: 12, zIndex: 40 }}>
          <ColorPicker wide color={parsed} onChange={remember} />
        </View>
      ) : null}
      {picker && phone ? (
        <View style={{ position: "absolute", left: 0, top: 40, width: 280, zIndex: 30 }}>
          <ColorPicker wide={false} color={parsed} onChange={remember} />
        </View>
      ) : null}
      {picker && !wide && !phone ? <ColorPicker wide={false} color={parsed} onChange={remember} /> : null}
      <SliderRow label="Size" min={16} max={480} step={1} value={size} decimals={0} onChange={setSize} live={live} field="size" onDrag={(active) => { sliding.current = active; }} />
      <SliderRow label="Speed" min={0.05} max={3} step={0.05} value={speed} decimals={2} onChange={setSpeed} live={live} field="speed" onDrag={(active) => { sliding.current = active; }} />
      <SliderRow label="Density" min={0.25} max={3} step={0.05} value={density} decimals={2} onChange={setDensity} live={live} field="density" onDrag={(active) => { sliding.current = active; }} />
      <SliderRow label="Dot Size" min={0.25} max={3} step={0.05} value={dotSize} decimals={2} onChange={setDotSize} live={live} field="dotSize" onDrag={(active) => { sliding.current = active; }} />
      {flat ? null : <SliderRow label="Tilt" min={-90} max={90} step={1} value={tilt} decimals={0} onChange={setTilt} live={live} field="tilt" onDrag={(active) => { sliding.current = active; }} />}
      <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", gap: 16 }}>
        <Pressable onPress={copy} hitSlop={8} accessibilityRole={Platform.OS === "web" ? "button" : undefined}>
          <Text style={{ color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>{copied ? "Copied" : "Copy"}</Text>
        </Pressable>
        {playgroundColor.trim().toLowerCase() !== colors.orb.toLowerCase() || size !== 320 || speed !== 1 || density !== 1 || dotSize !== 1 || tilt !== 20 ? (
          <Pressable
            onPress={() => {
              setSize(320);
              setSpeed(1);
              setDensity(1);
              setDotSize(1);
              setTilt(20);
              exact.current = null;
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
    <View role="navigation" accessibilityLabel="States" style={{ width: wide ? 280 : "100%", justifyContent: "center" }}>
      <View role={Platform.OS === "web" ? "list" : undefined} style={{ flexDirection: wide ? "column" : "row", flexWrap: wide ? "nowrap" : "wrap", columnGap: 16, rowGap: 8 }}>
        {PLAYGROUND.map((item, i) => {
          const on = i === index;
          return Platform.OS === "web" ? (
            <View key={item.id} role="listitem">
              <Pressable accessibilityRole="button" aria-current={on ? "true" : undefined} onPress={() => setIndex(i)} hitSlop={{ top: 12, bottom: 12 }} style={{ height: 20, justifyContent: "center" }}>
                <Text style={{ color: on ? colors.fg : colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>{item.playground}</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable key={item.id} accessibilityRole="button" aria-current={on ? "true" : undefined} onPress={() => setIndex(i)} hitSlop={{ top: 12, bottom: 12 }} style={{ height: 20, justifyContent: "center" }}>
              <Text style={{ color: on ? colors.fg : colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 }}>{item.playground}</Text>
            </Pressable>
          );
        })}
      </View>
      {wide ? <Text style={{ color: colors.muted, fontFamily: fonts.regular, fontSize: 12, marginTop: 24, marginBottom: -8 }}>↑ ↓ to switch</Text> : null}
    </View>
  );

  const stage = (
    <View
      accessibilityLabel={Platform.OS === "web" ? undefined : "Orb playground"}
      accessibilityElementsHidden={Platform.OS === "web" ? true : undefined}
      importantForAccessibility={Platform.OS === "web" ? "no-hide-descendants" : undefined}
      aria-hidden={Platform.OS === "web" ? true : undefined}
      style={{ flex: wide ? 1 : undefined, minHeight: phone ? height * 0.6 : wide ? 0 : shown, padding: phone ? 32 : 0, alignItems: "center", justifyContent: "center", marginTop: phone ? 24 : 0 }}
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
      pointerEvents="none"
      style={
        wide
          ? { position: "absolute", left: 0, right: 0, bottom: 22 + insets.bottom, zIndex: 6, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, transform: [{ translateX: -4.6 }] }
          : { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, alignSelf: "center" }
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
      <Shimmer text={look.status} style={phone ? { lineHeight: 20 } : undefined} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.page }}>
      {Platform.OS === "web" ? (
        <Head>
          <title>Playground - Thinking Orbs</title>
        </Head>
      ) : null}
      {(menu || picker) && (
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") setMenu(null);
            setPicker(false);
          }}
          style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, zIndex: 4 }}
        />
      )}
      <Header active={null} />
      {wide ? (
        <View style={{ flex: 1, flexDirection: "row", alignItems: "stretch", paddingLeft: 32, paddingRight: 42, zIndex: 5 }}>
          <View style={{ alignSelf: "center", marginBottom: 8 }}>{list}</View>
          {stage}
          <View style={{ alignSelf: "center" }}>{panel}</View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingLeft: 16, paddingRight: 16, paddingTop: width < 768 ? 24 : 0, paddingBottom: (width < 768 ? 24 : 32) + insets.bottom }} style={{ zIndex: 5 }}>
          {list}
          <View>
            {stage}
            {phone ? <View style={{ position: "absolute", left: 0, right: 0, bottom: 24 }}>{status}</View> : null}
          </View>
          {phone ? null : status}
          <View style={{ marginTop: phone ? 24 : 20 }}>{panel}</View>
        </ScrollView>
      )}
      {wide ? status : null}
    </View>
  );
}

/* FILE src/components/ColorPicker.tsx */
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring, withTiming, type SharedValue } from "react-native-reanimated";
import { runOnJS } from "react-native-reanimated";

import type { OrbLive } from "../orb/OrbView";
import { fonts, useTheme } from "../theme/theme";

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
  const { colors } = useTheme();
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

  const move = (steps: number) => {
    const next = snap(value + steps * step, min, max, step);
    onChange(next);
  };

  useEffect(() => {
    if (!focused || Platform.OS !== "web") return;
    const onKey = (event: KeyboardEvent) => {
      const key = event.key;
      let steps: number | null = null;
      if (key === "ArrowRight" || key === "ArrowUp") steps = 1;
      else if (key === "ArrowLeft" || key === "ArrowDown") steps = -1;
      else if (key === "PageUp") steps = 10;
      else if (key === "PageDown") steps = -10;
      else if (key === "Home") steps = 0;
      else if (key === "End") steps = 0;
      else return;
      event.preventDefault();
      event.stopPropagation();
      if (key === "Home") onChange(min);
      else if (key === "End") onChange(max);
      else if (steps !== null) move(steps);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused, value, min, max, step, onChange]);

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
            outlineStyle: focused ? "solid" : undefined,
            outlineWidth: focused ? 2 : 0,
            outlineColor: colors.fg,
            outlineOffset: 2,
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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12 }} pointerEvents="none">
          <Text onLayout={(e) => { labelW.value = e.nativeEvent.layout.width; }} style={{ color: colors.fg, fontFamily: fonts.regular, fontSize: 13 }}>{label}</Text>
          <Text onLayout={(e) => { valueW.value = e.nativeEvent.layout.width; }} style={{ color: colors.fg, fontFamily: fonts.mono, fontSize: 13 }}>{labelText}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

/* FILE src/components/Shimmer.tsx */
import { Canvas, LinearGradient, Mask, Rect, Text, useFont, vec } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { Text as RNText, type TextStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
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
  const font = useFont(require("../../assets/fonts/Geist-Regular.ttf"), size);
  const opacity = useSharedValue(0);
  const shift = useSharedValue(0);
  const width = font ? Math.max(1, Math.ceil(font.getTextWidth(text))) : Math.max(1, Math.ceil(text.length * size * 0.56));
  const height = Math.ceil(size * 1.45);

  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 300 });
  }, [text, opacity]);

  useEffect(() => {
    if (reduced) return;
    shift.value = -width * 2;
    shift.value = withRepeat(withTiming(width * 2, { duration: 2000, easing: Easing.linear }), -1, false);
  }, [reduced, shift, text, width]);

  const start = useDerivedValue(() => vec(shift.value, 0));
  const end = useDerivedValue(() => vec(shift.value + width * 2, 0));
  const fade = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (reduced || !font) {
    return (
      <Animated.View style={fade}>
        <RNText style={[{ color: colors.muted, fontFamily: style?.fontFamily ?? fonts.regular, fontSize: size, fontStyle: style?.fontStyle }, style]}>
          {text}
        </RNText>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={fade}>
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
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { useTheme, fonts } from "../theme/theme";

let injected = false;
function injectKeyframes() {
  if (injected || Platform.OS !== "web" || typeof document === "undefined") return;
  injected = true;
  const style = document.createElement("style");
  style.textContent = `@keyframes orb-shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}`;
  document.head.appendChild(style);
}

export function Shimmer({ text, style }: { text: string; style?: TextStyle }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const opacity = useSharedValue(0);
  useEffect(() => {
    injectKeyframes();
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 300 });
  }, [text, opacity]);
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const sweep = !reduced;
  return (
    <Animated.View style={anim}>
      <span
        style={{
          fontFamily: typeof style?.fontFamily === "string" ? style.fontFamily : fonts.regular,
          fontSize: typeof style?.fontSize === "number" ? style.fontSize : 14,
          fontStyle: style?.fontStyle,
          lineHeight: typeof style?.lineHeight === "number" ? `${style.lineHeight}px` : "1.65",
          display: "inline-block",
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
    </Animated.View>
  );
}

/* FILE src/components/icons.tsx */
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

export function Chevron({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M4 6.5 L8 10.5 L12 6.5" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

