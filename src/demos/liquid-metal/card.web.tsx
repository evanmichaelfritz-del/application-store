import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { MetalFx, pauseShared, resumeShared, useMetalBend, type MetalFxPreset, type MetalFxTheme } from 'metal-fx';

/**
 * metal-fx@2.0.11. libraries.dev/metal opens on family v2
 * (metal.tsx:233 useState<Family>("v2"), :258 renders MetalExamplesV2).
 * The card default is that composer: chromatic, 40×40 circle, Auto reflection,
 * innerShadow, useMetalBend, strength 0.81, running
 * (metal-examples-v2.tsx:59, :87-94). The Live mode New pill is a later row
 * at strength 0.72. The playground circle starts paused. Pause freezes the
 * mounted specimen on the current frame: `paused` holds that canvas and
 * `pauseShared` stops shader time, so Play continues from the same frame.
 * The v1 gold row is metal-fx@1.0.4 and is not rendered here.
 * Light theme is a package option. Child text stays #f8f8f8.
 */

const PRESETS: readonly MetalFxPreset[] = ['chromatic', 'silver', 'gold'];
const PACKAGE_OPTION = 'package option, not on the original';
const STUDIO_LOCKED =
  'package option: Studio-locked on libraries.dev; live on the metal-fx package demo';
const PAGE_STRENGTH = 90;

const FONT = 'Inter_400Regular, system-ui, sans-serif';
const FONT_MED = 'Inter_500Medium, system-ui, sans-serif';

type Specimen = 'v2' | 'playground' | 'package';

const ROW_PRESET: Record<Specimen, MetalFxPreset> = {
  v2: 'chromatic',
  playground: 'chromatic',
  package: 'chromatic',
};

type Tokens = {
  stage: string;
  controlBg: string;
  controlText: string;
  controlOn: string;
  controlOnText: string;
  label: string;
};

const DARK: Tokens = {
  stage: '#171717',
  controlBg: 'rgba(255, 255, 255, 0.06)',
  controlText: '#c0c0c0',
  controlOn: 'rgba(255, 255, 255, 0.16)',
  controlOnText: '#ffffff',
  label: '#8b8b8b',
};

const LIGHT: Tokens = {
  stage: '#f6f6f6',
  controlBg: 'rgba(0, 0, 0, 0.04)',
  controlText: '#3f434a',
  controlOn: '#111111',
  controlOnText: '#ffffff',
  label: '#6c6c6c',
};

const FACE = '#1d1d1d';
const FACE_FG = '#f8f8f8';
const FACE_BORDER = 'rgba(44, 47, 54, 0.52)';
const CHIP_BG = 'rgba(255, 255, 255, 0.04)';
const CHIP_SHADOW = 'inset 0 0 0 1px rgba(255, 255, 255, 0.02), inset 0 1px 0 0 rgba(255, 255, 255, 0.04)';

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#8b8b8b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="m16 16-3.5-3.5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: 'rotate(90deg)', color: '#8e8e8e' }}>
      <path d="M7 11L10 8L7 5" />
    </svg>
  );
}

function Chip({
  label,
  on,
  tokens,
  onPress,
  packageOption,
  hint,
}: {
  label: string;
  on: boolean;
  tokens: Tokens;
  onPress: () => void;
  packageOption?: boolean;
  hint?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      title={hint ?? (packageOption ? PACKAGE_OPTION : undefined)}
      onClick={onPress}
      style={{
        height: 26,
        padding: '0 8px',
        borderRadius: 8,
        border: 'none',
        background: on ? tokens.controlOn : tokens.controlBg,
        color: on ? tokens.controlOnText : tokens.controlText,
        fontFamily: FONT_MED,
        fontSize: 11,
        lineHeight: '26px',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function ControlRow({ label, tokens, children }: { label: string; tokens: Tokens; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 72, fontFamily: FONT_MED, fontSize: 10, lineHeight: '12px', color: tokens.label }}>{label}</span>
      {children}
    </div>
  );
}

const circleFace = (cursor: 'default' | 'pointer'): CSSProperties => ({
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  padding: 0,
  border: `1px solid ${FACE_BORDER}`,
  borderRadius: '50%',
  background: FACE,
  boxShadow: 'inset 0 0 50px 0 rgba(255, 255, 255, 0.02)',
  color: FACE_FG,
  cursor,
});

function ChatShell({ short, fit, children }: { short: boolean; fit: boolean; children: ReactNode }) {
  return (
    <div
      style={{
        width: fit ? '100%' : 448,
        maxWidth: fit ? 448 : '100%',
        ...(fit ? { minWidth: 0 } : {}),
        boxSizing: 'border-box',
        borderRadius: 20,
        background: 'rgba(29, 29, 29, 0.7)',
        padding: '20px 16px 16px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          width: short ? '70%' : '100%',
          marginBottom: 16,
          fontFamily: FONT,
          fontSize: 14,
          lineHeight: '16px',
          color: '#4e4e4e',
        }}
      >
        Build anything...
      </div>
      {children}
    </div>
  );
}

function PlusButton() {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        minWidth: 36,
        borderRadius: '50%',
        background: CHIP_BG,
        boxShadow: CHIP_SHADOW,
        color: '#caccd2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <PlusIcon />
    </div>
  );
}

function V2Composer({
  preset,
  theme,
  strength,
  fit,
  paused,
}: {
  preset: MetalFxPreset;
  theme: Exclude<MetalFxTheme, 'auto'>;
  strength: number;
  fit: boolean;
  paused: boolean;
}) {
  const autoChipRef = useRef<HTMLDivElement>(null);
  const sendRef = useRef<HTMLDivElement>(null);
  useMetalBend(sendRef);
  const autoTargets = useMemo(() => [autoChipRef], []);
  const send = (
    <MetalFx
      key="v2"
      ref={sendRef}
      preset={preset}
      variant="circle"
      theme={theme}
      reflectionTargets={autoTargets}
      innerShadow
      strength={strength}
      paused={paused}
    >
      <button type="button" aria-label="Send" style={circleFace('default')}>
        <ArrowUpIcon />
      </button>
    </MetalFx>
  );
  return (
    <ChatShell short fit={fit}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', minWidth: 0, gap: 12 }}>
        <PlusButton />
        {fit ? null : <div style={{ flex: 1 }} />}
        <div
          style={
            fit
              ? { flex: '1 1 auto', minWidth: 0, display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 12 }
              : { display: 'contents' }
          }
        >
          <ComposerChip label="Agent" />
          <ComposerChip label="Auto" chipRef={autoChipRef} />
          {send}
        </div>
      </div>
    </ChatShell>
  );
}

function PlaygroundCircle({
  preset,
  theme,
  strength,
  paused,
  disableGlow,
  disableReflection,
  fit,
}: {
  preset: MetalFxPreset;
  theme: Exclude<MetalFxTheme, 'auto'>;
  strength: number;
  paused: boolean;
  disableGlow: boolean;
  disableReflection: boolean;
  fit: boolean;
}) {
  const searchRef = useRef<HTMLLabelElement>(null);
  const sendRef = useRef<HTMLDivElement>(null);
  useMetalBend(sendRef);
  const searchTargets = useMemo(() => [searchRef], []);
  return (
    <div
      style={
        fit
          ? { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12, maxWidth: '100%', minWidth: 0 }
          : { display: 'flex', alignItems: 'center', gap: 12 }
      }
    >
      <label
        ref={searchRef}
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: fit ? '100%' : 180,
          ...(fit ? { maxWidth: 180, minWidth: 0 } : {}),
          height: 40,
          borderRadius: 999,
          padding: '10px 8px 10px 12px',
          background: FACE,
          border: `1px solid ${FACE_BORDER}`,
          boxShadow: 'inset 0 0 50px 0 rgba(255, 255, 255, 0.02)',
          color: FACE_FG,
          fontFamily: FONT_MED,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        <SearchIcon />
        <input
          type="search"
          placeholder="Search"
          aria-label="Search"
          readOnly
          tabIndex={-1}
          style={{
            flex: 1,
            minWidth: 0,
            border: 0,
            background: 'transparent',
            font: 'inherit',
            color: 'inherit',
            outline: 'none',
          }}
        />
      </label>
      <MetalFx
        key="playground"
        ref={sendRef}
        preset={preset}
        variant="circle"
        theme={theme}
        strength={strength}
        paused={paused}
        disableGlow={disableGlow}
        innerShadow
        reflectionTargets={disableReflection ? undefined : searchTargets}
      >
        <button type="button" aria-label="Send" style={circleFace('default')}>
          <ArrowUpIcon />
        </button>
      </MetalFx>
    </div>
  );
}

export function LiquidMetalCard({ copy = false }: { copy?: boolean } = {}) {
  const shellRef = useRef<HTMLDivElement>(null);
  // The detail preview is the wide prod layout. Gallery cards are not inside it.
  const [onAssetPage, setOnAssetPage] = useState(false);
  // A Copy host of 504px fits the 448px page composer. Anything narrower shrinks.
  const [narrow, setNarrow] = useState(false);
  // MetalFx mounts only after this measurement. The first render would otherwise
  // use the gallery tree, then this effect would destroy that copy and mount
  // another in the same turn. The shared context's lost event then stops the
  // replacement after one frame.
  const [placed, setPlaced] = useState(false);
  useLayoutEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    setOnAssetPage(Boolean(el.closest('[data-testid="asset-preview"]')));
    setPlaced(true);
    if (!copy) return;
    const measure = () => setNarrow(el.getBoundingClientRect().width < 504);
    measure();
    if (typeof ResizeObserver !== 'function') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [copy]);
  const galleryFit = !copy && !onAssetPage;
  const shrink = copy && narrow;
  const fit = galleryFit || shrink;
  const [preset, setPreset] = useState<MetalFxPreset>('chromatic');
  const [specimen, setSpecimen] = useState<Specimen>('v2');
  const [slot, setSlot] = useState<Specimen | null>('v2');
  const [theme, setTheme] = useState<Exclude<MetalFxTheme, 'auto'>>('dark');
  const [pageStrength, setPageStrength] = useState(PAGE_STRENGTH);
  const [pausedBySpecimen, setPausedBySpecimen] = useState<Record<Specimen, boolean>>({
    v2: false,
    playground: true,
    package: false,
  });
  const [disableGlow, setDisableGlow] = useState(false);
  const [disableReflection, setDisableReflection] = useState(false);
  useEffect(() => {
    if (slot === specimen) return;
    setSlot(null);
  }, [specimen, slot]);
  useEffect(() => {
    if (slot !== null) return;
    const id = requestAnimationFrame(() => setSlot(specimen));
    return () => cancelAnimationFrame(id);
  }, [slot, specimen]);
  const tokens = theme === 'dark' ? DARK : LIGHT;
  const circleStrength = (pageStrength / 100) * 0.9;
  const paused = pausedBySpecimen[specimen];
  const mountedPaused = slot ? pausedBySpecimen[slot] : false;
  const shownSlot = placed ? slot : null;
  // Theme changes drop the reflection canvases and build new ones. They paint
  // from the frame callback, and a paused copy that already drew a frame does
  // not run that callback. Let the shader through until those canvases paint,
  // then freeze on that frame. The control stays on Play.
  const seenTheme = useRef(theme);
  // The repaint pump is only for a copy that has not painted yet: the first
  // mount while paused, or a new slot, fit, or theme. A Pause click on the
  // copy that is already showing already called pauseShared(). Running the
  // pump there lets shader time move under the held bitmap, so Play jumps
  // ahead by the pump length.
  const pumpKey = useRef('');
  const [releasePause, setReleasePause] = useState(false);
  const shaderPaused = mountedPaused && !releasePause;
  useEffect(() => {
    const themeChanged = seenTheme.current !== theme;
    seenTheme.current = theme;
    if (slot == null || !mountedPaused) {
      pumpKey.current = slot == null ? '' : `${slot}|${fit}|${theme}`;
      resumeShared();
      setReleasePause(false);
      return;
    }
    const key = `${slot}|${fit}|${theme}`;
    const newCopy = key !== pumpKey.current;
    pumpKey.current = key;
    if (!newCopy) return;
    if (themeChanged) setReleasePause(true);
    // A new copy mounts while the shared clock is frozen and never paints.
    // Release the clock, give the reflection pass its 66ms cadence, then freeze.
    resumeShared();
    let handle = 0;
    const started = performance.now();
    const pump = () => {
      if (performance.now() - started < 160) {
        handle = requestAnimationFrame(pump);
        return;
      }
      pauseShared();
      setReleasePause(false);
    };
    handle = requestAnimationFrame(pump);
    return () => cancelAnimationFrame(handle);
  }, [slot, mountedPaused, fit, theme]);
  const togglePause = () => {
    const next = !pausedBySpecimen[specimen];
    if (slot === specimen) {
      if (next) pauseShared();
      else resumeShared();
    }
    setPausedBySpecimen((current) => ({ ...current, [specimen]: next }));
  };
  const choose = (next: Specimen) => {
    setSpecimen(next);
    setPreset(ROW_PRESET[next]);
  };
  const shell: CSSProperties = {
    width: '100%',
    ...(fit ? { minWidth: 0, overflow: 'hidden' } : {}),
    boxSizing: 'border-box',
    background: tokens.stage,
    borderRadius: 14,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  };
  return (
    <div ref={shellRef} data-testid="liquid-metal-card" data-theme={theme} data-specimen={specimen} data-paused={paused ? 'true' : 'false'} data-fit={shrink ? 'fluid' : galleryFit ? 'gallery' : 'page'} style={shell}>
      <div
        style={
          galleryFit
            ? { minHeight: 168, width: '100%', minWidth: 0, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
            : shrink
              ? { minHeight: 168, width: '100%', minWidth: 0, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }
              : { minHeight: 168, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }
        }
      >
        {shownSlot === 'v2' ? <V2Composer preset={preset} theme={theme} strength={circleStrength} fit={fit} paused={shaderPaused} /> : null}
        {shownSlot === 'playground' ? (
          <PlaygroundCircle
            preset={preset}
            theme={theme}
            strength={circleStrength}
            paused={shaderPaused}
            disableGlow={disableGlow}
            disableReflection={disableReflection}
            fit={fit}
          />
        ) : null}
        {shownSlot === 'package' ? (
          <MetalFx key="package" preset={preset} variant="button" theme={theme} strength={1} paused={shaderPaused}>
            <button
              type="button"
              style={{
                boxSizing: 'border-box',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 140,
                height: 40,
                padding: 0,
                border: `1px solid ${FACE_BORDER}`,
                borderRadius: 20,
                background: FACE,
                boxShadow: 'inset 0 0 50px 0 rgba(255, 255, 255, 0.02)',
                color: FACE_FG,
                fontFamily: FONT_MED,
                fontSize: 14,
                fontWeight: 500,
                lineHeight: '17.938px',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              Upgrade to Pro
            </button>
          </MetalFx>
        ) : null}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ControlRow label="Preset" tokens={tokens}>
          {PRESETS.map((option) => (
            <Chip
              key={option}
              label={option}
              on={preset === option}
              tokens={tokens}
              hint={option === 'chromatic' ? undefined : STUDIO_LOCKED}
              onPress={() => setPreset(option)}
            />
          ))}
        </ControlRow>
        <ControlRow label="Specimen" tokens={tokens}>
          <Chip label="v2" on={specimen === 'v2'} tokens={tokens} onPress={() => choose('v2')} />
          <Chip label="playground" on={specimen === 'playground'} tokens={tokens} onPress={() => choose('playground')} />
          <Chip label="package default" on={specimen === 'package'} tokens={tokens} packageOption onPress={() => choose('package')} />
        </ControlRow>
        <ControlRow label="Theme" tokens={tokens}>
          <Chip label="dark" on={theme === 'dark'} tokens={tokens} onPress={() => setTheme('dark')} />
          <Chip label="light" on={theme === 'light'} tokens={tokens} packageOption onPress={() => setTheme('light')} />
          <Chip
            label={paused ? 'Play' : 'Pause'}
            on={!paused}
            tokens={tokens}
            onPress={togglePause}
          />
        </ControlRow>
        <ControlRow label="Options" tokens={tokens}>
          <Chip label="No Glow" on={disableGlow} tokens={tokens} onPress={() => setDisableGlow((value) => !value)} />
          <Chip
            label="No Reflection"
            on={disableReflection}
            tokens={tokens}
            onPress={() => setDisableReflection((value) => !value)}
          />
        </ControlRow>
        <ControlRow label="Strength" tokens={tokens}>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={pageStrength}
            aria-label="Effect strength"
            title={STUDIO_LOCKED}
            onChange={(event) => {
              const next = event.target.valueAsNumber;
              if (Number.isFinite(next)) setPageStrength(next);
            }}
            style={{ width: 120, accentColor: tokens.controlOnText }}
          />
          <span style={{ fontFamily: FONT, fontSize: 11, color: tokens.controlText }}>
            {specimen === 'package' ? '1.00' : `${pageStrength}% × 0.9 = ${circleStrength.toFixed(2)}`}
          </span>
          <span style={{ flexBasis: '100%', fontFamily: FONT, fontSize: 10, lineHeight: '14px', color: tokens.label }}>
            {STUDIO_LOCKED}
          </span>
        </ControlRow>
        <span style={{ fontFamily: FONT, fontSize: 10, lineHeight: '14px', color: tokens.label }}>
          140×40 strength-1 button: package default, {PACKAGE_OPTION}. Light theme: {PACKAGE_OPTION}. silver, gold:{' '}
          {STUDIO_LOCKED}
        </span>
      </div>
    </div>
  );
}

function ComposerChip({ label, chipRef }: { label: string; chipRef?: RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={chipRef}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 36,
        padding: '0 10px 0 14px',
        borderRadius: 50,
        background: CHIP_BG,
        boxShadow: CHIP_SHADOW,
        color: '#caccd2',
        fontFamily: FONT,
        fontSize: 12,
        lineHeight: '14px',
      }}
    >
      <span>{label}</span>
      <ChevronDownIcon />
    </div>
  );
}
