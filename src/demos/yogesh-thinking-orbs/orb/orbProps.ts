/**
 * Public orb props aligned with @yogesharc/thinking-orbs 0.1.1 `Orb` / `mountOrb`.
 * An unknown state falls back to `base`. A variant the state does not have falls back to that state's default.
 * `color` is not an npm prop (npm paints `currentColor`); the dark store default is `#ffffff`.
 */

export type OrbStateName =
  | "base"
  | "working"
  | "reasoning"
  | "searching"
  | "background"
  | "retrying"
  | "compacting"
  | "waiting";

export const VARIANTS: Record<OrbStateName, readonly string[]> = {
  base: ["default"],
  working: ["default", "gyro"],
  reasoning: ["default", "twins"],
  searching: ["default", "lighthouse"],
  background: ["default", "spiral"],
  retrying: ["default", "surge"],
  compacting: ["default", "squeeze", "fuse"],
  waiting: ["default"],
};

export type KnownLook =
  | "base"
  | "working"
  | "working-gyro"
  | "reasoning"
  | "reasoning-twins"
  | "searching"
  | "searching-lighthouse"
  | "background"
  | "background-spiral"
  | "retrying"
  | "retrying-surge"
  | "compacting"
  | "compacting-squeeze"
  | "compacting-fuse"
  | "waiting";

export const KNOWN_LOOKS: readonly KnownLook[] = [
  "base",
  "working",
  "working-gyro",
  "reasoning",
  "reasoning-twins",
  "searching",
  "searching-lighthouse",
  "background",
  "background-spiral",
  "retrying",
  "retrying-surge",
  "compacting",
  "compacting-squeeze",
  "compacting-fuse",
  "waiting",
];

const KNOWN = new Set<string>(KNOWN_LOOKS);

export const ORB_DEFAULT_STATE: OrbStateName = "base";
export const ORB_DEFAULT_SIZE = 20;
export const ORB_DEFAULT_COLOR = "#ffffff";
export const ORB_DEFAULT_SPEED = 1;
export const ORB_DEFAULT_DENSITY = 1;
export const ORB_DEFAULT_DOT_SIZE = 1;
export const ORB_DEFAULT_TILT = 20;
export const ORB_DEFAULT_PAUSED = false;

export function isOrbState(value: string): value is OrbStateName {
  return Object.prototype.hasOwnProperty.call(VARIANTS, value);
}

export function isKnownLook(value: string): value is KnownLook {
  return KNOWN.has(value);
}

export function resolveLook(state?: string, variant?: string): KnownLook {
  const which = state !== undefined && isOrbState(state) ? state : ORB_DEFAULT_STATE;
  const v: readonly string[] = VARIANTS[which];
  const own = variant !== undefined && variant !== "default" && v.includes(variant);
  const id = own ? `${which}-${variant}` : which;
  if (isKnownLook(id)) return id;
  return ORB_DEFAULT_STATE;
}

export type OrbPassProps = {
  state?: string;
  variant?: string;
  size?: number;
  speed?: number;
  color?: string;
  paused?: boolean;
  label?: string;
  className?: string;
};

/** Defaults npm applies when `state` / `size` / `paused` are omitted, plus the dark color stand-in. */
export function normalizeOrbProps(props: OrbPassProps = {}) {
  return {
    state: resolveLook(props.state, props.variant),
    size: props.size ?? ORB_DEFAULT_SIZE,
    speed: props.speed ?? ORB_DEFAULT_SPEED,
    color: props.color ?? ORB_DEFAULT_COLOR,
    paused: props.paused ?? ORB_DEFAULT_PAUSED,
    label: props.label,
    className: props.className,
  };
}
