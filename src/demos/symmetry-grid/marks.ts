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

export type Frame = { x: number; y: number; width: number; height: number };

export type GuideMark =
  | { kind: 'h'; y: number }
  | { kind: 'v'; x: number }
  | { kind: 'box'; frame: Frame };

function round(value: number): number {
  return Math.round(value);
}

export function guideMarks(frames: Frame[]): GuideMark[] {
  const horizontal = new Set<number>();
  const vertical = new Set<number>();
  for (const frame of frames) {
    horizontal.add(round(frame.y));
    horizontal.add(round(frame.y + frame.height / 2));
    horizontal.add(round(frame.y + frame.height));
    vertical.add(round(frame.x));
    vertical.add(round(frame.x + frame.width / 2));
    vertical.add(round(frame.x + frame.width));
  }
  const marks: GuideMark[] = [];
  for (const y of [...horizontal].sort((a, b) => a - b)) marks.push({ kind: 'h', y });
  for (const x of [...vertical].sort((a, b) => a - b)) marks.push({ kind: 'v', x });
  for (const frame of frames) marks.push({ kind: 'box', frame });
  return marks;
}
