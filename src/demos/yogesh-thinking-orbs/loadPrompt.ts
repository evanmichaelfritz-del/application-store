/** Lazy agent prompts. Each sheet fetches its file on open so the text stays out of the main bundle. */
const cache = new Map<string, Promise<string>>();

function fetchPrompt(url: string): Promise<string> {
  let pending = cache.get(url);
  if (!pending) {
    pending = fetch(url).then(async (res) => {
      if (!res.ok) throw new Error(`prompt ${res.status}`);
      const bytes = await res.arrayBuffer();
      return new TextDecoder('utf-8').decode(bytes);
    });
    cache.set(url, pending);
    pending.catch(() => {
      if (cache.get(url) === pending) cache.delete(url);
    });
  }
  return pending;
}

export function loadPublicPrompt(url: string): Promise<string> {
  return fetchPrompt(url);
}

/** Drop a failed fetch so the next read hits the network again. */
export function reloadPublicPrompt(url: string): Promise<string> {
  cache.delete(url);
  return fetchPrompt(url);
}

export const YOGESH_THINKING_ORBS_PROMPT_PATH = '/prompts/yogesh-thinking-orbs.md';
export const YOGESH_ORB_CREATOR_PROMPT_PATH = '/prompts/yogesh-orb-creator.md';

export function loadYogeshThinkingOrbsPrompt(): Promise<string> {
  return loadPublicPrompt(YOGESH_THINKING_ORBS_PROMPT_PATH);
}

export function loadYogeshOrbCreatorPrompt(): Promise<string> {
  return loadPublicPrompt(YOGESH_ORB_CREATOR_PROMPT_PATH);
}
