/*!
646793af2c86604539e02faa344e9793ab2aefe8

MIT License

Copyright (c) 2026 Dominik Scholz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
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
