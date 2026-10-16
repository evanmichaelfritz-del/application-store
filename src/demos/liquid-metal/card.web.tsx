import { useState, type CSSProperties, type ReactNode } from 'react';
import { MetalFx, type MetalFxPreset, type MetalFxTheme, type MetalFxVariant } from 'metal-fx';

/**
 * metal-fx@2.0.11. Package defaults: variant button, preset chromatic,
 * strength 1, paused false. Theme is pinned here (the package default is
 * auto). Button scale is 1.6 with a 1px ring; circle scale is 1.3 with a
 * 2px ring. Reference pill is 140×40. WebGL2 support is probed inside
 * MetalFx; an unsupported host renders the child alone.
 */

const PRESETS: readonly MetalFxPreset[] = ['chromatic', 'silver', 'gold'];
const VARIANTS: readonly MetalFxVariant[] = ['button', 'circle'];
const THEMES: readonly Exclude<MetalFxTheme, 'auto'>[] = ['dark', 'light'];

const FONT = 'Inter_400Regular, system-ui, sans-serif';
const FONT_MED = 'Inter_500Medium, system-ui, sans-serif';

type Tokens = {
  stage: string;
  fill: string;
  fg: string;
  border: string;
  inset: string;
  controlBg: string;
  controlText: string;
  controlOn: string;
  controlOnText: string;
  label: string;
};

const DARK: Tokens = {
  stage: '#171717',
  fill: '#1d1d1d',
  fg: '#f8f8f8',
  border: 'rgba(44, 47, 54, 0.52)',
  inset: 'rgba(255, 255, 255, 0.02)',
  controlBg: 'rgba(255, 255, 255, 0.06)',
  controlText: '#c0c0c0',
  controlOn: 'rgba(255, 255, 255, 0.16)',
  controlOnText: '#ffffff',
  label: '#8b8b8b',
};

const LIGHT: Tokens = {
  stage: '#f6f6f6',
  fill: '#ffffff',
  fg: '#111111',
  border: 'rgba(0, 0, 0, 0.08)',
  inset: 'rgba(0, 0, 0, 0.015)',
  controlBg: 'rgba(0, 0, 0, 0.04)',
  controlText: '#3f434a',
  controlOn: '#111111',
  controlOnText: '#ffffff',
  label: '#6c6c6c',
};

function ArrowUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function Chip({ label, on, tokens, onPress }: { label: string; on: boolean; tokens: Tokens; onPress: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
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
      <span style={{ width: 64, fontFamily: FONT_MED, fontSize: 10, lineHeight: '12px', color: tokens.label }}>{label}</span>
      {children}
    </div>
  );
}

export function LiquidMetalCard() {
  const [preset, setPreset] = useState<MetalFxPreset>('chromatic');
  const [variant, setVariant] = useState<MetalFxVariant>('button');
  const [theme, setTheme] = useState<Exclude<MetalFxTheme, 'auto'>>('dark');
  const [strength, setStrength] = useState(1);
  const [paused, setPaused] = useState(false);
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
  const face: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${tokens.border}`,
    background: tokens.fill,
    boxShadow: `inset 0 0 50px 0 ${tokens.inset}`,
    color: tokens.fg,
    fontFamily: FONT_MED,
    fontSize: 14,
    fontWeight: 500,
    lineHeight: '17.938px',
    padding: 0,
    cursor: 'pointer',
  };
  return (
    <div data-testid="liquid-metal-card" data-theme={theme} style={shell}>
      <div style={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
        <MetalFx preset={preset} variant={variant} theme={theme} strength={strength} paused={paused}>
          {variant === 'circle' ? (
            <button type="button" aria-label="Send" style={{ ...face, width: 40, height: 40, borderRadius: '50%' }}>
              <ArrowUpIcon />
            </button>
          ) : (
            <button type="button" style={{ ...face, width: 140, height: 40, borderRadius: 20, whiteSpace: 'nowrap' }}>
              Upgrade to Pro
            </button>
          )}
        </MetalFx>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ControlRow label="Preset" tokens={tokens}>
          {PRESETS.map((option) => (
            <Chip key={option} label={option} on={preset === option} tokens={tokens} onPress={() => setPreset(option)} />
          ))}
        </ControlRow>
        <ControlRow label="Variant" tokens={tokens}>
          {VARIANTS.map((option) => (
            <Chip key={option} label={option} on={variant === option} tokens={tokens} onPress={() => setVariant(option)} />
          ))}
        </ControlRow>
        <ControlRow label="Theme" tokens={tokens}>
          {THEMES.map((option) => (
            <Chip key={option} label={option} on={theme === option} tokens={tokens} onPress={() => setTheme(option)} />
          ))}
          <Chip label={paused ? 'Play' : 'Pause'} on={!paused} tokens={tokens} onPress={() => setPaused((value) => !value)} />
        </ControlRow>
        <ControlRow label="Strength" tokens={tokens}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={strength}
            aria-label="Strength"
            onChange={(event) => {
              const next = event.target.valueAsNumber;
              if (Number.isFinite(next)) setStrength(next);
            }}
            style={{ width: 120, accentColor: tokens.fg }}
          />
          <span style={{ fontFamily: FONT, fontSize: 11, color: tokens.controlText }}>{strength.toFixed(2)}</span>
        </ControlRow>
      </div>
    </div>
  );
}
