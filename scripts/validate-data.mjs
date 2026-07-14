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
let missingThumbs = 0;

// Cover -> committed thumbnail (mirror of lib/images.ts / generate-thumbnails).
const thumbFor = (cover) =>
  cover.startsWith('images/') ? cover.replace(/^images\//, 'thumbs/') : cover;

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
  // Each post's cover must have a committed thumbnail (run `npm run thumbnails`).
  const cover = p.imageUrls?.[0];
  if (cover && !fs.existsSync(path.join(root, 'public', thumbFor(cover)))) {
    missingThumbs++;
    if (missingThumbs <= 10) errors.push(`missing thumbnail: ${thumbFor(cover)} (run: npm run thumbnails)`);
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

// --- Data-quality report (informational; never fails the build) ---
// Surfaces drift on data PRs: coverage of the fields the UI derives, image
// gaps, and tag spellings that differ only by case/spacing (merge candidates
// for lib/tagMerge.ts). Kept non-fatal so legitimate data variance can't break
// CI — it's a signal for reviewers, not a gate.
const pct = (n) => `${((n / posts.length) * 100).toFixed(0)}% (${n}/${posts.length})`;

const tagCount = new Map();
for (const p of posts) for (const t of p.tags ?? []) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);

const ppRe = /^\d{3,4}\s*pp$|^\d{3,4}$/i;
const starRe = /^\d+\s*stars?$/i;
let ppCov = 0;
let starCov = 0;
let noImages = 0;
for (const p of posts) {
  const tags = (p.tags ?? []).map((t) => t.trim());
  if (tags.some((t) => ppRe.test(t))) ppCov++;
  if (tags.some((t) => starRe.test(t)) || /\d+\s*stars?\b/i.test(p.body ?? '')) starCov++;
  if (!(p.imageUrls?.length)) noImages++;
}

// Group tags whose normalized (lowercase, collapsed-whitespace) form collides.
const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();
const byNorm = new Map();
for (const t of tagCount.keys()) {
  const k = norm(t);
  if (!byNorm.has(k)) byNorm.set(k, []);
  byNorm.get(k).push(t);
}
const variantGroups = [...byNorm.values()].filter((g) => g.length > 1);

console.log('\nData quality (informational):');
console.log(`  PP coverage:      ${pct(ppCov)}`);
console.log(`  Rating coverage:  ${pct(starCov)} (tags + body)`);
console.log(`  Posts w/o images: ${noImages}`);
console.log(`  Distinct tags:    ${tagCount.size}`);
if (variantGroups.length) {
  console.log(
    `  ⚠ ${variantGroups.length} tag group(s) differ only by case/spacing — consider lib/tagMerge.ts:`,
  );
  for (const g of variantGroups.slice(0, 12)) console.log(`      ${g.join('  |  ')}`);
}
