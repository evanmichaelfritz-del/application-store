import { GeistMono_500Medium } from "@expo-google-fonts/geist-mono/500Medium";
import { useFonts } from "expo-font";
import React, { createElement, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";

import {
  detectFormat,
  displayP3GammaToSrgb,
  formatColor,
  maxChroma,
  oklchToRgb,
  parseColor,
  srgbGammaToDisplayP3,
  type ColorFormat,
  type Oklch,
} from "../color/color";

const TABS: { id: ColorFormat; label: string }[] = [
  { id: "hex", label: "Hex" },
  { id: "oklch", label: "OKLCH" },
  { id: "p3", label: "Display P3" },
];

const SANS = 'system-ui, -apple-system, "SF Pro Display", sans-serif';
const MONO = "GeistMono_500Medium, ui-monospace, monospace";

type FieldSpace = "srgb" | "p3";

type FieldCanvas = {
  width: number;
  height: number;
  getContext: (kind: "2d", opts?: { colorSpace?: string }) => FieldContext | null;
};

type FieldContext = {
  createImageData: (w: number, h: number) => { data: Uint8ClampedArray };
  putImageData: (data: { data: Uint8ClampedArray }, x: number, y: number) => void;
  getContextAttributes?: () => { colorSpace?: string };
};

type BitmapSpace = "srgb" | "display-p3";

const bitmapSpace = new WeakMap<object, BitmapSpace>();

function isFieldCanvas(node: object | null): node is FieldCanvas {
  return !!node && "getContext" in node && "width" in node && "height" in node;
}

function fieldSpace(format: ColorFormat): FieldSpace {
  return format === "p3" ? "p3" : "srgb";
}

function chromaRatio(color: Oklch, space: FieldSpace) {
  const cap = maxChroma(color.l, color.h, space);
  if (cap <= 0) return 0;
  return Math.min(1, Math.max(0, color.c / cap));
}

function paintField(node: object | null, hue: number, space: FieldSpace) {
  if (!isFieldCanvas(node)) return;
  const ctx = node.getContext("2d", { colorSpace: "display-p3" });
  if (!ctx) return;
  let bitmap = bitmapSpace.get(node);
  if (!bitmap) {
    const reported = ctx.getContextAttributes?.().colorSpace;
    bitmap = reported === "display-p3" ? "display-p3" : "srgb";
    bitmapSpace.set(node, bitmap);
  }
  const w = node.width;
  const h = node.height;
  const image = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const l = h <= 1 ? 1 : 1 - y / (h - 1);
    const cap = maxChroma(l, hue, space);
    for (let x = 0; x < w; x++) {
      const c = (w <= 1 ? 0 : x / (w - 1)) * cap;
      let rgb = oklchToRgb({ l, c, h: hue, a: 1 }, space);
      if (bitmap === "display-p3" && space === "srgb") rgb = srgbGammaToDisplayP3(rgb);
      else if (bitmap === "srgb" && space === "p3") rgb = displayP3GammaToSrgb(rgb);
      const i = (y * w + x) * 4;
      image.data[i] = Math.round(255 * Math.min(1, Math.max(0, rgb[0])));
      image.data[i + 1] = Math.round(255 * Math.min(1, Math.max(0, rgb[1])));
      image.data[i + 2] = Math.round(255 * Math.min(1, Math.max(0, rgb[2])));
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

function hueTrack(color: Oklch, ratio: number, space: FieldSpace) {
  const stops: string[] = [];
  for (let i = 0; i < 73; i++) {
    const h = i * 5;
    stops.push(formatColor({ l: color.l, c: ratio * maxChroma(color.l, h, space), h, a: 1 }, "oklch"));
  }
  return `linear-gradient(to right in oklab, ${stops.join(", ")})`;
}

let injected = false;
function injectStyles() {
  if (injected || typeof document === "undefined") return;
  injected = true;
  const style = document.createElement("style");
  style.setAttribute("data-orb-color", "");
  style.textContent = `
.orb-cp-control{box-sizing:border-box;height:36px;width:100%;background:rgba(255,255,255,.08);border-radius:8px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 12px;transition:background .15s,box-shadow .15s;font-family:${SANS}}
.orb-cp-control[data-open=true]{background:rgba(255,255,255,.18);box-shadow:inset 0 0 0 1px rgba(255,255,255,.26)}
.orb-cp-label{color:rgba(255,255,255,.7);flex-shrink:0;font-size:13px;font-weight:500;line-height:19.5px;transform:translateY(-.5px)}
.orb-cp-control[data-open=true] .orb-cp-label,.orb-cp-control[data-open=true] .orb-cp-value{color:#fffffff2}
.orb-cp-inputs{flex:1;min-width:0;display:flex;justify-content:flex-end;align-items:center;gap:8px}
.orb-cp-value{width:100%;min-width:0;height:25px;box-sizing:border-box;color:rgba(255,255,255,.7);text-align:right;text-overflow:ellipsis;background:transparent;border:0;outline:none;padding:4px 0;font:500 13px ${MONO};caret-color:rgba(255,255,255,.7)}
.orb-cp-value:focus,.orb-cp-control[data-open=true] .orb-cp-value:focus{color:#fff;caret-color:#fff;outline:none;box-shadow:inset 0 -1px 0 0 rgba(255,255,255,.6)}
.orb-cp-value[aria-invalid=true],.orb-cp-control[data-open=true] .orb-cp-value[aria-invalid=true]{color:#ef7777;caret-color:#ef7777}
.orb-cp-swatch{box-sizing:border-box;border:1px solid rgba(255,255,255,.26);background-color:transparent;background-image:linear-gradient(var(--orb-cp-color),var(--orb-cp-color)),repeating-conic-gradient(#aaa 0% 25%,#eee 0% 50%);background-size:auto,8px 8px;background-position:0 0,0 50%;cursor:pointer;border-radius:5px;flex:0 0 20px;width:20px;height:20px;padding:0;transition:transform .15s;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
.orb-cp-swatch:hover{transform:scale(1.08)}
.orb-cp-swatch:focus{outline:none}
.orb-cp-swatch:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:-2px}
.orb-cp-pop{box-sizing:border-box;width:280px;height:350px;z-index:10002;position:fixed;margin:0;padding:10px;display:grid;grid-template-rows:36px 160px auto 36px;gap:6px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:#212121;box-shadow:0 8px 32px rgba(0,0,0,.5);color:rgba(255,255,255,.7);font:500 13px/19.5px ${SANS};animation:orb-cp-enter .16s ease-out;overflow:hidden}
.orb-cp-pop *,.orb-cp-pop *::before,.orb-cp-pop *::after{box-sizing:border-box}
@keyframes orb-cp-enter{from{opacity:0;transform:translateY(3px) scale(.98)}to{opacity:1;transform:none}}
.orb-cp-formats{height:36px;background:rgba(255,255,255,.08);border-radius:8px;padding:2px;display:flex;align-items:center}
.orb-cp-seg{position:relative;display:flex;flex:1;min-width:0;padding:2px;border-radius:8px}
.orb-cp-pill{position:absolute;left:2px;top:2px;bottom:2px;width:calc(33.3333% - 1.33333px);border-radius:6px;background:rgba(255,255,255,.18);pointer-events:none;z-index:0;transition:transform .2s cubic-bezier(.25,1,.5,1)}
.orb-cp-format{position:relative;z-index:1;flex:1 1 0;min-width:0;white-space:nowrap;cursor:pointer;background:transparent;border:0;padding:6px 8px;font-family:inherit;font-size:13px;font-weight:500;line-height:19.5px;color:rgba(255,255,255,.7);transition:color .15s}
.orb-cp-format:hover,.orb-cp-format[data-active=true]{color:#fffffff2}
.orb-cp-plane{position:relative;height:160px;border-radius:8px;touch-action:none;cursor:crosshair;user-select:none}
.orb-cp-plane::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)}
.orb-cp-plane:focus{outline:none}
.orb-cp-plane:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:-2px}
.orb-cp-canvas{width:100%;height:100%;display:block;border-radius:inherit;pointer-events:none}
.orb-cp-marker{position:absolute;z-index:1;width:12px;height:12px;margin:-6px;border:2px solid #fff;border-radius:50%;pointer-events:none;box-shadow:0 2px 4px rgba(0,0,0,.3)}
.orb-cp-tracks{display:grid;gap:6px}
.orb-cp-track-row{height:36px;border-radius:8px;background:rgba(255,255,255,.08);display:flex;align-items:center;gap:12px;padding:0 12px;font-size:13px;font-weight:500}
.orb-cp-track-row>span{flex:0 0 52px;color:rgba(255,255,255,.7)}
.orb-cp-track{appearance:none;-webkit-appearance:none;background:transparent;border:0;flex:1;min-width:0;height:100%;margin:0;padding:0;cursor:pointer;touch-action:none}
.orb-cp-track::-webkit-slider-runnable-track{height:16px;border-radius:4px;background:var(--orb-cp-track)}
.orb-cp-track::-moz-range-track{height:16px;border:0;border-radius:4px;background:var(--orb-cp-track)}
.orb-cp-track::-webkit-slider-thumb{-webkit-appearance:none;box-sizing:border-box;width:16px;height:24px;margin-top:-4px;border:2px solid #fff;border-radius:5px;background:var(--orb-cp-thumb);background-clip:padding-box;box-shadow:0 2px 4px rgba(0,0,0,.3)}
.orb-cp-track::-moz-range-thumb{box-sizing:border-box;width:16px;height:24px;border:2px solid #fff;border-radius:5px;background:var(--orb-cp-thumb);background-clip:padding-box;box-shadow:0 2px 4px rgba(0,0,0,.3)}
.orb-cp-track:focus{outline:none}
.orb-cp-track:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:-2px}
.orb-cp-format:focus{outline:none}
.orb-cp-format:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:-2px}
[data-testid="yogesh-orb-panel"] [aria-haspopup="listbox"]:focus-visible,[data-testid="yogesh-orb-panel"] [role="slider"]:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:-2px}
.orb-cp-css{width:100%;height:36px;box-sizing:border-box;border:0;border-radius:8px;background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);padding:0 12px;font:500 13px/19.5px ${MONO};outline:none;caret-color:rgba(255,255,255,.7)}
.orb-cp-css:focus{color:#fff;caret-color:#fff;outline:none}
.orb-cp-css[aria-invalid=true]{color:#ef7777;caret-color:#ef7777}
@media (prefers-reduced-motion:reduce){.orb-cp-pop{animation:none}.orb-cp-pill{transition:none}}
`;
  document.head.appendChild(style);
}

export type ColorPickerProps = {
  text: string;
  color: Oklch;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Commit the typed string unchanged. Uppercase hex stays uppercase. */
  onCommit: (text: string) => void;
  onChange: (color: Oklch, text: string) => void;
};

type DomInput = HTMLInputElement;
type DomButton = HTMLButtonElement;

function isFormatButton(node: Element): node is HTMLButtonElement {
  return node instanceof HTMLButtonElement;
}

type FieldPoint = { clientX: number; clientY: number };

export function ColorPicker({ text, color, open, onOpenChange, onCommit, onChange }: ColorPickerProps) {
  useFonts({ GeistMono_500Medium });
  const popId = useId();
  const [format, setFormat] = useState<ColorFormat>(() => detectFormat(text));
  const [rowDraft, setRowDraft] = useState(text);
  const [cssDraft, setCssDraft] = useState(text);
  const [rowInvalid, setRowInvalid] = useState(false);
  const [cssInvalid, setCssInvalid] = useState(false);
  const [heldHue, setHeldHue] = useState(color.h);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const rowInputRef = useRef<DomInput | null>(null);
  const cssInputRef = useRef<DomInput | null>(null);
  const swatchRef = useRef<DomButton | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<FieldCanvas | null>(null);
  const wasOpen = useRef(false);
  const commitRef = useRef<(raw: string) => boolean>(() => false);
  const textRef = useRef(text);
  const onOpenChangeRef = useRef(onOpenChange);
  textRef.current = text;
  onOpenChangeRef.current = onOpenChange;
  const hue = color.c > 1e-7 ? color.h : heldHue;
  const space = fieldSpace(format);
  const ratio = chromaRatio(color, space);
  const opaque = formatColor({ ...color, a: 1 }, "oklch");
  const withAlpha = formatColor(color, "oklch");
  const swatchColor = parseColor(text) ? text.trim() : formatColor(color, "hex");

  commitRef.current = (raw: string) => {
    const trimmed = raw.trim();
    const parsed = parseColor(trimmed);
    if (!parsed) return false;
    setFormat(detectFormat(trimmed));
    setRowInvalid(false);
    setCssInvalid(false);
    setRowDraft(trimmed);
    setCssDraft(trimmed);
    onCommit(trimmed);
    return true;
  };

  useEffect(() => {
    injectStyles();
  }, []);

  useEffect(() => {
    const row = rowInputRef.current;
    const css = cssInputRef.current;
    if (document.activeElement !== row) {
      setRowDraft(text);
      setRowInvalid(false);
    }
    if (document.activeElement !== css) {
      setCssDraft(text);
      setCssInvalid(false);
    }
    if (document.activeElement !== row && document.activeElement !== css && parseColor(text)) {
      setFormat(detectFormat(text));
    }
  }, [text]);

  useEffect(() => {
    if (color.c > 1e-7) setHeldHue(color.h);
  }, [color.c, color.h]);

  useLayoutEffect(() => {
    if (!open) return;
    paintField(canvasRef.current, hue, space);
  }, [open, hue, space]);

  const place = () => {
    const row = rowRef.current;
    const pop = popRef.current;
    if (!row || !pop) return;
    const rect = row.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const edge = vw < 768 ? 16 : 8;
    let top = rect.top - 32;
    const maxTop = Math.max(edge, vh - edge - 350);
    if (top < edge) top = edge;
    if (top > maxTop) top = maxTop;
    let left = rect.left - 288;
    const maxLeft = Math.max(edge, vw - edge - 280);
    if (left < edge) left = edge;
    if (left > maxLeft) left = maxLeft;
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  };

  const closeToSwatch = () => {
    flushSync(() => onOpenChange(false));
    swatchRef.current?.focus({ preventScroll: true });
  };

  useLayoutEffect(() => {
    if (!open) {
      wasOpen.current = false;
      return;
    }
    place();
    if (!wasOpen.current) {
      const checked = popRef.current?.querySelector('[role="radio"][aria-checked="true"]');
      if (checked && isFormatButton(checked)) checked.focus({ preventScroll: true });
    }
    wasOpen.current = true;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rowRef.current?.contains(target) || popRef.current?.contains(target)) return;
      flushSync(() => onOpenChangeRef.current(false));
    };
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rowRef.current?.contains(target) || popRef.current?.contains(target)) return;
      flushSync(() => onOpenChangeRef.current(false));
    };
    const onMove = () => place();
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    window.addEventListener("resize", onMove);
    document.addEventListener("scroll", onMove, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("resize", onMove);
      document.removeEventListener("scroll", onMove, true);
    };
  }, [open]);

  const apply = (next: Oklch, nextFormat = format) => {
    onChange(next, formatColor(next, nextFormat));
  };

  const onFieldPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const node = event.currentTarget;
    event.preventDefault();
    node.focus({ preventScroll: true });
    if (node.setPointerCapture) node.setPointerCapture(event.pointerId);
    const read = (e: FieldPoint) => {
      const rect = node.getBoundingClientRect();
      const l = Math.min(1, Math.max(0, 1 - (e.clientY - rect.top) / Math.max(1, rect.height)));
      const nextRatio = Math.min(1, Math.max(0, (e.clientX - rect.left) / Math.max(1, rect.width)));
      apply({ l, c: nextRatio * maxChroma(l, hue, space), h: hue, a: color.a });
    };
    read(event);
    const move = (e: globalThis.PointerEvent) => {
      if (!node.hasPointerCapture?.(e.pointerId)) return;
      read(e);
    };
    const end = (e: globalThis.PointerEvent) => {
      if (node.hasPointerCapture?.(e.pointerId)) node.releasePointerCapture(e.pointerId);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", end);
      node.removeEventListener("pointercancel", end);
    };
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", end);
    node.addEventListener("pointercancel", end);
  };

  const onFieldKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const key = event.key;
    if (key !== "ArrowUp" && key !== "ArrowDown" && key !== "ArrowLeft" && key !== "ArrowRight") return;
    event.preventDefault();
    const step = event.shiftKey ? 0.1 : 0.01;
    let l = color.l;
    let nextRatio = ratio;
    if (key === "ArrowUp") l += step;
    else if (key === "ArrowDown") l -= step;
    else if (key === "ArrowRight") nextRatio += step;
    else nextRatio -= step;
    l = Math.min(1, Math.max(0, l));
    nextRatio = Math.min(1, Math.max(0, nextRatio));
    apply({ l, c: nextRatio * maxChroma(l, hue, space), h: hue, a: color.a });
  };

  const onPopKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      closeToSwatch();
      return;
    }
    if (event.key !== "Tab" || !popRef.current) return;
    const checked = popRef.current.querySelector('[role="radio"][aria-checked="true"]');
    const first = checked && isFormatButton(checked) ? checked : null;
    const last = cssInputRef.current;
    const leave = (event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last);
    if (!leave) return;
    // Focus the swatch, then let the browser Tab onward. Preventing default is what stopped on the swatch.
    swatchRef.current?.focus({ preventScroll: true });
    flushSync(() => onOpenChange(false));
  };

  const onFormatKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.metaKey || event.ctrlKey || !popRef.current) return;
    const buttons = [...popRef.current.querySelectorAll(".orb-cp-format")].filter(isFormatButton);
    const index = buttons.findIndex((b) => b === document.activeElement);
    if (index < 0) return;
    let next = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % buttons.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + buttons.length) % buttons.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = buttons.length - 1;
    else return;
    event.preventDefault();
    event.stopPropagation();
    buttons[next].focus({ preventScroll: true });
    buttons[next].click();
  };

  const bindChange = (node: DomInput | null, setInvalid: (invalid: boolean) => void) => {
    if (!node) return;
    const onChange = () => {
      if (node.value === textRef.current) {
        setInvalid(false);
        return;
      }
      if (!commitRef.current(node.value)) setInvalid(true);
    };
    node.addEventListener("change", onChange);
    return () => node.removeEventListener("change", onChange);
  };

  useEffect(() => bindChange(rowInputRef.current, setRowInvalid), [text]);
  useEffect(() => {
    if (!open) return;
    return bindChange(cssInputRef.current, setCssInvalid);
  }, [open, text]);

  const pop = open
    ? createElement(
        "div",
        {
          ref: popRef,
          className: "orb-cp-pop",
          role: "dialog",
          id: popId,
          "aria-label": "Color color picker",
          "data-testid": "yogesh-orb-color-popover",
          onKeyDown: onPopKey,
        },
        createElement(
          "div",
          { className: "orb-cp-formats" },
          createElement(
            "div",
            { className: "orb-cp-seg", role: "radiogroup", "aria-label": "Color format", onKeyDown: onFormatKey },
            createElement("div", {
              className: "orb-cp-pill",
              "aria-hidden": true,
              style: { transform: `translateX(${TABS.findIndex((tab) => tab.id === format) * 100}%)` },
            }),
            ...TABS.map((tab) => {
              const on = tab.id === format;
              return createElement(
                "button",
                {
                  key: tab.id,
                  type: "button",
                  className: "orb-cp-format",
                  role: "radio",
                  "aria-checked": on,
                  "data-active": String(on),
                  tabIndex: on ? 0 : -1,
                  onClick: () => {
                    setFormat(tab.id);
                    onChange(color, formatColor({ ...color, h: hue }, tab.id));
                  },
                },
                tab.label,
              );
            }),
          ),
        ),
        createElement(
          "div",
          {
            className: "orb-cp-plane",
            role: "group",
            "aria-label": "Color field; use arrow keys to adjust saturation and lightness",
            tabIndex: 0,
            onPointerDown: onFieldPointer,
            onKeyDown: onFieldKey,
          },
          createElement("canvas", {
            ref: canvasRef,
            className: "orb-cp-canvas",
            width: 252,
            height: 160,
            "aria-hidden": true,
          }),
          createElement("span", {
            className: "orb-cp-marker",
            "aria-hidden": true,
            style: {
              left: `${ratio * 100}%`,
              top: `${(1 - color.l) * 100}%`,
              background: opaque,
            },
          }),
        ),
        createElement(
          "div",
          { className: "orb-cp-tracks" },
          createElement(
            "label",
            { className: "orb-cp-track-row" },
            createElement("span", null, "Hue"),
            createElement("input", {
              className: "orb-cp-track",
              type: "range",
              min: 0,
              max: 360,
              step: 0.1,
              value: hue,
              "aria-label": "Hue",
              "aria-valuetext": `${Math.round(hue)} degrees`,
              style: {
                "--orb-cp-track": hueTrack({ ...color, h: hue }, ratio, space),
                "--orb-cp-thumb": opaque,
              },
              onInput: (event: React.FormEvent<HTMLInputElement>) => {
                const h = Number(event.currentTarget.value);
                setHeldHue(h);
                const l = color.l;
                const nextRatio = chromaRatio(color, space);
                apply({ l, c: nextRatio * maxChroma(l, h, space), h, a: color.a });
              },
            }),
          ),
          createElement(
            "label",
            { className: "orb-cp-track-row" },
            createElement("span", null, "Opacity"),
            createElement("input", {
              className: "orb-cp-track orb-cp-op",
              type: "range",
              min: 0,
              max: 100,
              step: 1,
              value: Math.round(color.a * 100),
              "aria-label": "Opacity",
              "aria-valuetext": `${Math.round(color.a * 100)} percent`,
              style: {
                "--orb-cp-track": `linear-gradient(to right, transparent, ${opaque}), repeating-conic-gradient(#aaa 0% 25%, #eee 0% 50%) 0 / 8px 8px`,
                "--orb-cp-thumb": `linear-gradient(${withAlpha}, ${withAlpha}), repeating-conic-gradient(#aaa 0% 25%, #eee 0% 50%) 0 / 8px 8px`,
              },
              onInput: (event: React.FormEvent<HTMLInputElement>) => {
                apply({ l: color.l, c: color.c, h: hue, a: Number(event.currentTarget.value) / 100 });
              },
            }),
          ),
        ),
        createElement("input", {
          ref: cssInputRef,
          className: "orb-cp-css",
          type: "text",
          spellCheck: false,
          autoComplete: "off",
          "aria-label": "CSS color",
          "aria-invalid": cssInvalid ? true : undefined,
          title: text,
          value: cssDraft,
          onInput: (event: React.FormEvent<HTMLInputElement>) => {
            setCssDraft(event.currentTarget.value);
            setCssInvalid(false);
          },
          onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            const value = event.currentTarget.value;
            if (!commitRef.current(value)) setCssInvalid(true);
          },
        }),
      )
    : null;

  return createElement(
    "div",
    null,
    createElement(
      "div",
      { ref: rowRef, className: "orb-cp-control", "data-open": open ? "true" : "false", "data-testid": "yogesh-orb-color-row" },
      createElement("span", { className: "orb-cp-label" }, "Color"),
      createElement(
        "div",
        { className: "orb-cp-inputs" },
        createElement("input", {
          ref: rowInputRef,
          className: "orb-cp-value",
          type: "text",
          spellCheck: false,
          autoComplete: "off",
          "aria-label": "Color color value",
          "aria-invalid": rowInvalid ? true : undefined,
          title: text,
          value: rowDraft,
          onInput: (event: React.FormEvent<HTMLInputElement>) => {
            setRowDraft(event.currentTarget.value);
            setRowInvalid(false);
          },
          onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
            event.stopPropagation();
            const input = event.currentTarget;
            if (event.key === "Escape") {
              event.preventDefault();
              input.value = text;
              setRowDraft(text);
              setRowInvalid(false);
              if (open) {
                closeToSwatch();
                return;
              }
              input.blur();
              return;
            }
            if (event.key === "Enter") {
              if (commitRef.current(input.value)) input.blur();
              else setRowInvalid(true);
            }
          },
        }),
        createElement("button", {
          ref: swatchRef,
          type: "button",
          className: "orb-cp-swatch",
          "data-testid": "yogesh-orb-color-swatch",
          "aria-label": "Pick color color",
          "aria-haspopup": "dialog",
          "aria-controls": popId,
          "aria-expanded": open,
          style: { "--orb-cp-color": swatchColor },
          onClick: () => onOpenChange(!open),
        }),
      ),
    ),
    pop && typeof document !== "undefined" ? createPortal(pop, document.body) : null,
  );
}
