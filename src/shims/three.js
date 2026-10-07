import { WebGLRenderer as ThreeWebGLRenderer } from 'three';
import { installImgFxGate, patchImgFxRenderer } from './imgFxGate';

installImgFxGate();

/**
 * img-fx imports `WebGLRenderer` from this module on web (see metro.config.js).
 * The real renderer assigns `this.render` inside its constructor, so the
 * replacement has to happen after `super()` returns.
 */
export class WebGLRenderer extends ThreeWebGLRenderer {
  constructor(parameters) {
    super(parameters);
    patchImgFxRenderer(this);
  }
}

export * from 'three';
