import { createRoot } from 'react-dom/client';
import { GlisseStage } from './Stage';

const root = document.getElementById('glisse-root');
if (root) createRoot(root).render(<GlisseStage />);
