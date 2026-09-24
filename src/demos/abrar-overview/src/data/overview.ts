import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

export type IonName = ComponentProps<typeof Ionicons>['name'];

/**
 * DESIGN_LOCK numbers and labels for the Overview screen.
 * Inferred values are marked on the field that introduces them.
 */

export type CampaignFilter = 'all' | 'active' | 'needs';

export const filters: { id: CampaignFilter; label: string; dot?: boolean }[] = [
  { id: 'all', label: 'All campaigns' },
  { id: 'active', label: 'Active' },
  { id: 'needs', label: 'Needs action', dot: true },
];

export const actionCards: {
  id: string;
  label: string;
  icon: IonName;
  tile: string;
  value: string;
  unit: string;
  note: string;
  action: string;
  actionKind: 'black' | 'outline';
}[] = [
  {
    id: 'spend',
    label: 'Available to spend',
    icon: 'wallet-outline',
    tile: '#3B6FD6',
    value: '$14.00',
    unit: '',
    note: 'Covers 0 of 22 pending approvals.',
    action: 'Add funds',
    actionKind: 'black',
  },
  {
    id: 'content',
    label: 'Content awaiting approval',
    icon: 'image-outline',
    tile: '#E39B4A',
    value: '07',
    unit: 'assets',
    note: '2 are due to post today',
    action: 'Open queue',
    actionKind: 'outline',
  },
  {
    id: 'applications',
    label: 'Applications to review',
    icon: 'people-outline',
    tile: '#2A9D8F',
    value: '22',
    unit: 'creators',
    note: '4 have waited more than 3 days',
    action: 'Open queue',
    actionKind: 'outline',
  },
];

export type DeltaTone = 'up' | 'down' | 'flat';

export const kpis: {
  id: string;
  label: string;
  icon: IonName;
  value: string;
  delta: string;
  tone: DeltaTone;
  /** Right-aligned "vs …" baseline. Attributed revenue and Cost per post have none. */
  baseline?: string;
}[] = [
  {
    id: 'revenue',
    label: 'Attributed revenue',
    icon: 'trending-up-outline',
    value: '$18,420',
    delta: '+34%',
    tone: 'up',
  },
  {
    id: 'ros',
    label: 'Return on spend',
    icon: 'swap-horizontal-outline',
    value: '2.7×',
    delta: '−0.4',
    tone: 'down',
    baseline: 'vs 3.1×',
  },
  {
    id: 'live',
    label: 'Live posts',
    icon: 'radio-outline',
    value: '59',
    delta: '+1',
    tone: 'up',
    baseline: 'vs 58',
  },
  {
    id: 'cost',
    // INFERRED: the label is truncated in every source crop.
    // DESIGN_LOCK names "Cost per post" as the only inferred word.
    label: 'Cost per post',
    icon: 'pricetag-outline',
    value: '$142',
    delta: 'No change',
    tone: 'flat',
  },
];

/**
 * Pointy-top hex rows. B blue, O orange, T teal, P purple.
 * g = empty grey-200 cell (DESIGN_LOCK). . = outside the field, not drawn.
 * Grey cells are the two-cell halo around the coloured cluster.
 */
export const hexRows = [
  '........gggggg.........',
  '......gggggggggg.......',
  '....gggggBBBBggggg.....',
  '...ggggBBBBBBBBgggg....',
  '..gggBBBBBBOPOOBOggg...',
  '.gggBBBBBBBOOOOOBBgg...',
  '.ggBBBBBTTTPOOOOBOggg..',
  '.ggBBBBTTOPPPPOOOBBgg..',
  '..ggBBBTTPPPPPOOOBBgg..',
  '..ggBBBTTTgPPPOOOBgg...',
  '..ggBBTTTPPPTTOOBBgg...',
  '..ggBBBBTTTPTOOBBBgg...',
  '...ggBBBBBBBTTBBBBgg...',
  '...gggBBBBBBBBBBBBgg...',
  '....gggBBBBBBBOBgggg...',
  '.....gggBBBBBBggggg....',
  '......ggggggggggg......',
  '.......gggggggg........',
];

export const hexLegend = [
  { name: 'Stir in strength', swatch: 'B' as const, percent: '51%', amount: '$3,420', direction: 'up' as const },
  { name: 'Healthier every day', swatch: 'O' as const, percent: '28%', amount: '$1,880', direction: 'up' as const },
  { name: 'Iron boost Q3', swatch: 'T' as const, percent: '12%', amount: '$840', direction: 'down' as const },
  // No percent chip — DESIGN_LOCK.
  { name: 'Ambassador program', swatch: 'P' as const, percent: null, amount: '$610', direction: 'up' as const },
];

export const hexTotal = '$6,750';

/**
 * Daily bar heights for Jun 6 through Jul 20 (45 columns).
 * Locked labels stay $18,420 and $614 avg/day. Day amounts are not printed
 * in the source, so this fixed series — built from a seeded trend plus
 * day-to-day noise, not Math.random at render — sums to 18420 and rises
 * from early June into late July. The same noise is scaled around a $200
 * floor so the shortest columns sit near that axis line.
 */
export const revenueByDay: readonly number[] = [
  222, 216, 200, 243, 238, 247, 225, 226, 245, 273, 296, 326, 308, 347, 294, 346,
  308, 376, 395, 400, 345, 427, 369, 447, 460, 386, 439, 479, 491, 500, 435, 460,
  481, 481, 551, 497, 567, 592, 605, 568, 621, 641, 658, 589, 600,
];

/** Only the tick labels that are legible in root-2 / root-card. */
export const revenueXTicks: { label: string; day: number }[] = [
  { label: 'Jun 6', day: 0 },
  { label: 'Jul 13', day: 37 },
  { label: 'Jul 20', day: 44 },
];
export const revenueYLabels = ['$1000', '$750', '$500', '$250', '$0'] as const;

/** Square fills about 80% of its cell; the remaining gap is a hairline between columns. */
export const REVENUE_SQUARE = 4;
export const REVENUE_GAP = 1;
export const REVENUE_PITCH = REVENUE_SQUARE + REVENUE_GAP;
export const REVENUE_ROWS = 40;

export type RevenueSquare = { x: number; y: number };

/** Precomputed once from the locked series. Not rebuilt during render. */
export const revenueSquares: RevenueSquare[] = revenueByDay.flatMap((value, day) => {
  const count = Math.max(1, Math.round((value / 1000) * REVENUE_ROWS));
  const squares: RevenueSquare[] = [];
  for (let i = 0; i < count; i += 1) {
    squares.push({
      x: day * REVENUE_PITCH + REVENUE_GAP / 2,
      y: (REVENUE_ROWS - 1 - i) * REVENUE_PITCH + REVENUE_GAP / 2,
    });
  }
  return squares;
});

export const revenuePlotWidth = revenueByDay.length * REVENUE_PITCH;
export const revenuePlotHeight = REVENUE_ROWS * REVENUE_PITCH;

export type CampaignRow = {
  id: string;
  letter: string;
  tile: string;
  name: string;
  status: string;
  statusTone: 'active' | 'stalled';
  waitingCount: string;
  waitingNote: string;
  livePosts: string;
  liveNote: string;
  budgetUsed: number | null;
  revenue: string;
  /** Legible crop delta. Iron boost has none. */
  revenueDelta: string | null;
};

export const campaigns: CampaignRow[] = [
  {
    id: 'stir',
    letter: 'S',
    tile: '#2A9D8F',
    name: 'Stir in strength',
    status: 'Active · day 41',
    statusTone: 'active',
    waitingCount: '22 creators',
    waitingNote: '4 waiting over 5 days',
    livePosts: '40',
    liveNote: '12 this week',
    budgetUsed: 96,
    revenue: '$12,180',
    revenueDelta: '+18%',
  },
  {
    id: 'healthier',
    letter: 'H',
    tile: '#F27A86',
    name: 'Healthier every day',
    status: 'Active · day 189',
    statusTone: 'active',
    waitingCount: '4 creators',
    waitingNote: 'all within 48h target',
    livePosts: '10',
    liveNote: '3 this week',
    budgetUsed: 31,
    revenue: '$4,120',
    // Legible in the root-2 crop (DESIGN_LOCK: use the delta that can be read).
    revenueDelta: '+6%',
  },
  {
    id: 'iron',
    letter: 'I',
    tile: '#8B7FE0',
    name: 'Iron boost Q3',
    status: 'Stalled',
    statusTone: 'stalled',
    // INFERRED: metric cells are not visible in the source. Muted em dashes.
    waitingCount: '—',
    waitingNote: '',
    livePosts: '—',
    liveNote: '',
    budgetUsed: null,
    revenue: '—',
    revenueDelta: null,
  },
];

export const sidebar = {
  workspace: 'Creator',
  workspaceSub: 'Brand workspace',
  messagesBadge: 3,
  creatorsCount: 49,
  setupStep: 2,
  setupTotal: 4,
} as const;
