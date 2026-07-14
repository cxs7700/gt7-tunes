import type { Metadata } from 'next';
import Link from 'next/link';
import { readPosts } from '@/lib/posts';
import { buildCategorized, orderedCategories } from '@/lib/categorize';
import { slugifyTag } from '@/lib/tags';

export const metadata: Metadata = { title: 'Explore tunes' };

// A hub that makes the per-tag pages discoverable: every tag, grouped by
// category, with its count, linking to /tag/<slug>.
export default function BrowsePage() {
  const posts = readPosts();
  const { categorized } = buildCategorized(posts);
  const cats = orderedCategories(categorized);

  return (
    <main className="browse-page">
      <h1 className="browse-title">Explore tunes</h1>
      {cats.map((cat) => (
        <section className="browse-section" key={cat}>
          <h2 className="browse-heading">{cat}</h2>
          <div className="browse-chips">
            {categorized[cat].map(({ tag, count }) => (
              <Link className="browse-chip" href={`/tag/${slugifyTag(tag)}`} key={tag}>
                {tag}
                <span className="browse-chip-count">{count}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
