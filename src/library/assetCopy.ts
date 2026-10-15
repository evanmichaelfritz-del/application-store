import { promptFor } from '@/src/agentPrompts';
import { copyTextFor } from '@/src/closedNetwork/previewSources';
import {
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
  return Promise.resolve(promptFor(id));
}

export function promptIsLazy(id: string): boolean {
  return id === 'yogesh-thinking-orbs' || id === 'yogesh-orb-creator';
}

/** Prompt text already in the bundle. Lazy Yogesh prompts return null until fetched. */
export function readyPrompt(id: string): string | null {
  if (promptIsLazy(id)) return null;
  return promptFor(id);
}
