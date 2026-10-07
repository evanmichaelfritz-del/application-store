/** Lazy agent prompts. Each sheet fetches its file on open so the text stays out of the main bundle. */
const cache = new Map<string, Promise<string>>();

export function loadPublicPrompt(url: string): Promise<string> {
  let pending = cache.get(url);
  if (!pending) {
    pending = fetch(url).then(async (res) => {
      if (!res.ok) throw new Error(`prompt ${res.status}`);
      const bytes = await res.arrayBuffer();
      return new TextDecoder('utf-8').decode(bytes);
    });
    cache.set(url, pending);
  }
  return pending;
}

export const YOGESH_THINKING_ORBS_PROMPT_PATH = '/prompts/yogesh-thinking-orbs.md';
export const YOGESH_ORB_CREATOR_PROMPT_PATH = '/prompts/yogesh-orb-creator.md';

export function loadYogeshThinkingOrbsPrompt(): Promise<string> {
  return loadPublicPrompt(YOGESH_THINKING_ORBS_PROMPT_PATH);
}

export function loadYogeshOrbCreatorPrompt(): Promise<string> {
  return loadPublicPrompt(YOGESH_ORB_CREATOR_PROMPT_PATH);
}
