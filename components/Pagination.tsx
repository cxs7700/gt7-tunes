'use client';

import { PAGE_SIZES } from '@/lib/urlState';

interface Props {
  page: number;
  size: number;
  total: number;
  onPage: (page: number) => void;
  onSize: (size: number) => void;
}

export default function Pagination({ page, size, total, onPage, onSize }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (current - 1) * size + 1;
  const end = Math.min(current * size, total);

  return (
    <div className="pagination">
      <div className="page-size">
        <label htmlFor="page-size-select">Per page</label>
        <select
          id="page-size-select"
          value={size}
          onChange={(e) => onSize(parseInt(e.target.value, 10))}
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="page-range">
        {total === 0 ? 'No tunes' : `Showing ${start}–${end} of ${total}`}
      </div>

      <div className="page-nav">
        <button
          className="btn secondary"
          onClick={() => onPage(current - 1)}
          disabled={current <= 1}
        >
          ← Prev
        </button>
        <span className="page-indicator">
          Page {current} of {totalPages}
        </span>
        <button
          className="btn secondary"
          onClick={() => onPage(current + 1)}
          disabled={current >= totalPages}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
