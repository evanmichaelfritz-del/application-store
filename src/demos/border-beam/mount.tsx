import { createRoot } from 'react-dom/client';
import { BorderBeamCard } from './card.web';

const root = document.getElementById('parity-root');
if (root) createRoot(root).render(<BorderBeamCard />);
