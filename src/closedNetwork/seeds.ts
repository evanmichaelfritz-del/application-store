/**
 * Closed-network recreation seeds for the Playground.
 * Each seed is a full HTML document — no npm / CDN.
 */
import { GOOEY_PLUS_CLOSED_NETWORK_HTML } from './gooeyPlusMenu';
import { promptFor } from '@/src/agentPrompts';

export type PlaygroundSeed = {
  id: string;
  label: string;
  /** Full HTML document for iframe preview */
  html: string;
  /** Matching AGENT_PROMPT text */
  prompt: string;
};

export const PLAYGROUND_SEEDS: PlaygroundSeed[] = [
  {
    id: 'gooey-plus-menu',
    label: 'Gooey plus menu',
    html: GOOEY_PLUS_CLOSED_NETWORK_HTML,
    prompt: '', // filled lazily via promptFor to avoid circular init issues
  },
];

export function playgroundSeeds(): PlaygroundSeed[] {
  return PLAYGROUND_SEEDS.map((seed) => ({
    ...seed,
    prompt: seed.prompt || promptFor(seed.id),
  }));
}
