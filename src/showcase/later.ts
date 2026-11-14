/**
 * Yogesh Thinking Orbs and Orb Creator are the next pull request.
 * Their live cards stay as they are. The showcase button is disabled and
 * reads Later, so this pull request does not build a file for them.
 */
const LATER = new Set(['yogesh-thinking-orbs', 'yogesh-orb-creator']);

export function showcaseLater(id: string): boolean {
  return LATER.has(id);
}
