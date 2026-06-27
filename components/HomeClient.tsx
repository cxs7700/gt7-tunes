'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Post, SortMode } from '@/lib/types';
import { buildCategorized, orderedCategories } from '@/lib/categorize';
import { getFiltered } from '@/lib/filter';
import { decodeState, encodeState, SCROLL_KEY } from '@/lib/urlState';
import TuneGrid from './TuneGrid';
import FilterModal from './FilterModal';

function readInitial() {
  if (typeof window === 'undefined') return { search: '', sort: 'newest' as SortMode, filters: [] as string[] };
  return decodeState(window.location.search);
}

export default function HomeClient({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const { categorized, tagCategoryOf } = useMemo(() => buildCategorized(posts), [posts]);
  const cats = useMemo(() => orderedCategories(categorized), [categorized]);

  // Initialize synchronously from the URL so the very first client paint shows
  // the correct (filtered) layout — essential for accurate scroll restoration.
  const [init] = useState(readInitial);
  const [searchInput, setSearchInput] = useState(init.search);
  const [search, setSearch] = useState(init.search);
  const [sort, setSort] = useState<SortMode>(init.sort);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(init.filters));
  const [modalOpen, setModalOpen] = useState(false);

  // Render nothing until mounted so the (state-independent) server HTML and the
  // first client render match — then we render the URL-derived state in one go.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    setMounted(true);
  }, []);

  // Once the list is on screen, restore the saved scroll position (retry across
  // frames until the page is tall enough for the target to stick).
  useEffect(() => {
    if (!mounted) return;
    const saved = parseInt(sessionStorage.getItem(SCROLL_KEY) || '0', 10);
    if (saved <= 0) return;
    let tries = 0;
    const tick = () => {
      window.scrollTo(0, saved);
      if (Math.abs(window.scrollY - saved) > 2 && tries++ < 40) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [mounted]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reflect state into the URL (replace, so no history spam) once mounted.
  useEffect(() => {
    if (!mounted) return;
    const qs = encodeState({ search, sort, filters: [...activeFilters] });
    if (qs === window.location.search) return;
    router.replace(`/${qs}`, { scroll: false });
  }, [mounted, search, sort, activeFilters, router]);

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

  function clearAll() {
    setActiveFilters(new Set());
    setSearchInput('');
    setSearch('');
  }

  // Skeleton shell before mount (keeps server/client first render identical).
  if (!mounted) return <div id="app" className="visible" />;

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
            <select id="sort-select" value={sort} onChange={(e) => setSort(e.target.value as SortMode)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
          <button className="btn secondary more-filters-btn" onClick={() => setModalOpen(true)}>
            Filters
            {activeFilters.size > 0 && <span className="badge">{activeFilters.size}</span>}
          </button>
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

      {activeFilters.size > 0 && (
        <div className="active-filters">
          {[...activeFilters].map((t) => (
            <button
              key={t}
              className="active-chip"
              onClick={() => toggleFilter(t)}
              aria-label={`Remove filter ${t}`}
            >
              {t}
              <span className="active-chip-x" aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}

      <TuneGrid posts={filtered} query={search} />

      <FilterModal
        open={modalOpen}
        cats={cats}
        categorized={categorized}
        initial={activeFilters}
        onApply={(f) => {
          setActiveFilters(f);
          setModalOpen(false);
        }}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
