import { createRoot } from 'react-dom/client';
import { OpenBotAvatarStage } from './Stage';

const root = document.getElementById('oba-root');
if (root) createRoot(root).render(<OpenBotAvatarStage />);
