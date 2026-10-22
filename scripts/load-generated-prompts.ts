import { TRANSITIONS } from '../src/catalog';
import { promptFor } from '../src/agentPrompts';
import { copyTextFor, embedGooeyFont } from '../src/closedNetwork/previewSources';

export { copyTextFor, embedGooeyFont };

/** Prompts the template emits. Yogesh ids are empty here; their sheets live in public/prompts. */
export function generatedPrompts(): { id: string; prompt: string }[] {
  return TRANSITIONS.map((item) => ({ id: item.id, prompt: promptFor(item.id) }));
}

/** Skill files declared on the catalog, not a regex over catalog.ts. */
export function catalogSkills(): { id: string; path: string; name: string }[] {
  return TRANSITIONS.flatMap((item) =>
    item.skill ? [{ id: item.id, path: item.skill.path, name: item.skill.name }] : [],
  );
}
