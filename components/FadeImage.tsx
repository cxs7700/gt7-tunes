'use client';

import { useState } from 'react';

// A plain <img> that fades in once loaded (from the container's neutral
// placeholder), so thumbnails don't pop in on scroll. Cached images that are
// already complete on mount start visible (no flash). Under reduced motion the
// global rule drops the transition, so it simply appears.
type Props = React.ImgHTMLAttributes<HTMLImageElement>;

export default function FadeImage({ className = '', onLoad, ...props }: Props) {
  const [loaded, setLoaded] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={props.alt ?? ''}
      ref={(el) => {
        if (el?.complete && el.naturalWidth > 0 && !loaded) setLoaded(true);
      }}
      className={`fade-img${loaded ? ' loaded' : ''}${className ? ' ' + className : ''}`}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
    />
  );
}
