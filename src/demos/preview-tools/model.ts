export const GUIDE = '#9B5CFF';

export const SAMPLE_CONTROLS = [
  { id: 'plus', label: '+', kind: 'icon' },
  { id: 'auto', label: 'Auto', kind: 'short' },
  { id: 'amount', label: '5.5', kind: 'short' },
  { id: 'fast', label: 'Fast', kind: 'pill' },
  { id: 'quality', label: 'Quality', kind: 'pill' },
  { id: 'send', label: '↑', kind: 'send' },
] as const;

export type SampleControl = (typeof SAMPLE_CONTROLS)[number];

export const TOOL_MODES = [
  { id: 'guides', label: 'Guides' },
  { id: 'draw', label: 'Draw' },
  { id: 'note', label: 'Note' },
] as const;

export type ToolMode = (typeof TOOL_MODES)[number]['id'];

export const INK_TOOLS = [
  { id: 'pen', label: 'Pen' },
  { id: 'marker', label: 'Marker' },
  { id: 'eraser', label: 'Eraser' },
] as const;

export type InkTool = (typeof INK_TOOLS)[number]['id'];

export type Frame = { x: number; y: number; width: number; height: number };

export type GuideMark =
  | { kind: 'h'; y: number }
  | { kind: 'v'; x: number }
  | { kind: 'box'; frame: Frame };

export type Point = { x: number; y: number };

export type InkStroke = { tool: InkTool; points: Point[] };

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
  for (const x of [...vertical].sort((a, b) => a - b)) marks.push({ kind: 'v', x });
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
  if (stroke.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.lineWidth = 18;
    trace(ctx, points);
  } else if (stroke.tool === 'marker') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(255, 214, 10, 0.45)';
    ctx.lineWidth = 14;
    trace(ctx, points);
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#17181c';
    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const next = points[i];
      const speed = Math.hypot(next.x - prev.x, next.y - prev.y);
      ctx.lineWidth = Math.max(0.8, 3.2 * (1 - Math.min(1, speed / 28) * 0.7));
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function trace(ctx: CanvasRenderingContext2D, points: Point[]) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
  ctx.stroke();
}
