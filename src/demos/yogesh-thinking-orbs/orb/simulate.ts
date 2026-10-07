/**
 * Per-frame orb motion, ported from @yogesharc/thinking-orbs 0.1.1 dist/orb-core.js (MIT).
 * Copyright (c) 2026 Yogesh. See ./LICENSE.
 * If this file and MOTION_LOCK disagree, this code (the npm source) wins.
 */

import type { OrbInput } from "./model";

const TAU = Math.PI * 2;
const ease = (x: number) => {
  "worklet";
  return (1 - Math.cos(Math.PI * x)) / 2;
};
const hash = (n: number) => {
  "worklet";
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};
const spring = (x: number) => {
  "worklet";
  return 1 - Math.exp(-4.5 * x) * Math.cos(3 * Math.PI * x) - x * Math.exp(-4.5);
};

const PERIOD: Record<string, number> = {
  base: 6500,
  working: 3000,
  "working-gyro": 3000,
  reasoning: 6500,
  "reasoning-twins": 6500,
  searching: 13000,
  "searching-lighthouse": 13000,
  background: 13000,
  "background-spiral": 13000,
  retrying: 13000,
  "retrying-surge": 13000,
  compacting: 10000,
  "compacting-squeeze": 10000,
  "compacting-fuse": 10000,
  waiting: 13000,
};

function rewind(t: number, w: number) {
  "worklet";
  const P = 3200;
  const k = Math.floor(t / P);
  const u = t - k * P;
  const back = 0.6 * 2100 * w;
  const fwd = (2000 + 100 + 100) * w;
  let a: number;
  if (u < 2000) a = u * w;
  else if (u < 2200) {
    const x = (u - 2000) / 200;
    a = (2000 + 200 * (x - (x * x) / 2)) * w;
  } else if (u < 3000) a = 2100 * w - back * spring((u - 2200) / 800);
  else {
    const x = (u - 3000) / 200;
    a = 2100 * w - back + 100 * x * x * w;
  }
  return k * (fwd - back) + a;
}

function yawOf(state: string, t: number) {
  "worklet";
  if (state === "retrying") return rewind(2 * t, TAU / 9000);
  if (state === "retrying-surge") {
    const turns = t / 3250;
    const u = turns - Math.floor(turns);
    return (Math.floor(turns) + (1 - (1 - u) ** 3)) * TAU;
  }
  return (t / PERIOD[state]) * TAU;
}

const RING_TIP = (30 * Math.PI) / 180;
const RING_ROLL = (10 * Math.PI) / 180;
const RING_AXIS = [
  -Math.sin(RING_ROLL) * Math.cos(RING_TIP),
  Math.cos(RING_ROLL) * Math.cos(RING_TIP),
  Math.sin(RING_TIP),
];
const TWIST = 1.4;
const LEAN = (30 * Math.PI) / 180;
const TRAIL = Math.PI / 2;
const LENS_MS = 1800;
const MOVE = 0.4;
const LENS = 0.6;
const HOP = 220;
const TAIL = 5;
const WALK = 16;

function spot(k: number) {
  "worklet";
  const phi = k * 2.45 + hash(k) * 1.5;
  const theta = ((15 + 30 * hash(k + 0.5)) * Math.PI) / 180;
  return [Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta)];
}

function lensAt(t: number) {
  "worklet";
  const k = Math.floor(t / LENS_MS);
  const u = t / LENS_MS - k;
  const e = u < MOVE ? (1 - Math.cos((u / MOVE) * Math.PI)) / 2 : 1;
  const a = spot(k);
  const b = spot(k + 1);
  const v = [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e];
  const n = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / n, v[1] / n, v[2] / n];
}

export type OrbLocal = {
  key: string;
  walks: number[][];
  hops: number;
  ink: Float32Array;
  hits: Float32Array;
  dots: Float32Array;
  lit: Float32Array;
};

export function makeLocal(input: OrbInput): OrbLocal {
  "worklet";
  const walks: number[][] = [];
  if (input.reasoning) {
    walks.push([]);
    if (input.twins) walks.push([]);
  }
  const g2 = input.g * input.g;
  return {
    key: input.key,
    walks,
    hops: 0,
    ink: new Float32Array(g2),
    hits: new Float32Array(g2),
    dots: new Float32Array(input.count * 6),
    lit: new Float32Array(input.count),
  };
}

function pdist(pts: Float64Array, i: number, j: number) {
  "worklet";
  const dx = pts[i * 3] - pts[j * 3];
  const dy = pts[i * 3 + 1] - pts[j * 3 + 1];
  const dz = pts[i * 3 + 2] - pts[j * 3 + 2];
  return dx * dx + dy * dy + dz * dz;
}

export function step(input: OrbInput, local: OrbLocal, t: number, tilt: number, dotScale: number) {
  "worklet";
  const state = input.state;
  const pts = input.pts;
  const count = input.count;
  const size = input.size;
  const flat = input.flat;
  const rs = input.rs * dotScale;
  const c = size / 2;
  const R = input.R;
  const period = PERIOD[state];
  const yaw = yawOf(state, t);
  const gyro = state === "working-gyro" ? (t / 5000) * TAU : -1;
  const pitch = (((flat ? 0 : tilt) + input.tip + (gyro < 0 ? 0 : 10 * Math.cos(gyro))) * Math.PI) / 180;
  const roll = gyro < 0 ? 0 : ((12 * Math.sin(gyro)) * Math.PI) / 180;
  const sr = Math.sin(roll);
  const cr = Math.cos(roll);
  const sy = Math.sin(yaw);
  const cy = Math.cos(yaw);
  const st = Math.sin(pitch);
  const ct = Math.cos(pitch);

  const facing = (k: number) => {
    const x = pts[k * 3];
    const y = pts[k * 3 + 1];
    const z = pts[k * 3 + 2];
    return y * st + (-x * sy + z * cy) * ct;
  };

  if (local.lit.length !== count) local.lit = new Float32Array(count);
  else local.lit.fill(0);

  if (input.reasoning) {
    const s = t / HOP;
    const n = Math.floor(s);
    const f = s - n;
    const walks = local.walks;
    if (!walks[0].length) {
      let first = 0;
      let bestF = facing(0);
      for (let k = 1; k < count; k++) {
        const fk = facing(k);
        if (fk > bestF) {
          bestF = fk;
          first = k;
        }
      }
      for (let w = 0; w < walks.length; w++) {
        if (!w) walks[w].push(first);
        else {
          let best = 0;
          let score = -Infinity;
          for (let k = 0; k < count; k++) {
            const sc = facing(k) + pdist(pts, k, first);
            if (sc > score) {
              score = sc;
              best = k;
            }
          }
          walks[w].push(best);
        }
      }
    }
    local.hops = Math.max(local.hops, n - WALK);
    for (; local.hops < n; local.hops++) {
      const hop = local.hops;
      for (let w = 0; w < walks.length; w++) {
        const walk = walks[w];
        const from = walk[walk.length - 1];
        const recentStart = Math.max(0, walk.length - 8);
        const other = state === "reasoning-twins" ? walks[1 - w][walks[1 - w].length - 1] : -1;
        const span = input.reach;
        const base = from * span;
        let best = -1;
        let score = -Infinity;
        for (let j = 0; j < span; j++) {
          const k = input.near[base + j];
          if (k < 0) break;
          let seen = false;
          for (let r = recentStart; r < walk.length; r++) if (walk[r] === k) seen = true;
          if (seen) continue;
          const apart = other < 0 ? 0 : 1.2 * Math.min(Math.sqrt(pdist(pts, k, other)), 0.8);
          const sc = facing(k) + 0.35 * hash(hop * 31 + j + w * 977) + apart;
          if (sc > score) {
            score = sc;
            best = k;
          }
        }
        walk.push(best < 0 ? input.near[base] : best);
        if (walk.length > WALK) walk.shift();
      }
    }
    for (let w = 0; w < walks.length; w++) {
      const walk = walks[w];
      for (let j = TAIL - 1; j >= 0; j--) {
        const idx = walk.length - 1 - j;
        if (idx < 0) continue;
        const k = walk[idx];
        const v = j === 0 ? ease(Math.min(1, f * 2)) : 1 - (j - 1 + f) / TAIL;
        if (v > local.lit[k]) local.lit[k] = v;
      }
    }
  }

  const head = (t / 2000) * TAU + yaw;
  const ahead = TAU / 2000 + TAU / period;
  const headLat = (tt: number) => ((70 * Math.PI) / 180) * (1 - 2 * ((tt % 6000) / 6000));
  const glow = Math.min(1, 3 * Math.sin(Math.PI * ((t % 6000) / 6000)));
  const lens = state === "searching" ? lensAt(t) : null;
  const tw =
    state === "working-gyro" ? 0.5 * Math.sin((t / 2600) * TAU) : state === "compacting-squeeze" ? Math.sin((t / 2600) * TAU) : 0;
  const compacting = state === "compacting" || state === "compacting-fuse";
  let sweepAt = 0;
  let sweepHold = 0;
  let hasSweep = false;
  if (compacting) {
    const u = (t % 2800) / 2800;
    const s = (u - 0.7) / 0.3;
    const release =
      state === "compacting-fuse"
        ? (1 - s) ** 3
        : s < 0.45
          ? 1 - 1.25 * ease(s / 0.45)
          : s < 0.7
            ? -0.25 * (1 - (s - 0.45) / 0.25) ** 2
            : 0;
    sweepAt = -1.15 + 2.3 * Math.min(1, u / 0.7);
    sweepHold = u < 0.7 ? 1 : release;
    hasSweep = true;
  }

  const g = input.g;
  const cell = input.cell;
  const g2 = g * g;
  if (local.ink.length !== g2) {
    local.ink = new Float32Array(g2);
    local.hits = new Float32Array(g2);
  } else {
    local.ink.fill(0);
    local.hits.fill(0);
  }
  if (local.dots.length !== count * 6) local.dots = new Float32Array(count * 6);
  const flatRender = input.render === "halftone" || input.render === "lines" || input.render === "verticalLines";

  for (let i = 0; i < count; i++) {
    const x = pts[i * 3];
    const y = pts[i * 3 + 1];
    const z = pts[i * 3 + 2];
    const turn = yaw + TWIST * tw * y;
    const ly = tw ? Math.sin(turn) : sy;
    const lc = tw ? Math.cos(turn) : cy;
    const z1 = -x * ly + z * lc;
    let vx = x * lc + z * ly;
    let vy = y * ct - z1 * st;
    const sx = z1;
    const sy2 = vx * st;
    const vz = y * st + z1 * ct;
    const d = (vz + 1) / 2;
    let r = (0.5 + 1.4 * d) * rs;
    let a = Math.max(0, (d - 0.3) / 0.7);
    if (lens) {
      const hypot = Math.hypot(vx, vy, vz) || 1;
      const ang = Math.acos(Math.min(1, (vx * lens[0] + vy * lens[1] + vz * lens[2]) / hypot));
      const w = ang < LENS ? (1 - (ang / LENS) ** 2) ** 2 : 0;
      a *= 1 - 0.55 * (1 - w);
      if (size <= 24) r *= 1 + 0.5 * w;
      if (w) {
        vx *= 1 + 0.12 * w;
        vy *= 1 + 0.12 * w;
        vx += (vx - lens[0]) * 0.35 * w;
        vy += (vy - lens[1]) * 0.35 * w;
        r *= 1 + 0.9 * w;
        a += (1 - a) * w;
      }
    }
    if (hasSweep) {
      const q = vx;
      const w = Math.min(1, Math.max(0, (sweepAt - q) / 0.2)) * sweepHold;
      const k = state === "compacting" ? 1.5 : 1;
      vx *= 1 - 0.2 * k * w;
      vy *= 1 - 0.2 * k * w;
      r *= 1 - 0.3 * k * w;
      if (state === "compacting-fuse") {
        a *= 1 - 0.5 * w;
        const gg = Math.exp(-(((q - sweepAt) / 0.08) ** 2)) * Math.max(0, sweepHold) * Math.min(1, d / 0.5);
        r *= 1 + 0.8 * gg;
        a += (1 - a) * gg;
      }
    }
    if (state === "working") {
      const u = t % 1700;
      const at = 1.3 - 2.6 * ease(Math.min(1, u / 1200));
      const q = flat ? vy : vx * RING_AXIS[0] + vy * RING_AXIS[1] + vz * RING_AXIS[2];
      const gg = u < 1200 ? Math.exp(-(((q - at) / 0.2) ** 2)) : 0;
      r *= 1 + 0.6 * gg;
      a += (1 - a) * gg;
      const w = Math.min(1, Math.max(0, (q - at) / 0.2)) * (u < 1200 ? 1 : 1 - Math.min(1, 1.6 * ((u - 1200) / 800)));
      vx *= 1 - 0.08 * w;
      vy *= 1 - 0.08 * w;
      r *= 1 - 0.15 * w;
    }
    if (state === "searching-lighthouse") {
      a *= 0.5;
      const lr = Math.sin(LEAN);
      const lcy = Math.cos(LEAN);
      const across = vx * lcy - vy * lr;
      const toward = -st * (vx * lr + vy * lcy) + ct * vz;
      const off = Math.atan2(across, toward) - (((t / 2500) % 1) * TAU - Math.PI);
      const dphi = ((((off + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
      const beam = dphi < 0 ? Math.max(0, 1 + dphi / TRAIL) : Math.exp(-((dphi / 0.45) ** 2));
      const gg = beam * (0.25 + 0.75 * Math.min(1, Math.max(0, (d - 0.4) / 0.3)));
      r *= 1 + 0.6 * gg;
      a += (1 - a) * gg;
    }
    if (input.reasoning) {
      const spark = local.lit[i];
      a *= 0.5;
      if (spark) {
        r *= 1 + 0.8 * spark;
        a += (1 - a) * spark;
      }
    }
    if (state === "waiting") {
      const mag = Math.hypot(x, y, z) || 1;
      const lat = Math.asin(y / mag);
      const lon = Math.atan2(z, x);
      const off = Math.atan2(Math.sin(lon - head), Math.cos(lon - head));
      const along = off * Math.cos(lat);
      const gg =
        Math.exp(-(((lat - headLat(t + off / ahead)) / 0.28) ** 2)) *
        Math.exp(-((along / (off * ahead > 0 ? 0.12 : 1)) ** 2));
      const w = glow * gg ** 0.6;
      a = a * 0.5 + (1 - a * 0.5) * w;
      r *= 1 + 1.1 * w;
    }
    if (roll) {
      const nx = vx * cr - vy * sr;
      const ny = vx * sr + vy * cr;
      vx = nx;
      vy = ny;
    }
    const px = c + vx * R;
    const py = c - vy * R;
    const o = i * 6;
    local.dots[o] = px;
    local.dots[o + 1] = py;
    local.dots[o + 2] = r;
    local.dots[o + 3] = a;
    local.dots[o + 4] = sx;
    local.dots[o + 5] = -sy2;
    if (flatRender) {
      const fx = px / cell - 0.5;
      const fy = py / cell - 0.5;
      const ix = Math.floor(fx);
      const iy = Math.floor(fy);
      const tx = fx - ix;
      const ty = fy - iy;
      const weights = [
        [0, 0, (1 - tx) * (1 - ty)],
        [1, 0, tx * (1 - ty)],
        [0, 1, (1 - tx) * ty],
        [1, 1, tx * ty],
      ];
      for (let w = 0; w < 4; w++) {
        const gx = ix + weights[w][0];
        const gy = iy + weights[w][1];
        if (gx < 0 || gy < 0 || gx >= g || gy >= g) continue;
        const f = weights[w][2];
        const idx = gy * g + gx;
        local.ink[idx] += (a * r * f * (0.4 + 0.6 * a)) / rs;
        local.hits[idx] += a * f;
      }
    }
  }
}

export function toneAt(local: OrbLocal, k: number, cell: number) {
  "worklet";
  const hits = local.hits[k];
  if (!hits) return 0;
  return 0.5 * cell * Math.min(1, ((local.ink[k] / hits) * Math.min(1, hits / 0.3)) / 2.2);
}
