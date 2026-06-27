import fs from 'node:fs';
import path from 'node:path';
import type { Post } from './types';

// Build-time / server-only data access. Reads the canonical data/posts.json once.
let cache: Post[] | null = null;

export function readPosts(): Post[] {
  if (!cache) {
    const file = path.join(process.cwd(), 'data', 'posts.json');
    cache = JSON.parse(fs.readFileSync(file, 'utf8')) as Post[];
  }
  return cache;
}

export function getPostById(id: string): Post | undefined {
  return readPosts().find((p) => p.id === id);
}
