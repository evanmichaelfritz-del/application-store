import { useEffect, useId, useRef, useState } from 'react';

export type TipPlace = 'below' | 'above' | 'right' | 'left';

/** Hover waits 500ms. Keyboard focus shows at once. Leave, blur, and Esc hide it. */
export function useShowcaseTip() {
  const rawId = useId().replace(/:/g, '');
  const id = `showcase-tip-${rawId}`;
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<TipPlace>('below');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fromPointer = useRef(false);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const hide = () => {
    clear();
    const node = typeof document !== 'undefined' ? document.getElementById(id) : null;
    if (node) node.setAttribute('data-showcase-tip', 'off');
    setOpen(false);
  };

  const reveal = () => {
    const node = typeof document !== 'undefined' ? document.getElementById(id) : null;
    const next = node ? choosePlace(node) : 'below';
    if (node) node.setAttribute('data-showcase-place', next);
    setPlace(next);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, id]);

  return {
    id,
    state: open ? 'on' : 'off',
    place,
    hoverIn: () => {
      clear();
      timer.current = setTimeout(reveal, 500);
    },
    hoverOut: hide,
    pointerDown: () => {
      fromPointer.current = true;
    },
    focus: () => {
      if (fromPointer.current) return;
      clear();
      reveal();
    },
    blur: () => {
      fromPointer.current = false;
      hide();
    },
  };
}

function overlaps(a: DOMRect, b: DOMRect): boolean {
  return a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
}

/** Below stays 6px under the button. The other places keep a flip off the title and the neighbouring controls. */
function choosePlace(node: HTMLElement): TipPlace {
  const previous = node.getAttribute('data-showcase-place');
  const order: TipPlace[] = ['below', 'right', 'left', 'above'];
  let picked: TipPlace = 'right';
  for (const place of order) {
    node.setAttribute('data-showcase-place', place);
    const rect = node.getBoundingClientRect();
    const inView =
      rect.width > 0 &&
      rect.top >= 8 &&
      rect.left >= 8 &&
      rect.bottom <= window.innerHeight - 8 &&
      rect.right <= window.innerWidth - 8;
    if (inView && !coversNeighbours(node, rect)) {
      picked = place;
      break;
    }
  }
  if (previous) node.setAttribute('data-showcase-place', previous);
  else node.removeAttribute('data-showcase-place');
  return picked;
}

function coversNeighbours(tip: HTMLElement, rect: DOMRect): boolean {
  const slot = tip.parentElement;
  const nodes = document.querySelectorAll('[role="button"], a[data-testid^="card-link"], h1');
  for (const node of nodes) {
    if (!(node instanceof HTMLElement)) continue;
    if (slot && slot.contains(node)) continue;
    const box = node.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) continue;
    if (overlaps(rect, box)) return true;
  }
  return false;
}
