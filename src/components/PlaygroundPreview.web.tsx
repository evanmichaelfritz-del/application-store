import { createElement, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

/** Web-only iframe preview for closed-network HTML recreations. */
export function PlaygroundPreview({ html }: { html: string }) {
  const host = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    node.replaceChildren();
    const iframe = document.createElement('iframe');
    iframe.title = 'Playground preview';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.style.background = '#f9f9f9';
    iframe.srcdoc = html || '<!DOCTYPE html><html><body style="margin:0;display:grid;place-items:center;height:100vh;font:14px system-ui;color:#6c6c6c">Paste HTML and press Run</body></html>';
    node.appendChild(iframe);
  }, [html]);

  return (
    <View style={styles.wrap}>
      {createElement('div', {
        ref: host,
        style: { width: '100%', height: '100%' },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 320, borderRadius: 14, overflow: 'hidden' },
});
