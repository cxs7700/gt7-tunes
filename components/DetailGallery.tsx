'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Image grid for the detail page with a click-to-zoom lightbox.
// `images` are already base-path-resolved by the server component.
export default function DetailGallery({ images }: { images: string[] }) {
  const [idx, setIdx] = useState<number | null>(null);
  const n = images.length;

  const prev = useCallback(() => setIdx((i) => (i === null ? i : (i - 1 + n) % n)), [n]);
  const next = useCallback(() => setIdx((i) => (i === null ? i : (i + 1) % n)), [n]);

  // Touch swipe (mobile): horizontal swipe navigates; the guard prevents the
  // swipe's trailing tap from closing the lightbox.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    swiped.current = false;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchStart.current;
    touchStart.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped.current = true;
      if (dx < 0) next();
      else prev();
    }
  };

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIdx(null);
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [idx, prev, next]);

  if (n === 0) return null;

  return (
    <>
      <div className="post-images detail-images">
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} loading="lazy" decoding="async" alt="" onClick={() => setIdx(i)} />
        ))}
      </div>

      {idx !== null && (
        <div
          className="lightbox open"
          onClick={() => {
            if (swiped.current) {
              swiped.current = false;
              return; // ignore the tap that ends a swipe
            }
            setIdx(null);
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button className="lightbox-close" onClick={() => setIdx(null)}>
            ×
          </button>
          {n > 1 && (
            <>
              <button
                className="lightbox-nav prev"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
              >
                ‹
              </button>
              <button
                className="lightbox-nav next"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
              >
                ›
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[idx]} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
