import { TRANSITIONS } from '../src/catalog';
import { CANONICAL_IDS, promptFor } from '../src/agentPrompts';
import { copyTextFor, embedGooeyFont } from '../src/closedNetwork/previewSources';

export { CANONICAL_IDS, copyTextFor, embedGooeyFont };

/** Prompts the template emits. Yogesh ids are empty here; their sheets live in public/prompts. */
export function generatedPrompts(): { id: string; prompt: string }[] {
  return TRANSITIONS.map((item) => ({ id: item.id, prompt: promptFor(item.id) }));
}

type CatalogSkillRow = {
  id: string;
  name: string;
  path?: string;
  download?: { href: string; filename: string };
};

/** Skill files declared on the catalog, not a regex over catalog.ts. */
export function catalogSkills(): CatalogSkillRow[] {
  const skills: CatalogSkillRow[] = [];
  for (const item of TRANSITIONS) {
    const skill = item.skill;
    if (!skill) continue;
    if ('href' in skill) {
      skills.push({ id: item.id, name: skill.name, download: { href: skill.href, filename: skill.filename } });
    } else {
      skills.push({ id: item.id, name: skill.name, path: skill.path });
    }
  }
  return skills;
}
