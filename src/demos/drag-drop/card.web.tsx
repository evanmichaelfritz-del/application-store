import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { DROP_PHOTO } from './photo';

/**
 * Drag-and-drop board. Geometry is the 1280 desktop card.
 * The same component is what the copy bundle mounts.
 */

const BOARD_W = 213;
const BOARD_H = 192;
const CHIP = 72;
const ZONE = 104;
const CHIP_X = 141;
const CHIP_Y = 0;
const ZONE_X = 0;
const ZONE_Y = 88;
const BORDER = 2;
const RADIUS = 12;
const GRAB_SCALE = 1.05;
const LIFT_MS = 200;
/** 35ms into the 200ms lift reads about 1.017. */
const LIFT_EASE = 'cubic-bezier(0, 0.24, 0.43, 0.65)';
const TILT_LIMIT = 10;
/**
 * An 80px drag at a steady 0.2 px/ms (80px in 400ms) settles on -5.6°.
 * One 80ms sample at or past the clamp settles on -7.4°: the blend over
 * 80ms is 1 - e^(-80 / ease) = 0.74, and 0.74 * -10 = -7.4.
 * A typical drag at 8.5/28 px/ms reads -8.5° at 400ms.
 * Idle pointer movement does not change tilt.
 */
const DRAG_80_VX = -80 / 400;
const TILT_GAIN = -5.6 / DRAG_80_VX;
const TILT_EASE_MS = 80 / -Math.log(0.26);
const RETURN_MS = 500;
const RETURN_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const FADE_MS = 229;
const FADE_BLUR = 1.8;
const SQUASH = 0.97;
const SQUASH_MS = 520;
const SQUASH_DIP = 42;
const PHOTO_IN_MS = 445;
const PUFF_MS = 1460;
const PUFF_PEAK_MS = 460;
const PUFF_SCALE_MS = 500;
const PUFF_MID_SCALE = 1.135;
const PHOTO_OUT_AT = 1830;
const PHOTO_OUT_MS = 234;
const PHOTO_OUT_BLUR = 1.5;
const RESPAWN_AT = 2271;
const RESPAWN_MS = 149;
const RESPAWN_SCALE = 0.9;
const PUFF_SIZE = 100;
const PUFF_STROKE = 50;
const PUFF_RADIUS = 27;
const PUFF_DRIFT = 10;
const PUFF_SCALE = 1 + 60 / ZONE;
const PUFF_COLOR = 'rgba(148,148,148,0.55)';
const PUFF_NOISE = 0.045;
const PUFF_OCTAVES = 2;
const PUFF_SEED = 9;
const PUFF_DISPLACE = 8;
const PUFF_BLUR = 8;
const ZONE_BORDER = 'rgba(0,0,0,0.1)';
const ZONE_BG = 'rgba(234,234,234,0.2)';
const OVER_BORDER = 'rgba(0,0,0,0.28)';
const OVER_BG = 'rgba(234,234,234,0.55)';
const OVER_LABEL = 0.5;
const FILLED_BG = '#f7f7f7';
const LABEL_COLOR = '#767676';
const LABEL_FONT = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const LABEL_SIZE = 11;
const LABEL_LINE = 14;
const LABEL_WIDTH = 76;
const LABEL_TOP = 40;
const CHIP_SHADOW = '0 1px 2px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.08), 0 18px 32px rgba(0,0,0,0.06)';
const ZONE_SHADOW = '0 2px 4px rgba(0,0,0,0.06), 0 10px 22px rgba(0,0,0,0.08)';

type Pose = { x: number; y: number; tilt: number; scale: number };
type DropPhase = 'ready' | 'held' | 'homing' | 'sinking' | 'clearing' | 'empty' | 'back';

const REST: Pose = { x: 0, y: 0, tilt: 0, scale: 1 };

const PEAK_AT = (PUFF_PEAK_MS / PUFF_MS) * 100;
const SCALE_AT = (PUFF_SCALE_MS / PUFF_MS) * 100;

const SHEET = `
.ddp-squash { animation: ddp-squash ${SQUASH_MS}ms ease-in-out both; }
@keyframes ddp-squash {
  0% { transform: scale(1); }
  ${SQUASH_DIP}% { transform: scale(${SQUASH}); }
  100% { transform: scale(1); }
}
.ddp-fade { animation: ddp-fade ${FADE_MS}ms ease-out both; }
@keyframes ddp-fade {
  from { opacity: 1; filter: blur(0px); }
  to { opacity: 0; filter: blur(${FADE_BLUR}px); }
}
.ddp-photo-out { animation: ddp-photo-out ${PHOTO_OUT_MS}ms ease-out both; }
@keyframes ddp-photo-out {
  from { opacity: 1; filter: blur(0px); }
  to { opacity: 0; filter: blur(${PHOTO_OUT_BLUR}px); }
}
.ddp-in { animation: ddp-in ${RESPAWN_MS}ms ease-out both; }
@keyframes ddp-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.ddp-in-lift { animation: ddp-in-lift ${RESPAWN_MS}ms ease-out both; }
@keyframes ddp-in-lift {
  from { transform: scale(${RESPAWN_SCALE}); }
  to { transform: scale(1); }
}
.ddp-puff {
  opacity: 0;
  pointer-events: none;
  transform-origin: center center;
  animation:
    ddp-puff-fade ${PUFF_MS}ms linear both,
    ddp-puff-grow ${PUFF_MS}ms ease-out both;
}
@keyframes ddp-puff-fade {
  0% { opacity: 0; }
  ${PEAK_AT}% { opacity: 0.9; }
  100% { opacity: 0; }
}
@keyframes ddp-puff-grow {
  0% { transform: translateY(0px) scale(1); }
  ${SCALE_AT}% { transform: translateY(0px) scale(${PUFF_MID_SCALE}); }
  100% { transform: translateY(${PUFF_DRIFT}px) scale(${PUFF_SCALE}); }
}
@media (prefers-reduced-motion: reduce) {
  .ddp-squash, .ddp-puff, .ddp-fade, .ddp-photo-out, .ddp-in, .ddp-in-lift { animation: none !important; }
  .ddp-puff { opacity: 0 !important; }
  .ddp-chip, .ddp-lift, .ddp-photo { transition: none !important; }
}
`;

function installSheet() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('ddp-sheet')) return;
  const style = document.createElement('style');
  style.id = 'ddp-sheet';
  style.textContent = SHEET;
  document.head.appendChild(style);
}

function clampTilt(vxPxPerMs: number): number {
  const raw = vxPxPerMs * TILT_GAIN;
  if (raw > TILT_LIMIT) return TILT_LIMIT;
  if (raw < -TILT_LIMIT) return -TILT_LIMIT;
  return raw;
}

function centreInsideZone(x: number, y: number): boolean {
  const cx = CHIP_X + x + CHIP / 2;
  const cy = CHIP_Y + y + CHIP / 2;
  return cx >= ZONE_X && cx <= ZONE_X + ZONE && cy >= ZONE_Y && cy <= ZONE_Y + ZONE;
}

function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduce(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  return reduce;
}

function Puff({ filterId }: { filterId: string }) {
  const inset = PUFF_STROKE / 2;
  const inner = PUFF_SIZE - PUFF_STROKE;
  const innerRadius = PUFF_RADIUS - inset;
  return (
    <div
      className="ddp-puff"
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: ZONE_X + (ZONE - PUFF_SIZE) / 2,
        top: ZONE_Y + (ZONE - PUFF_SIZE) / 2,
        width: PUFF_SIZE,
        height: PUFF_SIZE,
        zIndex: 0,
      }}
    >
      <svg width={PUFF_SIZE} height={PUFF_SIZE} viewBox={`0 0 ${PUFF_SIZE} ${PUFF_SIZE}`} overflow="visible">
        <filter id={filterId} x="-80%" y="-80%" width="260%" height="260%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={PUFF_NOISE} numOctaves={PUFF_OCTAVES} seed={PUFF_SEED} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={PUFF_DISPLACE} xChannelSelector="R" yChannelSelector="G" result="torn" />
          <feGaussianBlur in="torn" stdDeviation={PUFF_BLUR} />
        </filter>
        <rect
          x={inset}
          y={inset}
          width={inner}
          height={inner}
          rx={innerRadius}
          fill="none"
          stroke={PUFF_COLOR}
          strokeWidth={PUFF_STROKE}
          filter={`url(#${filterId})`}
        />
      </svg>
    </div>
  );
}

export function PhysicsDropCard() {
  installSheet();
  const reduce = usePrefersReducedMotion();
  const reduceRef = useRef(reduce);
  reduceRef.current = reduce;

  const filterRaw = useId();
  const filterId = `ddp${filterRaw.replace(/[^A-Za-z0-9_-]/g, '')}`;

  const [phase, setPhase] = useState<DropPhase>('ready');
  const [pose, setPose] = useState<Pose>(REST);
  const [over, setOver] = useState(false);
  const phaseRef = useRef<DropPhase>('ready');
  const poseRef = useRef<Pose>(REST);
  const pointerRef = useRef<number | null>(null);
  const grabRef = useRef({ x: 0, y: 0, poseX: 0, poseY: 0 });
  const velRef = useRef({ lastX: 0, movedAt: 0, tilt: 0 });
  const timersRef = useRef<number[]>([]);
  const homeFrameRef = useRef(0);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
      if (homeFrameRef.current) cancelAnimationFrame(homeFrameRef.current);
    };
  }, []);

  function publish(next: Pose) {
    poseRef.current = next;
    setPose(next);
  }

  function setPhaseBoth(next: DropPhase) {
    phaseRef.current = next;
    setPhase(next);
  }

  function later(ms: number, run: () => void) {
    const id = window.setTimeout(() => {
      if (!aliveRef.current) return;
      run();
    }, ms);
    timersRef.current.push(id);
  }

  function clearTimers() {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
    if (homeFrameRef.current) cancelAnimationFrame(homeFrameRef.current);
    homeFrameRef.current = 0;
  }

  function parkReady() {
    publish(REST);
    setOver(false);
    setPhaseBoth('ready');
  }

  function beginHome() {
    setOver(false);
    setPhaseBoth('homing');
    if (reduceRef.current) {
      parkReady();
      return;
    }
    homeFrameRef.current = requestAnimationFrame(() => {
      homeFrameRef.current = 0;
      if (!aliveRef.current || phaseRef.current !== 'homing') return;
      publish(REST);
      later(RETURN_MS, () => {
        if (phaseRef.current !== 'homing') return;
        setPhaseBoth('ready');
      });
    });
  }

  function beginDrop() {
    clearTimers();
    setOver(false);
    setPhaseBoth('sinking');
    if (reduceRef.current) {
      publish(REST);
      later(PHOTO_OUT_AT, () => {
        if (phaseRef.current !== 'sinking') return;
        setPhaseBoth('empty');
      });
      later(RESPAWN_AT, () => {
        if (phaseRef.current !== 'empty') return;
        parkReady();
      });
      return;
    }
    later(FADE_MS, () => {
      if (phaseRef.current !== 'sinking') return;
      publish(REST);
    });
    later(PHOTO_OUT_AT, () => {
      if (phaseRef.current !== 'sinking') return;
      setPhaseBoth('clearing');
    });
    later(PHOTO_OUT_AT + PHOTO_OUT_MS, () => {
      if (phaseRef.current !== 'clearing') return;
      setPhaseBoth('empty');
    });
    later(RESPAWN_AT, () => {
      if (phaseRef.current !== 'empty') return;
      setPhaseBoth('back');
      publish({ ...REST, scale: RESPAWN_SCALE });
      later(RESPAWN_MS, () => {
        if (phaseRef.current !== 'back') return;
        publish(REST);
        setPhaseBoth('ready');
      });
    });
  }

  function finishDrag() {
    pointerRef.current = null;
    if (centreInsideZone(poseRef.current.x, poseRef.current.y)) beginDrop();
    else beginHome();
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    if (phaseRef.current !== 'ready') return;
    clearTimers();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerRef.current = event.pointerId;
    grabRef.current = {
      x: event.clientX,
      y: event.clientY,
      poseX: poseRef.current.x,
      poseY: poseRef.current.y,
    };
    velRef.current = { lastX: event.clientX, movedAt: performance.now(), tilt: poseRef.current.tilt };
    setPhaseBoth('held');
    publish({ x: poseRef.current.x, y: poseRef.current.y, tilt: poseRef.current.tilt, scale: GRAB_SCALE });
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (phaseRef.current !== 'held' || event.pointerId !== pointerRef.current) return;
    const grab = grabRef.current;
    const vel = velRef.current;
    const now = performance.now();
    const dt = Math.max(now - vel.movedAt, 1);
    const dx = event.clientX - vel.lastX;
    vel.lastX = event.clientX;
    vel.movedAt = now;
    let tilt = vel.tilt;
    if (dx !== 0) {
      const target = clampTilt(dx / dt);
      tilt = vel.tilt + (target - vel.tilt) * (1 - Math.exp(-dt / TILT_EASE_MS));
      vel.tilt = tilt;
    }
    const x = grab.poseX + (event.clientX - grab.x);
    const y = grab.poseY + (event.clientY - grab.y);
    setOver(centreInsideZone(x, y));
    publish({ x, y, tilt, scale: GRAB_SCALE });
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (phaseRef.current !== 'held' || event.pointerId !== pointerRef.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishDrag();
  }

  const showingPhoto = phase === 'sinking' || phase === 'clearing';
  const homing = phase === 'homing' && !reduce;
  const fading = phase === 'sinking' && !reduce;
  const respawning = phase === 'back' && !reduce;

  let chipOpacity = 1;
  if (phase === 'clearing' || phase === 'empty') chipOpacity = 0;
  if (reduce && (phase === 'sinking' || phase === 'back')) chipOpacity = 0;

  let chipTransition = 'none';
  if (homing) chipTransition = `transform ${RETURN_MS}ms ${RETURN_EASE}`;

  let liftTransition = `transform ${LIFT_MS}ms ${LIFT_EASE}`;
  if (reduce || phase === 'back' || phase === 'clearing' || phase === 'empty' || (phase === 'sinking' && pose.scale === 1)) {
    liftTransition = 'none';
  } else if (homing) liftTransition = `transform ${RETURN_MS}ms ${RETURN_EASE}`;

  const chipStyle: CSSProperties = {
    position: 'absolute',
    left: CHIP_X,
    top: CHIP_Y,
    width: CHIP,
    height: CHIP,
    borderRadius: RADIUS,
    zIndex: 2,
    touchAction: 'none',
    userSelect: 'none',
    cursor: phase === 'held' ? 'grabbing' : 'grab',
    pointerEvents: phase === 'ready' || phase === 'held' ? 'auto' : 'none',
    opacity: fading || respawning ? undefined : chipOpacity,
    boxShadow: CHIP_SHADOW,
    transform: `translate(${pose.x}px, ${pose.y}px) rotate(${pose.tilt}deg)`,
    transformOrigin: 'center center',
    transition: chipTransition,
  };

  const photoStyle: CSSProperties = {
    position: 'absolute',
    left: -BORDER,
    top: -BORDER,
    width: ZONE,
    height: ZONE,
    objectFit: 'cover',
    borderRadius: RADIUS,
    opacity: showingPhoto ? 1 : 0,
    transition: reduce || phase === 'clearing' ? 'none' : `opacity ${PHOTO_IN_MS}ms ease-in-out`,
    pointerEvents: 'none',
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }} data-testid="drag-drop-physics">
      <div
        data-phase={phase}
        data-over={over ? '1' : '0'}
        style={{ position: 'relative', width: BOARD_W, height: BOARD_H, background: 'transparent' }}
      >
        {showingPhoto && !reduce ? <Puff filterId={filterId} /> : null}
        <div
          className={phase === 'sinking' && !reduce ? 'ddp-squash' : undefined}
          style={{
            position: 'absolute',
            left: ZONE_X,
            top: ZONE_Y,
            width: ZONE,
            height: ZONE,
            boxSizing: 'border-box',
            borderRadius: RADIUS,
            border: `${BORDER}px dashed ${showingPhoto ? 'transparent' : over ? OVER_BORDER : ZONE_BORDER}`,
            background: showingPhoto ? FILLED_BG : over ? OVER_BG : ZONE_BG,
            boxShadow: showingPhoto ? ZONE_SHADOW : 'none',
            zIndex: 1,
            transformOrigin: 'center center',
          }}
        >
          <img
            className={phase === 'clearing' && !reduce ? 'ddp-photo ddp-photo-out' : 'ddp-photo'}
            src={DROP_PHOTO}
            alt=""
            draggable={false}
            style={photoStyle}
          />
          <span
            style={{
              position: 'absolute',
              top: LABEL_TOP,
              left: 0,
              right: 0,
              width: LABEL_WIDTH,
              margin: '0 auto',
              opacity: showingPhoto ? 0 : over ? OVER_LABEL : 1,
              textAlign: 'center',
              fontFamily: LABEL_FONT,
              fontSize: LABEL_SIZE,
              lineHeight: `${LABEL_LINE}px`,
              color: LABEL_COLOR,
              pointerEvents: 'none',
            }}
          >
            Drag & drop
            <br />
            it here
          </span>
        </div>
        <div
          className={fading ? 'ddp-chip ddp-fade' : respawning ? 'ddp-chip ddp-in' : 'ddp-chip'}
          style={chipStyle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            className={respawning ? 'ddp-lift ddp-in-lift' : 'ddp-lift'}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: RADIUS,
              overflow: 'hidden',
              transform: `scale(${pose.scale})`,
              transformOrigin: 'center center',
              transition: liftTransition,
            }}
          >
            <img
              src={DROP_PHOTO}
              alt=""
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
