import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';

const SRC = '/media/stageshow-demo.mp4';
const POSTER = '/media/stageshow-poster.jpg';

const frame: CSSProperties = {
  display: 'block',
  width: '100%',
  maxHeight: 420,
  aspectRatio: '1546 / 1080',
  objectFit: 'contain',
  background: '#f9f9f9',
};

function systemReduced(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Looping recording of the skill. Reduced motion keeps the poster still. */
export function StageshowDemo() {
  const { reduceMotion } = useReduceMotion();
  const [system, setSystem] = useState(systemReduced);
  const still = reduceMotion || system;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setSystem(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (still) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const pending = video.play();
    if (pending) void pending.catch(() => undefined);
  }, [still]);

  return (
    <div
      data-testid="stageshow-stage"
      style={{
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
        background: '#f9f9f9',
        border: '1px solid rgba(0, 0, 0, 0.04)',
      }}
    >
      {still ? (
        <img data-testid="stageshow-demo" data-reduced="1" src={POSTER} alt="" style={frame} />
      ) : (
        <video
          ref={videoRef}
          data-testid="stageshow-demo"
          src={SRC}
          poster={POSTER}
          muted
          loop
          autoPlay
          playsInline
          style={frame}
        />
      )}
    </div>
  );
}
