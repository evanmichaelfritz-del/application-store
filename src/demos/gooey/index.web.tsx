import { useEffect, useRef, useState, type ComponentType } from 'react';
import { View } from 'react-native';

function hostElement(node: View | null): HTMLElement | null {
  if (typeof HTMLElement !== 'undefined' && node instanceof HTMLElement) return node;
  return null;
}

/** Loads liquid-gooey only after the card intersects, then keeps it mounted. */
export function GooeyDemo() {
  const hostRef = useRef<View>(null);
  const canObserve = typeof IntersectionObserver === 'function';
  const [show, setShow] = useState(!canObserve);
  const [Card, setCard] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (!canObserve) return;
    const el = hostElement(hostRef.current);
    if (!el) {
      setShow(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setShow(true);
      },
      { root: null, rootMargin: '0px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [canObserve]);

  useEffect(() => {
    if (!show || Card) return;
    let live = true;
    void import('./card.web').then((mod) => {
      if (live) setCard(() => mod.GooeyCard);
    });
    return () => {
      live = false;
    };
  }, [Card, show]);

  return (
    <View ref={hostRef} collapsable={false} style={{ width: '100%' }}>
      {Card ? (
        <Card />
      ) : (
        <div data-testid="gooey-pending" style={{ width: '100%', minHeight: 280, borderRadius: 14, background: '#171717' }} />
      )}
    </View>
  );
}
