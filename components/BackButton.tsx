'use client';

import { useRouter } from 'next/navigation';

// Returns to the previous page (preserving list state/scroll) when there is
// history, otherwise falls back to the home route.
export default function BackButton() {
  const router = useRouter();
  return (
    <button
      className="btn secondary back-btn"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) router.back();
        else router.push('/');
      }}
    >
      ← Back to tunes
    </button>
  );
}
