/**
 * Run: node --experimental-strip-types src/demos/yogesh-thinking-orbs/orb/orbProps.check.ts
 * Unknown looks resolve to a known id, and a slipped id cannot produce NaN yaw.
 */
import { buildInput } from "./model";
import { KNOWN_LOOKS, normalizeOrbProps, resolveLook, type OrbStateName } from "./orbProps";
import { makeLocal, step } from "./simulate";

function assert(cond: boolean, message: string) {
  if (!cond) throw new Error(message);
}

const known = new Set<string>(KNOWN_LOOKS);

assert(resolveLook() === "base", "omitted state");
assert(resolveLook("nope") === "base", "unknown state");
assert(resolveLook("working-gyro") === "base", "combined id is not a state");
assert(resolveLook("working", "gyro") === "working-gyro", "gyro");
assert(resolveLook("working", "nope") === "working", "unknown variant");
assert(resolveLook("working", "default") === "working", "default variant");
assert(resolveLook("compacting", "fuse") === "compacting-fuse", "fuse");
assert(resolveLook("compacting", "squeeze") === "compacting-squeeze", "squeeze");

const defaults = normalizeOrbProps();
assert(defaults.state === "base" && defaults.size === 20 && defaults.speed === 1, "defaults");
assert(defaults.color === "#ffffff" && defaults.paused === false, "color and paused defaults");
assert(normalizeOrbProps({ paused: true, label: "Thinking", className: "orb" }).paused === true, "paused");

const states: OrbStateName[] = ["base", "working", "reasoning", "searching", "background", "retrying", "compacting", "waiting"];
for (const state of states) {
  for (const variant of ["default", "gyro", "twins", "lighthouse", "spiral", "surge", "squeeze", "fuse", "nope"]) {
    const id = resolveLook(state, variant);
    assert(known.has(id), `resolved ${state}/${variant} -> ${id}`);
  }
}

function finiteLook(state: string, variant?: string) {
  const input = buildInput({ state, variant, size: 48, density: 1, dotSize: 1, shape: "sphere", render: "dots" });
  assert(known.has(input.state), `build ${state}`);
  const local = makeLocal(input);
  step(input, local, 120, 23, 1);
  for (let i = 0; i < local.dots.length; i++) {
    if (!Number.isFinite(local.dots[i])) throw new Error(`NaN dots for ${input.state}`);
  }
  const slipped = { ...input, state: "not-a-look" };
  const slippedLocal = makeLocal(slipped);
  step(slipped, slippedLocal, 80, 20, 1);
  for (let i = 0; i < slippedLocal.dots.length; i++) {
    if (!Number.isFinite(slippedLocal.dots[i])) throw new Error("slipped look produced NaN");
  }
}

finiteLook("nope");
finiteLook("working", "gyro");
finiteLook("reasoning", "twins");
for (const id of KNOWN_LOOKS) finiteLook(id.includes("-") ? id.split("-")[0] : id, id.includes("-") ? id.slice(id.indexOf("-") + 1) : "default");

console.log("orb props ok");
