'use client';

import { useEffect, useState } from 'react';

// Image grid for the detail page with a click-to-zoom lightbox.
// `images` are already base-path-resolved by the server component.
export default function DetailGallery({ images }: { images: string[] }) {
  const [idx, setIdx] = useState<number | null>(null);

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIdx(null);
      else if (e.key === 'ArrowLeft') setIdx((i) => (i === null ? i : (i - 1 + images.length) % images.length));
      else if (e.key === 'ArrowRight') setIdx((i) => (i === null ? i : (i + 1) % images.length));
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [idx, images.length]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="post-images detail-images">
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} loading="lazy" decoding="async" alt="" onClick={() => setIdx(i)} />
        ))}
      </div>

      {idx !== null && (
        <div className="lightbox open" onClick={() => setIdx(null)}>
          <button className="lightbox-close" onClick={() => setIdx(null)}>
            ×
          </button>
          {images.length > 1 && (
            <>
              <button
                className="lightbox-nav prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx((i) => (i === null ? i : (i - 1 + images.length) % images.length));
                }}
              >
                ‹
              </button>
              <button
                className="lightbox-nav next"
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx((i) => (i === null ? i : (i + 1) % images.length));
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
