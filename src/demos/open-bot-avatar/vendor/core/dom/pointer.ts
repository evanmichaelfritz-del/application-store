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

/**
 * Window-wide pointer tracking for avatars that follow the cursor. Listeners
 * are installed while at least one avatar asks for them and removed after the
 * last one lets go.
 */
import { setPointer } from './clock';

let users = 0;
let detach: (() => void) | null = null;

function attach(): () => void {
  const move = (e: PointerEvent) => setPointer({ x: e.clientX, y: e.clientY });
  const leave = () => setPointer(null);
  // Leaving the window shows up as an `out` with no related target.
  const out = (e: PointerEvent) => !e.relatedTarget && leave();
  // A lifted finger or pen has no position any more.
  const lift = (e: PointerEvent) => e.pointerType !== 'mouse' && leave();
  const hidden = () => document.hidden && leave();
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerdown', move, { passive: true });
  window.addEventListener('pointerout', out);
  window.addEventListener('pointerup', lift);
  window.addEventListener('pointercancel', lift);
  window.addEventListener('blur', leave);
  document.addEventListener('visibilitychange', hidden);
  return () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerdown', move);
    window.removeEventListener('pointerout', out);
    window.removeEventListener('pointerup', lift);
    window.removeEventListener('pointercancel', lift);
    window.removeEventListener('blur', leave);
    document.removeEventListener('visibilitychange', hidden);
    setPointer(null);
  };
}

/** Start tracking the pointer; call the returned function to stop. Safe to call many times. */
export function trackPointer(): () => void {
  if (typeof window === 'undefined') return () => {};
  if (users++ === 0) detach = attach();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--users === 0) {
      detach?.();
      detach = null;
    }
  };
}
