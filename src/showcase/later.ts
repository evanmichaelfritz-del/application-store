/**
 * Every card has a showcase. The set stays so a later card can be held back
 * without a second button path.
 */
const LATER = new Set<string>();

export function showcaseLater(id: string): boolean {
  return LATER.has(id);
}
