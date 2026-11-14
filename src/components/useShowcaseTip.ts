import { useEffect, useId, useRef, useState } from 'react';

export type TipPlace = 'below' | 'above';

/** A tip that has just been shown keeps the next card instant for a short move. */
let tipWarmUntil = 0;

/** Hover waits 500ms, unless a neighbouring tip was showing within 300ms. */
export function useShowcaseTip() {
  const rawId = useId().replace(/:/g, '');
  const id = `showcase-tip-${rawId}`;
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<TipPlace>('below');
  const [shift, setShift] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fromPointer = useRef(false);
  const shown = useRef(false);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const hide = () => {
    clear();
    if (shown.current) tipWarmUntil = Date.now() + 300;
    shown.current = false;
    const node = typeof document !== 'undefined' ? document.getElementById(id) : null;
    if (node) node.setAttribute('data-showcase-tip', 'off');
    setOpen(false);
  };

  const reveal = () => {
    const node = typeof document !== 'undefined' ? document.getElementById(id) : null;
    const next = node ? placeTip(node) : { place: 'below' as const, shift: 0 };
    shown.current = true;
    tipWarmUntil = Date.now() + 300;
    setPlace(next.place);
    setShift(next.shift);
    setOpen(true);
  };

  useEffect(() => {
    const node = document.getElementById(id);
    if (node) node.style.setProperty('--tip-shift', `${shift}px`);
  }, [id, open, place, shift]);

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
      if (Date.now() < tipWarmUntil) {
        reveal();
        return;
      }
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

/** Below by default. Above, still centred, only when below would leave the viewport. Then clamp 8px inside. */
function placeTip(node: HTMLElement): { place: TipPlace; shift: number } {
  const previous = node.getAttribute('data-showcase-place');
  const previousShift = node.style.getPropertyValue('--tip-shift');
  node.style.setProperty('--tip-shift', '0px');
  node.setAttribute('data-showcase-place', 'below');
  let place: TipPlace = 'below';
  let rect = node.getBoundingClientRect();
  if (rect.width > 0 && (rect.bottom > window.innerHeight - 8 || rect.top < 8)) {
    place = 'above';
    node.setAttribute('data-showcase-place', 'above');
    rect = node.getBoundingClientRect();
  }
  const shift = clampShift(rect);
  if (previous) node.setAttribute('data-showcase-place', previous);
  else node.removeAttribute('data-showcase-place');
  if (previousShift) node.style.setProperty('--tip-shift', previousShift);
  else node.style.removeProperty('--tip-shift');
  return { place, shift };
}

function clampShift(rect: DOMRect): number {
  let shift = 0;
  if (rect.left < 8) shift += 8 - rect.left;
  const right = rect.right + shift;
  if (right > window.innerWidth - 8) shift -= right - (window.innerWidth - 8);
  return shift;
}
