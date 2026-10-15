import { TRANSITIONS, type TransitionItem } from '@/src/catalog';
import { ADDED_ON } from '@/src/library/addedDates';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export const COLLAPSED_DAYS = 3;
export const COLLAPSED_ITEMS = 4;

export type AddedDay = {
  key: string;
  rail: string;
  detail: string;
  items: TransitionItem[];
};

type Stamp = { y: number; m: number; d: number };

function stampOf(label: string): Stamp | null {
  const match = /^([A-Za-z]+)\s+(\d+),\s+(\d+)$/.exec(label);
  if (!match) return null;
  const month = MONTHS.findIndex((name) => name === match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  if (month < 0 || !Number.isInteger(day) || !Number.isInteger(year)) return null;
  return { y: year, m: month + 1, d: day };
}

function daysBetween(stamp: Stamp, now: Date): number {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const then = Date.UTC(stamp.y, stamp.m - 1, stamp.d);
  return Math.round((today - then) / 86400000);
}

function railLabel(stamp: Stamp, now: Date): string {
  const base = `${MONTHS[stamp.m - 1]} ${stamp.d}`;
  if (stamp.y !== now.getFullYear()) return `${base}, ${stamp.y}`;
  return base;
}

function detailLabel(stamp: Stamp, now: Date): string {
  const days = daysBetween(stamp, now);
  if (days >= 14) return `${MONTHS[stamp.m - 1]} ${stamp.d}, ${stamp.y}`;
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

/** Newest day first. Within a day, catalog order. */
export function addedGroups(now = new Date()): AddedDay[] {
  const buckets = new Map<string, { stamp: Stamp; items: TransitionItem[] }>();
  for (const item of TRANSITIONS) {
    const label = ADDED_ON[item.id];
    if (!label) continue;
    const stamp = stampOf(label);
    if (!stamp) continue;
    const key = `${stamp.y}-${stamp.m}-${stamp.d}`;
    const bucket = buckets.get(key);
    if (bucket) bucket.items.push(item);
    else buckets.set(key, { stamp, items: [item] });
  }
  return [...buckets.values()]
    .sort((a, b) => b.stamp.y - a.stamp.y || b.stamp.m - a.stamp.m || b.stamp.d - a.stamp.d)
    .map((bucket) => ({
      key: `${bucket.stamp.y}-${bucket.stamp.m}-${bucket.stamp.d}`,
      rail: railLabel(bucket.stamp, now),
      detail: detailLabel(bucket.stamp, now),
      items: bucket.items,
    }));
}

/** Five newest assets: newest day first, catalog order inside the day. */
export function newestAssets(count: number): TransitionItem[] {
  const items: TransitionItem[] = [];
  for (const group of addedGroups()) {
    for (const item of group.items) {
      items.push(item);
      if (items.length >= count) return items;
    }
  }
  return items;
}
