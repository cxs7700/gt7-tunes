'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Post, ViewMode, SortMode } from '@/lib/types';
import { SORT_OPTIONS } from '@/lib/types';
import { buildCategorized, orderedCategories } from '@/lib/categorize';
import { getFiltered } from '@/lib/filter';
import { decodeState, encodeState, SCROLL_KEY, DEFAULT_PAGE_SIZE } from '@/lib/urlState';
import TuneGrid from './TuneGrid';
import FilterModal from './FilterModal';
import Pagination from './Pagination';

export default function HomeClient({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const { categorized, tagCategoryOf } = useMemo(() => buildCategorized(posts), [posts]);
  const cats = useMemo(() => orderedCategories(categorized), [categorized]);

  // Start from defaults so the server-prerendered HTML and the first client
  // render are identical (clean hydration + fast first paint of page 1). Any URL
  // state (e.g. returning from a tune) is applied immediately after mount.
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortMode>('newest');
  const [page, setPage] = useState(1);
  const size = DEFAULT_PAGE_SIZE; // fixed page size (per-page selector removed)
  const [view, setView] = useState<ViewMode>('detailed');
  const [modalOpen, setModalOpen] = useState(false);
  const [urlReady, setUrlReady] = useState(false);

  // After mount, apply any URL state, then restore the saved scroll position
  // (retry across frames until the page is tall enough for the target to stick).
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const s = decodeState(window.location.search);
    setSearchInput(s.search);
    setSearch(s.search);
    setActiveFilters(new Set(s.filters));
    setSort(s.sort);
    setPage(s.page);
    setView(s.view);
    setUrlReady(true);

    const saved = parseInt(sessionStorage.getItem(SCROLL_KEY) || '0', 10);
    if (saved > 0) {
      let tries = 0;
      const tick = () => {
        window.scrollTo(0, saved);
        if (Math.abs(window.scrollY - saved) > 2 && tries++ < 40) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reflect state into the URL (replace, no history spam) once the URL is read.
  useEffect(() => {
    if (!urlReady) return;
    const qs = encodeState({ search, sort, filters: [...activeFilters], page, size, view });
    if (qs === window.location.search) return;
    router.replace(`/${qs}`, { scroll: false });
  }, [urlReady, search, sort, activeFilters, page, size, view, router]);

  const filtered = useMemo(
    () => getFiltered(posts, { search, sort, activeFilters }, tagCategoryOf),
    [posts, search, sort, activeFilters, tagCategoryOf],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  // Keep page within range if the result set shrinks.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const current = Math.min(page, totalPages);
  const paged = useMemo(
    () => filtered.slice((current - 1) * size, current * size),
    [filtered, current, size],
  );

  // Step relative to the latest pending page so rapid taps compose instead of
  // collapsing on a stale value (each click re-reads the freshest page).
  function stepPage(delta: number) {
    setPage((p) => Math.min(Math.max(1, p + delta), totalPages));
    window.scrollTo({ top: 0 });
  }

  function changeSort(s: SortMode) {
    setSort(s);
    setPage(1);
    window.scrollTo({ top: 0 });
  }

  function toggleFilter(tag: string) {
    setPage(1);
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
    setPage(1);
  }

  const hasActive = activeFilters.size > 0 || search.length > 0;

  return (
    <div id="app" className="visible">
      <div className="list-controls">
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
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="controls">
          <div className="controls-left">
            <button className="btn secondary more-filters-btn" onClick={() => setModalOpen(true)}>
              Filters
              {activeFilters.size > 0 && <span className="badge">{activeFilters.size}</span>}
            </button>
            <label className="sort-select">
              <span className="sr-only">Sort</span>
              <select
                value={sort}
                onChange={(e) => changeSort(e.target.value as SortMode)}
                aria-label="Sort tunes"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            {hasActive && (
              <button className="btn secondary" onClick={clearAll}>
                Clear
              </button>
            )}
            <span className="stats">
              {filtered.length} of {posts.length} tunes
            </span>
          </div>
          <div className="view-toggle" role="group" aria-label="View">
            <button
              className={'view-btn' + (view === 'compact' ? ' active' : '')}
              aria-pressed={view === 'compact'}
              aria-label="Compact view"
              title="Compact view"
              onClick={() => setView('compact')}
            >
              <svg className="view-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </button>
            <button
              className={'view-btn' + (view === 'detailed' ? ' active' : '')}
              aria-pressed={view === 'detailed'}
              aria-label="Detailed view"
              title="Detailed view"
              onClick={() => setView('detailed')}
            >
              <svg className="view-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="9" y1="6" x2="20" y2="6" />
                <line x1="9" y1="12" x2="20" y2="12" />
                <line x1="9" y1="18" x2="20" y2="18" />
                <line x1="4" y1="6" x2="4.01" y2="6" />
                <line x1="4" y1="12" x2="4.01" y2="12" />
                <line x1="4" y1="18" x2="4.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>
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

      </div>

      <TuneGrid posts={paged} query={search} view={view} />

      {filtered.length > 0 && (
        <div className="list-footer">
          <Pagination page={current} size={size} total={filtered.length} onStep={stepPage} />
        </div>
      )}

      <FilterModal
        open={modalOpen}
        cats={cats}
        categorized={categorized}
        posts={posts}
        tagCategoryOf={tagCategoryOf}
        initial={activeFilters}
        onApply={(f) => {
          setActiveFilters(f);
          setPage(1);
          setModalOpen(false);
        }}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
