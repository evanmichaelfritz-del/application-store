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
 * Gain is 5.58 / 0.2 = 27.9. An 80px drag in 400ms is 0.2 px/ms and settles
 * at −5.58°. The same gain gives −2.79° at 0.1 px/ms and −8.37° at 0.3 px/ms.
 * Leftward is negative. Anything past ±10° snaps to the clamp.
 *
 * The angle is a first-order chase of that target. It does not restart, and
 * a constant target is never crossed. After a 28ms wait, 44% of the target
 * (up to ±5.58°) arrives with a 6ms time constant and the rest with 70ms.
 * The part of the target past ±5.58° skips that fast mode. It waits 58ms
 * and arrives with a 64ms time constant, so a faster drag cannot multiply
 * the opening kick. Speed is the horizontal movement since the grab divided
 * by the time since the grab, so one short interval cannot spike it.
 * A sample with no horizontal change leaves the target.
 */
const TILT_GAIN = 27.9;
const TILT_FAST_CAP = 5.58;
const TILT_LAG_MS = 28;
const TILT_FAST_WEIGHT = 0.44;
const TILT_TAU_FAST = 6;
const TILT_TAU_BODY = 70;
const TILT_EXTRA_LAG_MS = 58;
const TILT_EXTRA_TAU = 64;
const RETURN_MS = 500;
const RETURN_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const FADE_MS = 229;
const FADE_BLUR = 2;
const SQUASH = 0.97;
const SQUASH_DOWN_MS = 226;
const SQUASH_BACK_MS = 240;
const SQUASH_MS = SQUASH_DOWN_MS + SQUASH_BACK_MS;
const SQUASH_DIP = (SQUASH_DOWN_MS / SQUASH_MS) * 100;
/** Dip: 0.985 at 45ms, 0.9725 at 111ms, 0.970 by 210ms. */
const SQUASH_DIP_EASE = 'cubic-bezier(0.4, 1.05, 0.4, 0.9)';
/** Back: 0.975/0.983/0.989/0.996 at 278/312/345/412ms, and 0.999 by 460ms. */
const SQUASH_BACK_EASE = 'cubic-bezier(0.55, 0.3, 0, 0.4)';
/**
 * The squash animation clock sat 12ms behind the drop timestamp. Shifting
 * the animation forward by that amount puts the wall-clock samples on the curve.
 */
const SQUASH_LEAD = 12;
/**
 * Photo fade-in. The sinking paint runs about 12ms behind the drop, so this
 * curve is fitted on that clock: opacity 0.13/0.50/0.77/0.94 at 111/210/277/344ms,
 * and 0.99 only after about 377ms.
 */
const PHOTO_IN_MS = 430;
const PHOTO_IN_EASE = 'cubic-bezier(0.433, 0.032, 0.516, 1.065)';
/**
 * First and last visible frames of the puff. The sinking paint runs about
 * 12ms behind the drop, so the animation is started that much earlier.
 */
const PUFF_FROM = 279;
const PUFF_END = 1462;
const PUFF_DELAY = PUFF_FROM - SQUASH_LEAD;
const PUFF_MS = PUFF_END - PUFF_FROM;
const PHOTO_OUT_AT = 1832;
const PHOTO_OUT_MS = 211;
const PHOTO_OUT_BLUR = 4;
/** Opacity 0.66/0.40/0.24/0.13/0.07 at 32/64/100/130/163ms. The fit reaches 0 at 211ms, so the fade ends at 2043ms. */
const PHOTO_OUT_EASE = 'cubic-bezier(0.12, 0.04, 0.08, 0.8)';
/** Scheduled from the sinking paint, which lands SQUASH_LEAD after the drop. */
const PHOTO_OUT_DELAY = PHOTO_OUT_AT - SQUASH_LEAD;
const RESPAWN_AT = 2268;
const RESPAWN_MS = 142;
/** Opacity and scale share this ease: 0.51/0.951 at 30ms, 0.79/0.979 at 63ms, 0.92/0.992 at 96ms. Done at 142ms, which is 2410ms after the drop. */
const RESPAWN_EASE = 'cubic-bezier(0.24, 0.76, 0.5, 0.92)';
/**
 * Scheduled from the same sinking paint as the photo fade. The respawn
 * samples read about 3ms behind that paint, so this starts 3ms sooner.
 */
const RESPAWN_DELAY = RESPAWN_AT - SQUASH_LEAD - 3;
const RESPAWN_SCALE = 0.9;
const PUFF_SIZE = 100;
/**
 * Stroke 36 is an eye choice: a thick ring, open in the middle (inner 64).
 * One octave, because the side darkness falls off in a smooth haze.
 * Blur 5 is the stdDeviation whose 500ms and 800ms side profiles are the
 * closest joint fit to the demo. Alpha 0.48 is the weight on that blur.
 * 500ms reads 48/31/13/2/0 against 56/42/20/5/0. 800ms left reads
 * 40/32/23/14/6/1 against 40/30/19/8/1.6/0.2.
 */
const PUFF_STROKE = 36;
const PUFF_RADIUS = 27;
const PUFF_COLOR = 'rgba(132,132,132,0.48)';
const PUFF_NOISE = 0.028;
const PUFF_OCTAVES = 1;
const PUFF_SEED = 11;
const PUFF_DISPLACE = 4;
const PUFF_BLUR = 5;
/** Filter box in the puff's own pixels, wide enough that the blur is not cut. */
const PUFF_FILTER_MARGIN = 160;

type PuffStop = { t: number; opacity?: number; drift?: number; scale?: number };
/** Opacity, drift, and scale read off the demo frames. Linear between these stops. */
const PUFF_STOPS: PuffStop[] = [
  { t: 279, opacity: 0, drift: 0, scale: 1 },
  { t: 313, opacity: 0.335 },
  { t: 363, opacity: 0.607 },
  { t: 413, opacity: 0.807 },
  { t: 462, opacity: 0.899, drift: 2.46, scale: 1.112 },
  { t: 513, opacity: 0.836 },
  { t: 612, opacity: 0.706, drift: 4.11, scale: 1.214 },
  { t: 712, opacity: 0.585 },
  { t: 812, opacity: 0.472, drift: 6.08, scale: 1.335 },
  { t: 913, opacity: 0.369 },
  { t: 1012, opacity: 0.274, scale: 1.438 },
  { t: 1112, opacity: 0.191 },
  { t: 1213, opacity: 0.119, scale: 1.517 },
  { t: 1313, opacity: 0.061 },
  { t: 1412, opacity: 0.021 },
  { t: 1462, opacity: 0, drift: 9.94, scale: 1.573 },
];

function puffKeyframeCss(): string {
  return PUFF_STOPS.map((stop) => {
    const pct = ((stop.t - PUFF_FROM) / PUFF_MS) * 100;
    const bits: string[] = [];
    if (stop.opacity !== undefined) bits.push(`opacity: ${stop.opacity}`);
    if (stop.drift !== undefined) bits.push(`translate: 0 ${stop.drift}px`);
    if (stop.scale !== undefined) bits.push(`scale: ${stop.scale}`);
    return `  ${Number(pct.toFixed(4))}% { ${bits.join('; ')}; }`;
  }).join('\n');
}
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
.ddp-squash { animation: ddp-squash ${SQUASH_MS}ms linear -${SQUASH_LEAD}ms both; }
@keyframes ddp-squash {
  0% { transform: scale(1); animation-timing-function: ${SQUASH_DIP_EASE}; }
  ${SQUASH_DIP}% { transform: scale(${SQUASH}); animation-timing-function: ${SQUASH_BACK_EASE}; }
  100% { transform: scale(1); }
}
@keyframes ddp-fade {
  from { opacity: 1; filter: blur(0px); }
  to { opacity: 0; filter: blur(${FADE_BLUR}px); }
}
.ddp-photo-out {
  animation:
    ddp-photo-in ${PHOTO_IN_MS}ms ${PHOTO_IN_EASE} both,
    ddp-photo-out ${PHOTO_OUT_MS}ms ${PHOTO_OUT_EASE} ${PHOTO_OUT_DELAY}ms forwards;
}
@keyframes ddp-photo-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes ddp-photo-out {
  from { opacity: 1; filter: blur(0px); }
  to { opacity: 0; filter: blur(${PHOTO_OUT_BLUR}px); }
}
.ddp-chip-life {
  animation:
    ddp-fade ${FADE_MS}ms ease-out forwards,
    ddp-in ${RESPAWN_MS}ms ${RESPAWN_EASE} ${RESPAWN_DELAY}ms forwards;
}
.ddp-life-lift { animation: ddp-in-lift ${RESPAWN_MS}ms ${RESPAWN_EASE} ${RESPAWN_DELAY}ms forwards; }
@keyframes ddp-in {
  from { opacity: 0; filter: blur(0px); }
  to { opacity: 1; filter: blur(0px); }
}
@keyframes ddp-in-lift {
  from { scale: ${RESPAWN_SCALE}; }
  to { scale: 1; }
}
.ddp-puff {
  opacity: 0;
  pointer-events: none;
  transform-origin: center center;
  animation: ddp-puff ${PUFF_MS}ms linear ${PUFF_DELAY}ms both;
}
@keyframes ddp-puff {
${puffKeyframeCss()}
}
@media (prefers-reduced-motion: reduce) {
  .ddp-squash, .ddp-puff, .ddp-photo-out, .ddp-chip-life, .ddp-life-lift { animation: none !important; }
  .ddp-puff { opacity: 0 !important; }
  .ddp-chip, .ddp-tilt, .ddp-lift, .ddp-photo { transition: none !important; }
}
html[data-reduce-motion="1"] .ddp-squash,
html[data-reduce-motion="1"] .ddp-puff,
html[data-reduce-motion="1"] .ddp-photo-out,
html[data-reduce-motion="1"] .ddp-chip-life,
html[data-reduce-motion="1"] .ddp-life-lift { animation: none !important; }
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

/** Two first-order modes. Result stays in [0, 1] and does not decrease. */
function firstOrderMix(elapsedMs: number, lagMs: number, weightFast: number, tauFast: number, tauBody: number): number {
  const elapsed = elapsedMs - lagMs;
  if (elapsed <= 0) return 0;
  const mixed =
    1 -
    weightFast * Math.exp(-elapsed / tauFast) -
    (1 - weightFast) * Math.exp(-elapsed / tauBody);
  if (mixed <= 0) return 0;
  if (mixed >= 1) return 1;
  return mixed;
}

function chaseTilt(elapsedMs: number, target: number): number {
  const sign = target < 0 ? -1 : 1;
  const mag = Math.abs(target);
  const capped = mag < TILT_FAST_CAP ? mag : TILT_FAST_CAP;
  const extra = mag - capped;
  const base = capped * firstOrderMix(elapsedMs, TILT_LAG_MS, TILT_FAST_WEIGHT, TILT_TAU_FAST, TILT_TAU_BODY);
  const extraElapsed = elapsedMs - TILT_EXTRA_LAG_MS;
  const tail = extraElapsed <= 0 ? 0 : extra * (1 - Math.exp(-extraElapsed / TILT_EXTRA_TAU));
  return Math.round(sign * (base + tail) * 1000) / 1000;
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
        overflow: 'visible',
        zIndex: 0,
      }}
    >
      <svg width={PUFF_SIZE} height={PUFF_SIZE} viewBox={`0 0 ${PUFF_SIZE} ${PUFF_SIZE}`} overflow="visible">
        <filter
          id={filterId}
          filterUnits="userSpaceOnUse"
          x={-PUFF_FILTER_MARGIN}
          y={-PUFF_FILTER_MARGIN}
          width={PUFF_SIZE + PUFF_FILTER_MARGIN * 2}
          height={PUFF_SIZE + PUFF_FILTER_MARGIN * 2}
          colorInterpolationFilters="sRGB"
        >
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

const ChipFace = memo(function ChipFace({ tilt, scale, cycling }: { tilt: number; scale: number; cycling: boolean }) {
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
        className={cycling ? 'ddp-lift ddp-life-lift' : 'ddp-lift'}
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
  const tiltTrack = useRef({ downAt: 0, x: 0, target: 0 });
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
    return chaseTilt(now - track.downAt, track.target);
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
    tiltTrack.current = { downAt: now, x: event.clientX, target: 0 };
    reduceRef.current = motionReducedNow();
    flushSync(() => {
      setPhaseBoth('held');
      publish({ x: poseRef.current.x, y: poseRef.current.y, tilt: poseRef.current.tilt, scale: GRAB_SCALE });
    });
    if (!reduceRef.current) kickTiltLoop();
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (phaseRef.current !== 'held' || event.pointerId !== pointerRef.current) return;
    const grab = grabRef.current;
    const now = performance.now();
    const track = tiltTrack.current;
    const snap = motionReducedNow();
    reduceRef.current = snap;
    const step = event.clientX - track.x;
    track.x = event.clientX;
    const elapsed = now - track.downAt;
    if (elapsed > 0 && step !== 0) track.target = clampTilt((event.clientX - grab.x) / elapsed);
    if (snap) stopTiltLoop();
    const tilt = snap ? track.target : tiltAngle(now);
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
  const cycling = !reduce && (phase === 'sinking' || phase === 'clearing' || phase === 'empty' || phase === 'back');

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
    transition: reduce || cycling ? 'none' : `opacity ${PHOTO_IN_MS}ms ${PHOTO_IN_EASE}`,
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
            className={cycling && showingPhoto ? 'ddp-photo ddp-photo-out' : 'ddp-photo'}
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
          className={cycling ? 'ddp-chip ddp-chip-life' : 'ddp-chip'}
          style={chipStyle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <ChipFace tilt={pose.tilt} scale={pose.scale} cycling={cycling} />
        </div>
      </div>
    </div>
  );
}
