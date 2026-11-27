import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { CARD_CSS } from './cardCss';
import { COLOR_ROW, DEFAULT_PRESET_ID, PRESETS, presetById, type PresetGroup } from './presets';
import { mountAvatar, type AvatarMaterial, type AvatarOptions, type MountedAvatar } from './vendor/core/dom';
import { fluffy } from './vendor/core/dom/materials/fluffy';
import { glass } from './vendor/core/dom/materials/glass';
import { validateAvatar } from './vendor/core';
import type { AvatarDefinition, AvatarMood, AvatarState } from './vendor/core/types';

const STATES: readonly AvatarState[] = ['idle', 'thinking', 'working', 'waiting', 'blocked', 'done'];
const MOODS: readonly AvatarMood[] = ['neutral', 'happy'];
type Finish = 'flat' | 'fluffy' | 'glass';
const FINISHES: readonly Finish[] = ['flat', 'fluffy', 'glass'];
const GROUPS: readonly PresetGroup[] = ['Examples', 'More'];
/**
 * Drop Fluffy or Glass to Flat after this many consecutive frames, each
 * slower than STALL_MS. 250 ms is 4 fps, far below a frame this coat paints
 * while a GPU is keeping up. The first sample is ignored, so a shader compile
 * on the first paint does not count. One later slow frame is a hitch: that
 * compile spilling one frame, or the single gap when a hidden tab is shown
 * again. A frame on time clears the run. Three in a row means the finish
 * is still stuck. The same check runs on a real GPU and on software WebGL.
 */
const STALL_MS = 250;
const STALL_FRAMES = 3;

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

function finishLabel(finish: Finish): string {
  switch (finish) {
    case 'flat':
      return 'Flat';
    case 'fluffy':
      return 'Fluffy';
    case 'glass':
      return 'Glass';
    default: {
      const never: never = finish;
      return never;
    }
  }
}

function finishValue(finish: Finish): AvatarMaterial {
  switch (finish) {
    case 'flat':
      return 'flat';
    case 'fluffy':
      return fluffy;
    case 'glass':
      return glass;
    default: {
      const never: never = finish;
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

let softwareGl: boolean | null = null;

/** SwiftShader, llvmpipe, and other software renderers. A real GPU string is false. */
function softwareWebGL(): boolean {
  if (softwareGl !== null) return softwareGl;
  softwareGl = false;
  if (typeof document === 'undefined') return softwareGl;
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) return softwareGl;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  softwareGl = /swiftshader|llvmpipe|software/i.test(renderer);
  return softwareGl;
}

function stallLine(finish: Finish): string {
  switch (finish) {
    case 'fluffy':
      return 'Fluffy was too slow here, so the finish is Flat.';
    case 'glass':
      return 'Glass was too slow here, so the finish is Flat.';
    case 'flat':
      return 'Fluffy was too slow here, so the finish is Flat.';
    default: {
      const never: never = finish;
      return never;
    }
  }
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
  const [finish, setFinish] = useState<Finish>(() => (softwareWebGL() ? 'flat' : 'fluffy'));
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [mood, setMood] = useState<AvatarMood>('neutral');
  const [followPointer, setFollowPointer] = useState(true);
  const [presetId, setPresetId] = useState(DEFAULT_PRESET_ID);
  const [json, setJson] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [stall, setStall] = useState<string | null>(null);

  const options: AvatarOptions = {
    definition,
    color,
    material: finishValue(finish),
    state: avatarState,
    mood,
    followPointer,
    reducedMotion: 'system',
    label: definition.name,
  };
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const software = softwareWebGL();

  useLayoutEffect(() => {
    const parent = frameRef.current?.parentElement;
    setCompact(!!parent && parent.clientWidth > 0 && parent.clientWidth < 480);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const avatar = mountAvatar(host, {
      ...optionsRef.current,
      still: compact,
      followPointer: compact ? false : optionsRef.current.followPointer,
    });
    avatarRef.current = avatar;
    return () => {
      avatar.destroy();
      avatarRef.current = null;
    };
  }, [compact]);
  useEffect(() => {
    avatarRef.current?.update(optionsRef.current);
  }, [definition, color, finish, avatarState, mood, followPointer]);

  useEffect(() => {
    if (compact || (finish !== 'fluffy' && finish !== 'glass')) return;
    let last = performance.now();
    let samples = 0;
    let slow = 0;
    let raf = 0;
    const line = stallLine(finish);
    const tick = (now: number) => {
      const gap = now - last;
      last = now;
      samples += 1;
      if (samples > 1) {
        if (gap > STALL_MS) {
          slow += 1;
          if (slow >= STALL_FRAMES) {
            setStall(line);
            setFinish('flat');
            return;
          }
        } else {
          slow = 0;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [compact, finish]);

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
        <div className="oba-field" role="group" aria-label="State">
          <span className="oba-label">State</span>
          <div className="oba-states">
            {STATES.map((state) => (
              <button
                key={state}
                type="button"
                className="oba-chip"
                aria-pressed={avatarState === state}
                data-testid={`oba-state-${state}`}
                onClick={() => setAvatarState(state)}
              >
                {stateLabel(state)}
              </button>
            ))}
          </div>
        </div>
        <div className="oba-pair">
          <div className="oba-field" role="group" aria-label="Mood">
            <span className="oba-label">Mood</span>
            <div className="oba-row">
              {MOODS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="oba-chip"
                  aria-pressed={mood === item}
                  data-testid={`oba-mood-${item}`}
                  onClick={() => setMood(item)}
                >
                  {moodLabel(item)}
                </button>
              ))}
            </div>
          </div>
          <div className="oba-field" role="group" aria-label="Finish">
            <span className="oba-label">Finish</span>
            <div className="oba-row">
              {FINISHES.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="oba-chip"
                  aria-pressed={finish === item}
                  data-testid={`oba-material-${item}`}
                  onClick={() => {
                    setStall(null);
                    setFinish(item);
                  }}
                >
                  {finishLabel(item)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="oba-field">
          <span className="oba-label">Pointer</span>
          <button
            type="button"
            role="switch"
            className="oba-switch"
            aria-checked={followPointer}
            data-testid="oba-follow"
            onClick={() => setFollowPointer((value) => !value)}
          >
            Eyes follow cursor
          </button>
        </div>
        {stall || (software && finish === 'flat') ? (
          <p className="oba-stall" role="status" data-testid="oba-stall">
            {stall ?? 'Software WebGL starts on Flat.'}
          </p>
        ) : null}
        <div className="oba-field">
          <span className="oba-label">Preset</span>
          <div className="oba-presets">
            {GROUPS.map((group) => (
              <div key={group} className="oba-preset-group" role="group" aria-label={group}>
                <span className="oba-group-name">{group}</span>
                <div className="oba-row">
                  {PRESETS.filter((preset) => preset.group === group).map((preset) => (
                    <button
                      key={preset.definition.id}
                      type="button"
                      className="oba-chip"
                      aria-pressed={presetId === preset.definition.id}
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
        <div className="oba-field" role="group" aria-label="Colour">
          <span className="oba-label">Colour</span>
          <div className="oba-swatches">
            {COLOR_ROW.map((swatch) => (
              <button
                key={swatch.value}
                type="button"
                className="oba-swatch"
                style={{ background: swatch.value }}
                aria-label={swatch.name}
                aria-pressed={color.toLowerCase() === swatch.value}
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
            aria-invalid={errors.length > 0}
            aria-describedby={errors.length > 0 ? 'oba-json-errors' : undefined}
            data-testid="oba-json"
            placeholder="Paste an avatar definition"
            onChange={(event) => setJson(event.target.value)}
          />
        </label>
        <button type="button" className="oba-import" data-testid="oba-import" onClick={importJson}>
          Import
        </button>
        {errors.length > 0 ? (
          <ul className="oba-errors" id="oba-json-errors" role="alert" data-testid="oba-errors">
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
