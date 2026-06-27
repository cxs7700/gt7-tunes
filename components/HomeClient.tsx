'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Post, SortMode } from '@/lib/types';
import { buildCategorized, orderedCategories } from '@/lib/categorize';
import { getFiltered } from '@/lib/filter';
import { withBasePath } from '@/lib/basePath';

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts: React.ReactNode[] = [];
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  let i = 0;
  let key = 0;
  for (;;) {
    const found = lower.indexOf(q, i);
    if (found === -1) {
      parts.push(text.slice(i));
      break;
    }
    if (found > i) parts.push(text.slice(i, found));
    parts.push(<mark key={key++}>{text.slice(found, found + q.length)}</mark>);
    i = found + q.length;
  }
  return <>{parts}</>;
}

function PostBody({ body, query }: { body: string; query: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [clamped, setClamped] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el && !expanded && el.scrollHeight > 300) setClamped(true);
  }, [expanded, body]);

  return (
    <>
      <div
        ref={ref}
        className={'post-body' + (expanded ? ' expanded' : clamped ? ' clamped' : '')}
      >
        <Highlight text={body} query={query} />
      </div>
      {clamped && (
        <button
          className="expand-btn"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </>
  );
}

export default function HomeClient({ posts }: { posts: Post[] }) {
  const { categorized, tagCategoryOf } = useMemo(() => buildCategorized(posts), [posts]);
  const cats = useMemo(() => orderedCategories(categorized), [categorized]);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('newest');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(
    () => new Set(cats.slice(1)), // all collapsed except the first
  );
  const [lbIndex, setLbIndex] = useState<number | null>(null);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [searchInput]);

  const filtered = useMemo(
    () => getFiltered(posts, { search, sort, activeFilters }, tagCategoryOf),
    [posts, search, sort, activeFilters, tagCategoryOf],
  );

  // Flat image list + per-card offsets for lightbox navigation across visible images.
  const flatImages = useMemo(
    () => filtered.flatMap((p) => p.imageUrls.map((u) => withBasePath(u))),
    [filtered],
  );
  const offsets = useMemo(() => {
    let o = 0;
    return filtered.map((p) => {
      const start = o;
      o += p.imageUrls.length;
      return start;
    });
  }, [filtered]);

  // Lightbox keyboard nav
  useEffect(() => {
    if (lbIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLbIndex(null);
      else if (e.key === 'ArrowLeft') setLbIndex((i) => (i === null ? i : (i - 1 + flatImages.length) % flatImages.length));
      else if (e.key === 'ArrowRight') setLbIndex((i) => (i === null ? i : (i + 1) % flatImages.length));
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lbIndex, flatImages.length]);

  function toggleFilter(tag: string) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  function toggleCat(cat: string) {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function clearAll() {
    setActiveFilters(new Set());
    setSearchInput('');
    setSearch('');
  }

  const hasActive = activeFilters.size > 0 || search.length > 0;

  return (
    <div id="app" className="visible">
      <div className="toolbar">
        <div className="search-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            id="search"
            placeholder="Search car, track, setup…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="controls">
          <div className="sort-control">
            <label htmlFor="sort-select">Sort</label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
          {hasActive && (
            <button className="btn secondary" onClick={clearAll}>
              Clear
            </button>
          )}
        </div>
        <span className="stats">
          {filtered.length} of {posts.length} tunes
        </span>
      </div>

      <div className="filters">
        {cats.map((cat) => {
          const collapsed = collapsedCats.has(cat);
          const selInCat = categorized[cat].filter((t) => activeFilters.has(t.tag)).length;
          return (
            <div key={cat} className={'filter-group' + (collapsed ? ' collapsed' : '')}>
              <div className="filter-group-header" onClick={() => toggleCat(cat)}>
                <span className="label">{cat}</span>
                {selInCat > 0 && <span className="sel-count">{selInCat}</span>}
                <span className="filter-toggle" aria-hidden="true" />
              </div>
              <div className="filter-chips">
                {categorized[cat].map(({ tag, count }) => (
                  <button
                    key={tag}
                    className={'chip' + (activeFilters.has(tag) ? ' active' : '')}
                    onClick={() => toggleFilter(tag)}
                  >
                    {tag}
                    <span className="chip-count">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="posts-grid">
        {filtered.length === 0 ? (
          <div className="no-results">No tunes match your filters.</div>
        ) : (
          filtered.map((post, idx) => (
            <div className="post-card" key={post.id}>
              <div className="post-header">
                <div className="post-title">
                  <a href={post.url} target="_blank" rel="noopener noreferrer">
                    <Highlight text={post.title} query={search} />
                  </a>
                </div>
                <div className="post-date">{post.date}</div>
              </div>
              <PostBody body={post.body} query={search} />
              {post.tags.length > 0 && (
                <div className="post-tags">
                  {post.tags.map((t) => (
                    <span className="post-tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {post.imageUrls.length > 0 && (
                <div className="post-images">
                  {post.imageUrls.map((url, j) => (
                    <img
                      key={url}
                      src={withBasePath(url)}
                      loading="lazy"
                      alt=""
                      onClick={() => setLbIndex(offsets[idx] + j)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {lbIndex !== null && (
        <div className="lightbox open" onClick={() => setLbIndex(null)}>
          <button className="lightbox-close" onClick={() => setLbIndex(null)}>
            ×
          </button>
          <button
            className="lightbox-nav prev"
            onClick={(e) => {
              e.stopPropagation();
              setLbIndex((i) => (i === null ? i : (i - 1 + flatImages.length) % flatImages.length));
            }}
          >
            ‹
          </button>
          <button
            className="lightbox-nav next"
            onClick={(e) => {
              e.stopPropagation();
              setLbIndex((i) => (i === null ? i : (i + 1) % flatImages.length));
            }}
          >
            ›
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flatImages[lbIndex]} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
