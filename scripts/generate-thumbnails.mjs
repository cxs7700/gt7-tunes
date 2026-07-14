// Generate small WebP thumbnails for each post's cover image (imageUrls[0]),
// mirrored under public/thumbs/. The grid and Similar-tunes rail load these
// instead of full-resolution game screenshots. Idempotent — safe to re-run;
// only (re)writes thumbnails whose source is newer or missing.
//
// Run: npm run thumbnails
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const WIDTH = 640;
const QUALITY = 72;
const CONCURRENCY = 8;

const posts = JSON.parse(fs.readFileSync(path.join(root, 'data', 'posts.json'), 'utf8'));

// cover path (e.g. "images/.../01.webp") -> thumb path ("thumbs/.../01.webp")
export function thumbFor(cover) {
  return cover.replace(/^images\//, 'thumbs/');
}

const covers = [...new Set(posts.map((p) => p.imageUrls?.[0]).filter(Boolean))];

let done = 0;
let written = 0;
let srcBytes = 0;
let outBytes = 0;

async function one(cover) {
  const src = path.join(root, 'public', cover);
  const out = path.join(root, 'public', thumbFor(cover));
  if (!fs.existsSync(src)) {
    console.warn(`  ! missing source: ${cover}`);
    return;
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const srcStat = fs.statSync(src);
  const fresh = fs.existsSync(out) && fs.statSync(out).mtimeMs >= srcStat.mtimeMs;
  if (!fresh) {
    await sharp(src).resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(out);
    written++;
  }
  srcBytes += srcStat.size;
  outBytes += fs.statSync(out).size;
  done++;
}

async function run() {
  console.log(`Generating thumbnails for ${covers.length} covers (width ${WIDTH}, q${QUALITY})…`);
  for (let i = 0; i < covers.length; i += CONCURRENCY) {
    await Promise.all(covers.slice(i, i + CONCURRENCY).map(one));
  }
  const mb = (b) => (b / 1024 / 1024).toFixed(1);
  console.log(
    `Done: ${done} thumbnails (${written} (re)written). ` +
      `Covers ${mb(srcBytes)}MB → thumbs ${mb(outBytes)}MB ` +
      `(${Math.round((1 - outBytes / srcBytes) * 100)}% smaller).`,
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
