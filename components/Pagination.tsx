'use client';

interface Props {
  page: number;
  size: number;
  total: number;
  onStep: (delta: number) => void;
}

export default function Pagination({ page, size, total, onStep }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (current - 1) * size + 1;
  const end = Math.min(current * size, total);

  return (
    <div className="pagination">
      <div className="page-range">
        {total === 0 ? 'No tunes' : `Showing ${start}–${end} of ${total}`}
      </div>

      <div className="page-nav">
        <button
          className="btn secondary"
          onClick={() => onStep(-1)}
          disabled={current <= 1}
        >
          ← Prev
        </button>
        <span key={current} className="page-indicator">
          Page {current} of {totalPages}
        </span>
        <button
          className="btn secondary"
          onClick={() => onStep(1)}
          disabled={current >= totalPages}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
