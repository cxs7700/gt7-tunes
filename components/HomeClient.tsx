'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Post, SortMode } from '@/lib/types';
import { buildCategorized, orderedCategories } from '@/lib/categorize';
import { getFiltered } from '@/lib/filter';
import TuneGrid from './TuneGrid';

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

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [searchInput]);

  const filtered = useMemo(
    () => getFiltered(posts, { search, sort, activeFilters }, tagCategoryOf),
    [posts, search, sort, activeFilters, tagCategoryOf],
  );

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

      <TuneGrid posts={filtered} query={search} />
    </div>
  );
}
