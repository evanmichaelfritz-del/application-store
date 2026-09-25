export const GUIDE = '#9B5CFF';

export const SAMPLE_CONTROLS = [
  { id: 'plus', label: '+', kind: 'icon' },
  { id: 'auto', label: 'Auto', kind: 'short' },
  { id: 'amount', label: '5.5', kind: 'short' },
  { id: 'fast', label: 'Fast', kind: 'pill' },
  { id: 'quality', label: 'Quality', kind: 'pill' },
  { id: 'send', label: '↑', kind: 'send' },
] as const;

export const SWATCHES = ['#111111', '#ff383c', '#ff8d28', '#ffcc00', '#34c759', '#0088ff', '#6155f5'] as const;

export const INSTRUMENTS = [
  { id: 'pencil', label: 'Pencil' },
  { id: 'pen', label: 'Pen' },
  { id: 'fineliner', label: 'Fineliner' },
  { id: 'marker', label: 'Marker' },
  { id: 'highlighter', label: 'Highlighter' },
  { id: 'brush', label: 'Brush' },
  { id: 'fountain', label: 'Fountain' },
  { id: 'eraser', label: 'Eraser' },
] as const;

export type PenId = (typeof INSTRUMENTS)[number]['id'];

export type NoteTool = 'element' | 'box';

export type Chrome = {
  open: boolean;
  face: 'instruments' | 'palette';
  hand: 'draw' | 'annotate';
  noteTool: NoteTool;
  guides: boolean;
  pen: PenId;
  color: string;
  draftId: string | null;
  draftText: string;
  draftBox: Frame | null;
};

export const INITIAL_CHROME: Chrome = {
  open: true,
  face: 'instruments',
  hand: 'draw',
  noteTool: 'element',
  guides: false,
  pen: 'pencil',
  color: '#111111',
  draftId: null,
  draftText: '',
  draftBox: null,
};

export function toggleOpen(chrome: Chrome): Chrome {
  if (chrome.open) {
    return { ...chrome, open: false, face: 'instruments', draftId: null, draftText: '', draftBox: null };
  }
  return { ...chrome, open: true };
}

export function pickPen(chrome: Chrome, pen: PenId): Chrome {
  if (!chrome.open) return chrome;
  return { ...chrome, pen, face: 'instruments', hand: 'draw', draftId: null, draftText: '', draftBox: null };
}

export function toggleFace(chrome: Chrome): Chrome {
  if (!chrome.open || chrome.hand !== 'draw') return chrome;
  const face = chrome.face === 'palette' ? 'instruments' : 'palette';
  return { ...chrome, face, draftId: null, draftText: '', draftBox: null };
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
    noteTool: 'element',
    draftId: null,
    draftText: '',
    draftBox: null,
  };
}

export function pickNoteTool(chrome: Chrome, noteTool: NoteTool): Chrome {
  if (!chrome.open || chrome.hand !== 'annotate' || chrome.noteTool === noteTool) return chrome;
  return { ...chrome, noteTool, draftId: null, draftText: '', draftBox: null };
}

export function pickControl(chrome: Chrome, id: string): Chrome {
  if (!chrome.open || chrome.hand !== 'annotate' || chrome.noteTool !== 'element') return chrome;
  if (chrome.draftId === id && !chrome.draftBox) return chrome;
  return { ...chrome, draftId: id, draftText: '', draftBox: null };
}

export function setDraftBox(chrome: Chrome, draftBox: Frame): Chrome {
  if (!chrome.open || chrome.hand !== 'annotate' || chrome.noteTool !== 'box') return chrome;
  return { ...chrome, draftId: 'region', draftText: '', draftBox };
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

export const STAGE_HEIGHT = 520;

const DRAW: Record<
  PenId,
  {
    size: number;
    thinning: number;
    nibAngle?: number;
    nibContrast?: number;
    flat?: boolean;
    taper?: number;
    mode: 'ink' | 'graphite' | 'highlight' | 'erase';
  }
> = {
  pencil: { size: 1, thinning: 0.5, mode: 'graphite' },
  pen: { size: 6, thinning: 0.5, mode: 'ink' },
  fineliner: { size: 2, thinning: 0, mode: 'ink' },
  marker: { size: 18, thinning: 0.12, mode: 'ink' },
  highlighter: { size: 28, thinning: 0, flat: true, mode: 'highlight' },
  brush: { size: 14, thinning: 0.42, taper: 16, mode: 'ink' },
  fountain: { size: 8, thinning: 0.1, nibAngle: 45, nibContrast: 0.85, mode: 'ink' },
  eraser: { size: 28, thinning: 0, mode: 'erase' },
};

export function paintStrokes(ctx: CanvasRenderingContext2D, strokes: InkStroke[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (const stroke of strokes) paintStroke(ctx, stroke);
}

function paintStroke(ctx: CanvasRenderingContext2D, stroke: InkStroke) {
  const points = stroke.points;
  if (points.length < 2) return;
  const spec = DRAW[stroke.pen];
  ctx.save();
  if (spec.mode === 'erase') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000';
  } else if (spec.mode === 'highlight') {
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#fff01f';
  } else if (spec.mode === 'graphite') {
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#3a3a3a';
  } else {
    ctx.fillStyle = stroke.color;
  }
  for (const ring of strokeRings(points, spec)) fillRing(ctx, ring);
  ctx.restore();
}

function strokeRings(
  points: Point[],
  spec: { size: number; thinning: number; nibAngle?: number; nibContrast?: number; flat?: boolean; taper?: number },
): number[][][] {
  const nib = spec.size / 2;
  const radii: number[] = [];
  const lengths: number[] = [];
  let pressure = 0.7;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const next = points[i];
    const dist = Math.hypot(next.x - prev.x, next.y - prev.y) || 1;
    lengths.push(dist);
    pressure += (1 - Math.min(1, dist / 26) - pressure) * 0.45;
    let radius = nib * (1 - spec.thinning + spec.thinning * pressure);
    if (spec.nibContrast) {
      const angle = Math.atan2(next.y - prev.y, next.x - prev.x) - ((spec.nibAngle ?? 0) * Math.PI) / 180;
      radius *= 1 - spec.nibContrast * (1 - Math.abs(Math.sin(angle)));
    }
    radii.push(Math.max(0.35, radius));
  }
  if (spec.taper) {
    let walked = 0;
    for (let i = lengths.length - 1; i >= 0; i -= 1) {
      walked += lengths[i];
      const along = Math.min(1, walked / spec.taper);
      radii[i] *= 0.1 + 0.9 * Math.pow(along, 0.55);
    }
  }
  const rings: number[][][] = [];
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const next = points[i];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const r0 = radii[i - 1];
    const r1 = radii[Math.min(i, radii.length - 1)];
    rings.push([
      [prev.x + nx * r0, prev.y + ny * r0],
      [next.x + nx * r1, next.y + ny * r1],
      [next.x - nx * r1, next.y - ny * r1],
      [prev.x - nx * r0, prev.y - ny * r0],
    ]);
    if (!spec.flat) rings.push(disc(prev.x, prev.y, r0));
  }
  if (!spec.flat) {
    const last = points[points.length - 1];
    rings.push(disc(last.x, last.y, radii[radii.length - 1]));
  }
  return rings;
}

function disc(cx: number, cy: number, radius: number): number[][] {
  const ring: number[][] = [];
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2;
    ring.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  return ring;
}

function fillRing(ctx: CanvasRenderingContext2D, ring: number[][]) {
  ctx.beginPath();
  ctx.moveTo(ring[0][0], ring[0][1]);
  for (let i = 1; i < ring.length; i += 1) ctx.lineTo(ring[i][0], ring[i][1]);
  ctx.closePath();
  ctx.fill();
}
