'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const STEP = 0.5;
const HIDE_DELAY = 2500; // ms before controls auto-hide
const SWIPE_THRESHOLD = 45; // px to commit a swipe

const dist = (a: React.Touch, b: React.Touch) =>
  Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

// Image grid for the detail page with a click-to-zoom lightbox.
// `images` are already base-path-resolved by the server component.
export default function DetailGallery({ images }: { images: string[] }) {
  const [idx, setIdx] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [swipeX, setSwipeX] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const [dragging, setDragging] = useState(false);
  const n = images.length;

  const canPrev = idx !== null && idx > 0;
  const canNext = idx !== null && idx < n - 1;

  // Clamped navigation (no wrap-around).
  const goPrev = useCallback(() => setIdx((i) => (i === null || i <= 0 ? i : i - 1)), []);
  const goNext = useCallback(
    () => setIdx((i) => (i === null || i >= n - 1 ? i : i + 1)),
    [n],
  );

  // Auto-hide controls; any interaction re-shows them and resets the timer.
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const showUI = useCallback(() => {
    setUiVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setUiVisible(false), HIDE_DELAY);
  }, []);

  const resetView = useCallback(() => {
    setScale(1);
    setPanX(0);
    setPanY(0);
    setSwipeX(0);
    setAnimating(false);
  }, []);

  const open = (i: number) => {
    resetView();
    setIdx(i);
  };
  const close = () => setIdx(null);

  // Instant (non-swipe) navigation from arrows / dots / keyboard.
  const navPrev = () => {
    setSwipeX(0);
    setAnimating(false);
    showUI();
    goPrev();
  };
  const navNext = () => {
    setSwipeX(0);
    setAnimating(false);
    showUI();
    goNext();
  };

  const zoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    showUI();
    setAnimating(true);
    setScale((s) => Math.min(MAX_SCALE, +(s + STEP).toFixed(2)));
  };
  const zoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    showUI();
    setAnimating(true);
    setScale((s) => {
      const ns = Math.max(MIN_SCALE, +(s - STEP).toFixed(2));
      if (ns === MIN_SCALE) {
        setPanX(0);
        setPanY(0);
      }
      return ns;
    });
  };

  // Click-to-zoom: step in on each click until max, then a click resets to full.
  const onImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (suppressClick.current) {
      suppressClick.current = false; // this "click" ended a pan-drag
      return;
    }
    showUI();
    setAnimating(true);
    setScale((s) => {
      if (s >= MAX_SCALE) {
        setPanX(0);
        setPanY(0);
        return 1; // at max → reset to full
      }
      return Math.min(MAX_SCALE, +(s + STEP).toFixed(2));
    });
  };

  // Desktop panning of a zoomed image: drag with the mouse, or scroll/trackpad.
  const mouseDown = useRef(false);
  const mouseStart = useRef({ x: 0, y: 0 });
  const mousePanStart = useRef({ x: 0, y: 0 });
  const mouseMoved = useRef(false);
  const suppressClick = useRef(false);

  const onImageMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return; // nothing to pan; let the click zoom
    mouseDown.current = true;
    mouseStart.current = { x: e.clientX, y: e.clientY };
    mousePanStart.current = { x: panX, y: panY };
    mouseMoved.current = false;
    e.preventDefault(); // avoid the browser's image-drag ghost / text selection
  };

  const onLightboxMouseMove = (e: React.MouseEvent) => {
    showUI();
    if (!mouseDown.current) return;
    const dx = e.clientX - mouseStart.current.x;
    const dy = e.clientY - mouseStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) mouseMoved.current = true;
    const { x, y } = clampPan(mousePanStart.current.x + dx, mousePanStart.current.y + dy, scale);
    setAnimating(false);
    setDragging(true);
    setPanX(x);
    setPanY(y);
  };

  const onLightboxMouseUp = () => {
    if (!mouseDown.current) return;
    mouseDown.current = false;
    setDragging(false);
    if (mouseMoved.current) suppressClick.current = true; // it was a pan, not a click
  };

  const onLightboxWheel = (e: React.WheelEvent) => {
    if (scale <= 1) return;
    const { x, y } = clampPan(panX - e.deltaX, panY - e.deltaY, scale);
    setAnimating(false);
    setPanX(x);
    setPanY(y);
  };

  const clampPan = (x: number, y: number, s: number) => {
    const maxX = ((s - 1) * window.innerWidth) / 2;
    const maxY = ((s - 1) * window.innerHeight) / 2;
    return { x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) };
  };

  // Reset zoom whenever the shown image changes (swipeX is managed by handlers).
  useEffect(() => {
    setScale(1);
    setPanX(0);
    setPanY(0);
  }, [idx]);

  // Open lifecycle: key handling, scroll lock, initial control timer.
  useEffect(() => {
    if (idx === null) return;
    showUI();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') navPrev();
      else if (e.key === 'ArrowRight') navNext();
      else if (e.key === '+' || e.key === '=') zoomIn();
      else if (e.key === '-') zoomOut();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // --- Touch handling ---
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const panStart = useRef({ x: 0, y: 0 });
  const swiped = useRef(false); // suppress the tap that ends a gesture
  const multiTouch = useRef(false);
  const wasHidden = useRef(false);
  const pinchDist = useRef(0);
  const pinchScale = useRef(1);

  const onTouchStart = (e: React.TouchEvent) => {
    wasHidden.current = !uiVisible;
    showUI();
    if (e.touches.length > 1) {
      multiTouch.current = true;
      touchStart.current = null;
      pinchDist.current = dist(e.touches[0], e.touches[1]);
      pinchScale.current = scale;
      return;
    }
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    panStart.current = { x: panX, y: panY };
    swiped.current = false;
    multiTouch.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    // Pinch-to-zoom (allowed) — never navigates.
    if (e.touches.length > 1) {
      multiTouch.current = true;
      if (pinchDist.current > 0) {
        const ratio = dist(e.touches[0], e.touches[1]) / pinchDist.current;
        const ns = Math.max(MIN_SCALE, Math.min(MAX_SCALE, +(pinchScale.current * ratio).toFixed(3)));
        setAnimating(false);
        setScale(ns);
        if (ns === MIN_SCALE) {
          setPanX(0);
          setPanY(0);
        }
      }
      return;
    }
    if (!touchStart.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    if (scale > 1) {
      // Pan the zoomed image.
      const { x, y } = clampPan(panStart.current.x + dx, panStart.current.y + dy, scale);
      setAnimating(false);
      setPanX(x);
      setPanY(y);
    } else {
      // Follow the finger horizontally (swipe animation); resist at the ends.
      let mx = dx;
      if ((dx > 0 && !canPrev) || (dx < 0 && !canNext)) mx = dx * 0.3;
      setAnimating(false);
      setSwipeX(mx);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchStart.current;
    touchStart.current = null;
    if (multiTouch.current || scale > 1) {
      swiped.current = true; // pinch / pan: no navigation, suppress close
      return;
    }
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    setAnimating(true); // animate the settle / snap-back
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.2) {
      swiped.current = true;
      if (dx < 0 && canNext) {
        setSwipeX(0);
        goNext();
      } else if (dx > 0 && canPrev) {
        setSwipeX(0);
        goPrev();
      } else {
        setSwipeX(0); // at an end — snap back
      }
    } else {
      setSwipeX(0); // not far enough — snap back
    }
  };

  const onBackdropClick = () => {
    if (wasHidden.current) {
      wasHidden.current = false;
      swiped.current = false;
      return; // the tap only revealed the controls
    }
    if (swiped.current) {
      swiped.current = false;
      return; // ended a swipe / pinch / pan
    }
    close();
  };

  if (n === 0) return null;

  const transform =
    scale > 1
      ? `translate(${panX}px, ${panY}px) scale(${scale})`
      : `translateX(${swipeX}px)`;

  return (
    <>
      <div className="post-images detail-images">
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} loading="lazy" decoding="async" alt="" onClick={() => open(i)} />
        ))}
      </div>

      {idx !== null && (
        <div
          className={'lightbox open' + (uiVisible ? '' : ' ui-hidden')}
          onClick={onBackdropClick}
          onMouseMove={onLightboxMouseMove}
          onMouseUp={onLightboxMouseUp}
          onMouseLeave={onLightboxMouseUp}
          onWheel={onLightboxWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <button
            className="lightbox-close"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="Close"
          >
            ×
          </button>

          <div className="lightbox-zoom" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-zoom-btn" onClick={zoomOut} disabled={scale <= MIN_SCALE} aria-label="Zoom out">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>
            <button className="lightbox-zoom-btn" onClick={zoomIn} disabled={scale >= MAX_SCALE} aria-label="Zoom in">
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
                  navPrev();
                }}
                disabled={!canPrev}
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                className="lightbox-nav next"
                onClick={(e) => {
                  e.stopPropagation();
                  navNext();
                }}
                disabled={!canNext}
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
            draggable={false}
            onClick={onImageClick}
            onMouseDown={onImageMouseDown}
            style={{
              transform,
              transition: animating ? 'transform 0.22s ease' : 'none',
              cursor: dragging ? 'grabbing' : scale >= MAX_SCALE ? 'zoom-out' : 'zoom-in',
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
                  onClick={() => {
                    setSwipeX(0);
                    setAnimating(false);
                    showUI();
                    setIdx(i);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
