import { useState, type CSSProperties, type ReactNode } from 'react';
import { BorderBeam, type BorderBeamColorVariant, type BorderBeamSize, type BorderBeamTheme } from 'border-beam';

/**
 * border-beam@1.4.1. The libraries.dev page offers md, line, pulse-inner, and
 * pulse-outside, colorful and mono, and dark only. libraries.dev passes no
 * strength (package default 1) and has no strength control. The slider is a
 * package option; border-beam's own site starts at 70%. sm, the other six
 * color variants, and light are package options.
 */

const PAGE_SIZES: readonly BorderBeamSize[] = ['md', 'line', 'pulse-inner', 'pulse-outside'];
const PACKAGE_SIZES: readonly BorderBeamSize[] = ['sm'];
const PAGE_COLORS: readonly BorderBeamColorVariant[] = ['colorful', 'mono'];
const PACKAGE_COLORS: readonly BorderBeamColorVariant[] = ['ocean', 'sunset', 'forest', 'candy', 'ice', 'gold'];
const PACKAGE_OPTION = 'package option, not on the original';
const STRENGTH_OPTION =
  "package option, not on the original (border-beam's own site starts at 70%)";

const FONT = 'Inter_400Regular, system-ui, sans-serif';
const FONT_MED = 'Inter_500Medium, system-ui, sans-serif';

type Tokens = {
  stage: string;
  mockBg: string;
  mockBorder: string;
  chipBg: string;
  chipLine: string;
  chipTop: string;
  glow: string;
  placeholder: string;
  searchText: string;
  square: string;
  tagText: string;
  controlBg: string;
  controlText: string;
  controlOn: string;
  controlOnText: string;
  label: string;
};

const DARK: Tokens = {
  stage: '#171717',
  mockBg: '#1d1d1d',
  mockBorder: 'rgba(44, 47, 54, 0.52)',
  chipBg: 'rgba(255, 255, 255, 0.04)',
  chipLine: 'rgba(255, 255, 255, 0.02)',
  chipTop: 'rgba(255, 255, 255, 0.04)',
  glow: 'rgba(255, 255, 255, 0.02)',
  placeholder: '#4e4e4e',
  searchText: '#565656',
  square: 'rgba(217, 217, 217, 0.8)',
  tagText: '#caccd2',
  controlBg: 'rgba(255, 255, 255, 0.06)',
  controlText: '#c0c0c0',
  controlOn: 'rgba(255, 255, 255, 0.16)',
  controlOnText: '#ffffff',
  label: '#8b8b8b',
};

const LIGHT: Tokens = {
  stage: '#f6f6f6',
  mockBg: '#ffffff',
  mockBorder: 'rgba(0, 0, 0, 0.08)',
  chipBg: 'rgba(0, 0, 0, 0.04)',
  chipLine: 'rgba(0, 0, 0, 0.03)',
  chipTop: 'rgba(255, 255, 255, 0.6)',
  glow: 'rgba(0, 0, 0, 0.015)',
  placeholder: '#9a9a9a',
  searchText: '#7a7a7a',
  square: 'rgba(0, 0, 0, 0.35)',
  tagText: '#3f434a',
  controlBg: 'rgba(0, 0, 0, 0.04)',
  controlText: '#3f434a',
  controlOn: '#111111',
  controlOnText: '#ffffff',
  label: '#6c6c6c',
};

function mockShadow(tokens: Tokens): string {
  return `inset 0 0 0 1px ${tokens.mockBorder}, inset 0 0 50px 0 ${tokens.glow}`;
}

function chipShadow(tokens: Tokens): string {
  return `inset 0 0 0 1px ${tokens.chipLine}, inset 0 1px 0 0 ${tokens.chipTop}`;
}

function AtSignIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M10.4 5.59963V8.59962C10.4 9.07701 10.5896 9.53485 10.9272 9.87242C11.2648 10.21 11.7226 10.3996 12.2 10.3996C12.6774 10.3996 13.1352 10.21 13.4728 9.87242C13.8104 9.53485 14 9.07701 14 8.59962V7.99962C13.9999 6.64544 13.5417 5.33111 12.7 4.27035C11.8582 3.20958 10.6823 2.46476 9.36359 2.15701C8.04484 1.84925 6.66076 1.99665 5.43641 2.57525C4.21206 3.15384 3.21944 4.1296 2.61996 5.34386C2.02048 6.55812 1.84939 7.93947 2.13451 9.26329C2.41963 10.5871 3.14419 11.7756 4.19038 12.6354C5.23657 13.4952 6.54286 13.9758 7.89684 13.9991C9.25083 14.0224 10.5729 13.587 11.648 12.7636M10.4 7.99962C10.4 9.32511 9.32549 10.3996 8 10.3996C6.67452 10.3996 5.6 9.32511 5.6 7.99962C5.6 6.67414 6.67452 5.59963 8 5.59963C9.32549 5.59963 10.4 6.67414 10.4 7.99962Z"
        stroke="#808388"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: 'rotate(90deg)' }}>
      <path d="M7 11L10 8L7 5" stroke="#8B9099" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 12.6667V3.33333M12.6667 8L8 3.33333L3.33333 8"
        stroke="#8B8B8B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ChatSpecimen({ tokens }: { tokens: Tokens }) {
  return (
    <div
      role="img"
      aria-label="Chat input"
      style={{
        width: 348,
        maxWidth: '100%',
        borderRadius: 20,
        background: tokens.mockBg,
        boxShadow: mockShadow(tokens),
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ boxSizing: 'border-box', padding: '7px 7px 8px', display: 'flex', flexDirection: 'column', height: 122 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            width: 'fit-content',
            height: 24,
            padding: '0 4px',
            marginLeft: 1,
            borderRadius: 36,
            background: tokens.chipBg,
            boxShadow: chipShadow(tokens),
          }}
        >
          <AtSignIcon />
        </div>
        <div style={{ fontFamily: FONT, fontSize: 13, lineHeight: '16px', color: tokens.placeholder, padding: '16px 4px 0' }}>
          Build anything...
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', position: 'relative', zIndex: 5 }}>
          <Tag tokens={tokens} first>
            Agent
          </Tag>
          <Tag tokens={tokens}>Auto</Tag>
          <div
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 36,
              background: tokens.chipBg,
              boxShadow: chipShadow(tokens),
              marginLeft: 'auto',
              padding: '0 8px',
            }}
          >
            <span style={{ display: 'flex', opacity: 0.5 }}>
              <ArrowUpIcon />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tag({ tokens, first, children }: { tokens: Tokens; first?: boolean; children: ReactNode }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 24,
        padding: '0 6px 0 8px',
        marginLeft: first ? 1 : 0,
        borderRadius: 36,
        background: tokens.chipBg,
        boxShadow: chipShadow(tokens),
        fontFamily: FONT,
        fontSize: 12,
        lineHeight: '14px',
        color: tokens.tagText,
      }}
    >
      {children}
      <ChevronDownIcon />
    </div>
  );
}

function IconSpecimen({ tokens }: { tokens: Tokens }) {
  return (
    <div
      role="img"
      aria-label="Icon button"
      style={{
        width: 36,
        height: 36,
        borderRadius: 20,
        background: tokens.mockBg,
        boxShadow: mockShadow(tokens),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: 12, height: 12, borderRadius: 2, background: tokens.square }} />
    </div>
  );
}

function SearchSpecimen({ tokens }: { tokens: Tokens }) {
  return (
    <div role="img" aria-label="Search bar" style={{ width: 366, maxWidth: '100%', height: 42, borderRadius: 64, position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 20,
          background: tokens.mockBg,
          boxShadow: mockShadow(tokens),
          display: 'flex',
          alignItems: 'center',
          padding: '0 13px',
          gap: 10,
          color: tokens.searchText,
        }}
      >
        <span style={{ display: 'flex', opacity: 0.4 }}>
          <SearchIcon />
        </span>
        <span style={{ fontFamily: FONT, fontSize: 15, lineHeight: '18px' }}>Search</span>
      </div>
    </div>
  );
}

function PulseDemoCard() {
  const line = 'rgba(238, 238, 239, 0.08)';
  return (
    <div
      role="img"
      aria-label="Demo card"
      style={{
        boxSizing: 'border-box',
        width: 250,
        maxWidth: '100%',
        padding: '24px 26px',
        borderRadius: 16,
        background: '#1d1d1d',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ height: 10, width: '55%', borderRadius: 4, background: 'rgba(238, 238, 239, 0.14)' }} />
      <div style={{ height: 8, borderRadius: 4, background: line }} />
      <div style={{ height: 8, width: '78%', borderRadius: 4, background: line }} />
    </div>
  );
}

function specimenFor(size: BorderBeamSize, tokens: Tokens) {
  if (size === 'sm') return <IconSpecimen tokens={tokens} />;
  if (size === 'line') return <SearchSpecimen tokens={tokens} />;
  if (size === 'pulse-inner' || size === 'pulse-outside') return <PulseDemoCard />;
  return <ChatSpecimen tokens={tokens} />;
}

function pulseOutsideVars(): CSSProperties {
  const style: CSSProperties & Record<string, string> = {};
  style['--sub-glow-offset-x'] = '1px';
  style['--sub-glow-offset-y'] = '0px';
  style['--sub-core-blur'] = '10px';
  style['--sub-bloom-blur'] = '19px';
  style['--sub-glow-opacity-mul'] = '1.71';
  return style;
}

function Chip({
  label,
  on,
  tokens,
  onPress,
  packageOption,
}: {
  label: string;
  on: boolean;
  tokens: Tokens;
  onPress: () => void;
  packageOption?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      title={packageOption ? PACKAGE_OPTION : undefined}
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
      <span style={{ width: 48, fontFamily: FONT_MED, fontSize: 10, lineHeight: '12px', color: tokens.label }}>{label}</span>
      {children}
    </div>
  );
}

export function BorderBeamCard() {
  const [size, setSize] = useState<BorderBeamSize>('md');
  const [colorVariant, setColorVariant] = useState<BorderBeamColorVariant>('colorful');
  const [theme, setTheme] = useState<Exclude<BorderBeamTheme, 'auto'>>('dark');
  const [active, setActive] = useState(true);
  const [strength, setStrength] = useState(100);
  const tokens = theme === 'dark' ? DARK : LIGHT;
  const shell: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    background: tokens.stage,
    borderRadius: 14,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  };
  return (
    <div data-testid="border-beam-card" data-theme={theme} style={shell}>
      <div
        style={{
          minHeight: 168,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: size === 'pulse-outside' ? 28 : 8,
          overflow: 'visible',
        }}
      >
        <BorderBeam
          size={size}
          colorVariant={colorVariant}
          theme={theme}
          active={active}
          strength={strength / 100}
          borderRadius={size === 'line' ? 20 : undefined}
          style={size === 'pulse-outside' ? pulseOutsideVars() : undefined}
        >
          {specimenFor(size, tokens)}
        </BorderBeam>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ControlRow label="Size" tokens={tokens}>
          {PAGE_SIZES.map((option) => (
            <Chip key={option} label={option} on={size === option} tokens={tokens} onPress={() => setSize(option)} />
          ))}
          {PACKAGE_SIZES.map((option) => (
            <Chip key={option} label={option} on={size === option} tokens={tokens} packageOption onPress={() => setSize(option)} />
          ))}
        </ControlRow>
        <ControlRow label="Color" tokens={tokens}>
          {PAGE_COLORS.map((option) => (
            <Chip key={option} label={option} on={colorVariant === option} tokens={tokens} onPress={() => setColorVariant(option)} />
          ))}
          {PACKAGE_COLORS.map((option) => (
            <Chip
              key={option}
              label={option}
              on={colorVariant === option}
              tokens={tokens}
              packageOption
              onPress={() => setColorVariant(option)}
            />
          ))}
        </ControlRow>
        <ControlRow label="Theme" tokens={tokens}>
          <Chip label="dark" on={theme === 'dark'} tokens={tokens} onPress={() => setTheme('dark')} />
          <Chip label="light" on={theme === 'light'} tokens={tokens} packageOption onPress={() => setTheme('light')} />
          <Chip label={active ? 'Pause' : 'Play'} on={active} tokens={tokens} onPress={() => setActive((value) => !value)} />
        </ControlRow>
        <ControlRow label="Strength" tokens={tokens}>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={strength}
            aria-label="Effect strength"
            title={STRENGTH_OPTION}
            onChange={(event) => {
              const next = event.target.valueAsNumber;
              if (Number.isFinite(next)) setStrength(next);
            }}
            style={{ width: 120, accentColor: tokens.controlOnText }}
          />
          <span style={{ fontFamily: FONT, fontSize: 11, color: tokens.controlText }}>{strength}%</span>
          <span style={{ flexBasis: '100%', fontFamily: FONT, fontSize: 10, lineHeight: '14px', color: tokens.label }}>
            {STRENGTH_OPTION}
          </span>
        </ControlRow>
        <span style={{ fontFamily: FONT, fontSize: 10, lineHeight: '14px', color: tokens.label }}>
          sm, ocean, sunset, forest, candy, ice, gold, light: {PACKAGE_OPTION}
        </span>
      </div>
    </div>
  );
}
