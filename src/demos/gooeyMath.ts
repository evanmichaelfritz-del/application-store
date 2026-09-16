export const GOO_W = 200;
export const GOO_H = 160;
export const GOO_CX = 100;
export const GOO_CY = 90;
export const HUB_R = 24;
export const DOT_R = 18;
export const REACH_STRETCH = 40;
export const REACH_SNAP = 74;
export const GOO_FILL = '#0d0d0d';

export const ACTIONS = [
  { label: 'F', angle: -50 },
  { label: 'I', angle: -10 },
  { label: 'L', angle: 30 },
  { label: 'N', angle: 70 },
] as const;

export function fanDistance(travel: number) {
  'worklet';
  if (travel <= 0.52) return (travel / 0.52) * REACH_STRETCH;
  return REACH_STRETCH + ((travel - 0.52) / 0.48) * (REACH_SNAP - REACH_STRETCH);
}

/** Mid-stretch peak 20px; 0 before 0.08 and after 0.88 (snap). */
export function neckWidth(travel: number) {
  'worklet';
  if (travel <= 0.08 || travel >= 0.88) return 0;
  const t = (travel - 0.08) / 0.8;
  return 12 + 8 * Math.sin(t * Math.PI);
}
