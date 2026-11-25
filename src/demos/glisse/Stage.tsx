import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Glass, SegmentedControl, Slider, Switch, TabBar } from './vendor';
import { CARD_CSS } from './cardCss';
import { BOOKS, COMPASS, HOUSE, RADIO } from './icons';
import { WALLPAPER } from './wallpaper';

const TABS = [
  { value: 'home', label: 'Home', icon: HOUSE },
  { value: 'browse', label: 'Browse', icon: COMPASS },
  { value: 'radio', label: 'Radio', icon: RADIO },
  { value: 'library', label: 'Library', icon: BOOKS },
];

const RANGES = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

function places(step: number): number {
  return (String(step).split('.')[1] ?? '').length;
}

function knobText(value: number, step: number): string {
  return value.toFixed(places(step));
}

function useCardCss(): void {
  useEffect(() => {
    if (document.getElementById('glisse-card-css')) return;
    const style = document.createElement('style');
    style.id = 'glisse-card-css';
    style.textContent = CARD_CSS;
    document.head.appendChild(style);
  }, []);
}

/** Mouse-drag and wheel, matching the docs scroller: the glass stays put. */
function useWallpaperDrag(scrollerRef: { current: HTMLDivElement | null }): void {
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const place = () => {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
      el.scrollTop = el.scrollHeight * 0.3;
    };
    place();
    const img = el.querySelector('img');
    img?.addEventListener('load', place);
    let drag: { id: number; x: number; y: number; left: number; top: number } | null = null;
    const down = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: el.scrollLeft, top: el.scrollTop };
      el.setPointerCapture(event.pointerId);
      el.dataset.dragging = '';
    };
    const move = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      el.scrollLeft = drag.left - (event.clientX - drag.x);
      el.scrollTop = drag.top - (event.clientY - drag.y);
    };
    const up = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      drag = null;
      delete el.dataset.dragging;
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      const unit =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 40
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? el.clientHeight
            : 1;
      const dx = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
      const dy = event.shiftKey && !event.deltaX ? 0 : event.deltaY;
      el.scrollLeft += dx * unit;
      el.scrollTop += dy * unit;
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', wheel, { passive: false });
    return () => {
      img?.removeEventListener('load', place);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('wheel', wheel);
    };
  }, [scrollerRef]);
}

function Volume({
  label,
  aria,
  value,
  onChange,
  step = 1,
  disabled = false,
}: {
  label: string;
  aria: string;
  value: number;
  onChange?: (value: number) => void;
  step?: number;
  disabled?: boolean;
}) {
  return (
    <label className="glisse-slider-label">
      <span>{label}</span>
      <Slider aria-label={aria} value={value} onValueChange={onChange} step={step} disabled={disabled} />
    </label>
  );
}

function Knob({
  label,
  min,
  max,
  step,
  value,
  unit,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="glisse-knob">
      <span>{label}</span>
      <Slider aria-label={label} min={min} max={max} step={step} value={value} onValueChange={onChange} />
      <span>
        {knobText(value, step)}
        {unit ?? ''}
      </span>
    </label>
  );
}

/**
 * Wallpaper you can drag, with Kelvin's controls on the glass.
 * The knobs write the Glass custom properties his docs expose.
 */
export function GlisseStage({ credit = null }: { credit?: ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState('radio');
  const [range, setRange] = useState('week');
  const [volume, setVolume] = useState(40);
  const [stepped, setStepped] = useState(40);
  const [wifi, setWifi] = useState(true);
  const [bend, setBend] = useState(0.45);
  const [dispersion, setDispersion] = useState(0.4);
  const [blur, setBlur] = useState(0);
  const [rim, setRim] = useState(0.13);
  useCardCss();
  useWallpaperDrag(scrollerRef);

  const lensStyle: CSSProperties & Record<`--lg-${string}`, string> = {
    width: 210,
    height: 120,
    borderRadius: 75,
    backgroundColor: 'transparent',
    '--lg-glass-bend': String(bend),
    '--lg-glass-dispersion': String(dispersion),
    '--lg-blur': `${blur}px`,
    '--lg-rim-shine': String(rim),
  };

  return (
    <div id="glisse" className="glisse" data-theme="dark" data-testid="glisse">
      <div className="glisse-scroller" ref={scrollerRef} data-testid="glisse-wallpaper">
        <div className="glisse-wall" data-glisse-backdrop="true">
          <img src={WALLPAPER} alt="" width={1300} height={1300} draggable={false} />
        </div>
      </div>
      <div className="glisse-overlay">
        <Glass className="glisse-lens" style={lensStyle} aria-hidden />
        <TabBar aria-label="Library" items={TABS} value={tab} onValueChange={setTab} />
        <SegmentedControl aria-label="Range" items={RANGES} value={range} onValueChange={setRange} />
        <div className="glisse-sliders">
          <Volume label="Continuous" aria="Volume" value={volume} onChange={setVolume} />
          <Volume label="Stepped" aria="Stepped volume" value={stepped} onChange={setStepped} step={10} />
          <Volume label="Disabled" aria="Disabled volume" value={40} disabled />
        </div>
        <div className="glisse-switch-row">
          <span>Wi-Fi</span>
          <Switch aria-label="Wi-Fi" checked={wifi} onCheckedChange={setWifi} />
        </div>
      </div>
      <div className="glisse-dock">
        <Knob label="Bend" min={0} max={1} step={0.01} value={bend} onChange={setBend} />
        <Knob label="Dispersion" min={0} max={2} step={0.05} value={dispersion} onChange={setDispersion} />
        <Knob label="Frost" min={0} max={12} step={0.5} value={blur} unit="px" onChange={setBlur} />
        <Knob label="Rim" min={0} max={1} step={0.01} value={rim} onChange={setRim} />
      </div>
      {credit}
    </div>
  );
}
