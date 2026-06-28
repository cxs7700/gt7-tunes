import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostById, readPosts } from '@/lib/posts';
import { withBasePath } from '@/lib/basePath';
import BackButton from '@/components/BackButton';
import DetailGallery from '@/components/DetailGallery';
import SpecChips from '@/components/SpecChips';
import FavoriteButton from '@/components/FavoriteButton';

export function generateStaticParams() {
  return readPosts().map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const post = getPostById(params.id);
  return { title: post ? `${post.title} — GT7 Tunes` : 'Tune not found — GT7 Tunes' };
}

export default function TunePage({ params }: { params: { id: string } }) {
  const post = getPostById(params.id);
  if (!post) notFound();

  return (
    <main className="detail">
      <BackButton />

      <h1 className="detail-title">{post.title}</h1>

      <div className="detail-meta">
        <span className="post-date">{post.date}</span>
        <FavoriteButton id={post.id} className="detail-fav" />
        <a className="btn secondary" href={post.url} target="_blank" rel="noopener noreferrer">
          Open on Patreon ↗
        </a>
      </div>

      <SpecChips post={post} />

      <div className="detail-body">{post.body}</div>

      {post.tags.length > 0 && (
        <div className="post-tags">
          {post.tags.map((t) => (
            <span className="post-tag" key={t}>
              {t}
            </span>
          ))}
        </div>
      )}

      <DetailGallery images={post.imageUrls.map(withBasePath)} />
    </main>
  );
}
