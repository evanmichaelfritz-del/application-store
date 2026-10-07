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
