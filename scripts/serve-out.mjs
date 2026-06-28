// Minimal static server for the built `out/` export, served under the project's
// base path (/gt7-tunes/) so it mirrors GitHub Pages exactly. Used by the
// Playwright e2e suite (and handy for local preview). No dependencies.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const ROOT = join(process.cwd(), 'out');
const PREFIX = '/gt7-tunes';
const PORT = process.env.PORT ? Number(process.env.PORT) : 4173;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

async function resolveFile(urlPath) {
  let path = decodeURIComponent(urlPath.split('?')[0]);
  if (path.startsWith(PREFIX)) path = path.slice(PREFIX.length);
  if (path === '') path = '/';

  const target = normalize(join(ROOT, path));
  if (!target.startsWith(ROOT)) return null; // path traversal guard

  let s = await stat(target).catch(() => null);
  if (s?.isDirectory()) {
    const index = join(target, 'index.html');
    if (await stat(index).catch(() => null)) return index;
  } else if (s?.isFile()) {
    return target;
  }
  // trailingSlash routes: /tune/<id>/ -> out/tune/<id>/index.html
  const index = join(ROOT, path, 'index.html');
  if (await stat(index).catch(() => null)) return index;
  return null;
}

const server = http.createServer(async (req, res) => {
  try {
    const file = await resolveFile(req.url || '/');
    if (!file) {
      const body = await readFile(join(ROOT, '404.html')).catch(() => Buffer.from('Not found'));
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(body);
    }
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(500);
    res.end('Server error');
  }
});

server.listen(PORT, () => {
  console.log(`serving out/ at http://localhost:${PORT}${PREFIX}/`);
});
