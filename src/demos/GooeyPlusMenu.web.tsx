import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Liquid } from 'liquid-gooey';
import { Stage } from '@/src/components/Stage';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';

/** Official liquid-gooey PlusMenu satellite layout (libraries.dev / playground). */
const SATELLITES = [
  {
    label: 'New file',
    x: -54,
    y: -34,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 1.5H4A1.5 1.5 0 0 0 2.5 3v10A1.5 1.5 0 0 0 4 14.5h8a1.5 1.5 0 0 0 1.5-1.5V6z" />
        <path d="M9 1.5V6h4.5" />
      </svg>
    ),
  },
  {
    label: 'Add image',
    x: 0,
    y: -64,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1.5" y="1.5" width="13" height="13" rx="2" />
        <circle cx="5.5" cy="5.5" r="1.25" />
        <path d="M14.5 10.5L11 7l-7.5 7.5" />
      </svg>
    ),
  },
  {
    label: 'New folder',
    x: 54,
    y: -34,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 12.5A1.5 1.5 0 0 1 13 14H3a1.5 1.5 0 0 1-1.5-1.5V3A1.5 1.5 0 0 1 3 1.5h3L7.5 4H13a1.5 1.5 0 0 1 1.5 1.5z" />
      </svg>
    ),
  },
] as const;

const GOOEY_CSS = `
.as-pm {
  width: 200px;
  height: 140px;
  position: relative;
}
.as-pm-slot {
  position: absolute;
  left: 80px;
  top: 80px;
}
.as-pm-btn {
  width: 40px;
  height: 40px;
  border: 0;
  padding: 0;
  border-radius: 50%;
  background: transparent;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #17181c;
  -webkit-tap-highlight-color: transparent;
}
.as-pm-btn:focus-visible {
  outline: 2px solid #17181c;
  outline-offset: 2px;
}
.as-pm-sat {
  pointer-events: none;
}
.as-pm-open .as-pm-sat {
  pointer-events: auto;
}
.as-pm-sat-icon {
  display: grid;
  place-items: center;
  opacity: 0;
  filter: blur(2px);
  transition: opacity 120ms ease, filter 120ms ease;
}
.as-pm-open .as-pm-sat-icon {
  opacity: 1;
  filter: blur(0);
  transition-duration: 180ms;
}
.as-pm-plus {
  display: grid;
  place-items: center;
  transform: rotate(0deg);
  transition: transform 250ms ease-in-out;
}
.as-pm-open .as-pm-plus {
  transform: rotate(45deg);
}
@media (prefers-reduced-motion: reduce) {
  .as-pm-plus,
  .as-pm-sat-icon {
    transition: none !important;
  }
}
`;

function installGooeyPlusCss() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('as-gooey-plus-css')) return;
  const style = document.createElement('style');
  style.id = 'as-gooey-plus-css';
  style.textContent = GOOEY_CSS;
  document.head.appendChild(style);
}

/**
 * Web showcase: official liquid-gooey PlusMenu pattern
 * (https://libraries.dev/gooey.html — `npm install liquid-gooey`).
 */
export function GooeyPlusMenuDemo() {
  const { reduceMotion } = useReduceMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    installGooeyPlusCss();
  }, []);

  const transition = reduceMotion
    ? { duration: 0 }
    : open
      ? { duration: 550, ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
      : { duration: 250, ease: 'cubic-bezier(0.22, 1, 0.36, 1)' };
  const stagger = reduceMotion ? 0 : open ? 40 : 0;

  return (
    <Stage>
      <View style={styles.wrap}>
        <Liquid
          blur={6}
          contrast={18}
          fill="#fff"
          shadow="0 0 0 1px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.05), 0 4px 42px rgba(0,0,0,.06)"
          className={`as-pm${open ? ' as-pm-open' : ''}`}
          data-testid="gooey-liquid"
        >
          {SATELLITES.map((s, i) => (
            <Liquid.Item
              key={s.label}
              className="as-pm-slot"
              x={open ? s.x : 0}
              y={open ? s.y : 0}
              transition={transition}
              delay={i * stagger}
            >
              <button
                type="button"
                className="as-pm-btn as-pm-sat"
                aria-label={s.label}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
              >
                <span
                  className="as-pm-sat-icon"
                  style={{
                    transitionDelay: open && !reduceMotion ? `${120 + i * stagger}ms` : '0ms',
                  }}
                >
                  {s.icon as ReactNode}
                </span>
              </button>
            </Liquid.Item>
          ))}
          <Liquid.Item className="as-pm-slot" transition={transition}>
            <button
              type="button"
              className="as-pm-btn as-pm-main"
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="as-pm-plus">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M10 4V16M4 10H16" />
                </svg>
              </span>
            </button>
          </Liquid.Item>
        </Liquid>
      </View>
    </Stage>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 200, height: 140 },
});
