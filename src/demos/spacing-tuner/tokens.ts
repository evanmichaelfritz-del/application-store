// Spacing tuner — design tokens. Units are stage px: the stage is 1440 x 1080
// and 1 stage px equals 1 px of the 1440 x 1080 reference recording.

export const STAGE = { width: 1440, height: 1080 } as const;

/** Outer edge of the app window (border included). Inner area is 1312 x 824 at (64, 76). */
export const WINDOW = { x: 62, y: 74, width: 1316, height: 828, border: 2, radius: 30 } as const;
export const INNER = { width: 1312, height: 824 } as const;

export const COLORS = {
  page: '#F3F3F3',
  window: '#FFFFFF',
  windowBorder: '#DCDCDC',
  sidebar: '#FAFAFA',
  sidebarEdge: '#EEEEEE',
  navActiveBg: '#EDEDED',
  navInk: '#DADADA',
  navInkActive: '#D0D0D0',
  logo: '#9F9F9F',
  dark: '#A0A0A0',
  light: '#E0E0E0',
  bar: '#DFDFDF',
  card: '#FFFFFF',
  cardRing: '#EEEEEE',
  pillLight: '#DFDFDF',
  pillDark: '#181818',
  chip: '#FFFFFF',
  chipText: '#181818',
  iconGrey: '#DFDFDF',
  iconOutline: '#DDDDDD',
  iconInnerBorder: 'rgba(0,0,0,0.12)',
} as const;

export type VarKey = 'sidebar' | 'padding' | 'rowGap' | 'colGap' | 'cardPadding';

export interface SpacingVariable {
  key: VarKey;
  /** Accessible name only; the scene shows no text labels. */
  label: string;
  accent: string;
  from: number;
  to: number;
}

/** Order = animation order = chip order, left to right. */
export const VARIABLES: readonly SpacingVariable[] = [
  { key: 'sidebar', label: 'Sidebar width', accent: '#F14E8F', from: 184, to: 248 },
  { key: 'padding', label: 'Outer padding', accent: '#3F8CED', from: 20, to: 40 },
  { key: 'rowGap', label: 'Row gap', accent: '#A06EE8', from: 20, to: 48 },
  { key: 'colGap', label: 'Column gap', accent: '#23B375', from: 20, to: 12 },
  { key: 'cardPadding', label: 'Card padding', accent: '#EC8A28', from: 12, to: 24 },
] as const;

/** Overlay = accent colour at this opacity, drawn over the affected area. */
export const OVERLAY_ALPHA = 0.32;
/** Icon fill for the two "box" icons (padding, card padding). */
export const ICON_FILL_ALPHA = 0.35;

/** Fixed content sizes (stage px). */
export const SIZES = {
  headerH: 36,
  titleBar: { w: 176, h: 16 },
  lightPill: { w: 96, h: 36 },
  darkPill: { w: 112, h: 36 },
  headerPillGap: 8,
  sectionLabelW: [104, 136] as const,
  sectionLabelH: 12,
  sectionRight: { w: 52, h: 10 },
  labelToCard: 12,
  statLabelW: [64, 80, 56, 72] as const,
  statValueW: [100, 116, 92, 108] as const,
  statInnerH: 86,
  miniHeights: [12, 17, 14, 21, 19, 24, 20, 26, 22, 28, 24] as const,
  chartTitle: { w: 120, h: 10 },
  chartPill: { w: 80, h: 28 },
  chartHeadGap: 16,
  chartBarGap: 12,
  chartPct: [37.6, 51.6, 43.6, 65.3, 57.5, 73.3, 61.4, 80.2, 69.4, 87.2, 75.3, 93.1] as const,
  listTitleW: 96,
  listLineW: [96, 72, 108, 84, 64, 90] as const,
  navLineW: [92, 68, 84, 60, 76, 88] as const,
  cardRadius: 10,
  ring: 2,
} as const;

/** Chip (status pill) geometry. */
export const CHIPS = {
  top: 943,
  height: 58,
  gap: 24,
  padL: 18,
  padR: 23,
  icon: 36,
  iconGap: 18,
  fontSize: 28,
  /** Each digit sits in a fixed 17px cell so chip widths do not depend on the font. */
  digitW: 17,
  ring: 3,
} as const;
