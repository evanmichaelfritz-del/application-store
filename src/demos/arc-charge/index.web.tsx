import { useEffect, useRef, useState, type ComponentType } from 'react';
import { View } from 'react-native';

function hostElement(node: View | null): HTMLElement | null {
  if (typeof HTMLElement !== 'undefined' && node instanceof HTMLElement) return node;
  return null;
}

function inViewport(entry: IntersectionObserverEntry): boolean {
  const rect = entry.boundingClientRect;
  const width = window.innerWidth || 0;
  const height = window.innerHeight || 0;
  return rect.bottom > 0 && rect.right > 0 && rect.top < height && rect.left < width;
}

/** Loads the arc only after the card intersects, then keeps one canvas mounted. */
export function ArcChargeDemo() {
  const hostRef = useRef<View>(null);
  const canObserve = typeof IntersectionObserver === 'function';
  const [show, setShow] = useState(!canObserve);
  const [onScreen, setOnScreen] = useState(!canObserve);
  const [Card, setCard] = useState<ComponentType<{ onScreen?: boolean }> | null>(null);

  useEffect(() => {
    if (!canObserve) return;
    const el = hostElement(hostRef.current);
    if (!el) {
      setShow(true);
      setOnScreen(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setShow(true);
        setOnScreen(entries.some((entry) => inViewport(entry)));
      },
      { root: null, rootMargin: '200px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [canObserve]);

  useEffect(() => {
    if (!show || Card) return;
    let live = true;
    void import('./card.web').then((mod) => {
      if (live) setCard(() => mod.ArcChargeCard);
    });
    return () => {
      live = false;
    };
  }, [Card, show]);

  return (
    <View ref={hostRef} collapsable={false} style={{ width: '100%' }}>
      {Card ? (
        <Card onScreen={onScreen} />
      ) : (
        <div
          data-testid="arc-charge-pending"
          style={{ width: '100%', aspectRatio: '16 / 9', background: '#070503' }}
        />
      )}
    </View>
  );
}
