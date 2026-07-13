import type { MetadataRoute } from 'next';
import { readPosts } from '@/lib/posts';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = readPosts();
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    ...posts.map((p) => ({
      url: `${SITE_URL}/tune/${p.id}/`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
