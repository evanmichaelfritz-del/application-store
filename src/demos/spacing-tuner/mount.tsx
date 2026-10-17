import { createRoot } from 'react-dom/client';
import SpacingTuner from './SpacingTuner';

const root = document.getElementById('parity-root');
if (root) {
  const raw = new URLSearchParams(location.search).get('t');
  const parsed = raw == null ? Number.NaN : Number(raw);
  const time = Number.isFinite(parsed) ? parsed : undefined;
  root.style.width = 'min(1440px, 100%)';
  root.style.aspectRatio = '1440 / 1080';
  createRoot(root).render(<SpacingTuner time={time} />);
}
