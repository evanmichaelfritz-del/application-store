const KEY = 'store.recent';
const MAX = 5;

export function readRecent(): string[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const ids: string[] = [];
    for (const item of parsed) {
      if (typeof item === 'string' && item.length > 0) ids.push(item);
    }
    return ids.slice(0, MAX);
  } catch {
    return [];
  }
}

export function rememberRecent(id: string) {
  if (typeof localStorage === 'undefined') return;
  const next = [id, ...readRecent().filter((item) => item !== id)].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode can reject the write. The palette still opens.
  }
}
