// GitHub Pages serves this project under a base path (e.g. /gt7-tunes). next/link
// and next/image prepend it automatically, but raw <img> src values and any
// hand-built URLs do NOT — route those through withBasePath().
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function withBasePath(src: string): string {
  if (!src) return src;
  if (/^https?:\/\//i.test(src) || src.startsWith('data:')) return src;
  const clean = src.replace(/^\//, '');
  return `${BASE_PATH}/${clean}`;
}
