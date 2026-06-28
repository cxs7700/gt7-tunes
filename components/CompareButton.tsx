'use client';

import { useCompare } from '@/lib/useCompare';

// Toggle a tune into the compare selection. Sits above the card overlay link and
// stops propagation. Disabled when the selection is full and this tune isn't in
// it.
export default function CompareButton({ id, className = '' }: { id: string; className?: string }) {
  const { isComparing, toggle, full, ready } = useCompare();
  const on = ready && isComparing(id);
  const disabled = ready && full && !on;
  return (
    <button
      type="button"
      className={'cmp-btn' + (on ? ' on' : '') + (className ? ' ' + className : '')}
      aria-pressed={on}
      disabled={disabled}
      aria-label={on ? 'Remove from compare' : 'Add to compare'}
      title={disabled ? 'Compare is full (3)' : on ? 'In compare' : 'Add to compare'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="cmp-icon">
        <rect x="4" y="5" width="6.5" height="14" rx="1.5" />
        <rect x="13.5" y="5" width="6.5" height="14" rx="1.5" />
      </svg>
    </button>
  );
}
