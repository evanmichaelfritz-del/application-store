import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { DROP_PHOTO } from './photo';

/**
 * Independent recreate of the visible behaviour of the transitions.dev
 * drag-and-drop demo. Geometry is the 1280 desktop measurement.
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
/** Rounded tile. The spec gives no radius; a quarter of the chip side stays clearly rounded. */
const CHIP_RADIUS = CHIP / 4;
const GRAB_SCALE = 1.05;
const TILT_LIMIT = 10;
/**
 * A typical drag covers the horizontal gap from the chip centre to the zone
 * centre in 400ms, moving left. That speed maps to -5.6°.
 */
const TYPICAL_TILT = -5.6;
const TYPICAL_DRAG_MS = 400;
const TYPICAL_VX = -(CHIP_X + CHIP / 2 - (ZONE_X + ZONE / 2)) / TYPICAL_DRAG_MS;
const TILT_GAIN = TYPICAL_TILT / TYPICAL_VX;
/** Own smoothing. Tilt eases toward the latest horizontal velocity. */
const TILT_SMOOTH_MS = 48;
const TILT_IDLE_MS = 40;
const RETURN_MS = 500;
const RETURN_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const FADE_MS = 230;
const SQUASH = 0.97;
const SQUASH_MS = 610;
const PHOTO_MS = 395;
const PUFF_START = 280;
const PUFF_END = 1460;
const PUFF_MS = PUFF_END - PUFF_START;
const EMPTY_AT = 1815;
const RESPAWN_AT = 2265;
const PUFF_SIZE = 100;
const PUFF_STROKE = 50;
const PUFF_RADIUS = 27;
const PUFF_DRIFT = 10;
const PUFF_SCALE = 1 + 60 / ZONE;
const PUFF_COLOR = 'rgba(122,122,122,0.4)';
/** Own wisp recipe: noise tears the thick stroke, then a small blur. */
const PUFF_NOISE = 0.08;
const PUFF_OCTAVES = 3;
const PUFF_SEED = 4;
const PUFF_DISPLACE = 24;
const PUFF_BLUR = 1.8;
const ZONE_BORDER = 'rgba(0,0,0,0.1)';
const ZONE_BG = 'rgba(234,234,234,0.2)';
const LABEL_COLOR = 'rgba(0,0,0,0.45)';
const LABEL_FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const LABEL_SIZE = 12;
const LABEL_LINE = 15;

type Pose = { x: number; y: number; tilt: number; scale: number };
type DropPhase = 'ready' | 'held' | 'homing' | 'sinking' | 'empty';

const REST: Pose = { x: 0, y: 0, tilt: 0, scale: 1 };

const SQUASH_AT = (FADE_MS / SQUASH_MS) * 100;

const SHEET = `
.ddp-squash { animation: ddp-squash ${SQUASH_MS}ms linear both; }
@keyframes ddp-squash {
  0% { transform: scale(1); }
  ${SQUASH_AT}% { transform: scale(${SQUASH}); }
  100% { transform: scale(1); }
}
.ddp-puff {
  opacity: 0;
  pointer-events: none;
  transform-origin: center center;
  animation: ddp-puff ${PUFF_MS}ms linear ${PUFF_START}ms forwards;
}
@keyframes ddp-puff {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(${PUFF_DRIFT}px) scale(${PUFF_SCALE}); }
}
@media (prefers-reduced-motion: reduce) {
  .ddp-squash, .ddp-puff { animation: none !important; }
  .ddp-puff { opacity: 0 !important; }
  .ddp-chip, .ddp-photo { transition: none !important; }
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
        zIndex: 2,
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
  const phaseRef = useRef<DropPhase>('ready');
  const poseRef = useRef<Pose>(REST);
  const pointerRef = useRef<number | null>(null);
  const grabRef = useRef({ x: 0, y: 0, poseX: 0, poseY: 0 });
  const velRef = useRef({ vx: 0, lastX: 0, movedAt: 0, tilt: 0 });
  const timersRef = useRef<number[]>([]);
  const tiltLoopRef = useRef(0);
  const homeFrameRef = useRef(0);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
      if (tiltLoopRef.current) cancelAnimationFrame(tiltLoopRef.current);
      if (homeFrameRef.current) cancelAnimationFrame(homeFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'held') return;
    const previous = document.body.style.cursor;
    document.body.style.cursor = 'grabbing';
    return () => {
      document.body.style.cursor = previous;
    };
  }, [phase]);

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
  }

  function stopTilt() {
    if (!tiltLoopRef.current) return;
    cancelAnimationFrame(tiltLoopRef.current);
    tiltLoopRef.current = 0;
  }

  function tiltFrame(now: number) {
    if (!aliveRef.current || phaseRef.current !== 'held') return;
    const vel = velRef.current;
    const idleFor = now - vel.movedAt;
    if (idleFor > TILT_IDLE_MS) {
      const blend = 1 - Math.exp(-idleFor / TILT_SMOOTH_MS);
      const nextTilt = vel.tilt + (0 - vel.tilt) * blend;
      vel.tilt = nextTilt;
      if (Math.abs(poseRef.current.tilt - nextTilt) > 0.05) {
        publish({ ...poseRef.current, tilt: nextTilt });
      }
    }
    tiltLoopRef.current = requestAnimationFrame(tiltFrame);
  }

  function parkReady() {
    publish(REST);
    setPhaseBoth('ready');
  }

  function beginHome() {
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
    setPhaseBoth('sinking');
    later(reduceRef.current ? 0 : FADE_MS, () => {
      if (phaseRef.current !== 'sinking') return;
      publish(REST);
    });
    later(EMPTY_AT, () => {
      if (phaseRef.current !== 'sinking') return;
      setPhaseBoth('empty');
    });
    later(RESPAWN_AT, () => {
      if (phaseRef.current !== 'empty') return;
      parkReady();
    });
  }

  function finishDrag() {
    stopTilt();
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
    velRef.current = { vx: 0, lastX: event.clientX, movedAt: performance.now(), tilt: 0 };
    setPhaseBoth('held');
    publish({ x: poseRef.current.x, y: poseRef.current.y, tilt: 0, scale: GRAB_SCALE });
    stopTilt();
    tiltLoopRef.current = requestAnimationFrame(tiltFrame);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (phaseRef.current !== 'held' || event.pointerId !== pointerRef.current) return;
    const grab = grabRef.current;
    const vel = velRef.current;
    const now = performance.now();
    const dt = Math.max(now - vel.movedAt, 1);
    vel.vx = (event.clientX - vel.lastX) / dt;
    vel.lastX = event.clientX;
    vel.movedAt = now;
    const blend = 1 - Math.exp(-dt / TILT_SMOOTH_MS);
    vel.tilt += (clampTilt(vel.vx) - vel.tilt) * blend;
    publish({
      x: grab.poseX + (event.clientX - grab.x),
      y: grab.poseY + (event.clientY - grab.y),
      tilt: vel.tilt,
      scale: GRAB_SCALE,
    });
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (phaseRef.current !== 'held' || event.pointerId !== pointerRef.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishDrag();
  }

  const filled = phase === 'sinking';
  const hidden = phase === 'sinking' || phase === 'empty';
  const homing = phase === 'homing' && !reduce;
  const fading = phase === 'sinking' && !reduce;

  const chipStyle: CSSProperties = {
    position: 'absolute',
    left: CHIP_X,
    top: CHIP_Y,
    width: CHIP,
    height: CHIP,
    borderRadius: CHIP_RADIUS,
    overflow: 'hidden',
    zIndex: 3,
    touchAction: 'none',
    userSelect: 'none',
    cursor: phase === 'held' ? 'grabbing' : 'grab',
    pointerEvents: phase === 'ready' || phase === 'held' ? 'auto' : 'none',
    opacity: hidden ? 0 : 1,
    transform: `translate(${pose.x}px, ${pose.y}px) rotate(${pose.tilt}deg) scale(${pose.scale})`,
    transformOrigin: 'center center',
    transition: homing ? `transform ${RETURN_MS}ms ${RETURN_EASE}` : fading ? `opacity ${FADE_MS}ms linear` : 'none',
  };

  const photoStyle: CSSProperties = {
    position: 'absolute',
    left: -BORDER,
    top: -BORDER,
    width: ZONE,
    height: ZONE,
    objectFit: 'cover',
    opacity: filled ? 1 : 0,
    transition: filled && !reduce ? `opacity ${PHOTO_MS}ms linear` : 'none',
    pointerEvents: 'none',
  };

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }} data-testid="drag-drop-physics">
      <div
        data-phase={phase}
        style={{ position: 'relative', width: BOARD_W, height: BOARD_H, background: 'transparent' }}
      >
        <div
          className={filled && !reduce ? 'ddp-squash' : undefined}
          style={{
            position: 'absolute',
            left: ZONE_X,
            top: ZONE_Y,
            width: ZONE,
            height: ZONE,
            boxSizing: 'border-box',
            border: `${BORDER}px dashed ${filled ? 'transparent' : ZONE_BORDER}`,
            background: ZONE_BG,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            transformOrigin: 'center center',
          }}
        >
          <img className="ddp-photo" src={DROP_PHOTO} alt="" draggable={false} style={photoStyle} />
          <span
            style={{
              position: 'relative',
              zIndex: 1,
              opacity: filled ? 0 : 1,
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
        {filled && !reduce ? <Puff filterId={filterId} /> : null}
        <div
          className="ddp-chip"
          style={chipStyle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
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
  );
}
