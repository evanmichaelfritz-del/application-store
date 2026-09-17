export type Point = { x: number; y: number };

export function roundedRectPerimeter(w: number, h: number, r: number) {
  'worklet';
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  return 2 * (w + h - 2 * radius) + 2 * Math.PI * radius;
}

export function pointOnRoundedRect(
  t: number,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): Point {
  'worklet';
  const radius = Math.max(0.001, Math.min(r, Math.min(w, h) / 2));
  const top = Math.max(0, w - 2 * radius);
  const right = Math.max(0, h - 2 * radius);
  const bottom = Math.max(0, w - 2 * radius);
  const left = Math.max(0, h - 2 * radius);
  const arc = (Math.PI / 2) * radius;
  const length = top + right + bottom + left + 4 * arc;
  let d = (((t % 1) + 1) % 1) * length;

  if (d <= top) {
    return { x: x + radius + d, y };
  }
  d -= top;

  if (d <= arc) {
    const a = -Math.PI / 2 + d / radius;
    return {
      x: x + w - radius + Math.cos(a) * radius,
      y: y + radius + Math.sin(a) * radius,
    };
  }
  d -= arc;

  if (d <= right) {
    return { x: x + w, y: y + radius + d };
  }
  d -= right;

  if (d <= arc) {
    const a = d / radius;
    return {
      x: x + w - radius + Math.cos(a) * radius,
      y: y + h - radius + Math.sin(a) * radius,
    };
  }
  d -= arc;

  if (d <= bottom) {
    return { x: x + w - radius - d, y: y + h };
  }
  d -= bottom;

  if (d <= arc) {
    const a = Math.PI / 2 + d / radius;
    return {
      x: x + radius + Math.cos(a) * radius,
      y: y + h - radius + Math.sin(a) * radius,
    };
  }
  d -= arc;

  if (d <= left) {
    return { x, y: y + h - radius - d };
  }
  d -= left;

  const a = Math.PI + d / radius;
  return {
    x: x + radius + Math.cos(a) * radius,
    y: y + radius + Math.sin(a) * radius,
  };
}

export function pointOnBottomStroke(
  t: number,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): Point {
  'worklet';
  const radius = Math.max(0.001, Math.min(r, Math.min(w, h) / 2));
  const bottom = Math.max(0, w - 2 * radius);
  const arc = (Math.PI / 2) * radius;
  const length = bottom + 2 * arc;
  let d = (((t % 1) + 1) % 1) * length;

  if (d <= arc) {
    const a = d / radius;
    return {
      x: x + w - radius + Math.cos(a) * radius,
      y: y + h - radius + Math.sin(a) * radius,
    };
  }
  d -= arc;

  if (d <= bottom) {
    return { x: x + w - radius - d, y: y + h };
  }
  d -= bottom;

  const a = Math.PI / 2 + d / radius;
  return {
    x: x + radius + Math.cos(a) * radius,
    y: y + h - radius + Math.sin(a) * radius,
  };
}
