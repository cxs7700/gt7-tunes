import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostById, readPosts } from '@/lib/posts';
import { withBasePath } from '@/lib/basePath';
import BackButton from '@/components/BackButton';
import DetailGallery from '@/components/DetailGallery';
import SpecChips from '@/components/SpecChips';
import FavoriteButton from '@/components/FavoriteButton';
import CompareButton from '@/components/CompareButton';
import ShareButton from '@/components/ShareButton';
import RelatedTunes from '@/components/RelatedTunes';
import { relatedPosts } from '@/lib/related';
import { absoluteUrl } from '@/lib/site';

export function generateStaticParams() {
  return readPosts().map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const post = getPostById(params.id);
  if (!post) return { title: 'Tune not found' };
  const description = post.body.replace(/\s+/g, ' ').trim().slice(0, 155);
  const cover = post.imageUrls[0];
  const image = absoluteUrl(cover ?? 'og-default.png');
  const url = absoluteUrl(`tune/${post.id}/`);
  return {
    title: post.title,
    description,
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url,
      images: [{ url: image, alt: post.title }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description, images: [image] },
    alternates: { canonical: url },
  };
}

export default function TunePage({ params }: { params: { id: string } }) {
  const post = getPostById(params.id);
  if (!post) notFound();

  const related = relatedPosts(post, readPosts());

  return (
    <main className="detail">
      <BackButton />

      <h1 className="detail-title">{post.title}</h1>

      <div className="detail-meta">
        <span className="post-date">{post.date}</span>
        <FavoriteButton id={post.id} className="detail-fav" />
        <CompareButton id={post.id} className="detail-fav" />
        <ShareButton title={post.title} />
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

      <RelatedTunes posts={related} />
    </main>
  );
}
