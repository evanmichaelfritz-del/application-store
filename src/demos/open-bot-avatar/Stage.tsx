import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { CARD_CSS } from './cardCss';
import { COLOR_ROW, DEFAULT_PRESET_ID, PRESETS, presetById, type PresetGroup } from './presets';
import { mountAvatar, type AvatarOptions, type MountedAvatar } from './vendor/core/dom';
import { validateAvatar } from './vendor/core';
import type { AvatarDefinition, AvatarMaterial, AvatarMood, AvatarState } from './vendor/core/types';

const STATES: readonly AvatarState[] = ['idle', 'thinking', 'working', 'waiting', 'blocked', 'done'];
const MOODS: readonly AvatarMood[] = ['neutral', 'happy'];
const MATERIALS: readonly AvatarMaterial[] = ['flat', 'fluffy'];
const GROUPS: readonly PresetGroup[] = ['Examples', 'Gallery'];

function stateLabel(state: AvatarState): string {
  switch (state) {
    case 'idle':
      return 'Idle';
    case 'thinking':
      return 'Thinking';
    case 'working':
      return 'Working';
    case 'waiting':
      return 'Waiting';
    case 'blocked':
      return 'Blocked';
    case 'done':
      return 'Done';
    default: {
      const never: never = state;
      return never;
    }
  }
}

function moodLabel(mood: AvatarMood): string {
  switch (mood) {
    case 'neutral':
      return 'Neutral';
    case 'happy':
      return 'Happy';
    default: {
      const never: never = mood;
      return never;
    }
  }
}

function materialLabel(material: AvatarMaterial): string {
  switch (material) {
    case 'flat':
      return 'Flat';
    case 'fluffy':
      return 'Fluffy';
    default: {
      const never: never = material;
      return never;
    }
  }
}

function useCardCss(): void {
  useEffect(() => {
    if (document.getElementById('oba-card-css')) return;
    const style = document.createElement('style');
    style.id = 'oba-card-css';
    style.textContent = CARD_CSS;
    document.head.appendChild(style);
  }, []);
}

/** Software WebGL spends a long first frame. Real GPUs do not. */
function softwareWebGL(): boolean {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) return false;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return /swiftshader|llvmpipe|software/i.test(renderer);
}

function startingPreset() {
  const preset = presetById(DEFAULT_PRESET_ID);
  if (!preset) throw new Error('cat preset missing');
  return preset;
}

const initial = startingPreset();

/** One live avatar and the controls that drive it. */
export function OpenBotAvatarStage({ credit }: { credit?: ReactNode }) {
  useCardCss();
  const frameRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<MountedAvatar | null>(null);
  const [compact, setCompact] = useState(false);
  const [definition, setDefinition] = useState<AvatarDefinition>(initial.definition);
  const [color, setColor] = useState(initial.color);
  const [material, setMaterial] = useState<AvatarMaterial>('fluffy');
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [mood, setMood] = useState<AvatarMood>('neutral');
  const [presetId, setPresetId] = useState(DEFAULT_PRESET_ID);
  const [json, setJson] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const options: AvatarOptions = {
    definition,
    color,
    material,
    state: avatarState,
    mood,
    followPointer: true,
    reducedMotion: 'system',
    label: definition.name,
  };
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useLayoutEffect(() => {
    const parent = frameRef.current?.parentElement;
    setCompact(!!parent && parent.clientWidth > 0 && parent.clientWidth < 480);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let avatar: MountedAvatar | null = null;
    let cancel = false;
    const delay = compact || !softwareWebGL() ? 0 : 2500;
    const timer = window.setTimeout(() => {
      if (cancel || !host.isConnected) return;
      avatar = mountAvatar(host, {
        ...optionsRef.current,
        still: compact,
        followPointer: compact ? false : optionsRef.current.followPointer,
      });
      avatarRef.current = avatar;
    }, delay);
    return () => {
      cancel = true;
      window.clearTimeout(timer);
      avatar?.destroy();
      avatarRef.current = null;
    };
  }, [compact]);
  useEffect(() => {
    avatarRef.current?.update(optionsRef.current);
  }, [definition, color, material, avatarState, mood]);

  function choosePreset(id: string): void {
    const preset = presetById(id);
    if (!preset) return;
    setPresetId(id);
    setDefinition(preset.definition);
    setColor(preset.color);
    setErrors([]);
  }

  function importJson(): void {
    const text = json.trim();
    if (!text) {
      setErrors(['Paste an avatar JSON object.']);
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      const message = error instanceof SyntaxError ? error.message : 'Invalid JSON';
      setErrors([message]);
      return;
    }
    const result = validateAvatar(parsed);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    const known = presetById(result.value.id);
    setDefinition(result.value);
    setPresetId(known ? result.value.id : '');
    if (known) setColor(known.color);
    setErrors([]);
  }

  useEffect(() => {
    if (errors.length === 0) return;
    const list = document.querySelector('[data-testid="oba-errors"]');
    const panel = list?.closest('.oba-panel');
    if (panel instanceof HTMLElement) panel.scrollTop = panel.scrollHeight;
  }, [errors]);

  const title = presetId ? definition.name : `Imported · ${definition.name}`;

  return (
    <div ref={frameRef} className={compact ? 'oba oba-compact' : 'oba'} data-testid="open-bot-avatar">
      <div className="oba-stage">
        <div ref={hostRef} className="oba-avatar-host" data-testid="oba-avatar" />
        {compact ? null : credit}
      </div>
      {compact ? null : (
      <div className="oba-panel">
        <p className="oba-name" data-testid="oba-name">
          {title}
        </p>
        <div className="oba-field" role="radiogroup" aria-label="State">
          <span className="oba-label">State</span>
          <div className="oba-states">
            {STATES.map((state) => (
              <button
                key={state}
                type="button"
                role="radio"
                className="oba-chip"
                aria-checked={avatarState === state}
                data-testid={`oba-state-${state}`}
                onClick={() => setAvatarState(state)}
              >
                {stateLabel(state)}
              </button>
            ))}
          </div>
        </div>
        <div className="oba-field" role="radiogroup" aria-label="Mood">
          <span className="oba-label">Mood</span>
          <div className="oba-row">
            {MOODS.map((item) => (
              <button
                key={item}
                type="button"
                role="radio"
                className="oba-chip"
                aria-checked={mood === item}
                data-testid={`oba-mood-${item}`}
                onClick={() => setMood(item)}
              >
                {moodLabel(item)}
              </button>
            ))}
          </div>
        </div>
        <div className="oba-field" role="radiogroup" aria-label="Material">
          <span className="oba-label">Material</span>
          <div className="oba-row">
            {MATERIALS.map((item) => (
              <button
                key={item}
                type="button"
                role="radio"
                className="oba-chip"
                aria-checked={material === item}
                data-testid={`oba-material-${item}`}
                onClick={() => setMaterial(item)}
              >
                {materialLabel(item)}
              </button>
            ))}
          </div>
        </div>
        <div className="oba-field">
          <span className="oba-label">Preset</span>
          <div className="oba-presets">
            {GROUPS.map((group) => (
              <div key={group} className="oba-preset-group" role="radiogroup" aria-label={group}>
                <span className="oba-group-name">{group}</span>
                <div className="oba-row">
                  {PRESETS.filter((preset) => preset.group === group).map((preset) => (
                    <button
                      key={preset.definition.id}
                      type="button"
                      role="radio"
                      className="oba-chip"
                      aria-checked={presetId === preset.definition.id}
                      data-testid={`oba-preset-${preset.definition.id}`}
                      onClick={() => choosePreset(preset.definition.id)}
                    >
                      {preset.definition.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="oba-field" role="radiogroup" aria-label="Colour">
          <span className="oba-label">Colour</span>
          <div className="oba-swatches">
            {COLOR_ROW.map((swatch) => (
              <button
                key={swatch.value}
                type="button"
                role="radio"
                className="oba-swatch"
                style={{ background: swatch.value }}
                aria-label={swatch.name}
                aria-checked={color.toLowerCase() === swatch.value}
                data-testid={`oba-color-${swatch.value.slice(1)}`}
                onClick={() => setColor(swatch.value)}
              />
            ))}
          </div>
        </div>
        <label className="oba-field">
          <span className="oba-label">JSON</span>
          <textarea
            className="oba-json"
            value={json}
            spellCheck={false}
            aria-label="Avatar JSON"
            data-testid="oba-json"
            placeholder="Paste an avatar definition"
            onChange={(event) => setJson(event.target.value)}
          />
        </label>
        <button type="button" className="oba-import" data-testid="oba-import" onClick={importJson}>
          Import
        </button>
        {errors.length > 0 ? (
          <ul className="oba-errors" data-testid="oba-errors">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        ) : null}
      </div>
      )}
    </div>
  );
}
