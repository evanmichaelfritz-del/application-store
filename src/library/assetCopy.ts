import { promptFor } from '@/src/agentPrompts';
import { TRANSITIONS } from '@/src/catalog';
import { copyTextFor, embedGooeyFont, prefetchGooeyFont } from '@/src/closedNetwork/previewSources';
import {
  loadPublicPrompt,
  loadYogeshOrbCreatorPrompt,
  loadYogeshThinkingOrbsPrompt,
  reloadPublicPrompt,
} from '@/src/demos/yogesh-thinking-orbs/loadPrompt';

export type CodeKind = 'html' | 'css' | 'script';

/** One slot of the card's Copy HTML / Copy CSS / Copy script payload. */
export function codeSlot(id: string, kind: CodeKind): string {
  return copyTextFor(id, kind);
}

/** Copy CSS, with the Gooey face filled in when this copy is built. */
export function loadCopyCss(id: string): Promise<string> {
  return embedGooeyFont(copyTextFor(id, 'css'));
}

/** Warm the Gooey face chunk on Copy hover, focus, or the Styles tab. */
export function prefetchCopyCss(id: string): void {
  prefetchGooeyFont(copyTextFor(id, 'css'));
}

/**
 * Agent prompt for this asset only.
 * Yogesh assets read public/prompts; every other asset reads promptFor.
 */
export function loadAssetPrompt(id: string): Promise<string> {
  if (id === 'yogesh-thinking-orbs') return loadYogeshThinkingOrbsPrompt();
  if (id === 'yogesh-orb-creator') return loadYogeshOrbCreatorPrompt();
  if (id === 'border-beam') return loadPublicPrompt('/prompts/border-beam.md');
  if (id === 'liquid-metal') return loadPublicPrompt('/prompts/liquid-metal.md');
  if (id === 'gooey') return loadPublicPrompt('/prompts/gooey.md');
  if (id === 'drag-drop-physics') return loadPublicPrompt('/prompts/drag-drop-physics.md');
  if (id === 'spacing-tuner') return loadPublicPrompt('/prompts/spacing-tuner.md');
  return Promise.resolve(promptFor(id));
}

export function promptIsLazy(id: string): boolean {
  return (
    id === 'yogesh-thinking-orbs' ||
    id === 'yogesh-orb-creator' ||
    id === 'border-beam' ||
    id === 'liquid-metal' ||
    id === 'gooey' ||
    id === 'drag-drop-physics' ||
    id === 'spacing-tuner'
  );
}

const PARITY_SCRIPT: Record<string, string> = {
  'border-beam': '/parity/border-beam.js',
  'liquid-metal': '/parity/liquid-metal.js',
  gooey: '/parity/gooey.js',
  'drag-drop-physics': '/parity/drag-drop-physics.js',
  'spacing-tuner': '/parity/spacing-tuner.js',
};

/** The runnable component is a public file. The preview iframe only carries a loader. */
export function scriptIsLazy(id: string): boolean {
  return id in PARITY_SCRIPT;
}

export function loadCopyScript(id: string): Promise<string> {
  const url = PARITY_SCRIPT[id];
  if (!url) return Promise.resolve(copyTextFor(id, 'script'));
  return loadPublicPrompt(url);
}

export function skillFor(id: string): { path: string; name: string } | null {
  const skill = TRANSITIONS.find((item) => item.id === id)?.skill;
  return skill ?? null;
}

/** Skill markdown served from public/. Empty when this asset has no skill. */
export function loadSkill(id: string): Promise<string> {
  const skill = skillFor(id);
  if (!skill) return Promise.resolve('');
  return loadPublicPrompt(`/${skill.path}`);
}

/** Fetch the skill again after a failed load. */
export function reloadSkill(id: string): Promise<string> {
  const skill = skillFor(id);
  if (!skill) return Promise.resolve('');
  return reloadPublicPrompt(`/${skill.path}`);
}

/** Prompt text already in the bundle. Lazy Yogesh prompts return null until fetched. */
export function readyPrompt(id: string): string | null {
  if (promptIsLazy(id)) return null;
  return promptFor(id);
}
