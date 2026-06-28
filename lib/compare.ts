// Device-local "compare" selection (max 3 tunes), persisted in localStorage with
// a tiny pub/sub — same shape as lib/favorites.ts so buttons and the compare bar
// stay in sync within and across tabs.

const KEY = 'gt7-compare';
export const MAX_COMPARE = 3;

type Listener = (ids: Set<string>) => void;
const listeners = new Set<Listener>();
let cache: Set<string> | null = null;
let inited = false;

function read(): Set<string> {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    cache = new Set<string>();
  }
  return cache;
}

function emit() {
  const snapshot = new Set(read());
  listeners.forEach((l) => l(snapshot));
}

function write(next: Set<string>) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify([...next]));
  } catch {
    /* storage unavailable */
  }
  emit();
}

function ensureInit() {
  if (inited || typeof window === 'undefined') return;
  inited = true;
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    cache = null;
    emit();
  });
}

export function getCompare(): Set<string> {
  return new Set(read());
}

// Returns the outcome so the UI can flag a full selection.
export function toggleCompare(id: string): 'added' | 'removed' | 'full' {
  const next = new Set(read());
  if (next.has(id)) {
    next.delete(id);
    write(next);
    return 'removed';
  }
  if (next.size >= MAX_COMPARE) return 'full';
  next.add(id);
  write(next);
  return 'added';
}

export function removeCompare(id: string) {
  const next = new Set(read());
  if (next.delete(id)) write(next);
}

export function clearCompare() {
  write(new Set());
}

export function subscribe(l: Listener): () => void {
  ensureInit();
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
