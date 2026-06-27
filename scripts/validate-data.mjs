// Read-only CI gate: asserts data/posts.json is well-formed and that every
// referenced image exists. Never writes anything. Exits non-zero on failure.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const posts = JSON.parse(fs.readFileSync(path.join(root, 'data', 'posts.json'), 'utf8'));
const errors = [];

if (!Array.isArray(posts) || posts.length === 0) {
  console.error('posts.json must be a non-empty array');
  process.exit(1);
}

const required = ['id', 'title', 'date', 'body', 'url', 'tags', 'imageUrls'];
const ids = new Set();
let missingImages = 0;
let imageRefs = 0;

for (const p of posts) {
  for (const k of required) {
    if (!(k in p)) errors.push(`post ${p.id ?? '?'} missing key "${k}"`);
  }
  if (ids.has(p.id)) errors.push(`duplicate id ${p.id}`);
  ids.add(p.id);
  if (!/^[\w-]+$/.test(p.id)) errors.push(`non-url-safe id ${p.id}`);
  for (const url of p.imageUrls ?? []) {
    imageRefs++;
    if (/^https?:\/\//i.test(url)) {
      errors.push(`post ${p.id} has a remote image url: ${url}`);
      continue;
    }
    const onDisk = path.join(root, 'public', url); // images live under public/
    if (!fs.existsSync(onDisk)) {
      missingImages++;
      if (missingImages <= 10) errors.push(`missing image: ${url}`);
    }
  }
}

if (errors.length) {
  console.error(`Data validation FAILED (${errors.length} issue(s)):`);
  for (const e of errors.slice(0, 30)) console.error('  - ' + e);
  process.exit(1);
}

console.log(
  `Data OK: ${posts.length} posts, ${ids.size} unique ids, ${imageRefs} image refs all present.`,
);
