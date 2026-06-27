'use client';

import { useEffect } from 'react';
import { BASE_PATH } from '@/lib/basePath';

// Registers the image-caching service worker at the app's base path. The SW file
// is served from /<basePath>/sw.js and scoped to /<basePath>/ so it controls the
// whole app (and so its cache keys match the base-path'd image URLs).
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const scope = `${BASE_PATH}/`;
    navigator.serviceWorker.register(`${BASE_PATH}/sw.js`, { scope }).catch(() => {
      /* registration failed; images simply won't be cached */
    });
  }, []);
  return null;
}
