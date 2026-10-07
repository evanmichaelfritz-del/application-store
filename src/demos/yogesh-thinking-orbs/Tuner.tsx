import { setStringAsync } from 'expo-clipboard';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native';
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

function bindTitle(title: string) {
  return (node: object | null) => {
    if (!node || !('setAttribute' in node)) return;
    const set = node.setAttribute;
    if (typeof set !== 'function') return;
    set.call(node, 'title', title);
  };
}

function swatchHexFrom(color: Oklch, fallback: string): string {
  if (!color) return fallback;
  const { r, g, b } = toSrgb(color);
  const byte = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 255).toString(16).padStart(2, '0');
  return `#${byte(r)}${byte(g)}${byte(b)}`;
}

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
  const [menu, setMenu] = useState<null | 'shape' | 'render'>(null);
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
  const parsed: Oklch =
    (exact.current && exact.current.text === playgroundColor ? exact.current.color : null) ??
    parseColor(playgroundColor) ?? { l: 1, c: 0, h: 0, a: 1 };
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
          setMenu(menu === 'shape' ? null : 'shape');
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
          setMenu(menu === 'render' ? null : 'render');
        }}
        onPick={(id) => {
          setRender(id);
          setMenu(null);
        }}
      />
      <View
        style={{
          height: 36,
          borderRadius: 8,
          backgroundColor: colors.row,
          borderWidth: picker ? 1 : 0,
          borderColor: colors.ring,
          paddingLeft: 12,
          paddingRight: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
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
          style={{ flex: 1, color: colors.fg, fontFamily: fonts.mono, fontSize: 13, textAlign: 'right', paddingVertical: 0 }}
        />
        <Pressable
          testID="yogesh-orb-color-swatch"
          onPress={() => {
            setMenu(null);
            setPicker((v) => !v);
          }}
          accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}
          accessibilityLabel="Pick color color"
          aria-haspopup={Platform.OS === 'web' ? 'dialog' : undefined}
          aria-expanded={Platform.OS === 'web' ? picker : undefined}
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            backgroundColor: swatchHexFrom(parsed, colors.fg),
            borderWidth: 1,
            borderColor: colors.ringSoft,
          }}
        />
      </View>
      {picker && wide ? (
        <View style={{ position: 'absolute', right: '100%', top: 0, marginRight: 12, zIndex: 40 }}>
          <ColorPicker wide color={parsed} onChange={remember} />
        </View>
      ) : null}
      {picker && phone ? (
        <View style={{ position: 'absolute', left: 0, top: 40, width: 280, zIndex: 30 }}>
          <ColorPicker wide={false} color={parsed} onChange={remember} />
        </View>
      ) : null}
      {picker && !wide && !phone ? <ColorPicker wide={false} color={parsed} onChange={remember} /> : null}
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
        <Text style={{ color: colors.muted, fontFamily: fonts.regular, fontSize: 12, marginTop: 24, marginBottom: -8 }}>
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
      <Shimmer text={look.status} style={phone ? { lineHeight: 20 } : undefined} />
    </View>
  );

  return (
    <View
      testID="yogesh-orb-tuner"
      style={{ width: '100%', backgroundColor: colors.page, minHeight: wide ? Math.max(560, shown + 160) : undefined }}
    >
      {(menu || picker) && (
        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') setMenu(null);
            setPicker(false);
          }}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 4 }}
        />
      )}
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
