'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const STEP = 0.5;

// Image grid for the detail page with a click-to-zoom lightbox.
// `images` are already base-path-resolved by the server component.
export default function DetailGallery({ images }: { images: string[] }) {
  const [idx, setIdx] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const n = images.length;

  const prev = useCallback(() => setIdx((i) => (i === null ? i : (i - 1 + n) % n)), [n]);
  const next = useCallback(() => setIdx((i) => (i === null ? i : (i + 1) % n)), [n]);

  // Reset zoom/pan whenever the shown image changes (incl. open/close).
  useEffect(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setDragging(false);
  }, [idx]);

  const zoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((s) => Math.min(MAX_SCALE, +(s + STEP).toFixed(2)));
  };
  const zoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((s) => {
      const ns = Math.max(MIN_SCALE, +(s - STEP).toFixed(2));
      if (ns === MIN_SCALE) setOffset({ x: 0, y: 0 });
      return ns;
    });
  };

  const clampOffset = (x: number, y: number, s: number) => {
    const maxX = ((s - 1) * window.innerWidth) / 2;
    const maxY = ((s - 1) * window.innerHeight) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  // Touch handling. A pinch (or any multi-touch gesture) is never treated as a
  // swipe. When zoomed in, a one-finger drag pans instead of navigating.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const panStart = useRef({ x: 0, y: 0 });
  const swiped = useRef(false);
  const multiTouch = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 1) {
      multiTouch.current = true; // pinch: ignore for nav
      touchStart.current = null;
      return;
    }
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    panStart.current = offset;
    swiped.current = false;
    multiTouch.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 1) {
      multiTouch.current = true;
      return;
    }
    if (scale > 1 && touchStart.current) {
      const t = e.touches[0];
      setDragging(true);
      setOffset(
        clampOffset(
          panStart.current.x + (t.clientX - touchStart.current.x),
          panStart.current.y + (t.clientY - touchStart.current.y),
          scale,
        ),
      );
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchStart.current;
    touchStart.current = null;
    // Pinch or zoomed pan: suppress the trailing tap and never navigate.
    if (multiTouch.current || scale > 1) {
      swiped.current = true;
      setDragging(false);
      return;
    }
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
      else if (e.key === '+' || e.key === '=') zoomIn();
      else if (e.key === '-') zoomOut();
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
              return; // ignore the tap that ends a swipe/pinch/pan
            }
            setIdx(null);
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <button className="lightbox-close" onClick={() => setIdx(null)} aria-label="Close">
            ×
          </button>

          <div className="lightbox-zoom" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-zoom-btn"
              onClick={zoomOut}
              disabled={scale <= MIN_SCALE}
              aria-label="Zoom out"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>
            <button
              className="lightbox-zoom-btn"
              onClick={zoomIn}
              disabled={scale >= MAX_SCALE}
              aria-label="Zoom in"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
                <line x1="11" y1="8" x2="11" y2="14" />
              </svg>
            </button>
          </div>

          {n > 1 && (
            <>
              <button
                className="lightbox-nav prev"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                className="lightbox-nav next"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[idx]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transition: dragging ? 'none' : 'transform 0.18s ease',
              cursor: scale > 1 ? 'grab' : 'zoom-out',
            }}
          />
          {n > 1 && (
            <div className="lightbox-dots" onClick={(e) => e.stopPropagation()}>
              {images.map((_, i) => (
                <button
                  key={i}
                  className={'lb-dot' + (i === idx ? ' active' : '')}
                  aria-label={`Go to image ${i + 1} of ${n}`}
                  aria-current={i === idx}
                  onClick={() => setIdx(i)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
