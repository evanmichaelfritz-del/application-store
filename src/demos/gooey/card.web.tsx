import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from 'react';
import { MELT_A, MELT_B } from './meltPhotos';
import { Liquid } from 'liquid-gooey';

/**
 * liquid-gooey@0.2.2. libraries.dev/gooey renders MorphDemo first
 * (gooey.tsx:24), then Move and Bend, then a public playground that
 * starts on morph (studio/gooey.tsx:681). The card opens on that morph
 * plus menu. Each effect keeps its own props.
 */

const PRO_LOCKED = 'Pro-locked on the original';
const BOUNCE_HINT = `${PRO_LOCKED}; teaser only; not wired on the original`;
const FONT = 'Inter, Inter_400Regular, system-ui, sans-serif';
const FONT_MED = 'Inter, Inter_500Medium, system-ui, sans-serif';

const DARK_SHADOW =
  '0 0 0 1px rgba(255, 255, 255, 0.04) inset, 0 1px 0 0 rgba(255, 255, 255, 0.03) inset, 0 0 0 1px rgba(0, 0, 0, 0.06), 0 2px 6px 0 rgba(0, 0, 0, 0.05), 0 4px 42px 0 rgba(0, 0, 0, 0.24)';

const FILLS = { morph: '#202020', move: '#525252', bend: '#202020' } as const;
const EASE_BOUNCY = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const EASE_SNAPPY = 'cubic-bezier(0.22, 1, 0.36, 1)';
const DROP_MS = 400;
const DROP_EASE = 'cubic-bezier(0.34, 1.40, 0.64, 1)';
const THUMB_MAX = 188;
const MELT_CARD = 84;
const MELT_STAGE_H = 200;
const BEND_CLAMP = { x: 70, y: 60 };

const OPEN_DUR = 550;
const CLOSE_DUR = 250;
const CLOSE_STAGGER = 0;
const SPREAD = 1;
const ANTICIP_DIST = 5;
const ANTICIP_DUR = 700;
const ICON_DUR = 180;
const ICON_DELAY = 120;

const MOVE = { springiness: 0.5, wobble: 0.5, stretch: 0.6, trail: 0.35 };
const BEND = { vertical: 0.6, horizontal: 0.35, content: 0.3 };
const MELT = { blur: 7, contrast: 40, reach: 0.8, fade: 17, warp: 0, mix: 1, mixBlur: 8, gravity: 1.9, waviness: 12 };

type Effect = 'morph' | 'move' | 'bend' | 'melt';
type SurfaceEffect = 'morph' | 'move' | 'bend';
type FillChoice = 'default' | '#e9e9e9' | '#7cd4ff';

const EFFECTS: readonly Effect[] = ['morph', 'move', 'bend', 'melt'];
const FILLS_LOCKED: readonly { id: FillChoice; label: string }[] = [
  { id: 'default', label: 'Surface' },
  { id: '#e9e9e9', label: 'Light' },
  { id: '#7cd4ff', label: 'Sky' },
];

const SATELLITES: readonly { label: string; x: number; y: number; icon: ReactNode }[] = [
  {
    label: 'New file',
    x: -54,
    y: -34,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 1.5H4A1.5 1.5 0 0 0 2.5 3v10A1.5 1.5 0 0 0 4 14.5h8a1.5 1.5 0 0 0 1.5-1.5V6z" />
        <path d="M9 1.5V6h4.5" />
      </svg>
    ),
  },
  {
    label: 'Add image',
    x: 0,
    y: -64,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1.5" y="1.5" width="13" height="13" rx="2" />
        <circle cx="5.5" cy="5.5" r="1.25" />
        <path d="M14.5 10.5L11 7l-7.5 7.5" />
      </svg>
    ),
  },
  {
    label: 'New folder',
    x: 54,
    y: -34,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 12.5A1.5 1.5 0 0 1 13 14H3a1.5 1.5 0 0 1-1.5-1.5V3A1.5 1.5 0 0 1 3 1.5h3L7.5 4H13a1.5 1.5 0 0 1 1.5 1.5z" />
      </svg>
    ),
  },
];

const CSS = `
.as-gooey .pm { position: relative; width: 200px; height: 140px; }
.as-gooey .pm-slot { position: absolute; left: 80px; top: 80px; }
.as-gooey .pm-btn {
  width: 40px; height: 40px; border: 0; padding: 0; border-radius: 50%;
  background: transparent; display: grid; place-items: center; cursor: pointer;
  color: var(--gd-ink, #fbfbfb); -webkit-tap-highlight-color: transparent;
}
.as-gooey .pm-btn:focus-visible { outline: 2px solid #ededed; outline-offset: 2px; }
.as-gooey .pm-sat { pointer-events: none; }
.as-gooey .pm-open .pm-sat { pointer-events: auto; }
.as-gooey .pm-open .pm-sat:hover { background: rgba(255, 255, 255, 0.06); }
.as-gooey .pm-sat-icon {
  display: grid; place-items: center; opacity: 0; filter: blur(2px);
  transition: opacity 120ms ease, filter 120ms ease;
}
.as-gooey .pm-open .pm-sat-icon { opacity: 1; filter: blur(0); transition-duration: var(--pm-icon-dur, 180ms); }
@keyframes as-gooey-anticipate {
  0% { transform: translateY(0); }
  30% { transform: translateY(var(--pm-anticip, 5px)); }
  100% { transform: translateY(0); }
}
.as-gooey .pm-anticipating [data-gooey-svg],
.as-gooey .pm-anticipating .pm-main {
  animation-name: as-gooey-anticipate;
  animation-duration: var(--pm-anticip-dur, 700ms);
  animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  animation-fill-mode: both;
}
.as-gooey .pm-plus { display: grid; place-items: center; transform: rotate(0deg); transition: transform 250ms ease-in-out; }
.as-gooey .pm-open .pm-plus { transform: rotate(45deg); }
.as-gooey .sl { position: relative; width: 240px; height: 80px; }
.as-gooey .sl-track {
  position: absolute; left: 14px; right: 14px; top: 38px; height: 8px; border-radius: 4px;
  background: rgba(115, 115, 115, 0.2); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02); z-index: -2;
}
.as-gooey .sl-thumb {
  position: absolute; left: 14px; top: 30px; width: 24px; height: 24px; border-radius: 50%;
  cursor: grab; touch-action: none; user-select: none;
}
.as-gooey .sl-thumb:focus-visible { outline: 2px solid #ededed; outline-offset: 4px; }
.as-gooey .dgc { width: 100%; max-width: 640px; height: 210px; position: relative; margin: 0 auto; }
.as-gooey .dgc-card {
  position: absolute; left: 50%; top: 50%; width: 261px; height: 46px; margin: -23px 0 0 -130.5px;
  border-radius: 54px; display: flex; align-items: center; gap: 8px; padding: 0 16px 0 8px;
  color: var(--gd-ink, #fbfbfb); cursor: grab; touch-action: none; user-select: none; box-sizing: border-box;
  font-family: Inter, Inter_500Medium, system-ui, sans-serif;
  font-size: 13px;
}
.as-gooey .dgc-chip {
  flex: none; width: 32px; height: 32px; border-radius: 40px; background: rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: center;
}
.as-gooey .dgc-chip svg { width: 16px; height: 16px; display: block; }
.as-gooey .dgc-title { font-size: 13px; font-weight: 500; white-space: nowrap; }
.as-gooey .dgc-count { font-size: 13px; font-weight: 400; opacity: 0.5; white-space: nowrap; }
.as-gooey .dgc-card > * {
  --dgc-k: calc(var(--dgc-cb, 0) * var(--dgc-arc, 1));
  transform: translate(calc(var(--lg-bend-x, 0px) * var(--dgc-k) * 2.4), calc(var(--lg-bend-y, 0px) * var(--dgc-k) * 2.4))
    rotate(calc(var(--lg-bend-yn, 0) * var(--dgc-rot, 0) * var(--dgc-cb, 0) * 1deg))
    skewX(calc(var(--lg-bend-xn, 0) * var(--dgc-cb, 0) * -0.55deg))
    scaleX(calc(1 - var(--lg-bend-xn, 0) * var(--dgc-cb, 0) * var(--dgc-sqx, 0.006)))
    scaleY(calc(1 + var(--lg-bend-yn, 0) * var(--dgc-cb, 0) * var(--dgc-sqy, 0)));
  transform-origin: center;
}
.as-gooey .dgc-card > :nth-child(1) { --dgc-arc: 0.45; --dgc-rot: 1.6; --dgc-sqx: 0.014; }
.as-gooey .dgc-card > :nth-child(2) { --dgc-arc: 1; --dgc-rot: 0; --dgc-sqy: 0.01; }
.as-gooey .dgc-card > :nth-child(3) { --dgc-arc: 0.6; --dgc-rot: -1.6; }
.as-gooey .mp { position: relative; margin: 0 auto; }
.as-gooey .mp-card {
  position: absolute; border-radius: 16px; overflow: hidden; cursor: grab; touch-action: none; user-select: none;
}
.as-gooey .mp-card img { width: 100%; height: 100%; object-fit: cover; display: block; pointer-events: none; }
.as-gooey .sl-thumb:active, .as-gooey .dgc-card:active, .as-gooey .mp-card:active { cursor: grabbing; }
@media (prefers-reduced-motion: reduce) {
  .as-gooey .pm-plus, .as-gooey .pm-sat-icon { transition: none !important; }
  .as-gooey .pm-anticipating [data-gooey-svg], .as-gooey .pm-anticipating .pm-main { animation: none !important; }
}
`;

function installCss() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('as-gooey-css')) return;
  const style = document.createElement('style');
  style.id = 'as-gooey-css';
  style.textContent = CSS;
  document.head.appendChild(style);
}

function inkFor(fill: string): string {
  const match = /^#([0-9a-f]{6})$/i.exec(fill);
  if (!match) return '#fbfbfb';
  const n = parseInt(match[1], 16);
  const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum > 140 ? '#17181c' : '#fbfbfb';
}

function surfaceFill(effect: SurfaceEffect, choice: FillChoice): string {
  return choice === 'default' ? FILLS[effect] : choice;
}

function Chip({
  label,
  on,
  onPress,
  hint,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
  hint?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      title={hint}
      onClick={onPress}
      style={{
        height: 26,
        padding: '0 8px',
        borderRadius: 8,
        border: 'none',
        background: on ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.06)',
        color: on ? '#ffffff' : '#c0c0c0',
        fontFamily: FONT_MED,
        fontWeight: 500,
        fontSize: 11,
        lineHeight: '26px',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 72, fontFamily: FONT_MED, fontWeight: 500, fontSize: 10, lineHeight: '12px', color: '#8b8b8b' }}>{label}</span>
      {children}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  hint?: string;
  onChange: (value: number) => void;
}) {
  return (
    <Row label={label}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        title={hint}
        onChange={(event) => {
          const next = event.target.valueAsNumber;
          if (Number.isFinite(next)) onChange(next);
        }}
        style={{ width: 120, accentColor: '#ffffff' }}
      />
      <span style={{ fontFamily: FONT, fontWeight: 400, fontSize: 11, color: '#c0c0c0' }}>{value}</span>
    </Row>
  );
}

function MorphSpecimen({
  blur,
  contrast,
  waviness,
  fill,
  stagger,
}: {
  blur: number;
  contrast: number;
  waviness: number;
  fill: string;
  stagger: number;
}) {
  const [open, setOpen] = useState(false);
  const [anticipating, setAnticipating] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const toggle = () => {
    if (open && ANTICIP_DIST > 0) {
      if (timer.current) clearTimeout(timer.current);
      setAnticipating(false);
      requestAnimationFrame(() => setAnticipating(true));
      timer.current = setTimeout(() => setAnticipating(false), ANTICIP_DUR);
    }
    setOpen((value) => !value);
  };
  const phase = open
    ? { dur: OPEN_DUR, ease: EASE_BOUNCY, stagger }
    : { dur: CLOSE_DUR, ease: EASE_SNAPPY, stagger: CLOSE_STAGGER };
  const vars: CSSProperties & Record<string, string> = {};
  vars['--pm-anticip'] = `${ANTICIP_DIST}px`;
  vars['--pm-anticip-dur'] = `${ANTICIP_DUR}ms`;
  vars['--pm-icon-dur'] = `${ICON_DUR}ms`;
  vars['--gd-ink'] = inkFor(fill);
  return (
    <Liquid
      key="morph"
      blur={blur}
      contrast={contrast}
      fill={fill}
      shadow={DARK_SHADOW}
      waviness={waviness}
      className={`pm${open ? ' pm-open' : ''}${anticipating ? ' pm-anticipating' : ''}`}
      style={vars}
      data-testid="gooey-morph"
    >
      {SATELLITES.map((satellite, index) => (
        <Liquid.Item
          key={satellite.label}
          className="pm-slot"
          x={open ? satellite.x * SPREAD : 0}
          y={open ? satellite.y * SPREAD : 0}
          transition={{ duration: phase.dur, ease: phase.ease }}
          delay={index * phase.stagger}
        >
          <button type="button" className="pm-btn pm-sat" aria-label={satellite.label} tabIndex={open ? 0 : -1} onClick={toggle}>
            <span className="pm-sat-icon" style={{ transitionDelay: open ? `${ICON_DELAY + index * phase.stagger}ms` : '0ms' }}>
              {satellite.icon}
            </span>
          </button>
        </Liquid.Item>
      ))}
      <Liquid.Item className="pm-slot">
        <button type="button" className="pm-btn pm-main" aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} onClick={toggle}>
          <span className="pm-plus">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M10 4V16M4 10H16" />
            </svg>
          </span>
        </button>
      </Liquid.Item>
    </Liquid>
  );
}

function MoveSpecimen({ blur, contrast, waviness, fill }: { blur: number; contrast: number; waviness: number; fill: string }) {
  const [x, setX] = useState(84);
  const drag = useRef<number | null>(null);
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* synthetic events have no active pointer */
    }
    drag.current = event.clientX - x;
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current == null) return;
    setX(Math.min(THUMB_MAX, Math.max(0, event.clientX - drag.current)));
  };
  const endDrag = () => {
    drag.current = null;
  };
  return (
    <Liquid key="move" blur={blur} contrast={contrast} fill={fill} shadow={DARK_SHADOW} waviness={waviness} className="sl" data-testid="gooey-move">
      <div className="sl-track" aria-hidden="true" />
      <Liquid.Item effect="move" move={MOVE}>
        <div
          className="sl-thumb"
          role="slider"
          aria-label="Demo slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round((x / THUMB_MAX) * 100)}
          tabIndex={0}
          style={{ transform: `translateX(${x}px)` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />
      </Liquid.Item>
    </Liquid>
  );
}

function BendSpecimen({ blur, contrast, waviness, fill }: { blur: number; contrast: number; waviness: number; fill: string }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [releasing, setReleasing] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ id: number; dx: number; dy: number } | null>(null);
  const limits = () => {
    const group = stageRef.current?.getBoundingClientRect();
    const card = cardRef.current?.getBoundingClientRect();
    if (!group || !card || !group.width || !card.width) return BEND_CLAMP;
    return {
      x: Math.max(0, (group.width - card.width) / 2),
      y: Math.max(0, (group.height - card.height) / 2),
    };
  };
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* synthetic events have no active pointer */
    }
    drag.current = { id: event.pointerId, dx: event.clientX - pos.x, dy: event.clientY - pos.y };
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || event.pointerId !== current.id) return;
    const lim = limits();
    setPos({
      x: Math.max(-lim.x, Math.min(lim.x, event.clientX - current.dx)),
      y: Math.max(-lim.y, Math.min(lim.y, event.clientY - current.dy)),
    });
  };
  const endDrag = () => {
    drag.current = null;
    setReleasing(true);
    setPos({ x: 0, y: 0 });
    window.setTimeout(() => setReleasing(false), DROP_MS);
  };
  const cardStyle: CSSProperties & Record<string, string> = {};
  cardStyle.transform = `translate(${pos.x}px, ${pos.y}px)`;
  cardStyle.transition = releasing ? `transform ${DROP_MS}ms ${DROP_EASE}` : 'none';
  cardStyle['--dgc-cb'] = String(BEND.content);
  const stageStyle: CSSProperties & Record<string, string> = {};
  stageStyle['--gd-ink'] = inkFor(fill);
  return (
    <Liquid
      key="bend"
      blur={blur}
      contrast={contrast}
      fill={fill}
      shadow={DARK_SHADOW}
      waviness={waviness}
      className="dgc"
      ref={stageRef}
      style={stageStyle}
      data-testid="gooey-bend"
    >
      <Liquid.Item effect="bend" bend={{ vertical: BEND.vertical, horizontal: BEND.horizontal }}>
        <div
          className="dgc-card"
          ref={cardRef}
          style={cardStyle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <span className="dgc-chip" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 12.5A1.5 1.5 0 0 1 13 14H3a1.5 1.5 0 0 1-1.5-1.5V3A1.5 1.5 0 0 1 3 1.5h3L7.5 4H13a1.5 1.5 0 0 1 1.5 1.5z" />
            </svg>
          </span>
          <span className="dgc-title">Gooey Project</span>
          <span className="dgc-count">45 files</span>
        </div>
      </Liquid.Item>
    </Liquid>
  );
}

function MeltCard({
  src,
  pos,
  setPos,
  stageRef,
}: {
  src: string;
  pos: { x: number; y: number };
  setPos: (pos: { x: number; y: number }) => void;
  stageRef: RefObject<HTMLDivElement | null>;
}) {
  const drag = useRef<{ id: number; dx: number; dy: number } | null>(null);
  return (
    <Liquid.Item effect="melt" melt={MELT}>
      <div
        className="mp-card"
        data-testid="gooey-melt-card"
        style={{ left: pos.x, top: pos.y, width: MELT_CARD, height: MELT_CARD }}
        onPointerDown={(event) => {
          drag.current = { id: event.pointerId, dx: event.clientX - pos.x, dy: event.clientY - pos.y };
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }}
        onPointerMove={(event) => {
          const current = drag.current;
          if (!current || event.pointerId !== current.id) return;
          const box = stageRef.current?.getBoundingClientRect();
          const maxX = Math.max(0, (box?.width ?? MELT_CARD * 2) - MELT_CARD);
          const maxY = Math.max(0, (box?.height ?? MELT_STAGE_H) - MELT_CARD);
          setPos({
            x: Math.max(0, Math.min(maxX, event.clientX - current.dx)),
            y: Math.max(0, Math.min(maxY, event.clientY - current.dy)),
          });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <img src={src} alt="" draggable={false} />
      </div>
    </Liquid.Item>
  );
}

function MeltSpecimen() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [a, setA] = useState({ x: 0, y: (MELT_STAGE_H - MELT_CARD) / 2 });
  const [b, setB] = useState({ x: MELT_CARD + 24, y: (MELT_STAGE_H - MELT_CARD) / 2 });
  const placed = useRef(false);
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const place = () => {
      const w = el.getBoundingClientRect().width;
      if (!w) return;
      const gap = Math.min(20, Math.max(4, w - MELT_CARD * 2 - 8));
      const total = MELT_CARD * 2 + gap;
      const left = Math.max(0, (w - total) / 2);
      setA({ x: left, y: (MELT_STAGE_H - MELT_CARD) / 2 });
      setB({ x: left + MELT_CARD + gap, y: (MELT_STAGE_H - MELT_CARD) / 2 });
      placed.current = true;
    };
    place();
    const observer = new ResizeObserver(() => {
      if (!placed.current) place();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const stageStyle: CSSProperties = { width: 'min(100%, 420px)', height: MELT_STAGE_H };
  return (
    <Liquid key="melt" className="mp" style={stageStyle} ref={stageRef} data-testid="gooey-melt">
      <MeltCard src={MELT_A} pos={a} setPos={setA} stageRef={stageRef} />
      <MeltCard src={MELT_B} pos={b} setPos={setB} stageRef={stageRef} />
    </Liquid>
  );
}

export function GooeyCard() {
  const [effect, setEffect] = useState<Effect>('morph');
  const [blur, setBlur] = useState(6);
  const [contrast, setContrast] = useState(18);
  const [waviness, setWaviness] = useState(0);
  const [fillChoice, setFillChoice] = useState<FillChoice>('default');
  const [stagger, setStagger] = useState(40);
  const [bounce, setBounce] = useState(0.5);
  useEffect(() => {
    installCss();
  }, []);
  const surface = effect === 'melt' ? null : surfaceFill(effect, fillChoice);
  return (
    <div className="as-gooey" data-testid="gooey-card" data-effect={effect} style={{ width: '100%', boxSizing: 'border-box', background: '#171717', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {effect === 'morph' && surface ? (
          <MorphSpecimen blur={blur} contrast={contrast} waviness={waviness} fill={surface} stagger={stagger} />
        ) : null}
        {effect === 'move' && surface ? <MoveSpecimen blur={blur} contrast={contrast} waviness={waviness} fill={surface} /> : null}
        {effect === 'bend' && surface ? <BendSpecimen blur={blur} contrast={contrast} waviness={waviness} fill={surface} /> : null}
        {effect === 'melt' ? <MeltSpecimen /> : null}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Row label="Effect">
          {EFFECTS.map((option) => (
            <Chip key={option} label={option} on={effect === option} onPress={() => setEffect(option)} />
          ))}
        </Row>
        {effect !== 'melt' ? (
          <>
            <Slider label="Goo blur" value={blur} min={0} max={16} step={0.5} onChange={setBlur} />
            <Slider label="Contrast" value={contrast} min={4} max={40} step={1} onChange={setContrast} />
          </>
        ) : null}
        <Slider label="Waviness" value={waviness} min={0} max={8} step={0.5} hint={PRO_LOCKED} onChange={setWaviness} />
        <Row label="Fill">
          {FILLS_LOCKED.map((option) => (
            <Chip key={option.id} label={option.label} on={fillChoice === option.id} hint={PRO_LOCKED} onPress={() => setFillChoice(option.id)} />
          ))}
        </Row>
        <Slider label="Bounce" value={bounce} min={0} max={1} step={0.05} hint={BOUNCE_HINT} onChange={setBounce} />
        <Slider label="Stagger" value={stagger} min={0} max={200} step={5} hint={PRO_LOCKED} onChange={setStagger} />
        <span style={{ fontFamily: FONT, fontWeight: 400, fontSize: 10, lineHeight: '14px', color: '#8b8b8b' }}>
          Waviness, Fill, Bounce, and Stagger: {PRO_LOCKED}. Goo blur and Contrast are the public playground sliders.
        </span>
      </div>
    </div>
  );
}
