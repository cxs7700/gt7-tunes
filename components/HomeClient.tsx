'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Post, ViewMode, SortMode, PpRange } from '@/lib/types';
import { SORT_OPTIONS } from '@/lib/types';
import { buildCategorized, orderedCategories } from '@/lib/categorize';
import { ppBounds } from '@/lib/derive';
import { getFiltered } from '@/lib/filter';
import { useFavorites } from '@/lib/useFavorites';
import { decodeState, encodeState, SCROLL_KEY, DEFAULT_PAGE_SIZE } from '@/lib/urlState';
import TuneGrid from './TuneGrid';
import FilterModal from './FilterModal';
import Pagination from './Pagination';
import CompareModal from './CompareModal';
import { useCompare } from '@/lib/useCompare';

export default function HomeClient({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const { categorized, tagCategoryOf } = useMemo(() => buildCategorized(posts), [posts]);
  const cats = useMemo(() => orderedCategories(categorized), [categorized]);
  const ppRangeBounds = useMemo(() => ppBounds(posts), [posts]);

  // Start from defaults so the server-prerendered HTML and the first client
  // render are identical (clean hydration + fast first paint of page 1). Any URL
  // state (e.g. returning from a tune) is applied immediately after mount.
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [pp, setPp] = useState<PpRange | null>(null);
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState<SortMode>('newest');
  const { favs } = useFavorites();
  const [page, setPage] = useState(1);
  const size = DEFAULT_PAGE_SIZE; // fixed page size (per-page selector removed)
  const [view, setView] = useState<ViewMode>('detailed');
  const [modalOpen, setModalOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const { ids: compareIds, count: compareCount, remove: removeCompare, clear: clearCompare, max: compareMax } = useCompare();
  const [urlReady, setUrlReady] = useState(false);

  // After mount, apply any URL state, then restore the saved scroll position
  // (retry across frames until the page is tall enough for the target to stick).
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const s = decodeState(window.location.search);
    setSearchInput(s.search);
    setSearch(s.search);
    setActiveFilters(new Set(s.filters));
    setPp(s.pp);
    setSavedOnly(s.saved);
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
    const qs = encodeState({
      search,
      sort,
      filters: [...activeFilters],
      pp,
      saved: savedOnly,
      page,
      size,
      view,
    });
    if (qs === window.location.search) return;
    router.replace(`/${qs}`, { scroll: false });
  }, [urlReady, search, sort, activeFilters, pp, savedOnly, page, size, view, router]);

  const filtered = useMemo(() => {
    const base = getFiltered(posts, { search, sort, activeFilters, pp }, tagCategoryOf);
    return savedOnly ? base.filter((p) => favs.has(p.id)) : base;
  }, [posts, search, sort, activeFilters, pp, savedOnly, favs, tagCategoryOf]);

  const comparePosts = useMemo(
    () => posts.filter((p) => compareIds.has(p.id)),
    [posts, compareIds],
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

  function toggleSavedOnly() {
    setSavedOnly((v) => !v);
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
    setPp(null);
    setSearchInput('');
    setSearch('');
    setPage(1);
  }

  const activeCount = activeFilters.size + (pp ? 1 : 0);
  const hasActive = activeFilters.size > 0 || pp !== null || search.length > 0;

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
            enterKeyHint="search"
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            onKeyDown={(e) => {
              // Dismiss the mobile keyboard on Enter (search is already live).
              if (e.key === 'Enter') {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
          />
          {searchInput && (
            <button
              type="button"
              className="search-clear"
              aria-label="Clear search"
              onClick={() => {
                setSearchInput('');
                setSearch('');
                setPage(1);
              }}
            >
              ×
            </button>
          )}
        </div>
        <div className="controls">
          <button
            className="btn secondary controls-toggle"
            onClick={() => setControlsOpen((o) => !o)}
            aria-expanded={controlsOpen}
            aria-controls="controls-panel"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="controls-toggle-icon">
              <line x1="4" y1="6" x2="20" y2="6" />
              <circle cx="9" cy="6" r="2" fill="var(--bg-input)" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <circle cx="15" cy="12" r="2" fill="var(--bg-input)" />
              <line x1="4" y1="18" x2="20" y2="18" />
              <circle cx="9" cy="18" r="2" fill="var(--bg-input)" />
            </svg>
            Options
            {activeCount > 0 && <span className="badge">{activeCount}</span>}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="chevron">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <span className="stats">
            {filtered.length} of {posts.length} tunes
          </span>
        </div>
        <div id="controls-panel" className={'controls-panel' + (controlsOpen ? ' open' : '')}>
          <button className="btn secondary more-filters-btn" onClick={() => setModalOpen(true)}>
            Filters
            {activeCount > 0 && <span className="badge">{activeCount}</span>}
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
          <button
            className={'btn secondary saved-toggle' + (savedOnly ? ' active' : '')}
            onClick={toggleSavedOnly}
            aria-pressed={savedOnly}
            title="Show saved tunes"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="fav-icon">
              <path d="M12 17.3l-5.4 3.2 1.4-6.1-4.7-4.1 6.2-.5L12 4l2.5 5.7 6.2.5-4.7 4.1 1.4 6.1z" />
            </svg>
            Saved{favs.size > 0 ? ` (${favs.size})` : ''}
          </button>
          {hasActive && (
            <button className="btn secondary" onClick={clearAll}>
              Clear
            </button>
          )}
        </div>
      </div>

      {(activeFilters.size > 0 || pp) && (
        <div className="active-filters">
          {pp && (
            <button
              className="active-chip"
              onClick={() => {
                setPp(null);
                setPage(1);
              }}
              aria-label={`Remove PP filter ${pp.min} to ${pp.max}`}
            >
              {pp.min}–{pp.max} PP
              <span className="active-chip-x" aria-hidden="true">×</span>
            </button>
          )}
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

      {compareCount > 0 && (
        <div className="compare-bar">
          <span className="compare-bar-label">
            Comparing {compareCount}/{compareMax}
          </span>
          <div className="compare-bar-actions">
            <button
              className="btn"
              onClick={() => setCompareOpen(true)}
              disabled={compareCount < 2}
              title={compareCount < 2 ? 'Add at least 2 tunes' : 'Compare selected tunes'}
            >
              Compare
            </button>
            <button className="btn secondary" onClick={clearCompare}>
              Clear
            </button>
          </div>
        </div>
      )}

      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">
          {savedOnly && favs.size === 0
            ? 'No saved tunes yet — tap the ☆ on a tune to save it.'
            : 'No tunes match your filters.'}
        </p>
      ) : (
        <TuneGrid posts={paged} query={search} view={view} />
      )}

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
        ppBounds={ppRangeBounds}
        initial={activeFilters}
        initialPp={pp}
        onApply={(f, ppRange) => {
          setActiveFilters(f);
          setPp(ppRange);
          setPage(1);
          setModalOpen(false);
        }}
        onClose={() => setModalOpen(false)}
      />

      {compareOpen && comparePosts.length >= 1 && (
        <CompareModal
          posts={comparePosts}
          onRemove={removeCompare}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </div>
  );
}
