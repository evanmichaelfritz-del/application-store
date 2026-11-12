import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { CatalogMedia as Media } from '@/src/catalog';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';

/** Poster files are fixed recordings. The ratio reserves the box before the image arrives. */
const ASPECT: Record<string, string> = {
  '/media/stageshow-poster.jpg': '1546 / 1080',
  '/media/spacing-tuner-poster.jpg': '1280 / 800',
  '/media/preview-tools-poster.jpg': '1280 / 800',
};

const shell: CSSProperties = {
  width: '100%',
  borderRadius: 14,
  overflow: 'hidden',
  background: '#f9f9f9',
  border: '1px solid rgba(0, 0, 0, 0.04)',
};

/**
 * Muted looping recording for a catalog entry.
 * The video element is not mounted until the frame nears the viewport, so a
 * below-the-fold card does not request the mp4 or compete for LCP.
 * Reduced motion, from the OS or the store switch, keeps the poster still.
 */
export function CatalogMedia({
  media,
  testID,
  stageID,
}: {
  media: Media;
  testID?: string;
  stageID?: string;
}) {
  const { reduceMotion } = useReduceMotion();
  const [system, setSystem] = useState(false);
  const [near, setNear] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const still = reduceMotion || system;
  const play = near && !still;
  const aspect = ASPECT[media.poster] ?? '16 / 10';
  const frame: CSSProperties = {
    display: 'block',
    width: '100%',
    maxHeight: 420,
    aspectRatio: aspect,
    objectFit: 'contain',
    background: '#f9f9f9',
  };

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setSystem(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver !== 'function') {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '160px 0px', threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!play) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const pending = video.play();
    if (pending) void pending.catch(() => undefined);
  }, [play]);

  return (
    <div ref={rootRef} data-testid={stageID ?? 'catalog-media'} style={shell}>
      {play ? (
        <video
          ref={videoRef}
          data-testid={testID ?? 'catalog-media-video'}
          src={media.mp4}
          poster={media.poster}
          muted
          loop
          autoPlay
          playsInline
          preload="none"
          aria-label={media.alt}
          style={frame}
        />
      ) : (
        <img
          data-testid={testID ?? 'catalog-media-still'}
          data-reduced={still ? '1' : undefined}
          src={media.poster}
          alt={media.alt}
          loading="lazy"
          decoding="async"
          style={frame}
        />
      )}
    </div>
  );
}
