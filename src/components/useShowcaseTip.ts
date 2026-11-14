import { useEffect, useId, useRef, useState } from 'react';

/** Hover waits 500ms. Keyboard focus shows at once. Leave, blur, and Esc hide it. */
export function useShowcaseTip() {
  const rawId = useId().replace(/:/g, '');
  const id = `showcase-tip-${rawId}`;
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fromPointer = useRef(false);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const hide = () => {
    clear();
    setOpen(false);
    setAbove(false);
  };

  const reveal = () => {
    setOpen(true);
    requestAnimationFrame(() => {
      const node = document.getElementById(id);
      if (!node) return;
      const rect = node.getBoundingClientRect();
      setAbove(rect.bottom > window.innerHeight - 8);
    });
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
    state: !open ? 'off' : above ? 'above' : 'on',
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
