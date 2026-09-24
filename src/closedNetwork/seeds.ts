/**
 * Closed-network recreation seeds for the Playground.
 * Each seed is a full HTML document — no npm / CDN.
 */
import { playgroundPreviewButtons } from '@/src/closedNetwork/previewSources';

export type PlaygroundSeed = {
  id: string;
  label: string;
  /** Full HTML document for iframe preview */
  html: string;
  /** Matching AGENT_PROMPT text */
  prompt: string;
};

export function playgroundSeeds(): PlaygroundSeed[] {
  const seen = new Set<string>();
  const seeds: PlaygroundSeed[] = [];
  for (const button of playgroundPreviewButtons()) {
    if (seen.has(button.id)) continue;
    seen.add(button.id);
    seeds.push({
      id: button.id,
      label: button.label,
      html: button.code,
      prompt: button.prompt,
    });
  }
  return seeds;
}
