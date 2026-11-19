/**
 * Original scene, inlined so the card never requests a wallpaper.
 * Kelvin's docs use macOS Tahoe photos that are not in the MIT repo.
 */
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1300" height="1300" viewBox="0 0 1300 1300">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#14225c"/>
<stop offset="0.42" stop-color="#c44b78"/>
<stop offset="0.7" stop-color="#f29a4a"/>
<stop offset="1" stop-color="#f8d7a4"/>
</linearGradient>
<linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#f0b56b"/>
<stop offset="0.35" stop-color="#5a6cb8"/>
<stop offset="1" stop-color="#101833"/>
</linearGradient>
<radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#fff6df"/>
<stop offset="0.35" stop-color="#ffd27a"/>
<stop offset="1" stop-color="#ff8a3d" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="1300" height="1300" fill="url(#sky)"/>
<circle cx="880" cy="420" r="240" fill="url(#sun)"/>
<circle cx="880" cy="420" r="64" fill="#fff4d2"/>
<circle cx="250" cy="280" r="96" fill="#ff4d6d"/>
<circle cx="390" cy="210" r="52" fill="#3dfff2"/>
<circle cx="160" cy="430" r="36" fill="#ffe14a"/>
<path d="M0 760C240 620 400 700 580 750C790 810 940 680 1300 750V1300H0Z" fill="#2a3868"/>
<path d="M0 840C280 740 500 900 740 830C990 760 1120 900 1300 850V1300H0Z" fill="#1a2448"/>
<rect y="900" width="1300" height="400" fill="url(#lake)"/>
<text x="650" y="500" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="84" font-weight="700">Liquid</text>
<text x="650" y="588" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="84" font-weight="700">Glass</text>
</svg>`;

export const WALLPAPER = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(SVG)}`;
