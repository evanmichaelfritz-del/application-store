/*!
 * MIT License
 * Copyright (c) 2026 Kelvin Zhang
 * https://github.com/0kzh/glisse
 * Pinned at 4922c852a6866ee9991d2f8c715bb1cfbe7aa2b9
 */

const id = "glisse-styles";

/**
 * Adds the stylesheet to the document once. It goes first in <head>, so the
 * app's own CSS comes after it and wins ties, as it would if imported after.
 */
export function insertStyles(css: string): void {
  if (typeof document === "undefined" || document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.prepend(style);
}
