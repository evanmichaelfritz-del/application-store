import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { CatalogMedia as Media } from '@/src/catalog';
import { useReduceMotion } from '@/src/context/ReduceMotionContext';

const MAX_HEIGHT = 420;

/** Stageshow's stage slot: full width of the card, height following the clip, capped at 420. */
const stageShell: CSSProperties = {
  width: '100%',
  borderRadius: 14,
  overflow: 'hidden',
  background: '#f9f9f9',
  border: '1px solid rgba(0, 0, 0, 0.04)',
};

function stageFrame(aspect: string): CSSProperties {
  return {
    display: 'block',
    width: '100%',
    maxHeight: MAX_HEIGHT,
    aspectRatio: aspect,
    objectFit: 'contain',
    background: '#f9f9f9',
  };
}

/** Width of a clip whose height is the 420 cap. 16:10 is 672. */
function clipMaxWidth(aspect: string): number {
  const [w, h] = aspect.split('/').map((part) => Number(part.trim()));
  if (!Number.isFinite(w) || !Number.isFinite(h) || h === 0) return 672;
  return Math.round((MAX_HEIGHT * w) / h);
}

/** Walkthrough slot: the clip's own ratio, centred, never taller than 420. */
function clipShell(aspect: string): CSSProperties {
  const maxWidth = clipMaxWidth(aspect);
  return {
    position: 'relative',
    width: `min(100%, ${maxWidth}px)`,
    maxWidth,
    aspectRatio: aspect,
    maxHeight: MAX_HEIGHT,
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 14,
    overflow: 'hidden',
    boxSizing: 'border-box',
    background: '#f9f9f9',
    border: '1px solid rgba(0, 0, 0, 0.04)',
  };
}

const clipFrame: CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

/**
 * Muted looping recording for a catalog entry.
 * No video bytes until the frame intersects the viewport. The observer stays
 * connected: the clip pauses offscreen and plays again when it returns.
 * Reduced motion, from the OS or the store switch, keeps the poster still.
 */
export function CatalogMedia({
  media,
  testID,
  stageID,
  fill = false,
}: {
  media: Media;
  testID?: string;
  stageID?: string;
  /** Full-width stage slot. Walkthroughs leave this off and size to the clip. */
  fill?: boolean;
}) {
  const { reduceMotion } = useReduceMotion();
  const [system, setSystem] = useState(false);
  const [seen, setSeen] = useState(false);
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const still = reduceMotion || system;
  const showVideo = seen && !still;
  const shouldPlay = showVideo && visible;
  const frame = fill ? stageFrame(media.aspect) : clipFrame;

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
      setSeen(true);
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((entry) => entry.isIntersecting);
        setVisible(hit);
        if (hit) setSeen(true);
      },
      { rootMargin: '0px', threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!shouldPlay) {
      video.pause();
      return;
    }
    video.muted = true;
    const pending = video.play();
    if (pending) void pending.catch(() => undefined);
  }, [shouldPlay]);

  return (
    <div ref={rootRef} data-testid={stageID ?? 'catalog-media'} style={fill ? stageShell : clipShell(media.aspect)}>
      {showVideo ? (
        <video
          ref={videoRef}
          data-testid={testID ?? 'catalog-media-video'}
          src={media.mp4}
          poster={media.poster}
          muted
          loop
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
