import { promptFor } from '@/src/agentPrompts';
import { copyTextFor } from '@/src/closedNetwork/previewSources';
import {
  loadPublicPrompt,
  loadYogeshOrbCreatorPrompt,
  loadYogeshThinkingOrbsPrompt,
} from '@/src/demos/yogesh-thinking-orbs/loadPrompt';

export type CodeKind = 'html' | 'css' | 'script';

/** One slot of the card's Copy HTML / Copy CSS / Copy script payload. */
export function codeSlot(id: string, kind: CodeKind): string {
  return copyTextFor(id, kind);
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
  return Promise.resolve(promptFor(id));
}

export function promptIsLazy(id: string): boolean {
  return id === 'yogesh-thinking-orbs' || id === 'yogesh-orb-creator' || id === 'border-beam' || id === 'liquid-metal' || id === 'gooey';
}

const PARITY_SCRIPT: Record<string, string> = {
  'border-beam': '/parity/border-beam.js',
  'liquid-metal': '/parity/liquid-metal.js',
  gooey: '/parity/gooey.js',
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

/** Prompt text already in the bundle. Lazy Yogesh prompts return null until fetched. */
export function readyPrompt(id: string): string | null {
  if (promptIsLazy(id)) return null;
  return promptFor(id);
}
