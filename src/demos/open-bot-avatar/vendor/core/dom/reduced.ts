/*!
 * MIT License
 * Copyright (c) 2026 Dominik Scholz
 * https://github.com/DominikScholz/open-bot-avatar
 */

/** The system's prefers-reduced-motion setting, watched once for the whole page. */
import { requestFrame } from './clock';

const QUERY = '(prefers-reduced-motion: reduce)';
let mql: MediaQueryList | null | undefined;
let watchingStore = false;

function media(): MediaQueryList | null {
  if (mql === undefined) {
    mql = typeof matchMedia === 'undefined' ? null : matchMedia(QUERY);
    // Live avatars pick up a change on their next frame; wake the loop so they get one.
    mql?.addEventListener('change', requestFrame);
  }
  return mql;
}

function watchStoreSwitch(): void {
  if (watchingStore || typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
  watchingStore = true;
  const observer = new MutationObserver(() => requestFrame());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduce-motion'] });
}

export function prefersReducedMotion(): boolean {
  watchStoreSwitch();
  if (typeof document !== 'undefined' && document.documentElement.getAttribute('data-reduce-motion') === '1') {
    return true;
  }
  return media()?.matches ?? false;
}
