'use client';

import { useFavorites } from '@/lib/useFavorites';

// Star toggle for saving a tune. Sits above the card's stretched-link overlay
// and stops propagation so tapping it never navigates.
export default function FavoriteButton({ id, className = '' }: { id: string; className?: string }) {
  const { isFav, toggle, ready } = useFavorites();
  const on = ready && isFav(id);
  return (
    <button
      type="button"
      className={'fav-btn' + (on ? ' on' : '') + (className ? ' ' + className : '')}
      aria-pressed={on}
      aria-label={on ? 'Remove from saved' : 'Save tune'}
      title={on ? 'Saved' : 'Save'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="fav-icon">
        <path d="M12 17.3l-5.4 3.2 1.4-6.1-4.7-4.1 6.2-.5L12 4l2.5 5.7 6.2.5-4.7 4.1 1.4 6.1z" />
      </svg>
    </button>
  );
}
