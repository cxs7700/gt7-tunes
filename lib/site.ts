import { BASE_PATH } from './basePath';

// Absolute site URL for metadata (Open Graph, sitemap, robots). Composed from
// the production origin + the current build's base path, so the deploy build
// yields the real URL and PR previews yield their own.
export const SITE_ORIGIN = 'https://cxs7700.github.io';
export const SITE_URL = `${SITE_ORIGIN}${BASE_PATH}`;

export function absoluteUrl(path: string): string {
  return `${SITE_URL}/${path.replace(/^\//, '')}`;
}
