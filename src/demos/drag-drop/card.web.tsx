import { memo, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { flushSync } from 'react-dom';
import { DROP_PHOTO } from './photo';

/**
 * Drag-and-drop board. Geometry is the 1280 desktop card.
 * The same component is what the copy bundle mounts.
 *
 * Timing below is fit to measured gestures and to frames read off the
 * moving card. The easing numbers are this file's own curves for those
 * samples. Nothing here is taken from another implementation's source.
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
const LIFT_MS = 150;
/** Own curve. The painted scale is measured on the card, not taken from the solver. */
const LIFT_EASE = 'cubic-bezier(0.2, 0.9, 0.3, 1)';
const TILT_LIMIT = 10;
/**
 * The 80px gesture's pointer events land about 33ms apart, so the drag lasts
 * about 400ms, not 12 frames of 16ms. Gain is the least-squares fit 27.9497
 * from the slow drag, that 80px drag, and a flick. Leftward is negative.
 * The displayed angle is this ease from the grab, written
 * in the same frame as the pointer event. Painted on that cadence: -1.77° at
 * 34ms, -3.19° at 40px, and -5.54° at 80px, then it holds. A 120px drag at 1.5×
 * that speed settles at -8.34°. A flick that clamps at ±10° is -3.22° at 35ms
 * and -3.46° at 51ms. dx === 0 leaves the target, and once the ease finishes
 * the angle holds.
 */
const TILT_GAIN = 27.9497;
const TILT_EASE_MS = 380;
/** Hits the 34ms and 200ms samples above. Not a curve copied from elsewhere. */
const TILT_CURVE = [0.104, 0.62, 0, 0.006] as const;
const RETURN_MS = 500;
const RETURN_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const FADE_MS = 229;
const FADE_BLUR = 2;
const SQUASH = 0.97;
const SQUASH_DOWN_MS = 173;
const SQUASH_BACK_MS = 285;
const SQUASH_MS = SQUASH_DOWN_MS + SQUASH_BACK_MS;
const SQUASH_DIP = (SQUASH_DOWN_MS / SQUASH_MS) * 100;
/** Dip reaches 0.985 at 45ms, 0.9725 at 111ms, and 0.97 by about 210ms. */
const SQUASH_DIP_EASE = 'cubic-bezier(0.57, 1.264, 0.853, 0.872)';
/** Back is 0.975 at 278ms, 0.983 at 312ms, 0.989 at 345ms, 0.996 at 412ms. */
const SQUASH_BACK_EASE = 'cubic-bezier(0.904, 0.336, 0.011, 0.233)';
const PHOTO_IN_MS = 380;
const PUFF_DELAY = 250;
const PUFF_MS = 1275;
const PUFF_START_SCALE = 0.96;
const PUFF_PEAK = 0.9;
const PUFF_PEAK_AT = 16;
const PHOTO_OUT_AT = 1815;
const PHOTO_OUT_MS = 263;
const PHOTO_OUT_BLUR = 4;
/** Opacity 0.66/0.40/0.24/0.13/0.07 at 32/64/100/130/163ms, gone at 263ms. Blur follows the same progress out to 4px. */
const PHOTO_OUT_EASE = 'cubic-bezier(0.138, 0.3, 0.19, 0.981)';
const RESPAWN_AT = 2265;
const RESPAWN_MS = 212;
/** Opacity and scale share this ease: about 0.51/0.951 at 30ms, 0.79/0.979 at 63ms, 0.92/0.992 at 96ms. */
const RESPAWN_EASE = 'cubic-bezier(0.208, 1.044, 0.529, 0.992)';
const RESPAWN_SCALE = 0.9;
const PUFF_SIZE = 100;
const PUFF_STROKE = 50;
const PUFF_RADIUS = 27;
const PUFF_DRIFT = 10;
const PUFF_SCALE = 1 + 60 / ZONE;
const PUFF_COLOR = 'rgba(132,132,132,0.55)';
const PUFF_NOISE = 0.028;
const PUFF_OCTAVES = 2;
const PUFF_SEED = 11;
const PUFF_DISPLACE = 6;
const PUFF_BLUR = 14;
const ZONE_BORDER = 'rgba(0,0,0,0.1)';
const ZONE_BG = 'rgba(234,234,234,0.2)';
const OVER_BORDER = 'rgba(0,0,0,0.28)';
const OVER_BG = 'rgba(234,234,234,0.55)';
const OVER_LABEL = 0.5;
const FILLED_BG = '#f7f7f7';
const LABEL_COLOR = '#767676';
const LABEL_FONT = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const LABEL_SIZE = 11;
const LABEL_LINE = 15;
const LABEL_WIDTH = 76;
/** 38px from the padding edge. The 2px border puts the text at 40px from the outer edge. */
const LABEL_TOP = 38;
/** Soft halo on #f9f9f9. Two blurs, no hard contact line. About 1 darkness at 20px, gone by 23px. */
const SHADOW = '0 2px 6px rgba(0,0,0,0.11), 0 5px 20px rgba(0,0,0,0.12)';

type Pose = { x: number; y: number; tilt: number; scale: number };
type DropPhase = 'ready' | 'held' | 'homing' | 'sinking' | 'clearing' | 'empty' | 'back';

const REST: Pose = { x: 0, y: 0, tilt: 0, scale: 1 };

const SHEET = `
.ddp-ready .ddp-lift,
.ddp-held .ddp-lift { transition: scale ${LIFT_MS}ms ${LIFT_EASE}; }
.ddp-homing .ddp-chip { transition: translate ${RETURN_MS}ms ${RETURN_EASE}; }
.ddp-homing .ddp-tilt { transition: rotate ${RETURN_MS}ms ${RETURN_EASE}; }
.ddp-homing .ddp-lift { transition: scale ${RETURN_MS}ms ${RETURN_EASE}; }
/* -12ms: the animation clock otherwise starts about a frame after pointerup. */
.ddp-squash { animation: ddp-squash ${SQUASH_MS}ms linear -12ms both; }
@keyframes ddp-squash {
  0% { transform: scale(1); animation-timing-function: ${SQUASH_DIP_EASE}; }
  ${SQUASH_DIP}% { transform: scale(${SQUASH}); animation-timing-function: ${SQUASH_BACK_EASE}; }
  100% { transform: scale(1); }
}
.ddp-fade { animation: ddp-fade ${FADE_MS}ms ease-out both; }
@keyframes ddp-fade {
  from { opacity: 1; filter: blur(0px); }
  to { opacity: 0; filter: blur(${FADE_BLUR}px); }
}
.ddp-photo-out { animation: ddp-photo-out ${PHOTO_OUT_MS}ms ${PHOTO_OUT_EASE} both; }
@keyframes ddp-photo-out {
  from { opacity: 1; filter: blur(0px); }
  to { opacity: 0; filter: blur(${PHOTO_OUT_BLUR}px); }
}
.ddp-in { animation: ddp-in ${RESPAWN_MS}ms ${RESPAWN_EASE} both; }
@keyframes ddp-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.ddp-in-lift { animation: ddp-in-lift ${RESPAWN_MS}ms ${RESPAWN_EASE} both; }
@keyframes ddp-in-lift {
  from { scale: ${RESPAWN_SCALE}; }
  to { scale: 1; }
}
.ddp-puff {
  opacity: 0;
  pointer-events: none;
  transform-origin: center center;
  animation: ddp-puff ${PUFF_MS}ms ease-out ${PUFF_DELAY}ms both;
}
@keyframes ddp-puff {
  0% { opacity: 0; transform: translateY(0px) scale(${PUFF_START_SCALE}); }
  ${PUFF_PEAK_AT}% { opacity: ${PUFF_PEAK}; }
  100% { opacity: 0; transform: translateY(${PUFF_DRIFT}px) scale(${PUFF_SCALE}); }
}
@media (prefers-reduced-motion: reduce) {
  .ddp-squash, .ddp-puff, .ddp-fade, .ddp-photo-out, .ddp-in, .ddp-in-lift { animation: none !important; }
  .ddp-puff { opacity: 0 !important; }
  .ddp-chip, .ddp-tilt, .ddp-lift, .ddp-photo { transition: none !important; }
}
html[data-reduce-motion="1"] .ddp-squash,
html[data-reduce-motion="1"] .ddp-puff,
html[data-reduce-motion="1"] .ddp-fade,
html[data-reduce-motion="1"] .ddp-photo-out,
html[data-reduce-motion="1"] .ddp-in,
html[data-reduce-motion="1"] .ddp-in-lift { animation: none !important; }
html[data-reduce-motion="1"] .ddp-puff { opacity: 0 !important; }
html[data-reduce-motion="1"] .ddp-chip,
html[data-reduce-motion="1"] .ddp-tilt,
html[data-reduce-motion="1"] .ddp-lift,
html[data-reduce-motion="1"] .ddp-photo { transition: none !important; }
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
  const clamped = Math.max(-TILT_LIMIT, Math.min(TILT_LIMIT, raw));
  return Math.round(clamped * 1000) / 1000;
}

function unitBezier(x1: number, y1: number, x2: number, y2: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const t = (lo + hi) / 2;
    const mt = 1 - t;
    const bx = 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t;
    if (bx < x) lo = t;
    else hi = t;
  }
  const t = (lo + hi) / 2;
  const mt = 1 - t;
  return 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t;
}

function tiltProgress(elapsedMs: number): number {
  return unitBezier(TILT_CURVE[0], TILT_CURVE[1], TILT_CURVE[2], TILT_CURVE[3], elapsedMs / TILT_EASE_MS);
}

function centreInsideZone(x: number, y: number): boolean {
  const cx = CHIP_X + x + CHIP / 2;
  const cy = CHIP_Y + y + CHIP / 2;
  return cx >= ZONE_X && cx <= ZONE_X + ZONE && cy >= ZONE_Y && cy <= ZONE_Y + ZONE;
}

function motionReducedNow(): boolean {
  if (typeof window === 'undefined') return false;
  const media =
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const forced = typeof document !== 'undefined' && document.documentElement.dataset.reduceMotion === '1';
  return Boolean(media || forced);
}

function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(motionReducedNow);

  useEffect(() => {
    const apply = () => setReduce(motionReducedNow());
    apply();
    const query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    query?.addEventListener('change', apply);
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduce-motion'] });
    return () => {
      query?.removeEventListener('change', apply);
      observer.disconnect();
    };
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

const ChipFace = memo(function ChipFace({ tilt, scale, respawning }: { tilt: number; scale: number; respawning: boolean }) {
  return (
    <div
      className="ddp-tilt"
      style={{
        width: '100%',
        height: '100%',
        borderRadius: RADIUS,
        boxShadow: SHADOW,
        transformOrigin: 'center center',
        rotate: `${tilt}deg`,
      }}
    >
      <div
        className={respawning ? 'ddp-lift ddp-in-lift' : 'ddp-lift'}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: RADIUS,
          overflow: 'hidden',
          transformOrigin: 'center center',
          scale,
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
  );
});

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
  const velRef = useRef({ lastX: 0, movedAt: 0 });
  const tiltTrack = useRef({ downAt: 0, origin: 0, from: 0, target: 0, armed: false });
  const tiltLoop = useRef(0);
  const timersRef = useRef<number[]>([]);
  const chipRef = useRef<HTMLDivElement>(null);
  const aliveRef = useRef(true);
  const armHomeRef = useRef(false);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      if (tiltLoop.current) cancelAnimationFrame(tiltLoop.current);
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
    };
  }, []);

  useLayoutEffect(() => {
    if (!armHomeRef.current || phase !== 'homing') return;
    armHomeRef.current = false;
    chipRef.current?.getBoundingClientRect();
    publish(REST);
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

  function tiltAngle(now: number): number {
    const track = tiltTrack.current;
    const raw = track.from + (track.target - track.from) * tiltProgress(now - track.origin);
    return Math.round(raw * 1000) / 1000;
  }

  function stopTiltLoop() {
    if (tiltLoop.current) cancelAnimationFrame(tiltLoop.current);
    tiltLoop.current = 0;
  }

  function kickTiltLoop() {
    stopTiltLoop();
    const step = () => {
      if (phaseRef.current !== 'held') return;
      const angle = tiltAngle(performance.now());
      if (angle !== poseRef.current.tilt) {
        flushSync(() => {
          publish({ ...poseRef.current, tilt: angle });
        });
      }
      tiltLoop.current = requestAnimationFrame(step);
    };
    tiltLoop.current = requestAnimationFrame(step);
  }

  function parkReady() {
    stopTiltLoop();
    publish(REST);
    setOver(false);
    setPhaseBoth('ready');
  }

  function beginHome() {
    stopTiltLoop();
    setOver(false);
    if (reduceRef.current) {
      parkReady();
      return;
    }
    armHomeRef.current = true;
    flushSync(() => {
      setPhaseBoth('homing');
    });
    later(RETURN_MS, () => {
      if (phaseRef.current !== 'homing') return;
      setPhaseBoth('ready');
    });
  }

  function beginDrop() {
    stopTiltLoop();
    clearTimers();
    setOver(false);
    flushSync(() => {
      setPhaseBoth('sinking');
    });
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
    const now = performance.now();
    velRef.current = { lastX: event.clientX, movedAt: now };
    tiltTrack.current = { downAt: now, origin: now, from: 0, target: 0, armed: false };
    flushSync(() => {
      setPhaseBoth('held');
      publish({ x: poseRef.current.x, y: poseRef.current.y, tilt: poseRef.current.tilt, scale: GRAB_SCALE });
    });
    if (!reduceRef.current) kickTiltLoop();
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
    const track = tiltTrack.current;
    if (dx !== 0) {
      const next = clampTilt(dx / dt);
      // A steady drag's event spacing wobbles, and that wobble used to restart the ease.
      // Keep the target until the speed really changes.
      const changed = Math.abs(next - track.target) >= 0.25;
      if (!track.armed) {
        track.armed = true;
        track.from = reduceRef.current ? next : 0;
        track.target = next;
        track.origin = reduceRef.current ? now : track.downAt;
      } else if (changed) {
        track.from = reduceRef.current ? next : tiltAngle(now);
        track.target = next;
        track.origin = now;
      }
    }
    const tilt = reduceRef.current ? track.target : tiltAngle(now);
    const x = grab.poseX + (event.clientX - grab.x);
    const y = grab.poseY + (event.clientY - grab.y);
    setOver(centreInsideZone(x, y));
    flushSync(() => {
      publish({ x, y, tilt, scale: GRAB_SCALE });
    });
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (phaseRef.current !== 'held' || event.pointerId !== pointerRef.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    finishDrag();
  }

  const showingPhoto = phase === 'sinking' || phase === 'clearing';
  const fading = phase === 'sinking' && !reduce;
  const respawning = phase === 'back' && !reduce;

  let chipOpacity = 1;
  if (phase === 'clearing' || phase === 'empty') chipOpacity = 0;
  if (respawning) chipOpacity = 0;
  if (reduce && (phase === 'sinking' || phase === 'back')) chipOpacity = 0;

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
    opacity: fading ? undefined : chipOpacity,
    translate: `${pose.x}px ${pose.y}px`,
    transformOrigin: 'center center',
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
        className={`ddp-${phase}`}
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
            boxShadow: showingPhoto ? SHADOW : 'none',
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
          ref={chipRef}
          className={fading ? 'ddp-chip ddp-fade' : respawning ? 'ddp-chip ddp-in' : 'ddp-chip'}
          style={chipStyle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <ChipFace tilt={pose.tilt} scale={pose.scale} respawning={respawning} />
        </div>
      </div>
    </div>
  );
}
