/** @type {import('next').NextConfig} */

// Base path for GitHub Pages. Defaults to the project site path, but the PR
// preview workflow overrides it (e.g. /gt7-tunes/pr-preview/pr-42) so previews
// resolve their assets correctly. Keep BASE_PATH without a trailing slash.
const basePath = process.env.BASE_PATH ?? '/gt7-tunes';

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: {
    // No image optimization server exists in a static export.
    unoptimized: true,
  },
  // Expose the base path to the client for hand-built URLs (raw <img>, lightbox).
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
