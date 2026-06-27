import type { Post, ViewMode } from '@/lib/types';
import TuneCard from './TuneCard';

export default function TuneGrid({
  posts,
  query = '',
  view = 'detailed',
}: {
  posts: Post[];
  query?: string;
  view?: ViewMode;
}) {
  if (posts.length === 0) {
    return (
      <div className="posts-grid">
        <div className="no-results">No tunes match your filters.</div>
      </div>
    );
  }
  return (
    <div className={'posts-grid' + (view === 'compact' ? ' compact' : '')}>
      {posts.map((post) => (
        <TuneCard key={post.id} post={post} query={query} view={view} />
      ))}
    </div>
  );
}
