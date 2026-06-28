'use client';

import { useEffect, useRef, useState } from 'react';
import { withBasePath } from '@/lib/basePath';

// Renders the site logo from /public/logo.svg if present, otherwise falls back
// to the "GT7 Tunes" wordmark. Drop a logo.svg into public/ to use a custom logo.
export default function BrandLogo() {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // The image can 404 before React hydrates (so the onError event is missed) —
  // check the already-loaded state on mount too.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) {
    return (
      <>
        <span className="brand-mark">GT7</span>
        <span className="brand-name">Tunes</span>
      </>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      className="brand-logo"
      src={withBasePath('logo.svg')}
      alt="GT7 Tunes"
      onError={() => setFailed(true)}
    />
  );
}
