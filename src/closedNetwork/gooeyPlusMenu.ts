/**
 * Closed-network, zero-dependency recreation of the Gooey plus menu.
 * Portable HTML/CSS/JS — no npm, no CDN, no external fetches.
 * Architecture mirrors liquid-gooey: SVG silhouette + goo filter under crisp DOM.
 */

/** Full runnable document — Copy code, AGENT_PROMPT examples, Playground seed. */
export const GOOEY_PLUS_CLOSED_NETWORK_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Gooey plus menu — closed network</title>
<style>
  :root {
    --btn-text: #17181c;
    --stage: #f9f9f9;
    --goo-fill: #ffffff;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: var(--stage);
    font-family: Inter, system-ui, -apple-system, sans-serif;
  }
  .liquid {
    position: relative;
    isolation: isolate;
    width: 200px;
    height: 140px;
  }
  .liquid svg[data-gooey-svg] {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
    z-index: -1;
    filter:
      drop-shadow(0 0 0 1px rgba(0,0,0,.06))
      drop-shadow(0 2px 6px rgba(0,0,0,.05))
      drop-shadow(0 4px 42px rgba(0,0,0,.06));
  }
  .slot {
    position: absolute;
    left: 80px;
    top: 80px;
    width: 40px;
    height: 40px;
    will-change: transform;
  }
  .slot.is-hub { z-index: 2; }
  .btn {
    width: 40px;
    height: 40px;
    border: 0;
    padding: 0;
    border-radius: 50%;
    background: transparent; /* liquid fill is the surface */
    color: var(--btn-text);
    display: grid;
    place-items: center;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .btn:focus-visible {
    outline: 2px solid var(--btn-text);
    outline-offset: 2px;
  }
  .sat { pointer-events: none; }
  .liquid.is-open .sat { pointer-events: auto; }
  .sat-icon {
    display: grid;
    place-items: center;
    opacity: 0;
    filter: blur(2px);
    transition: opacity 120ms ease, filter 120ms ease;
  }
  .liquid.is-open .sat-icon {
    opacity: 1;
    filter: blur(0);
    transition-duration: 180ms;
  }
  .plus {
    display: grid;
    place-items: center;
    transition: transform 250ms ease-in-out;
  }
  .liquid.is-open .plus { transform: rotate(45deg); }
  @media (prefers-reduced-motion: reduce) {
    .slot, .plus, .sat-icon, .blob { transition: none !important; }
  }
</style>
</head>
<body>
  <div class="liquid" id="liquid" data-testid="gooey-liquid">
    <svg data-gooey-svg aria-hidden="true" focusable="false">
      <defs>
        <!--
          Goo filter on SVG CONTENT (Safari-safe — do NOT use CSS filter:url() on HTML).
          stdDeviation = blur (softness / bridge distance). Default 6.
          feColorMatrix alpha slope = contrast (edge tightness). Default 18.
          intercept ≈ -(0.5 * contrast - 0.5) → for 18: -8.67
        -->
        <filter id="goo" filterUnits="userSpaceOnUse" x="-80" y="-80" width="360" height="300" color-interpolation-filters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix in="blur" type="matrix" values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 18 -8.67" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
      <g filter="url(#goo)" fill="#ffffff">
        <circle class="blob" data-i="0" cx="100" cy="100" r="20" />
        <circle class="blob" data-i="1" cx="100" cy="100" r="20" />
        <circle class="blob" data-i="2" cx="100" cy="100" r="20" />
        <circle class="blob" data-i="3" cx="100" cy="100" r="20" />
      </g>
    </svg>

    <div class="slot sat" data-i="0">
      <button type="button" class="btn sat" aria-label="New file" tabindex="-1">
        <span class="sat-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 1.5H4A1.5 1.5 0 0 0 2.5 3v10A1.5 1.5 0 0 0 4 14.5h8a1.5 1.5 0 0 0 1.5-1.5V6z"/>
            <path d="M9 1.5V6h4.5"/>
          </svg>
        </span>
      </button>
    </div>
    <div class="slot sat" data-i="1">
      <button type="button" class="btn sat" aria-label="Add image" tabindex="-1">
        <span class="sat-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1.5" y="1.5" width="13" height="13" rx="2"/>
            <circle cx="5.5" cy="5.5" r="1.25"/>
            <path d="M14.5 10.5L11 7l-7.5 7.5"/>
          </svg>
        </span>
      </button>
    </div>
    <div class="slot sat" data-i="2">
      <button type="button" class="btn sat" aria-label="New folder" tabindex="-1">
        <span class="sat-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 12.5A1.5 1.5 0 0 1 13 14H3a1.5 1.5 0 0 1-1.5-1.5V3A1.5 1.5 0 0 1 3 1.5h3L7.5 4H13a1.5 1.5 0 0 1 1.5 1.5z"/>
          </svg>
        </span>
      </button>
    </div>
    <div class="slot is-hub" data-i="3">
      <button type="button" class="btn" id="hub" aria-expanded="false" aria-label="Open menu">
        <span class="plus">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
            <path d="M10 4V16M4 10H16"/>
          </svg>
        </span>
      </button>
    </div>
  </div>
<script>
(function () {
  var OFFSETS = [
    { x: -54, y: -34 }, // New file
    { x: 0, y: -64 },   // Add image
    { x: 54, y: -34 },  // New folder
    { x: 0, y: 0 }      // hub
  ];
  var liquid = document.getElementById('liquid');
  var hub = document.getElementById('hub');
  var slots = liquid.querySelectorAll('.slot');
  var blobs = liquid.querySelectorAll('.blob');
  var icons = liquid.querySelectorAll('.sat-icon');
  var open = false;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setPos(el, x, y, dur, ease, delay) {
    el.style.transition = reduce ? 'none' : 'transform ' + dur + ' ' + ease + ' ' + delay;
    el.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  }

  function apply(isOpen) {
    var dur = reduce ? '0ms' : (isOpen ? '550ms' : '250ms');
    var ease = isOpen
      ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      : 'cubic-bezier(0.22, 1, 0.36, 1)';
    var stagger = reduce || !isOpen ? 0 : 40;

    liquid.classList.toggle('is-open', isOpen);
    hub.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    hub.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');

    for (var i = 0; i < 4; i++) {
      var o = isOpen ? OFFSETS[i] : { x: 0, y: 0 };
      var delay = (i < 3 ? i * stagger : 0) + 'ms';
      setPos(slots[i], o.x, o.y, dur, ease, delay);
      blobs[i].style.transformOrigin = '100px 100px';
      blobs[i].style.transition = reduce ? 'none' : 'transform ' + dur + ' ' + ease + ' ' + delay;
      blobs[i].style.transform = 'translate(' + o.x + 'px, ' + o.y + 'px)';
      if (i < 3) {
        icons[i].style.transitionDelay = isOpen && !reduce ? (120 + i * stagger) + 'ms' : '0ms';
        slots[i].querySelector('button').tabIndex = isOpen ? 0 : -1;
      }
    }
  }

  apply(false);
  hub.addEventListener('click', function () {
    open = !open;
    apply(open);
  });
  liquid.querySelectorAll('button.sat').forEach(function (btn) {
    btn.addEventListener('click', function () {
      open = false;
      apply(false);
    });
  });
})();
</script>
</body>
</html>
`;

export const GOOEY_PLUS_COPY_SNIPPET = GOOEY_PLUS_CLOSED_NETWORK_HTML;
