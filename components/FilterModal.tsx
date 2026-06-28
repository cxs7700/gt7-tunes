'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Categorized, Post } from '@/lib/types';
import { facetCounts } from '@/lib/facets';

interface Props {
  open: boolean;
  cats: string[];
  categorized: Categorized;
  posts: Post[];
  tagCategoryOf: Record<string, string>;
  initial: Set<string>;
  onApply: (filters: Set<string>) => void;
  onClose: () => void;
}

// Modal of all filter categories. Selections are STAGED locally and only take
// effect when "Apply Filters" is pressed; Close/Esc/backdrop discard them.
export default function FilterModal({
  open,
  cats,
  categorized,
  posts,
  tagCategoryOf,
  initial,
  onApply,
  onClose,
}: Props) {
  const [staged, setStaged] = useState<Set<string>>(() => new Set(initial));
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  // Contextual per-chip counts given the OTHER categories' staged selections.
  const facets = useMemo(
    () => facetCounts(posts, staged, tagCategoryOf),
    [posts, staged, tagCategoryOf],
  );

  // Keep the modal mounted briefly while it animates out.
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
      const t = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 180);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Seed staged selection + expand categories that have a selection on open.
  useEffect(() => {
    if (!open) return;
    setStaged(new Set(initial));
    const openCats = new Set<string>([cats[0]]);
    for (const t of initial) {
      for (const c of cats) {
        if (categorized[c].some((e) => e.tag === t)) openCats.add(c);
      }
    }
    setCollapsed(new Set(cats.filter((c) => !openCats.has(c))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Focus trap, Esc to close, scroll lock, restore focus on close.
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!visible) return null;

  const toggleChip = (t: string) =>
    setStaged((p) => {
      const n = new Set(p);
      if (n.has(t)) n.delete(t);
      else n.add(t);
      return n;
    });
  const toggleCat = (c: string) =>
    setCollapsed((p) => {
      const n = new Set(p);
      if (n.has(c)) n.delete(c);
      else n.add(c);
      return n;
    });

  return (
    <div className={'modal-backdrop' + (closing ? ' closing' : '')} onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        ref={ref}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Filters</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          {cats.map((cat) => {
            const col = collapsed.has(cat);
            const sel = categorized[cat].filter((e) => staged.has(e.tag)).length;
            return (
              <div key={cat} className={'filter-group' + (col ? ' collapsed' : '')}>
                <div className="filter-group-header" onClick={() => toggleCat(cat)}>
                  <span className="label">{cat}</span>
                  {sel > 0 && <span className="sel-count">{sel}</span>}
                  <span className="filter-toggle" aria-hidden="true" />
                </div>
                <div className="filter-chips-wrap">
                  <div className="filter-chips">
                  {categorized[cat].map(({ tag }) => {
                    const on = staged.has(tag);
                    const fc = facets.get(tag) ?? 0;
                    // Zero-result chips are disabled, unless already selected
                    // (so a selection can always be undone).
                    const disabled = fc === 0 && !on;
                    return (
                      <button
                        key={tag}
                        className={'chip' + (on ? ' active' : '') + (disabled ? ' disabled' : '')}
                        onClick={() => toggleChip(tag)}
                        disabled={disabled}
                      >
                        {tag}
                        <span className="chip-count">{fc}</span>
                      </button>
                    );
                  })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-footer">
          <span className="modal-footer-count">
            {staged.size > 0 ? `${staged.size} selected` : 'No filters selected'}
          </span>
          <div className="modal-footer-actions">
            <button className="btn secondary" onClick={() => setStaged(new Set())}>
              Clear
            </button>
            <button className="btn" onClick={() => onApply(new Set(staged))}>
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
