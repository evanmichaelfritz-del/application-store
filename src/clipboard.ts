import * as Clipboard from 'expo-clipboard';

export function writeClipboard(text: string) {
  try {
    const nav = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
    if (nav?.writeText) void nav.writeText(text).catch(() => undefined);
  } catch {
    /* ignore */
  }
  void Clipboard.setStringAsync(text).catch(() => undefined);
}
