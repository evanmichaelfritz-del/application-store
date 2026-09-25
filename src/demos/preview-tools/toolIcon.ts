import type { PenId } from './model';

const COLLAR = '#413e3a';

export function toolIconSvg(id: PenId, color: string, width = 30): string {
  const height = (width / 30) * 88;
  const uid = `${id}-${color.replace('#', '')}`;
  return `<svg width="${width}" height="${height}" viewBox="0 0 30 88" fill="none" aria-hidden="true">${defs(uid)}${body(id, color, uid)}</svg>`;
}

export const COLLAPSE_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#8a8a8e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.6 2.9v3.7H2.9"/><path d="M2.6 2.6 6.6 6.6"/><path d="M9.4 13.1V9.4h3.7"/><path d="M13.4 13.4 9.4 9.4"/></svg>`;

function defs(uid: string): string {
  return `<defs>
    <linearGradient id="b-${uid}" x1="0" x2="30" y1="0" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0.167" stop-color="#dcd8d2"/><stop offset="0.21" stop-color="#f6f4f1"/>
      <stop offset="0.33" stop-color="#ffffff"/><stop offset="0.44" stop-color="#fdfcfb"/>
      <stop offset="0.58" stop-color="#f8f6f3"/><stop offset="0.71" stop-color="#eceae5"/>
      <stop offset="0.765" stop-color="#dcd8d1"/><stop offset="0.805" stop-color="#e6e2dc"/>
      <stop offset="0.833" stop-color="#dcd8d2"/>
    </linearGradient>
    <linearGradient id="s-${uid}" x1="0" x2="30" y1="0" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0.167" stop-color="#000" stop-opacity="0.26"/>
      <stop offset="0.22" stop-color="#000" stop-opacity="0.03"/>
      <stop offset="0.33" stop-color="#fff" stop-opacity="0.22"/>
      <stop offset="0.44" stop-color="#fff" stop-opacity="0.06"/>
      <stop offset="0.58" stop-color="#000" stop-opacity="0"/>
      <stop offset="0.71" stop-color="#000" stop-opacity="0.12"/>
      <stop offset="0.765" stop-color="#000" stop-opacity="0.22"/>
      <stop offset="0.833" stop-color="#000" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="f-${uid}" x1="0" x2="30" y1="0" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0.167" stop-color="#ece8e2"/><stop offset="0.387" stop-color="#f8f6f2"/>
      <stop offset="0.388" stop-color="#fdfcfa"/><stop offset="0.613" stop-color="#f8f5f1"/>
      <stop offset="0.614" stop-color="#ebe7e0"/><stop offset="0.833" stop-color="#dad5cd"/>
    </linearGradient>
    <linearGradient id="m-${uid}" x1="0" x2="30" y1="0" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0.167" stop-color="#7d7a74"/><stop offset="0.24" stop-color="#cbc7c0"/>
      <stop offset="0.33" stop-color="#fdfdfc"/><stop offset="0.42" stop-color="#e2dfd9"/>
      <stop offset="0.58" stop-color="#b8b4ad"/><stop offset="0.71" stop-color="#8d8a84"/>
      <stop offset="0.765" stop-color="#6e6b66"/><stop offset="0.833" stop-color="#7d7a74"/>
    </linearGradient>
    <linearGradient id="g-${uid}" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#b08c2c"/><stop offset="0.12" stop-color="#e6c25c"/>
      <stop offset="0.24" stop-color="#fdf2c6"/><stop offset="0.36" stop-color="#f3da8c"/>
      <stop offset="0.56" stop-color="#e5c25f"/><stop offset="0.74" stop-color="#c39c33"/>
      <stop offset="0.88" stop-color="#a37f22"/><stop offset="1" stop-color="#997722"/>
    </linearGradient>
    <linearGradient id="r-${uid}" x1="0" x2="30" y1="0" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#d08b7c"/><stop offset="0.18" stop-color="#f3b8a8"/>
      <stop offset="0.46" stop-color="#f8ccbe"/><stop offset="0.78" stop-color="#e5a091"/>
      <stop offset="1" stop-color="#c9806f"/>
    </linearGradient>
  </defs>`;
}

function shade(d: string, fill: string, uid: string, rim = false): string {
  const edge = rim ? `<path d="${d}" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="0.4"/>` : '';
  return `<path d="${d}" fill="${fill}"/><path d="${d}" fill="url(#s-${uid})"/>${edge}`;
}

function barrel(uid: string, top = 31, facet = false): string {
  const d = `M5 ${top + 1.5}a1.5 1.5 0 0 1 1.5-1.5h17a1.5 1.5 0 0 1 1.5 1.5V88H5Z`;
  return `<path d="${d}" fill="url(#${facet ? 'f' : 'b'}-${uid})"/>`;
}

function band(uid: string, color: string, fixed = false): string {
  const d = 'M5 32.6h20v5H5Z';
  const klass = fixed ? '' : ' class="pt-ink"';
  const edge = `<path d="M5.3 32.9h19.4v4.4H5.3Z" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="0.4"/>`;
  return `<path${klass} d="${d}" fill="${color}"/><path d="${d}" fill="url(#s-${uid})"/>${edge}`;
}

function body(id: PenId, color: string, uid: string): string {
  if (id === 'pencil') {
    return [
      barrel(uid, 31, true),
      band(uid, color),
      `<path d="M5 32.6V30L15 4 11.6 32.6Z" fill="#ead6b2"/>`,
      `<path d="M11.6 32.6 15 4 18.4 32.6Z" fill="#f2e4c5"/>`,
      `<path d="M18.4 32.6 15 4 25 30V32.6Z" fill="#e1c79c"/>`,
      `<path class="pt-ink" d="M15 4 20.08 17.2H9.92Z" fill="${color}"/>`,
      `<path d="M10.6 17.2 15 4 13.17 17.2Z" fill="rgba(0,0,0,0.04)"/>`,
      `<path d="M16.83 17.2 15 4 19.4 17.2Z" fill="rgba(0,0,0,0.09)"/>`,
    ].join('');
  }
  if (id === 'pen') {
    return [barrel(uid), band(uid, color), shade('M15 4 19.4 25H10.6Z', color, uid, true).replace('<path d="M15 4 19.4 25H10.6Z"', '<path class="pt-ink" d="M15 4 19.4 25H10.6Z"'), shade(`M5 33.6V30L9.4 21.4h11.2L25 30V33.6Z`, COLLAR, uid)].join('');
  }
  if (id === 'fineliner') {
    return [
      barrel(uid),
      band(uid, color),
      shade(`M13.75 24V5.25a1.25 1.25 0 0 1 2.5 0V24Z`, color, uid, true).replace('<path d="M13.75', '<path class="pt-ink" d="M13.75'),
      shade('M11.6 24h6.8l1 3.4h-8.8Z', '#57534e', uid),
      shade(`M5 33.6V30L10.4 27h9.2L25 30V33.6Z`, COLLAR, uid),
    ].join('');
  }
  if (id === 'marker') {
    return [
      barrel(uid),
      band(uid, color),
      shade(`M10.6 25 11.5 6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2L19.4 25Z`, color, uid).replace('<path d="M10.6', '<path class="pt-ink" d="M10.6'),
      shade(`M5 33.6V30L9.6 22.6h10.8L25 30V33.6Z`, COLLAR, uid),
    ].join('');
  }
  if (id === 'highlighter') {
    return [
      barrel(uid),
      band(uid, '#fff01f', true),
      shade(`M8.4 24V12.6a1.2 1.2 0 0 1 .8-1.1l11.2-4.1a1.2 1.2 0 0 1 1.2 1.1V24Z`, '#fff01f', uid),
      shade(`M5 33.6V30L8.2 22h13.6L25 30V33.6Z`, COLLAR, uid),
    ].join('');
  }
  if (id === 'brush') {
    return [
      barrel(uid),
      band(uid, color),
      shade(`M15 4c2.4 4.6 4.9 9.4 5.6 13.6.6 3.4.2 6.2-.6 8.8H10c-.8-2.6-1.2-5.4-.6-8.8C10.1 13.4 12.6 8.6 15 4Z`, color, uid, true).replace('<path d="M15 4c', '<path class="pt-ink" d="M15 4c'),
      shade(`M5 32.6V26.6a1.4 1.4 0 0 1 1.4-1.4h17.2a1.4 1.4 0 0 1 1.4 1.4V32.6Z`, `url(#m-${uid})`, uid),
    ].join('');
  }
  if (id === 'fountain') {
    return [
      barrel(uid),
      band(uid, color),
      shade(`M11 25 11.7 11 15 4 18.3 11 19 25Z`, `url(#g-${uid})`, uid),
      `<path d="M14.64 8H15.36V13.75A1.3 1.3 0 1 1 14.64 13.75Z" fill="rgba(0,0,0,0.34)"/>`,
      shade(`M5 33.6V30L10.2 23.4h9.6L25 30V33.6Z`, COLLAR, uid),
    ].join('');
  }
  return [
    barrel(uid, 35),
    shade(`M6.8 9a4.8 4.8 0 0 1 4.8-4.8h6.8a4.8 4.8 0 0 1 4.8 4.8V34H6.8Z`, `url(#r-${uid})`, uid),
    shade(`M5 29h20v8.4H5Z`, `url(#m-${uid})`, uid),
  ].join('');
}
