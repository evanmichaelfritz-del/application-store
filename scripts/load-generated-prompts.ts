import { TRANSITIONS } from '../src/catalog';
import { promptFor } from '../src/agentPrompts';

/** Prompts the template emits. Yogesh ids are empty here; their sheets live in public/prompts. */
export function generatedPrompts(): { id: string; prompt: string }[] {
  return TRANSITIONS.map((item) => ({ id: item.id, prompt: promptFor(item.id) }));
}
