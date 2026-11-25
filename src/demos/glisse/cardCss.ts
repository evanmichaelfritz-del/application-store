/** Stage sheet for the card. The offline document inlines the same text. */
export const CARD_CSS = `.glisse {
  position: relative;
  width: 100%;
  height: 640px;
  overflow: hidden;
  background: #0c0c0c;
  color: #fff;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
.glisse-scroller {
  position: absolute;
  inset: 0;
  overflow: auto;
  cursor: grab;
  overscroll-behavior: none;
  user-select: none;
  scrollbar-width: none;
}
.glisse-scroller[data-dragging] { cursor: grabbing; }
.glisse-scroller::-webkit-scrollbar { display: none; }
.glisse-wall {
  position: relative;
  width: 1300px;
  height: 1300px;
  pointer-events: none;
}
.glisse-wall img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}
.glisse-overlay {
  position: absolute;
  inset: 0 0 148px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  pointer-events: none;
}
.glisse-overlay > * { pointer-events: auto; }
.glisse-lens { pointer-events: none; flex: none; }
.glisse .glisse-lens.lg-glass,
.glisse .glisse-lens.lg-glass[data-rim],
.glisse .glisse-lens.lg-glass[data-drawn] {
  box-shadow:
    0 6px 24px rgb(0 0 0 / 0.2),
    inset 0 0 0 1.5px rgb(255 255 255 / 0.5),
    inset 0 2px 1px rgb(255 255 255 / 0.45),
    inset 2px 7px 24px rgb(0 0 0 / 0.09),
    inset -2px -7px 24px rgb(255 255 255 / 0.16);
}
.glisse-sliders {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 320px;
}
.glisse-slider-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgb(255 255 255 / 0.86);
  font-size: 12px;
  line-height: 16px;
}
.glisse-slider-label > span:first-child { flex: none; width: 84px; }
.glisse-slider-label .lg-slider { flex: 1; min-width: 0; }
.glisse-switch-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgb(255 255 255 / 0.9);
  font-size: 13px;
  line-height: 18px;
}
.glisse-dock {
  position: absolute;
  right: 20px;
  bottom: 36px;
  left: 20px;
  z-index: 3;
  display: grid;
  grid-template-columns: repeat(2, max-content);
  justify-content: center;
  gap: 8px 28px;
}
.glisse-knob {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: rgb(255 255 255 / 0.82);
  font-size: 12px;
  line-height: 16px;
}
.glisse-knob > span:first-child { flex: none; width: 76px; }
.glisse-knob .lg-slider { width: 240px; flex: none; }
.glisse-knob > span:last-child {
  flex: none;
  min-width: 40px;
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.glisse-credit {
  position: absolute;
  right: 16px;
  bottom: 10px;
  left: 16px;
  z-index: 4;
  margin: 0;
  color: rgb(255 255 255 / 0.62);
  font: 400 12px/16px system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  text-align: center;
  pointer-events: auto;
}
.glisse-credit a { color: inherit; }
@media (prefers-reduced-motion: reduce) {
  .glisse-scroller { scroll-behavior: auto; }
}
`;
