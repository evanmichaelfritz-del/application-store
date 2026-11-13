import { copyTextExact } from '@/src/clipboard';

/** Above this size the press saves a file instead of filling the clipboard. */
export const SHOWCASE_FILE_LIMIT = 2 * 1024 * 1024;

export type ShowcaseResult = 'copied' | 'saved';

function downloadShowcase(id: string, html: string) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${id}-showcase.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Build the showcase on press. The generator stays out of the entry chunk. */
export async function pressCopyShowcase(id: string): Promise<ShowcaseResult> {
  const { generateShowcase } = await import('./generate');
  const html = await generateShowcase(id, (path) =>
    fetch(path).then(async (res) => {
      if (!res.ok) throw new Error(`Missing ${path}`);
      return new Uint8Array(await res.arrayBuffer());
    }),
  );
  const bytes = new TextEncoder().encode(html).length;
  if (bytes > SHOWCASE_FILE_LIMIT) {
    downloadShowcase(id, html);
    return 'saved';
  }
  const copied = await copyTextExact(html);
  if (!copied) {
    downloadShowcase(id, html);
    return 'saved';
  }
  return 'copied';
}
