import type { ComponentType } from 'react';
import { CardResizeDemo } from './demos/CardResize';
import { NumberPopInDemo } from './demos/NumberPopIn';
import { NotificationBadgeDemo } from './demos/NotificationBadge';
import { TextStatesSwapDemo } from './demos/TextStatesSwap';
import { MenuDropdownDemo } from './demos/MenuDropdown';
import { ConfettiBurstDemo } from './demos/ConfettiBurst';
import { ModalDemo } from './demos/ModalOpenClose';
import { GooeyPlusMenuDemo } from './demos/GooeyPlusMenu';
import { PageSideBySideDemo } from './demos/PageSideBySide';
import { IconSwapDemo } from './demos/IconSwap';
import { SuccessCheckDemo } from './demos/SuccessCheck';
import { AvatarGroupDemo } from './demos/AvatarGroup';
import { CardStackHoverDemo } from './demos/CardStackHover';
import { ErrorShakeDemo } from './demos/ErrorShake';
import { InputClearDemo } from './demos/InputClear';
import { SkeletonRevealDemo } from './demos/SkeletonReveal';
import { TextsRevealDemo } from './demos/TextsReveal';
import { TabsSlidingDemo } from './demos/TabsSliding';
import { DragDropDemo } from './demos/DragDrop';
import { ShimmerTextDemo } from './demos/ShimmerText';
import { TooltipDemo } from './demos/Tooltip';
import { TiltCardDemo } from './demos/TiltCard';
import { BorderBeamDemo } from './demos/border-beam';
import { GooeyDemo } from './demos/gooey';
import { LiquidMetalDemo } from './demos/liquid-metal';
import { ThinkingOrbsDemo } from './demos/thinking-orbs';
import type { NavSection } from './sections';

/**
 * Add a piece: demo in src/demos → snippet in src/snippets.ts →
 * LOCKS[id] in src/agentPrompts.ts → push onto TRANSITIONS with `sections`.
 */

export type FilterKey = 'all' | 'essential' | 'ai' | 'effects' | 'texts' | 'pro';
export type Category = 'essential' | 'ai' | 'effects' | 'texts';

export type TransitionItem = {
  id: string;
  title: string;
  subtitle: string;
  categories: Category[];
  sections: NavSection[];
  pro: boolean;
  Demo: ComponentType;
};

export const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'essential', label: 'Essential' },
  { key: 'ai', label: 'AI Agents' },
  { key: 'effects', label: 'Effects' },
  { key: 'texts', label: 'Texts' },
  { key: 'pro', label: 'Pro' },
];

export const TRANSITIONS: TransitionItem[] = [
  {
    id: 'card-resize',
    title: 'Card resize',
    subtitle: 'Smooth card resize transition',
    categories: ['essential'],
    sections: ['transitions'],
    pro: false,
    Demo: CardResizeDemo,
  },
  {
    id: 'number-pop-in',
    title: 'Number pop-in',
    subtitle: 'Digit flip with blur and stagger',
    categories: ['texts'],
    sections: ['transitions'],
    pro: false,
    Demo: NumberPopInDemo,
  },
  {
    id: 'notification-badge',
    title: 'Notification badge',
    subtitle: 'Diagonal slide with spring pop-in',
    categories: ['essential'],
    sections: ['transitions'],
    pro: false,
    Demo: NotificationBadgeDemo,
  },
  {
    id: 'text-states-swap',
    title: 'Text states swap',
    subtitle: 'Text swap transition with blur',
    categories: ['essential'],
    sections: ['transitions'],
    pro: false,
    Demo: TextStatesSwapDemo,
  },
  {
    id: 'menu-dropdown',
    title: 'Menu dropdown',
    subtitle: 'Origin-aware open / close transition',
    categories: ['essential'],
    sections: ['transitions'],
    pro: false,
    Demo: MenuDropdownDemo,
  },
  {
    id: 'confetti-burst',
    title: 'Confetti burst',
    subtitle: 'Physics confetti lands on the button',
    categories: ['effects'],
    sections: ['effects'],
    pro: true,
    Demo: ConfettiBurstDemo,
  },
  {
    id: 'modal-open-close',
    title: 'Modal open/close',
    subtitle: 'Modal transition with scale',
    categories: ['essential'],
    sections: ['transitions'],
    pro: false,
    Demo: ModalDemo,
  },
  {
    id: 'gooey-plus-menu',
    title: 'Gooey plus menu',
    subtitle: 'Closed-network SVG goo plus menu',
    categories: ['effects'],
    sections: ['effects'],
    pro: true,
    Demo: GooeyPlusMenuDemo,
  },
  {
    id: 'page-side-by-side',
    title: 'Page side-by-side',
    subtitle: 'Forward / back page transition',
    categories: ['essential'],
    sections: ['transitions'],
    pro: false,
    Demo: PageSideBySideDemo,
  },
  {
    id: 'icon-swap',
    title: 'Icon swap',
    subtitle: 'Scale and blur icon swap',
    categories: ['essential'],
    sections: ['transitions'],
    pro: false,
    Demo: IconSwapDemo,
  },
  {
    id: 'success-check',
    title: 'Success check',
    subtitle: 'Success check with blur and rotate',
    categories: ['essential'],
    sections: ['transitions'],
    pro: false,
    Demo: SuccessCheckDemo,
  },
  {
    id: 'avatar-group-hover',
    title: 'Avatar group hover',
    subtitle: 'Distance-falloff lift with bouncy return',
    categories: ['effects'],
    sections: ['effects'],
    pro: false,
    Demo: AvatarGroupDemo,
  },
  {
    id: 'card-stack-hover',
    title: 'Card stack hover',
    subtitle: 'Stack fans out with a spring on hover',
    categories: ['effects'],
    sections: ['effects'],
    pro: true,
    Demo: CardStackHoverDemo,
  },
  {
    id: 'error-state-shake',
    title: 'Error state shake',
    subtitle: 'Cubic-bezier shake on error',
    categories: ['essential'],
    sections: ['transitions'],
    pro: false,
    Demo: ErrorShakeDemo,
  },
  {
    id: 'input-clear-dissolve',
    title: 'Input clear with dissolve',
    subtitle: 'Clear with per-word dissolve',
    categories: ['effects'],
    sections: ['effects'],
    pro: false,
    Demo: InputClearDemo,
  },
  {
    id: 'skeleton-reveal',
    title: 'Skeleton loader and reveal',
    subtitle: 'Pulse to content cross-fade',
    categories: ['essential'],
    sections: ['transitions'],
    pro: false,
    Demo: SkeletonRevealDemo,
  },
  {
    id: 'texts-reveal',
    title: 'Texts reveal',
    subtitle: 'Two lines rise with offset stagger',
    categories: ['texts'],
    sections: ['transitions'],
    pro: false,
    Demo: TextsRevealDemo,
  },
  {
    id: 'tabs-sliding',
    title: 'Tabs sliding',
    subtitle: 'Pill indicator follows the active tab',
    categories: ['essential'],
    sections: ['transitions'],
    pro: false,
    Demo: TabsSlidingDemo,
  },
  {
    id: 'drag-drop-physics',
    title: 'Drag & drop with physics',
    subtitle: 'Zone morphs into the image',
    categories: ['effects'],
    sections: ['effects'],
    pro: true,
    Demo: DragDropDemo,
  },
  {
    id: 'shimmer-text',
    title: 'Shimmer text',
    subtitle: 'Masked gradient sweep across text',
    categories: ['texts', 'ai'],
    sections: ['transitions', 'ai-skills'],
    pro: false,
    Demo: ShimmerTextDemo,
  },
  {
    id: 'tooltip-open-close',
    title: 'Tooltip open/close',
    subtitle: 'Delayed in, travels, instant out',
    categories: ['essential'],
    sections: ['transitions'],
    pro: false,
    Demo: TooltipDemo,
  },
  {
    id: 'tilt-3d',
    title: '3D tilt',
    subtitle: '3D pointer tilt with cursor glare',
    categories: ['effects'],
    sections: ['effects'],
    pro: false,
    Demo: TiltCardDemo,
  },
  {
    id: 'border-beam',
    title: 'Border Beam',
    subtitle: 'Animated border beam component',
    categories: ['effects'],
    sections: ['effects'],
    pro: false,
    Demo: BorderBeamDemo,
  },
  {
    id: 'thinking-orbs',
    title: 'Thinking orbs',
    subtitle: 'Animated thinking orb component',
    categories: ['effects', 'ai'],
    sections: ['effects', 'ai-skills'],
    pro: false,
    Demo: ThinkingOrbsDemo,
  },
  {
    id: 'gooey',
    title: 'Gooey',
    subtitle: 'Liquid effects for UI',
    categories: ['effects'],
    sections: ['effects'],
    pro: false,
    Demo: GooeyDemo,
  },
  {
    id: 'liquid-metal',
    title: 'Liquid metal',
    subtitle: 'Animated liquid metal border component',
    categories: ['effects'],
    sections: ['effects'],
    pro: false,
    Demo: LiquidMetalDemo,
  },
];

export function itemTags(item: TransitionItem): string[] {
  return item.pro ? [...item.categories, 'pro'] : [...item.categories];
}

export function matchesFilter(item: TransitionItem, key: FilterKey): boolean {
  if (key === 'all') return true;
  if (key === 'pro') return item.pro;
  return item.categories.includes(key);
}

export function matchesSearch(item: TransitionItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [item.title, item.subtitle, item.id, ...itemTags(item)].join(' ').toLowerCase();
  return haystack.includes(q);
}

export function matchesSection(item: TransitionItem, section: NavSection): boolean {
  return item.sections.includes(section);
}

export function countSection(section: NavSection): number {
  return TRANSITIONS.filter((item) => matchesSection(item, section)).length;
}
