// Device-local "saved tunes", persisted in localStorage. A tiny pub/sub so every
// FavoriteButton and the list's "Saved" filter stay in sync within the tab (and
// across tabs via the storage event). No backend — fits the static export.

const KEY = 'gt7-favorites';
type Listener = (favs: Set<string>) => void;

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
    /* storage unavailable / quota */
  }
  emit();
}

function ensureInit() {
  if (inited || typeof window === 'undefined') return;
  inited = true;
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    cache = null; // re-read on next access
    emit();
  });
}

export function getFavorites(): Set<string> {
  return new Set(read());
}

export function isFavorite(id: string): boolean {
  return read().has(id);
}

export function toggleFavorite(id: string) {
  const next = new Set(read());
  if (next.has(id)) next.delete(id);
  else next.add(id);
  write(next);
}

export function subscribe(l: Listener): () => void {
  ensureInit();
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
