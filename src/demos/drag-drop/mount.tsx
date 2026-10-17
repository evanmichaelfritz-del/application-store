import { createRoot } from 'react-dom/client';
import { PhysicsDropCard } from './card.web';

const root = document.getElementById('parity-root');
if (root) {
  root.style.width = '213px';
  createRoot(root).render(<PhysicsDropCard />);
}
