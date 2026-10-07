/* FILE src/orb/clock.ts */
import { makeMutable } from "react-native-reanimated";

/**
 * One clock per look (`state@speed`), shared by every orb.
 * Forward-only, frame gap capped at 100ms. Port of orb-core.js `tick`.
 * A paused orb must not call this.
 */
export type Clock = { t: number; last: number };

export const clocks = makeMutable<Record<string, Clock>>({});

export function tick(look: string, now: number, speed: number): number {
  "worklet";
  const map = clocks.value;
  let c = map[look];
  if (c === undefined) {
    c = { t: 0, last: now };
    map[look] = c;
  }
  if (now > c.last) {
    c.t += Math.min(now - c.last, 100) * speed;
    c.last = now;
  }
  clocks.value = map;
  return c.t;
}

/* FILE src/orb/model.ts */
/**
 * Point layout from @yogesharc/thinking-orbs 0.1.1 dist/orb-core.js and renders.js (MIT).
 * Copyright (c) 2026 Yogesh. See ./LICENSE.
 */

import { SHAPES, torus, type Pt, type ShapeName } from "./shapes";

export type { ShapeName };

export const RENDERS: readonly ["dots", "crosses", "dashes", "halftone", "lines", "mesh", "squares", "verticalLines"] = [
  "dots",
  "crosses",
  "dashes",
  "halftone",
  "lines",
  "mesh",
  "squares",
  "verticalLines",
];
export type RenderName = (typeof RENDERS)[number];

const TAU = Math.PI * 2;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

const FLAT = new Set<RenderName>(["halftone", "lines", "verticalLines"]);

export function isFlat(render: RenderName): boolean {
  return FLAT.has(render);
}

function dist2(a: Pt, b: Pt): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

/** The k points nearest pts[i], nearest first. */
export function nearest(pts: Pt[], i: number, k: number): number[] {
  const idx: number[] = [];
  const d: number[] = [];
  const p = pts[i];
  for (let j = 0; j < pts.length; j++) {
    if (j === i) continue;
    const e = dist2(p, pts[j]);
    let at = idx.length;
    if (at === k) {
      if (e >= d[k - 1]) continue;
      at--;
    }
    while (at > 0 && d[at - 1] > e) {
      idx[at] = idx[at - 1];
      d[at] = d[at - 1];
      at--;
    }
    idx[at] = j;
    d[at] = e;
  }
  return idx;
}

function arms(count: number): Pt[] {
  const at = (lat: number, lon: number): Pt => [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
  const g = Math.sqrt((4 * Math.PI) / count);
  const n = 8;
  const along = 0.6 * g;
  const out: Pt[] = [];
  for (let m = 0; m < n; m++) {
    const room = m ? m & -m : n;
    const lim = Math.min((85 * Math.PI) / 180, Math.acos(Math.min(1, (g * n) / (TAU * room))));
    for (let lat = -lim + ((m * 0.618) % 1) * along; lat <= lim; lat += along / Math.sqrt(1 + Math.cos(lat) ** 2))
      out.push(at(lat, (m / n) * TAU - lat));
  }
  return out;
}

function distribute(state: string, count: number, shape: ShapeName): Pt[] {
  if (shape !== "sphere") return SHAPES[shape].points(count, state);
  if (state === "background-spiral") return arms(count);
  const out: Pt[] = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (2 * (i + 0.5)) / count;
    const r = Math.sqrt(1 - y * y);
    const th = i * GOLDEN;
    out.push([r * Math.cos(th), y, r * Math.sin(th)]);
  }
  return out;
}

export type OrbInput = {
  key: string;
  state: string;
  size: number;
  flat: boolean;
  tip: number;
  count: number;
  R: number;
  rs: number;
  reasoning: boolean;
  twins: boolean;
  /** Model space. Float64 so near-ties in the walker match the npm numbers. */
  pts: Float64Array;
  /** Flat neighbor index buffer, `reach` entries per point, unused slots -1. */
  near: Float32Array;
  reach: number;
  pairs: Float32Array;
  g: number;
  cell: number;
  render: RenderName;
};

const REACH = 24;

export function lookId(state: string, variant?: string): string {
  return variant && variant !== "default" ? `${state}-${variant}` : state;
}

export function buildInput(opts: {
  state: string;
  variant?: string;
  size: number;
  density: number;
  dotSize: number;
  shape: ShapeName;
  render: RenderName;
}): OrbInput {
  const state = lookId(opts.state, opts.variant);
  const size = opts.size;
  const dens = state === "background" ? 1 : 4;
  const asked = Math.max(8, Math.round(size * dens * opts.density));
  const form = opts.shape === "sphere" ? null : SHAPES[opts.shape];
  const c = size / 2;
  const R = c * 0.8 * (form?.scale ?? 1);
  const rs = (size / 64) ** 0.6 * (0.72 * Math.sqrt(4 / dens)) * opts.dotSize;
  const points = distribute(state, asked, opts.shape);
  const count = points.length;
  const pts = new Float64Array(count * 3);
  for (let i = 0; i < count; i++) {
    pts[i * 3] = points[i][0];
    pts[i * 3 + 1] = points[i][1];
    pts[i * 3 + 2] = points[i][2];
  }
  const reasoning = (state === "reasoning" || state === "reasoning-twins") && count > 1;
  const near = new Float32Array(reasoning ? count * REACH : 0);
  if (reasoning) {
    for (let i = 0; i < count; i++) {
      const row = nearest(points, i, REACH);
      for (let j = 0; j < REACH; j++) near[i * REACH + j] = j < row.length ? row[j] : -1;
    }
  }
  const pairList: number[] = [];
  if (opts.render === "mesh" && count > 1) {
    const seen = new Set<number>();
    for (let i = 0; i < count; i++) {
      for (const j of nearest(points, i, 3)) {
        const key = Math.min(i, j) * count + Math.max(i, j);
        if (!seen.has(key)) {
          seen.add(key);
          pairList.push(i, j);
        }
      }
    }
  }
  const pairs = Float32Array.from(pairList);
  const g = Math.max(6, Math.round(Math.sqrt(count) * 0.9));
  return {
    key: `${state}|${opts.shape}|${opts.render}|${size}|${opts.density}|${opts.dotSize}`,
    state,
    size,
    flat: isFlat(opts.render),
    tip: opts.shape === "torus" ? torus.tip : 0,
    count,
    R,
    rs,
    reasoning,
    twins: state === "reasoning-twins",
    pts,
    near,
    reach: REACH,
    pairs,
    g,
    cell: size / g,
    render: opts.render,
  };
}

/* FILE src/orb/shapes.ts */
/**
 * Port of @yogesharc/thinking-orbs 0.1.1 dist/shapes.js (MIT).
 * Copyright (c) 2026 Yogesh. See ./LICENSE.
 * Code wins over docs. Not part of the Jakub orbs library.
 */

const TAU = Math.PI * 2;
const TRI = Math.sqrt(8 / 9);

export type Pt = [number, number, number];

function pt(x: number, y: number, z: number): Pt {
  return [x, y, z];
}

function layers(solid: "cube" | "octahedron" | "tetrahedron", count: number): Pt[] {
  const gap = 0.6 * Math.sqrt((4 * Math.PI) / count);
  const n = 6;
  const out: Pt[] = [];
  const ring = (y: number, corners: [number, number][]) =>
    corners.forEach(([ax, az], k) => {
      const [bx, bz] = corners[(k + 1) % corners.length];
      const steps = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / gap));
      for (let q = 0; q < steps; q++) out.push([ax + ((bx - ax) * q) / steps, y, az + ((bz - az) * q) / steps]);
    });
  if (solid === "cube") {
    const h = 1 / Math.sqrt(3);
    for (let i = 0; i < n; i++) ring(h * ((2 * i) / (n - 1) - 1), [[h, h], [-h, h], [-h, -h], [h, -h]]);
    return out.map(([x, y, z]) => [y, x, z]);
  }
  out.push([0, 1, 0]);
  if (solid === "octahedron") {
    out.push([0, -1, 0]);
    for (let i = 1; i <= n; i++) {
      const y = (2 * i) / (n + 1) - 1;
      const w = 1 - Math.abs(y);
      ring(y, [[w, 0], [0, w], [-w, 0], [0, -w]]);
    }
  } else
    for (let i = 0; i < n; i++) {
      const y = -1 / 3 + (4 / 3) * (i / n);
      const w = TRI * (1 - y) * 0.75;
      ring(y, [0, 1, 2].map((k) => [w * Math.cos((k * TAU) / 3), w * Math.sin((k * TAU) / 3)]));
    }
  return out;
}

export const cube = {
  scale: 1.2,
  points(count: number, look: string): Pt[] {
    if (look === "background-spiral") return layers("cube", count);
    const n = Math.max(1, Math.round(Math.sqrt((count - 2) / 6)));
    const at = (i: number) => (2 * i) / n - 1;
    const out: Pt[] = [];
    for (let a = 0; a <= n; a++)
      for (let b = 0; b <= n; b++)
        for (let c = 0; c <= n; c++)
          if (a % n === 0 || b % n === 0 || c % n === 0) {
            const s = Math.sqrt(3);
            out.push(pt(at(a) / s, at(b) / s, at(c) / s));
          }
    return out;
  },
};

export const octahedron = {
  scale: 1.2,
  points(count: number, look: string): Pt[] {
    if (look === "background-spiral") return layers("octahedron", count);
    const n = Math.max(1, Math.round(Math.sqrt((count - 2) / 4)));
    const out: Pt[] = [];
    for (let i = -n; i <= n; i++)
      for (let j = Math.abs(i) - n; j <= n - Math.abs(i); j++) {
        const k = n - Math.abs(i) - Math.abs(j);
        out.push([i / n, j / n, k / n]);
        if (k) out.push([i / n, j / n, -k / n]);
      }
    return out;
  },
};

export const tetrahedron = {
  scale: 1.2,
  points(count: number, look: string): Pt[] {
    let out: Pt[];
    if (look === "background-spiral") out = layers("tetrahedron", count);
    else {
      const top = pt(0, 1, 0);
      const corner = (k: number): Pt => pt(TRI * Math.cos((k * TAU) / 3), -1 / 3, TRI * Math.sin((k * TAU) / 3));
      const base: [Pt, Pt, Pt] = [corner(0), corner(1), corner(2)];
      const n = Math.max(1, Math.round(Math.sqrt((count - 2) / 2)));
      const seen = new Map<string, Pt>();
      const faces: [Pt, Pt, Pt][] = [
        [top, base[0], base[1]],
        [top, base[1], base[2]],
        [top, base[2], base[0]],
        [base[0], base[1], base[2]],
      ];
      for (const [A, B, C] of faces)
        for (let i = 0; i <= n; i++)
          for (let j = 0; i + j <= n; j++) {
            const p = pt(
              A[0] + ((B[0] - A[0]) * i + (C[0] - A[0]) * j) / n,
              A[1] + ((B[1] - A[1]) * i + (C[1] - A[1]) * j) / n,
              A[2] + ((B[2] - A[2]) * i + (C[2] - A[2]) * j) / n,
            );
            seen.set(`${Math.round(p[0] * 1e4)},${Math.round(p[1] * 1e4)},${Math.round(p[2] * 1e4)}`, p);
          }
      out = [...seen.values()];
    }
    const s = Math.sqrt(3 / 4);
    return out.map(([x, y, z]): Pt => [x * s, (y - 1 / 3) * s, z * s]);
  },
};

const RING = 0.65;
const TUBE = 0.3;

export const torus = {
  scale: 1.2,
  tip: 35,
  points(count: number, look: string): Pt[] {
    const at = (u: number, v: number): Pt => {
      const w = RING + TUBE * Math.cos(v);
      return [w * Math.cos(u), TUBE * Math.sin(v), w * Math.sin(u)];
    };
    const out: Pt[] = [];
    if (look === "background-spiral") {
      const along = 0.6 * Math.sqrt((4 * Math.PI) / count);
      const strands = 6;
      const turns = 3;
      for (let k = 0; k < strands; k++)
        for (let u = 0; u < TAU; ) {
          const v = (k / strands) * TAU + turns * u;
          out.push(at(u, v));
          u += along / Math.hypot(RING + TUBE * Math.cos(v), TUBE * turns);
        }
      return out;
    }
    const gap = Math.sqrt((4 * Math.PI ** 2 * RING * TUBE) / count);
    const nv = Math.max(3, Math.round((TAU * TUBE) / gap));
    for (let j = 0; j < nv; j++) {
      const v = (j / nv) * TAU;
      const nu = Math.max(3, Math.round((TAU * (RING + TUBE * Math.cos(v))) / gap));
      for (let i = 0; i < nu; i++) out.push(at(((i + (j % 2) / 2) / nu) * TAU, v));
    }
    return out;
  },
};

export const SHAPES = { cube, octahedron, tetrahedron, torus };
export type ShapeName = "sphere" | keyof typeof SHAPES;

/* FILE src/orb/simulate.ts */
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

/* FILE src/orb/draw.ts */
/**
 * Skia draw of the ported renders (renders.js math, Skia calls).
 * Copyright notice for the render math: MIT, Yogesh 2026. See ./LICENSE.
 */
import { PaintStyle, Skia, StrokeCap, type SkCanvas } from "@shopify/react-native-skia";

import type { OrbInput } from "./model";
import { toneAt, type OrbLocal } from "./simulate";

const minR = (r: number) => {
  "worklet";
  return Math.max(0.45, r);
};

export function drawOrb(
  canvas: SkCanvas,
  input: OrbInput,
  local: OrbLocal,
  rgba: { r: number; g: number; b: number; a: number },
) {
  "worklet";
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  const base = Skia.Color(Float32Array.of(rgba.r, rgba.g, rgba.b, rgba.a));
  paint.setColor(base);
  const count = input.count;
  const dots = local.dots;
  const render = input.render;

  if (render === "halftone" || render === "lines" || render === "verticalLines") {
    const g = input.g;
    const cell = input.cell;
    const vertical = render === "verticalLines";
    if (render === "halftone") {
      const n = g * g;
      for (let k = 0; k < n; k++) {
        const rad = toneAt(local, k, cell);
        if (rad < 0.3) continue;
        paint.setAlphaf(rgba.a);
        canvas.drawCircle(((k % g) + 0.5) * cell, (Math.floor(k / g) + 0.5) * cell, rad, paint);
      }
      return;
    }
    for (let j = 0; j < g; j++) {
      const v = (j + 0.5) * cell;
      const path = Skia.Path.Make();
      const top: number[] = [];
      const bot: number[] = [];
      for (let k = 0; k < g; k++) {
        const u = (k + 0.5) * cell;
        const h = 0.8 * toneAt(local, vertical ? k * g + j : j * g + k, cell);
        if (vertical) {
          top.push(v - h, u);
          bot.push(v + h, u);
        } else {
          top.push(u, v - h);
          bot.push(u, v + h);
        }
      }
      const startU = 0;
      const endU = input.size;
      if (vertical) path.moveTo(v, startU);
      else path.moveTo(startU, v);
      for (let k = 0; k < g; k++) path.lineTo(top[k * 2], top[k * 2 + 1]);
      if (vertical) path.lineTo(v, endU);
      else path.lineTo(endU, v);
      for (let k = g - 1; k >= 0; k--) path.lineTo(bot[k * 2], bot[k * 2 + 1]);
      path.close();
      paint.setStyle(PaintStyle.Fill);
      paint.setAlphaf(rgba.a);
      canvas.drawPath(path, paint);
    }
    return;
  }

  if (render === "mesh") {
    const edge = Skia.Paint();
    edge.setAntiAlias(true);
    edge.setColor(base);
    edge.setStyle(PaintStyle.Stroke);
    edge.setStrokeWidth(Math.max(0.35, input.rs * 0.6));
    const pairs = input.pairs;
    for (let e = 0; e < pairs.length; e += 2) {
      const i = pairs[e];
      const j = pairs[e + 1];
      const a = 0.85 * Math.min(dots[i * 6 + 3], dots[j * 6 + 3]);
      if (a < 0.005) continue;
      edge.setAlphaf(a * rgba.a);
      canvas.drawLine(dots[i * 6], dots[i * 6 + 1], dots[j * 6], dots[j * 6 + 1], edge);
    }
  }

  const stroke = render === "dashes" || render === "crosses";
  if (stroke) {
    paint.setStyle(PaintStyle.Stroke);
    paint.setStrokeCap(StrokeCap.Round);
  } else {
    paint.setStyle(PaintStyle.Fill);
  }

  for (let i = 0; i < count; i++) {
    const o = i * 6;
    const x = dots[o];
    const y = dots[o + 1];
    const r = dots[o + 2];
    const a = dots[o + 3];
    if (a < 0.005) continue;
    paint.setAlphaf(Math.min(1, a) * rgba.a);
    if (render === "dots") {
      canvas.drawCircle(x, y, minR(r), paint);
    } else if (render === "squares") {
      const h = minR(r) * 0.9;
      canvas.drawRect(Skia.XYWHRect(x - h, y - h, 2 * h, 2 * h), paint);
    } else if (render === "dashes") {
      const rr = minR(r);
      const dx = dots[o + 4];
      const dy = dots[o + 5];
      const len = Math.hypot(dx, dy) || 1;
      const ux = (dx / len) * rr * 1.8;
      const uy = (dy / len) * rr * 1.8;
      paint.setStrokeWidth(Math.max(0.5, rr * 0.9));
      canvas.drawLine(x - ux, y - uy, x + ux, y + uy, paint);
    } else if (render === "crosses") {
      const rr = minR(r);
      const h = rr * 1.4;
      paint.setStrokeWidth(Math.max(0.5, rr * 0.7));
      canvas.drawLine(x - h, y, x + h, y, paint);
      canvas.drawLine(x, y - h, x, y + h, paint);
    } else if (render === "mesh") {
      canvas.drawCircle(x, y, minR(r) * 0.4, paint);
    }
  }
}

/* FILE src/color/color.ts */
/**
 * Color parsing and formatting ported from the live playground's picker
 * (OKLCH internally, Hex / OKLCH / Display P3 serialization).
 *
 * Paint channels:
 * - Web does not clamp. A patched Skia surface is Display P3 when
 *   matchMedia('(color-gamut: p3)') matches, and sRGB otherwise. Skia
 *   converts these extended-sRGB floats onto that surface.
 * - iOS: Canvas colorSpace "p3" (the library default). MetalWindowContext
 *   switches the layer to Display P3 on P3 screens and treats paint input
 *   as sRGB. Pass extended-sRGB floats, including components outside 0–1,
 *   via Float32Array / Color4f, only when canUseExtendedColor() is true
 *   (not Expo Go). Not 8-bit hex.
 * - Android: SkiaPictureViewManager.setColorSpace is a no-op and
 *   OpenGLWindowContext builds the on-screen GL surface with a null color
 *   space, so it is always sRGB. Clamp to sRGB.
 */

export type Oklch = { l: number; c: number; h: number; a: number };
export type ColorFormat = "hex" | "oklch" | "p3";

const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const hue360 = (h: number) => ((h % 360) + 360) % 360;
const dot = (m: number[][], v: number[]) => m.map((row) => row.reduce((s, n, i) => s + n * v[i], 0));
const toLinear = (e: number) =>
  Math.abs(e) <= 0.04045 ? e / 12.92 : Math.sign(e) * ((Math.abs(e) + 0.055) / 1.055) ** 2.4;
const toGamma = (e: number) =>
  Math.abs(e) <= 0.0031308 ? 12.92 * e : Math.sign(e) * (1.055 * Math.abs(e) ** (1 / 2.4) - 0.055);

const M_SRGB = [
  [0.4123907993, 0.3575843394, 0.1804807884],
  [0.2126390059, 0.7151686788, 0.0721923154],
  [0.0193308187, 0.1191947798, 0.9505321522],
];
const M_P3 = [
  [0.4865709486, 0.2656676932, 0.1982172852],
  [0.2289745641, 0.6917385218, 0.0792869141],
  [0, 0.0451133819, 1.0439443689],
];
const M_SRGB_INV = [
  [3.2409699419, -1.5373831776, -0.4986107603],
  [-0.9692436363, 1.8759675015, 0.0415550574],
  [0.0556300797, -0.2039769589, 1.0569715142],
];
const M_P3_INV = [
  [2.4934969119, -0.9313836179, -0.4027107845],
  [-0.8294889696, 1.7626640603, 0.0236246858],
  [0.0358458302, -0.0761723893, 0.956884524],
];
const M_OK_LMS = [
  [0.819022438, 0.3619062601, -0.1288737815],
  [0.0329836539, 0.9292868616, 0.0361446664],
  [0.0481771894, 0.2642395318, 0.6335478285],
];
const M_LMS_OK = [
  [1.2268798734, -0.5578149966, 0.2813910502],
  [-0.0405757626, 1.1122868294, -0.0717110667],
  [-0.0763729497, -0.421493324, 1.5869240244],
];

export function rgbToOklch(rgb: number[], a = 1, space: "srgb" | "p3" = "srgb"): Oklch {
  const lin = dot(space === "p3" ? M_P3 : M_SRGB, rgb.map(toLinear));
  const [r, s, b] = dot(M_OK_LMS, lin).map(Math.cbrt);
  const o = 1.9779984951 * r - 2.428592205 * s + 0.4505937099 * b;
  const l = 0.0259040371 * r + 0.7827717662 * s - 0.808675766 * b;
  const u = Math.hypot(o, l);
  return {
    l: clamp(0.2104542553 * r + 0.793617785 * s - 0.0040720468 * b),
    c: u < 1e-7 ? 0 : u,
    h: u < 1e-7 ? 0 : hue360((180 * Math.atan2(l, o)) / Math.PI),
    a: clamp(a),
  };
}

export function oklchToRgb(color: Oklch, space: "srgb" | "p3" = "srgb"): number[] {
  const i = color.c * Math.cos((color.h * Math.PI) / 180);
  const n = color.c * Math.sin((color.h * Math.PI) / 180);
  const lms = dot(M_LMS_OK, [
    (color.l + 0.3963377774 * i + 0.2158037573 * n) ** 3,
    (color.l - 0.1055613458 * i - 0.0638541728 * n) ** 3,
    (color.l - 0.0894841775 * i - 1.291485548 * n) ** 3,
  ]);
  return dot(space === "p3" ? M_P3_INV : M_SRGB_INV, lms).map(toGamma);
}

export function inGamut(color: Oklch, space: "srgb" | "p3" = "srgb"): boolean {
  return oklchToRgb(color, space).every((v) => v >= -1e-5 && v <= 1.00001);
}

export function clampChroma(color: Oklch, space: "srgb" | "p3" = "srgb"): Oklch {
  if (inGamut(color, space)) return color;
  let lo = 0;
  let hi = color.c;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut({ ...color, c: mid }, space)) lo = mid;
    else hi = mid;
  }
  return { ...color, c: lo };
}

export function maxChroma(l: number, h: number, space: "srgb" | "p3" = "srgb"): number {
  if (l <= 0 || l >= 1) return 0;
  return clampChroma({ l, c: 0.5, h, a: 1 }, space).c;
}

const num = (v: number, digits = 4) => Number(v.toFixed(digits));

/**
 * linear-sRGB → linear-Display-P3. Product of the CSS Color 4 XYZ matrices
 * (inverse of display-p3-to-XYZ times sRGB-to-XYZ). The near-zero third
 * column terms are exactly 0 in that product.
 */
const M_SRGB_TO_P3 = [
  [0.8224619687140926, 0.1775380312859074, 0],
  [0.0331941988509757, 0.9668058011490243, 0],
  [0.0170826307211474, 0.0723974406639507, 0.9105199286149019],
];

/** Gamma sRGB floats → Display P3 floats. Round only at the call site. */
function srgbToDisplayP3(rgb: number[]): number[] {
  return dot(M_SRGB_TO_P3, rgb.map(toLinear)).map(toGamma);
}

export function formatColor(color: Oklch, format: ColorFormat): string {
  const alpha = color.a < 1 ? ` / ${num(color.a)}` : "";
  if (format === "oklch") return `oklch(${num(color.l)} ${num(color.c)} ${num(color.h, 2)}${alpha})`;
  if (format === "p3") {
    const srgb = oklchToRgb(clampChroma(color, "srgb"), "srgb").map((v) => clamp(v));
    const p3 = srgbToDisplayP3(srgb);
    return `color(display-p3 ${p3.map((v) => num(v, 5)).join(" ")}${alpha})`;
  }
  const rgb = oklchToRgb(clampChroma(color, "srgb"), "srgb");
  const bytes = rgb.map((v) => Math.round(255 * clamp(v)));
  if (color.a < 1) bytes.push(Math.round(255 * color.a));
  return "#" + bytes.map((v) => v.toString(16).padStart(2, "0")).join("");
}

export function toSrgb(color: Oklch): { r: number; g: number; b: number; a: number } {
  const [r, g, b] = oklchToRgb(clampChroma(color, "srgb"), "srgb").map((v) => clamp(v));
  return { r, g, b, a: color.a };
}

/** sRGB floats that may lie outside 0–1. Chroma is limited to the P3 gamut first. */
export function toExtendedSrgb(color: Oklch): { r: number; g: number; b: number; a: number } {
  const [r, g, b] = oklchToRgb(clampChroma(color, "p3"), "srgb");
  return { r, g, b, a: color.a };
}

const UNIT = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?(%|deg|grad|rad|turn)?$/i;

function parseNum(raw: string, scale = 1, angle = false): number | null {
  const m = raw.match(UNIT);
  if (!m) return null;
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return null;
  const u = m[1]?.toLowerCase();
  if (angle) {
    if (u === "rad") return (180 * n) / Math.PI;
    if (u === "turn") return 360 * n;
    if (u === "grad") return 0.9 * n;
    if (u && u !== "deg") return null;
    return n;
  }
  if (u === "%") return (n * scale) / 100;
  if (u) return null;
  return n;
}

export function parseColor(input: string): Oklch | null {
  const t = input.trim().toLowerCase();
  if (t === "transparent") return { l: 0, c: 0, h: 0, a: 0 };
  if (/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/.test(t)) {
    let hex = t.slice(1);
    if (hex.length <= 4) hex = [...hex].map((c) => c + c).join("");
    const bytes = hex.match(/../g)!.map((b) => parseInt(b, 16) / 255);
    return rgbToOklch(bytes.slice(0, 3), bytes[3] ?? 1);
  }
  const m = t.match(/^(oklch|rgb|rgba|hsl|hsla|color)\(([^()]*)\)$/);
  if (!m) return null;
  const kind = m[1];
  let body = m[2].trim();
  const isColor = kind === "color";
  if (isColor) {
    if (!body.startsWith("display-p3 ")) return null;
    body = body.slice(11).trim();
  }
  const commas = body.includes(",");
  if (commas && (isColor || kind === "oklch" || body.includes("/"))) return null;
  const parts = commas ? body.split(",").map((s) => s.trim()) : body.split(/\s*\/\s*/);
  if (!commas && parts.length > 2) return null;
  const channels = commas ? parts.slice(0, 3) : parts[0].split(/\s+/);
  if (channels.length !== 3) return null;
  if (commas && parts.length !== 3 && parts.length !== 4) return null;
  if (commas && kind.startsWith("rgb") && channels.some((c) => c.endsWith("%")) && !channels.every((c) => c.endsWith("%")))
    return null;
  const alphaRaw = commas ? parts[3] : parts[1];
  const alpha = alphaRaw === undefined ? 1 : parseNum(alphaRaw);
  if (alpha === null) return null;
  if (kind === "oklch") {
    const l = parseNum(channels[0]);
    const c = parseNum(channels[1], 0.4);
    const h = parseNum(channels[2], 1, true);
    if (l === null || c === null || h === null) return null;
    return { l: clamp(l), c: Math.max(0, c), h: hue360(h), a: clamp(alpha) };
  }
  if (kind.startsWith("hsl")) {
    const h = parseNum(channels[0], 1, true);
    const s = parseNum(channels[1]);
    const l = parseNum(channels[2]);
    if (h === null || s === null || l === null || !channels[1].endsWith("%") || !channels[2].endsWith("%")) return null;
    const S = clamp(s);
    const L = clamp(l);
    const span = S * Math.min(L, 1 - L);
    const f = (n: number) => {
      const k = (n + hue360(h) / 30) % 12;
      return L - span * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return rgbToOklch([f(0), f(8), f(4)], clamp(alpha));
  }
  const scale = isColor ? 1 : 255;
  const rgb = channels.map((c) => parseNum(c, scale));
  if (!rgb.every((v): v is number => v !== null)) return null;
  const mapped = rgb.map((v) => (isColor ? v : clamp(v / 255)));
  return rgbToOklch(mapped, clamp(alpha), isColor ? "p3" : "srgb");
}

export function detectFormat(value: string): ColorFormat {
  const t = value.trim();
  if (/^oklch\(/i.test(t)) return "oklch";
  if (/^color\(display-p3\s/i.test(t)) return "p3";
  return "hex";
}

/* FILE src/hooks/useArrowKeys.ts */
/** Native: hardware arrows are a no-op. Web implementation is useArrowKeys.web.ts. */
export function useArrowKeys(_count: number, _index: number, _onIndex: (index: number) => void) {}

/* FILE src/hooks/useArrowKeys.web.ts */
import { useEffect } from "react";

/** ↑/↓ wrap the playground state list. Ignored while a field or slider is focused. */
export function useArrowKeys(count: number, index: number, onIndex: (index: number) => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest("input, textarea, select, [contenteditable='true'], [role='slider'], [data-arrow-keys='own']")
      ) {
        return;
      }
      event.preventDefault();
      if (count <= 0) return;
      if (event.key === "ArrowDown") onIndex((index + 1) % count);
      else onIndex((index - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, index, onIndex]);
}

/* FILE src/content/cards.ts */
export type ToolRow = { verb: string; target: string; add?: number; del?: number };
export type Done = ToolRow | "Thought" | { text: string };

export type Look = {
  id: string;
  state: string;
  variant?: string;
  /** Landing card label. Background says "Background Tasks". */
  landing: string;
  /** Playground list label. Background says "Background". */
  playground: string;
  status: string;
  thought?: string;
  done?: Done;
};

/** Landing order. Chat history walks this list. */
export const LANDING: Look[] = [
  { id: "working", state: "working", landing: "Working", playground: "Working", status: "Working", done: { verb: "Read", target: "login/page.tsx" } },
  {
    id: "reasoning",
    state: "reasoning",
    landing: "Reasoning",
    playground: "Reasoning",
    status: "Thinking",
    thought: "A redirect back to /login means the session looks missing. The cookie might be set too late…",
    done: "Thought",
  },
  {
    id: "searching",
    state: "searching",
    landing: "Searching",
    playground: "Searching",
    status: "Searching web",
    done: { verb: "Searched web", target: "cookie set after redirect" },
  },
  {
    id: "searching-lighthouse",
    state: "searching",
    variant: "lighthouse",
    landing: "Searching · Lighthouse",
    playground: "Searching · Lighthouse",
    status: "Searching files",
    done: { verb: "Searched", target: "setCookie" },
  },
  {
    id: "working-gyro",
    state: "working",
    variant: "gyro",
    landing: "Working · Gyro",
    playground: "Working · Gyro",
    status: "Working",
    done: { verb: "Edited", target: "session.ts", add: 4, del: 2 },
  },
  {
    id: "background",
    state: "background",
    landing: "Background Tasks",
    playground: "Background",
    status: "1 Background Task",
    done: { verb: "Bash", target: "pnpm test --watch" },
  },
  {
    id: "reasoning-twins",
    state: "reasoning",
    variant: "twins",
    landing: "Reasoning · Twins",
    playground: "Reasoning · Twins",
    status: "Thinking",
    thought: "Tests pass. Worth loading the page on the dev server to be sure…",
    done: "Thought",
  },
  {
    id: "background-spiral",
    state: "background",
    variant: "spiral",
    landing: "Background Tasks · Spiral",
    playground: "Background · Spiral",
    status: "2 Background Tasks",
    done: { verb: "Bash", target: "pnpm dev" },
  },
  {
    id: "retrying",
    state: "retrying",
    landing: "Retrying",
    playground: "Retrying",
    status: "Retrying — attempt 2 of 10",
  },
  {
    id: "compacting",
    state: "compacting",
    landing: "Compacting",
    playground: "Compacting",
    status: "Compacting context",
  },
  {
    id: "compacting-squeeze",
    state: "compacting",
    variant: "squeeze",
    landing: "Compacting · Squeeze",
    playground: "Compacting · Squeeze",
    status: "Compacting context",
  },
  {
    id: "compacting-fuse",
    state: "compacting",
    variant: "fuse",
    landing: "Compacting · Fuse",
    playground: "Compacting · Fuse",
    status: "Compacting context",
    done: { verb: "Compacted", target: "Saved 45k tokens" },
  },
  {
    id: "retrying-surge",
    state: "retrying",
    variant: "surge",
    landing: "Retrying · Surge",
    playground: "Retrying · Surge",
    status: "Retrying — attempt 3 of 10",
    done: {
      text: "Fixed. The session cookie was set after the redirect, so every visit looked logged out. It's set first now, before the redirect goes out.",
    },
  },
  {
    id: "waiting",
    state: "waiting",
    landing: "Waiting",
    playground: "Waiting",
    status: "Waiting for usage limit to reset",
  },
  { id: "base", state: "base", landing: "Base", playground: "Base", status: "Working" },
];

/** Playground order follows VARIANTS, default first, Working selected on load (index 1). */
export const PLAYGROUND: Look[] = [
  LANDING[14],
  LANDING[0],
  LANDING[4],
  LANDING[1],
  LANDING[6],
  LANDING[2],
  LANDING[3],
  LANDING[5],
  LANDING[7],
  LANDING[8],
  LANDING[12],
  LANDING[9],
  LANDING[10],
  LANDING[11],
  LANDING[13],
];

export const INITIAL_ROWS: ToolRow[] = [
  { verb: "Read", target: "middleware.ts" },
  { verb: "Edited", target: "middleware.ts", add: 3, del: 1 },
  { verb: "Bash", target: "pnpm test" },
];

export function chatFor(index: number) {
  const last = LANDING.length - 1;
  const safe = Number.isFinite(index) ? Math.min(last, Math.max(0, Math.floor(index))) : 0;
  const card = LANDING[safe];
  const rows: (ToolRow | "Thought" | { text: string })[] = [...INITIAL_ROWS];
  for (let i = 0; i < safe; i++) {
    const done = LANDING[i].done;
    if (done) rows.push(done);
  }
  const fuse = LANDING.findIndex((c) => c.landing === "Compacting · Fuse");
  let tasks: Look | undefined;
  if (safe <= fuse) {
    for (let i = safe; i >= 0; i--) if (LANDING[i].state === "background") {
      tasks = LANDING[i];
      break;
    }
  }
  const live = card.state === "background" ? undefined : card;
  return { card, rows, live, tasks };
}

export const USER_PROMPT = "The login page keeps redirecting to itself. Can you fix it?";

/* FILE src/content/snippet.ts */
import type { RenderName, ShapeName } from "../orb/model";

const DEFAULTS: Record<string, string | number> = { variant: "default", size: 20, speed: 1, density: 1, dotSize: 1, tilt: 20 };

/**
 * Web JSX snippet, verbatim format from the live playground Copy button.
 * Non-default props only, plus shape/render imports and className for a custom color.
 */
export function orbSnippet(opts: {
  state: string;
  variant?: string;
  size: number;
  speed: number;
  density: number;
  dotSize: number;
  tilt: number;
  shape: ShapeName;
  render: RenderName;
  color: string;
  themeDefault: string;
  flat: boolean;
}): string {
  const entries: [string, string | number | undefined][] = [
    ["state", opts.state],
    ["variant", opts.variant && opts.variant !== "default" ? opts.variant : "default"],
    ["speed", opts.speed],
    ["density", opts.density],
    ["dotSize", opts.dotSize],
    ["tilt", opts.flat ? undefined : opts.tilt],
    ["size", opts.size],
  ];
  const props: string[] = [];
  for (const [key, value] of entries) {
    if (value === undefined) continue;
    if (key in DEFAULTS && value === DEFAULTS[key]) continue;
    props.push(typeof value === "string" ? `${key}="${value}"` : `${key}={${value}}`);
  }
  const imports = ['import { Orb } from "@yogesharc/thinking-orbs";'];
  if (opts.shape !== "sphere") {
    props.push(`shape={${opts.shape}}`);
    imports.push(`import { ${opts.shape} } from "@yogesharc/thinking-orbs/shapes";`);
  }
  if (opts.render !== "dots") {
    props.push(`render={${opts.render}}`);
    imports.push(`import { ${opts.render} } from "@yogesharc/thinking-orbs/renders";`);
  }
  if (opts.color.toLowerCase() !== opts.themeDefault.toLowerCase()) {
    props.push(`className="text-[${opts.color}]"`);
  }
  return `${imports.join("\n")}\n\n<Orb ${props.join(" ")} />`;
}

/* FILE src/orb/LICENSE */
MIT License

Copyright (c) 2026 Yogesh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

