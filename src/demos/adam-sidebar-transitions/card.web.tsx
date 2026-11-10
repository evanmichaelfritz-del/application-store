import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';
import { boot, CSS, HTML } from './source';

function hostElement(node: View | null): HTMLElement | null {
  if (typeof HTMLElement !== 'undefined' && node instanceof HTMLElement) return node;
  return null;
}

/** Shadow host so the stage CSS and the drag tooltip stay inside the card. */
export function SidebarTransitionsCard({ onScreen = true }: { onScreen?: boolean }) {
  const hostRef = useRef<View>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const { reduceMotion } = useReduceMotion();

  useEffect(() => {
    const host = hostElement(hostRef.current);
    if (!host) return;
    const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>${CSS}</style>${HTML}`;
    const root = shadow.querySelector('#adam-sidebar');
    if (!(root instanceof HTMLElement)) return;
    rootRef.current = root;
    root.setAttribute('data-reduce', reduceMotion ? '1' : '0');
    root.setAttribute('data-visible', onScreen ? '1' : '0');
    boot(root);
    return () => {
      rootRef.current = null;
      shadow.innerHTML = '';
    };
    // Mount once. Reduced motion updates through the attribute effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    rootRef.current?.setAttribute('data-reduce', reduceMotion ? '1' : '0');
  }, [reduceMotion]);

  useEffect(() => {
    rootRef.current?.setAttribute('data-visible', onScreen ? '1' : '0');
  }, [onScreen]);

  return <View ref={hostRef} collapsable={false} style={{ width: '100%' }} />;
}
