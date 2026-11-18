/**
 * react-native-web reads the iframe window. The live card reads the browser
 * window, which is the showcase page around this frame. The page posts that
 * size before the bundle runs.
 */
'use strict';

const dimensions = {
  window: { fontScale: 1, height: 0, scale: 1, width: 0 },
  screen: { fontScale: 1, height: 0, scale: 1, width: 0 },
};
const listeners = {};
let shouldInit = typeof window !== 'undefined' && typeof document !== 'undefined';

function outerBox() {
  const injected = window.__SHOWCASE_WINDOW__;
  const scale = window.devicePixelRatio || 1;
  if (injected && injected.width) {
    return { width: injected.width, height: injected.height, scale };
  }
  const viewport = window.visualViewport;
  if (viewport) {
    return {
      width: Math.round(viewport.width * viewport.scale),
      height: Math.round(viewport.height * viewport.scale),
      scale,
    };
  }
  return {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    scale,
  };
}

function update() {
  if (typeof window === 'undefined') return;
  const box = outerBox();
  dimensions.window = { fontScale: 1, height: box.height, scale: box.scale, width: box.width };
  dimensions.screen = {
    fontScale: 1,
    height: window.screen.height,
    scale: box.scale,
    width: window.screen.width,
  };
}

function emit() {
  const list = listeners.change;
  if (Array.isArray(list)) {
    for (const handler of list) handler(dimensions);
  }
}

class Dimensions {
  static get(dimension) {
    if (shouldInit) {
      shouldInit = false;
      update();
    }
    const value = dimensions[dimension];
    if (!value) throw new Error(`No dimension set for key ${dimension}`);
    return value;
  }

  static set() {}

  static addEventListener(type, handler) {
    listeners[type] = listeners[type] || [];
    listeners[type].push(handler);
    return {
      remove() {
        Dimensions.removeEventListener(type, handler);
      },
    };
  }

  static removeEventListener(type, handler) {
    if (Array.isArray(listeners[type])) {
      listeners[type] = listeners[type].filter((item) => item !== handler);
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    update();
    emit();
  });
  window.addEventListener('showcase-viewport', () => {
    update();
    emit();
  });
}

module.exports = Dimensions;
