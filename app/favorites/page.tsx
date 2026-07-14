import type { Metadata } from 'next';
import { readPosts } from '@/lib/posts';
import FavoritesClient from '@/components/FavoritesClient';

export const metadata: Metadata = {
  title: 'Saved tunes',
  description: 'The GT7 tunes you have saved for quick access.',
};

// Server component: reads the full posts list at build time and hands it to the
// client component, which filters it down to the visitor's saved ids.
export default function FavoritesPage() {
  return <FavoritesClient posts={readPosts()} />;
}
