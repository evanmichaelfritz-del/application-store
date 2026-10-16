import { createRoot } from 'react-dom/client';
import { LiquidMetalCard } from './card.web';

const root = document.getElementById('parity-root');
if (root) createRoot(root).render(<LiquidMetalCard />);
