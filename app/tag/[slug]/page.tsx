import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { readPosts } from '@/lib/posts';
import { canonicalTags, slugifyTag, tagForSlug, postsForTag } from '@/lib/tags';
import TuneGrid from '@/components/TuneGrid';
import BackButton from '@/components/BackButton';

export function generateStaticParams() {
  return canonicalTags(readPosts()).map((t) => ({ slug: slugifyTag(t) }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tag = tagForSlug(readPosts(), params.slug);
  return { title: tag ? `${tag} tunes` : 'Tag not found' };
}

export default function TagPage({ params }: { params: { slug: string } }) {
  const posts = readPosts();
  const tag = tagForSlug(posts, params.slug);
  if (!tag) notFound();
  const matches = postsForTag(posts, tag);

  return (
    <main className="tag-page">
      <BackButton />
      <h1 className="tag-title">
        {tag}
        <span className="tag-count">
          {matches.length} tune{matches.length !== 1 ? 's' : ''}
        </span>
      </h1>
      <TuneGrid posts={matches} view="detailed" />
    </main>
  );
}
