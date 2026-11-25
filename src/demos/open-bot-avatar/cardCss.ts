export const CARD_CSS = `.oba {
  width: 960px;
  height: 720px;
  display: flex;
  box-sizing: border-box;
  background: #f3f3f4;
  color: #17181c;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
.oba-stage {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.oba-avatar-host {
  width: 420px;
  max-width: calc(100% - 48px);
  aspect-ratio: 1;
}
.oba-panel {
  width: 400px;
  flex: none;
  box-sizing: border-box;
  height: 100%;
  padding: 16px;
  overflow: auto;
  border-left: 1px solid rgba(23, 24, 28, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.oba-name {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: rgba(23, 24, 28, 0.72);
}
.oba-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
}
.oba-label {
  font-size: 11px;
  line-height: 14px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(23, 24, 28, 0.52);
}
.oba-states {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.oba-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.oba-chip {
  appearance: none;
  height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(23, 24, 28, 0.12);
  background: #ffffff;
  color: #17181c;
  font: 500 13px/1 system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  cursor: pointer;
}
.oba-states .oba-chip { width: 100%; }
.oba-chip[aria-checked="true"] {
  background: #17181c;
  border-color: #17181c;
  color: #ffffff;
}
.oba-chip:hover { background: #f1f1f1; }
.oba-chip[aria-checked="true"]:hover { background: #3a3a3e; }
.oba-presets {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 216px;
  overflow: auto;
}
.oba-preset-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.oba-group-name {
  font-size: 12px;
  line-height: 16px;
  color: rgba(23, 24, 28, 0.62);
}
.oba-swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.oba-swatch {
  width: 22px;
  height: 22px;
  padding: 0;
  border-radius: 999px;
  border: 1px solid rgba(23, 24, 28, 0.18);
  cursor: pointer;
}
.oba-swatch[aria-checked="true"] {
  box-shadow: 0 0 0 2px #f3f3f4, 0 0 0 4px #17181c;
}
.oba-json {
  width: 100%;
  box-sizing: border-box;
  min-height: 64px;
  height: 64px;
  resize: vertical;
  border-radius: 10px;
  border: 1px solid rgba(23, 24, 28, 0.12);
  background: #ffffff;
  color: #17181c;
  padding: 8px 10px;
  font: 400 12px/16px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
}
.oba-import {
  appearance: none;
  align-self: flex-start;
  height: 30px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #17181c;
  background: #17181c;
  color: #ffffff;
  font: 500 13px/1 system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  cursor: pointer;
}
.oba-import:hover { background: #3a3a3e; }
.oba-errors {
  margin: 0;
  padding-left: 18px;
  color: #b42318;
  font-size: 12px;
  line-height: 16px;
}
.oba-credit {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 12px;
  margin: 0;
  text-align: center;
  font-size: 12px;
  line-height: 16px;
  color: rgba(23, 24, 28, 0.62);
}
.oba-credit a { color: inherit; }
#oba-frame > .oba-credit {
  right: auto;
  width: 528px;
}
@media (prefers-reduced-motion: reduce) {
  .oba-chip, .oba-swatch, .oba-import { transition: none; }
}
html[data-reduce-motion="1"] .oba-chip,
html[data-reduce-motion="1"] .oba-swatch,
html[data-reduce-motion="1"] .oba-import { transition: none; }
`;
