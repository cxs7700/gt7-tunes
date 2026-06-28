'use client';

import { useEffect, useState } from 'react';
import {
  getCompare,
  subscribe,
  toggleCompare,
  removeCompare,
  clearCompare,
  MAX_COMPARE,
} from './compare';

// React binding for the compare store. `ready` stays false until after mount so
// server/first-client render agree (treat as nothing selected).
export function useCompare() {
  const [ids, setIds] = useState<Set<string>>(() => new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(getCompare());
    setReady(true);
    return subscribe(setIds);
  }, []);

  return {
    ids,
    ready,
    count: ids.size,
    isComparing: (id: string) => ids.has(id),
    full: ids.size >= MAX_COMPARE,
    toggle: toggleCompare,
    remove: removeCompare,
    clear: clearCompare,
    max: MAX_COMPARE,
  };
}
