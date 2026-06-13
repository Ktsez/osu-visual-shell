import { createHash } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import { opendir, readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { parseOsuFile } from './src/server/parseOsuFile.js';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';
const media = new Map();

const audioExts = new Set(['.mp3', '.ogg', '.wav', '.flac', '.m4a', '.aac', '.opus']);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.flac': 'audio/flac',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.opus': 'audio/ogg',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
};

function json(res, body, status = 200) {
  res.writeHead(status, { 'content-type': mimeTypes['.json'] });
  res.end(JSON.stringify(body));
}

function mediaId(filePath) {
  const id = createHash('sha1').update(filePath).digest('hex').slice(0, 16);
  media.set(id, filePath);
  return `/media/${id}`;
}

async function scanOsuSongs(songsPath) {
  const entries = [];
  const folders = await opendir(songsPath);
  for await (const folder of folders) {
    if (!folder.isDirectory()) continue;
    const folderPath = join(songsPath, folder.name);
    let files;
    try {
      files = await opendir(folderPath);
    } catch {
      continue;
    }

    for await (const file of files) {
      if (!file.isFile() || extname(file.name).toLowerCase() !== '.osu') continue;
      const osuPath = join(folderPath, file.name);
      try {
        const parsed = parseOsuFile(await readFile(osuPath, 'utf8'), folderPath);
        if (!parsed.audio || !existsSync(parsed.audio)) continue;
        const audioInfo = await stat(parsed.audio);
        entries.push({
          id: createHash('sha1').update(osuPath).digest('hex').slice(0, 12),
          source: 'osu',
          title: parsed.title,
          artist: parsed.artist,
          creator: parsed.creator,
          version: parsed.version,
          audioUrl: mediaId(parsed.audio),
          backgroundUrl: parsed.background && existsSync(parsed.background) ? mediaId(parsed.background) : '',
          timingPoints: parsed.timingPoints,
          durationHint: audioInfo.size,
          path: osuPath,
        });
      } catch {
        continue;
      }
    }
  }
  return entries.slice(0, 1500);
}

async function scanMusicFolder(folderPath, max = 1500) {
  const tracks = [];
  async function walk(dir, depth) {
    if (depth > 4 || tracks.length >= max) return;
    let handle;
    try {
      handle = await opendir(dir);
    } catch {
      return;
    }
    for await (const entry of handle) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath, depth + 1);
      } else if (entry.isFile() && audioExts.has(extname(entry.name).toLowerCase())) {
        const title = entry.name.replace(/\.[^.]+$/, '');
        tracks.push({
          id: createHash('sha1').update(fullPath).digest('hex').slice(0, 12),
          source: 'music',
          title,
          artist: 'Local music',
          creator: '',
          version: '',
          audioUrl: mediaId(fullPath),
          backgroundUrl: '',
          timingPoints: [],
          path: fullPath,
        });
      }
      if (tracks.length >= max) break;
    }
  }
  await walk(folderPath, 0);
  return tracks;
}

function likelyOsuPaths() {
  const home = homedir();
  return [
    join(home, 'AppData', 'Local', 'osu!', 'Songs'),
    join(home, 'AppData', 'Roaming', 'osu!', 'Songs'),
    'C:\\osu!\\Songs',
  ].filter((path) => existsSync(path));
}

async function handleApi(req, res, url) {
  if (url.pathname === '/api/default-paths') {
    return json(res, { osuSongs: likelyOsuPaths() });
  }

  if (url.pathname === '/api/scan') {
    const folderPath = resolve(url.searchParams.get('path') || '');
    const kind = url.searchParams.get('kind') || 'music';
    if (!folderPath || !existsSync(folderPath)) return json(res, { error: '文件夹不存在' }, 400);
    const info = await stat(folderPath);
    if (!info.isDirectory()) return json(res, { error: '路径不是文件夹' }, 400);
    const tracks = kind === 'osu' ? await scanOsuSongs(folderPath) : await scanMusicFolder(folderPath);
    return json(res, { tracks });
  }

  json(res, { error: 'not found' }, 404);
}

function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const target = resolve(root, `.${pathname}`);
  if (!target.startsWith(root.split(sep).join(sep))) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  const ext = extname(target).toLowerCase();
  createReadStream(target)
    .on('error', () => {
      res.writeHead(404);
      res.end('Not found');
    })
    .once('open', () => {
      res.writeHead(200, {
        'content-type': mimeTypes[ext] || 'application/octet-stream',
        'cache-control': 'no-store',
      });
    })
    .pipe(res);
}

async function streamMedia(req, res, filePath) {
  const ext = extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  const info = await stat(filePath);
  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, {
      'content-type': contentType,
      'content-length': info.size,
      'accept-ranges': 'bytes',
    });
    return createReadStream(filePath).pipe(res);
  }

  const match = range.match(/bytes=(\d*)-(\d*)/);
  if (!match) {
    res.writeHead(416, { 'content-range': `bytes */${info.size}` });
    return res.end();
  }

  const start = match[1] ? Number(match[1]) : 0;
  const end = match[2] ? Number(match[2]) : info.size - 1;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= info.size) {
    res.writeHead(416, { 'content-range': `bytes */${info.size}` });
    return res.end();
  }

  res.writeHead(206, {
    'content-type': contentType,
    'content-length': end - start + 1,
    'content-range': `bytes ${start}-${end}/${info.size}`,
    'accept-ranges': 'bytes',
  });
  createReadStream(filePath, { start, end }).pipe(res);
}

createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    if (url.pathname.startsWith('/media/')) {
      const id = url.pathname.split('/').pop();
      const filePath = id ? media.get(id) : '';
      if (!filePath || !existsSync(filePath)) return json(res, { error: 'media not found' }, 404);
      return streamMedia(req, res, filePath);
    }
    serveStatic(req, res, url);
  } catch (error) {
    json(res, { error: error instanceof Error ? error.message : 'unknown error' }, 500);
  }
}).listen(port, host, () => {
  console.log(`osu visual shell running at http://${host}:${port}`);
});
