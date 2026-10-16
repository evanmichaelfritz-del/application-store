import { createRoot } from 'react-dom/client';
import { GooeyCard } from './card.web';

const root = document.getElementById('parity-root');
if (root) {
  // 420px melt stage + 16px card padding each side.
  root.style.width = '452px';
  createRoot(root).render(<GooeyCard />);
}
