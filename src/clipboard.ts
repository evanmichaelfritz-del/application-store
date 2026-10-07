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

/** Copy during the press, including from inside a modal focus trap. */
export function writeClipboardNow(text: string) {
  if (typeof document !== 'undefined') {
    const host = document.querySelector('[aria-modal="true"]') ?? document.body;
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '0';
    field.style.left = '-9999px';
    host.appendChild(field);
    field.focus();
    field.select();
    try {
      document.execCommand('copy');
    } catch {
      /* ignore */
    }
    host.removeChild(field);
  }
  try {
    const nav = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
    if (nav?.writeText) void nav.writeText(text).catch(() => undefined);
  } catch {
    /* ignore */
  }
}
