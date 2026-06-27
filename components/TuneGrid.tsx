import type { Post } from '@/lib/types';
import TuneCard from './TuneCard';

export default function TuneGrid({ posts, query = '' }: { posts: Post[]; query?: string }) {
  if (posts.length === 0) {
    return (
      <div className="posts-grid">
        <div className="no-results">No tunes match your filters.</div>
      </div>
    );
  }
  return (
    <div className="posts-grid">
      {posts.map((post) => (
        <TuneCard key={post.id} post={post} query={query} />
      ))}
    </div>
  );
}
