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
