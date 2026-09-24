/**
 * Shared 3D-tilt spec for the live demo, Copy code, and AGENT_PROMPT.
 * Pointer position is always in the untransformed hit box — never offsetX/offsetY.
 */

export const TILT = {
  cardW: 210,
  cardH: 128,
  perspective: 1000,
  maxRx: 14,
  maxRy: 18,
  /** Exponential time constant (ms) for rotateX/Y while the pointer is over the card. */
  followMs: 120,
  /** Glare eases faster so the highlight stays on the cursor while tilt trails. */
  glareMs: 42,
  /** Ease back to rest after the pointer leaves. */
  returnMs: 520,
  glareRadius: 110,
} as const;

export const TILT_GLARE_STOPS =
  'rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.32) 26%, rgba(255,255,255,0.08) 46%, rgba(255,255,255,0) 68%';

/** Disc centered in its own box. The live view translates that center onto the pointer. */
export const TILT_GLARE_IMAGE = `radial-gradient(${TILT.glareRadius}px circle at 50% 50%, ${TILT_GLARE_STOPS})`;

export const TILT_MOTION = `Pointer-driven 3D tilt that eases toward the cursor. Do not write rotateX/Y on each pointer event (that snaps). Exponential follow, time constant ${TILT.followMs}ms: rotateX = (0.5 - ny) * ${TILT.maxRx}deg, rotateY = (nx - 0.5) * ${TILT.maxRy}deg, perspective ${TILT.perspective}. On leave, ease back to rest with time constant ${TILT.returnMs}ms. A soft radial glare (screen blend, ${TILT.glareRadius * 2}px disc, stops ${TILT_GLARE_STOPS}) sits on the pointer: snap the highlight onto the cursor when the pointer enters, then ease it with time constant ${TILT.glareMs}ms so it stays near the pointer while the tilt eases. Measure x/y on the untransformed hit box (clientX/Y minus getBoundingClientRect). Never offsetX/offsetY — those are relative to the text node under the cursor and jump across Credit, VISA, John Smith, and the card number.`;

export const TILT_RN = `Web hover is onMouseMove/onMouseLeave on a non-transformed hit target. Do not use Gesture.Hover (it calls setPointerCapture with no active pointer). Pan is the press/native path only — on web it must not spring the card back to rest on pointer-up while the cursor is still inside the card. Ease on the UI thread with useFrameCallback. Do not restart withTiming/withSpring on every mousemove. Reduced motion: identity transform, glare opacity 0. Showcase renders this same demo. Copy emits a closed-network .t-tilt HTML document with these constants — not a CSS-only sheet with a 400ms transform transition and a disc that does not track the pointer.`;

export const TILT_COPY_SNIPPET = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>3D tilt</title>
<style>
  :root {
    --tilt-perspective: ${TILT.perspective}px;
    --tilt-follow: ${TILT.followMs}ms;
    --tilt-glare: ${TILT.glareMs}ms;
    --tilt-return: ${TILT.returnMs}ms;
    --tilt-glare-radius: ${TILT.glareRadius}px;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: #f9f9f9;
    font-family: Inter, system-ui, -apple-system, sans-serif;
  }
  .t-tilt {
    width: ${TILT.cardW}px;
    height: ${TILT.cardH}px;
    perspective: var(--tilt-perspective);
    touch-action: none;
  }
  .t-tilt-card {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 16px;
    background: #16171c;
    padding: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transform: rotateX(0deg) rotateY(0deg);
    will-change: transform;
  }
  .t-tilt-brand { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.7); }
  .t-tilt-visa {
    position: absolute;
    right: 16px;
    top: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
  }
  .t-tilt-name { font-size: 13px; font-weight: 500; color: #fff; }
  .t-tilt-num { font-size: 12px; font-weight: 400; letter-spacing: 0.4px; color: rgba(255,255,255,0.78); }
  .t-tilt-glare {
    position: absolute;
    inset: 0;
    pointer-events: none;
    mix-blend-mode: screen;
    opacity: 0;
  }
  @media (prefers-reduced-motion: reduce) {
    .t-tilt-card { transform: none !important; }
    .t-tilt-glare { opacity: 0 !important; }
  }
</style>
</head>
<body>
  <div class="t-tilt" id="tilt">
    <div class="t-tilt-card" id="tilt-card">
      <div class="t-tilt-brand">Credit</div>
      <div class="t-tilt-visa">VISA</div>
      <div class="t-tilt-name">John Smith</div>
      <div class="t-tilt-num">4111 - 1111 - 1111 - 1111</div>
      <div class="t-tilt-glare" id="tilt-glare"></div>
    </div>
  </div>
  <script>
    (function () {
      var root = document.getElementById('tilt');
      var card = document.getElementById('tilt-card');
      var glare = document.getElementById('tilt-glare');
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var W = ${TILT.cardW}, H = ${TILT.cardH};
      var follow = ${TILT.followMs}, glareTau = ${TILT.glareMs}, ret = ${TILT.returnMs};
      var radius = ${TILT.glareRadius};
      var stops = '${TILT_GLARE_STOPS}';
      var targetRx = 0, targetRy = 0, targetGx = W / 2, targetGy = H / 2, targetOp = 0;
      var rx = 0, ry = 0, gx = W / 2, gy = H / 2, op = 0;
      var over = false, raf = 0, last = 0;

      function paint() {
        card.style.transform = 'rotateX(' + rx.toFixed(3) + 'deg) rotateY(' + ry.toFixed(3) + 'deg)';
        glare.style.opacity = String(op);
        glare.style.backgroundImage =
          'radial-gradient(' + radius + 'px circle at ' + gx.toFixed(2) + 'px ' + gy.toFixed(2) + 'px, ' + stops + ')';
      }

      function frame(now) {
        var dt = last ? Math.min(48, now - last) : 16.7;
        last = now;
        var tiltT = 1 - Math.exp(-dt / (over ? follow : ret));
        var gT = 1 - Math.exp(-dt / (over ? glareTau : ret));
        rx += (targetRx - rx) * tiltT;
        ry += (targetRy - ry) * tiltT;
        gx += (targetGx - gx) * gT;
        gy += (targetGy - gy) * gT;
        op += (targetOp - op) * gT;
        paint();
        var settled = !over && Math.abs(rx) < 0.04 && Math.abs(ry) < 0.04 && op < 0.02;
        if (settled) {
          rx = 0; ry = 0; op = 0;
          card.style.transform = 'rotateX(0deg) rotateY(0deg)';
          glare.style.opacity = '0';
          raf = 0;
          last = 0;
          return;
        }
        raf = requestAnimationFrame(frame);
      }

      function kick() {
        if (!raf) raf = requestAnimationFrame(frame);
      }

      function aim(clientX, clientY) {
        if (reduced) return;
        var rect = root.getBoundingClientRect();
        var x = Math.min(W, Math.max(0, clientX - rect.left));
        var y = Math.min(H, Math.max(0, clientY - rect.top));
        var nx = x / W, ny = y / H;
        var entered = !over;
        over = true;
        targetRx = (0.5 - ny) * ${TILT.maxRx};
        targetRy = (nx - 0.5) * ${TILT.maxRy};
        targetGx = x;
        targetGy = y;
        targetOp = 1;
        if (entered) { gx = x; gy = y; }
        kick();
      }

      function leave() {
        over = false;
        targetRx = 0;
        targetRy = 0;
        targetGx = W / 2;
        targetGy = H / 2;
        targetOp = 0;
        kick();
      }

      root.addEventListener('pointermove', function (e) { aim(e.clientX, e.clientY); });
      root.addEventListener('pointerleave', leave);
    })();
  </script>
</body>
</html>
`;
