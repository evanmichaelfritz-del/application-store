import { createRoot } from 'react-dom/client';
import { LiquidMetalCard } from './card.web';

const root = document.getElementById('parity-root');
if (root) {
  // Fill a narrow wrapper. Cap at the wide preview: 448 chat + 16px card padding each side + 12px stage padding each side.
  root.style.width = '100%';
  root.style.maxWidth = '504px';
  createRoot(root).render(<LiquidMetalCard />);
}
