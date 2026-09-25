export const GUIDE = '#9B5CFF';

export const SAMPLE_CONTROLS = [
  { id: 'plus', label: '+', kind: 'icon' },
  { id: 'auto', label: 'Auto', kind: 'short' },
  { id: 'amount', label: '5.5', kind: 'short' },
  { id: 'fast', label: 'Fast', kind: 'pill' },
  { id: 'quality', label: 'Quality', kind: 'pill' },
  { id: 'send', label: '↑', kind: 'send' },
] as const;

export const SWATCHES = ['#17181c', '#e5484d', '#f5a524', '#3b82f6', '#9B5CFF', '#12a150'] as const;

export type Mark =
  | { t: 'r'; x: number; y: number; w: number; h: number; rx?: number; fill?: string; stroke?: string; sw?: number }
  | { t: 'p'; d: string; fill?: string; stroke?: string; sw?: number }
  | { t: 'c'; cx: number; cy: number; r: number; fill: string };

export const INSTRUMENTS = [
  {
    id: 'pencil',
    label: 'Pencil',
    marks: [
      { t: 'r', x: 8, y: 1, w: 8, h: 6, rx: 1.5, fill: '#f3a0b2' },
      { t: 'r', x: 8, y: 7, w: 8, h: 3, fill: '#d5d5d8' },
      { t: 'r', x: 7, y: 10, w: 10, h: 16, rx: 1, fill: '#f0c14b' },
      { t: 'p', d: 'M7 26 L17 26 L12 34 Z', fill: '#e2b15a' },
      { t: 'p', d: 'M10.2 31.5 L13.8 31.5 L12 38 Z', fill: '#2c2c2c' },
    ],
  },
  {
    id: 'pen',
    label: 'Pen',
    marks: [
      { t: 'r', x: 9, y: 2, w: 6, h: 16, rx: 2, fill: '#1c1d22' },
      { t: 'r', x: 8.5, y: 17, w: 7, h: 4, rx: 1, fill: '#c8c8cc' },
      { t: 'p', d: 'M9 21 L15 21 L12 36 Z', fill: '#1c1d22' },
      { t: 'c', cx: 12, cy: 36.6, r: 1.15, fill: '#1c1d22' },
    ],
  },
  {
    id: 'brush',
    label: 'Brush',
    marks: [
      { t: 'r', x: 10, y: 1, w: 4, h: 15, rx: 1, fill: '#8a5a32' },
      { t: 'r', x: 8, y: 15, w: 8, h: 4, fill: '#c8c8cc' },
      { t: 'p', d: 'M8 19 C8 19 5 28 12 38 C19 28 16 19 16 19 Z', fill: '#242424' },
    ],
  },
  {
    id: 'fineliner',
    label: 'Fineliner',
    marks: [
      { t: 'r', x: 10.5, y: 2, w: 3, h: 22, rx: 1, fill: '#202228' },
      { t: 'p', d: 'M10.5 24 L13.5 24 L12 38 Z', fill: '#202228' },
    ],
  },
  {
    id: 'highlighter',
    label: 'Highlighter',
    marks: [
      { t: 'r', x: 6, y: 3, w: 12, h: 7, rx: 2, fill: '#f6d34d' },
      { t: 'r', x: 7, y: 10, w: 10, h: 14, rx: 1, fill: '#ffe56a' },
      { t: 'p', d: 'M7 24 L17 24 L17 33 L7 28 Z', fill: '#f0c83a' },
    ],
  },
  {
    id: 'fountain',
    label: 'Fountain',
    marks: [
      { t: 'r', x: 9, y: 2, w: 6, h: 15, rx: 3, fill: '#1a2744' },
      { t: 'r', x: 8, y: 16, w: 8, h: 3, fill: '#d4b483' },
      { t: 'p', d: 'M8 19 L16 19 L13.2 28 L12 37 L10.8 28 Z', fill: '#e4e7ee' },
      { t: 'r', x: 11.4, y: 22, w: 1.2, h: 11, fill: '#8b93a7' },
    ],
  },
  {
    id: 'eraser',
    label: 'Eraser',
    marks: [
      { t: 'r', x: 4, y: 14, w: 16, h: 12, rx: 3, fill: '#f3a0b2' },
      { t: 'r', x: 4, y: 14, w: 6, h: 12, rx: 3, fill: '#ececef' },
    ],
  },
] as const;

export type PenId = (typeof INSTRUMENTS)[number]['id'];

export type Chrome = {
  open: boolean;
  face: 'instruments' | 'palette';
  hand: 'draw' | 'annotate';
  guides: boolean;
  pen: PenId;
  color: string;
  draftId: string | null;
  draftText: string;
};

export const INITIAL_CHROME: Chrome = {
  open: false,
  face: 'instruments',
  hand: 'draw',
  guides: true,
  pen: 'pen',
  color: '#17181c',
  draftId: null,
  draftText: '',
};

export function toggleOpen(chrome: Chrome): Chrome {
  if (chrome.open) {
    return { ...chrome, open: false, face: 'instruments', draftId: null, draftText: '' };
  }
  return { ...chrome, open: true, face: 'instruments', hand: 'draw', draftId: null, draftText: '' };
}

export function pickPen(chrome: Chrome, pen: PenId): Chrome {
  if (!chrome.open) return chrome;
  return { ...chrome, pen, face: 'instruments', hand: 'draw', draftId: null, draftText: '' };
}

export function toggleFace(chrome: Chrome): Chrome {
  if (!chrome.open) return chrome;
  const face = chrome.face === 'palette' ? 'instruments' : 'palette';
  return { ...chrome, face, hand: 'draw', draftId: null, draftText: '' };
}

export function pickColor(chrome: Chrome, color: string): Chrome {
  if (!chrome.open) return chrome;
  return { ...chrome, color, face: 'instruments' };
}

export function toggleGuides(chrome: Chrome): Chrome {
  if (!chrome.open) return chrome;
  return { ...chrome, guides: !chrome.guides };
}

export function toggleAnnotate(chrome: Chrome): Chrome {
  if (!chrome.open) return chrome;
  const annotate = chrome.hand !== 'annotate';
  return {
    ...chrome,
    hand: annotate ? 'annotate' : 'draw',
    face: 'instruments',
    draftId: annotate ? chrome.draftId : null,
    draftText: annotate ? chrome.draftText : '',
  };
}

export function pickControl(chrome: Chrome, id: string): Chrome {
  if (!chrome.open || chrome.hand !== 'annotate') return chrome;
  if (chrome.draftId === id) return chrome;
  return { ...chrome, draftId: id, draftText: '' };
}

export function setDraftText(chrome: Chrome, draftText: string): Chrome {
  return { ...chrome, draftText };
}

export type Frame = { x: number; y: number; width: number; height: number };

export type GuideMark =
  | { kind: 'h'; y: number }
  | { kind: 'v'; x: number; top: number; height: number }
  | { kind: 'box'; frame: Frame };

export type Point = { x: number; y: number };

export type InkStroke = { pen: PenId; color: string; points: Point[] };

export type AgentNote = {
  label: string;
  selector: string;
  comment: string;
  box: Frame;
};

export function noteSelector(id: string): string {
  return `[data-note="${id}"]`;
}

export function guideMarks(frames: Frame[]): GuideMark[] {
  if (!frames.length) return [];
  const top = Math.min(...frames.map((frame) => frame.y));
  const bottom = Math.max(...frames.map((frame) => frame.y + frame.height));
  const horizontal = new Set<number>();
  const vertical = new Set<number>();
  for (const frame of frames) {
    horizontal.add(Math.round(frame.y));
    horizontal.add(Math.round(frame.y + frame.height / 2));
    horizontal.add(Math.round(frame.y + frame.height));
    vertical.add(Math.round(frame.x));
    vertical.add(Math.round(frame.x + frame.width / 2));
    vertical.add(Math.round(frame.x + frame.width));
  }
  const marks: GuideMark[] = [];
  for (const y of [...horizontal].sort((a, b) => a - b)) marks.push({ kind: 'h', y });
  for (const x of [...vertical].sort((a, b) => a - b)) {
    marks.push({ kind: 'v', x, top, height: Math.max(0, bottom - top) });
  }
  for (const frame of frames) marks.push({ kind: 'box', frame });
  return marks;
}

export function agentNotesMarkdown(notes: AgentNote[]): string {
  return notes
    .map((note, index) => {
      const box = note.box;
      return [
        `${index + 1}. ${note.label}`,
        `selector: ${note.selector}`,
        `note: ${note.comment}`,
        `box: ${box.x}, ${box.y}, ${box.width}, ${box.height}`,
      ].join('\n');
    })
    .join('\n\n');
}

export function marksSvg(marks: readonly Mark[], width = 20, height = 34): string {
  const body = marks
    .map((mark) => {
      if (mark.t === 'r') {
        const fill = mark.fill ?? 'none';
        const stroke = mark.stroke ? ` stroke="${mark.stroke}" stroke-width="${mark.sw ?? 1}"` : '';
        return `<rect x="${mark.x}" y="${mark.y}" width="${mark.w}" height="${mark.h}" rx="${mark.rx ?? 0}" fill="${fill}"${stroke}/>`;
      }
      if (mark.t === 'c') return `<circle cx="${mark.cx}" cy="${mark.cy}" r="${mark.r}" fill="${mark.fill}"/>`;
      const fill = mark.fill ?? 'none';
      const stroke = mark.stroke ? ` stroke="${mark.stroke}" stroke-width="${mark.sw ?? 1}"` : '';
      return `<path d="${mark.d}" fill="${fill}"${stroke}/>`;
    })
    .join('');
  return `<svg viewBox="0 0 24 40" width="${width}" height="${height}" aria-hidden="true">${body}</svg>`;
}

export const CHEVRON_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 9 L12 15 L18 9" fill="none" stroke="#17181c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const STAGE_HEIGHT = 460;

function hexAlpha(hex: string, alpha: number): string {
  const value = Number.parseInt(hex.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function paintStrokes(ctx: CanvasRenderingContext2D, strokes: InkStroke[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (const stroke of strokes) paintStroke(ctx, stroke);
}

function paintStroke(ctx: CanvasRenderingContext2D, stroke: InkStroke) {
  const points = stroke.points;
  if (points.length < 2) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (stroke.pen === 'eraser' || stroke.pen === 'highlighter' || stroke.pen === 'fineliner') {
    if (stroke.pen === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = 20;
    } else if (stroke.pen === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = hexAlpha(stroke.color, 0.38);
      ctx.lineWidth = 16;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 1.35;
    }
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
  } else {
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const next = points[i];
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (stroke.pen === 'fountain') {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = 0.6 + (Math.max(0, dy) / dist) * 5.5;
      } else if (stroke.pen === 'brush') {
        const speed = Math.min(1, dist / 22);
        ctx.strokeStyle = hexAlpha(stroke.color, 0.85);
        ctx.lineWidth = Math.max(1.8, 9 * (1 - speed * 0.78));
      } else if (stroke.pen === 'pencil') {
        const speed = Math.min(1, dist / 24);
        ctx.strokeStyle = '#4a4a4a';
        ctx.lineWidth = Math.max(0.45, 2.2 * (1 - speed * 0.75));
      } else {
        const speed = Math.min(1, dist / 28);
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = Math.max(0.7, 3.4 * (1 - speed * 0.72));
      }
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
    }
  }
  ctx.restore();
}
