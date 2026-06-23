import { createHash } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import { open, opendir, readFile, stat } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve, sep } from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { homedir, platform, release } from 'node:os';
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

function lazerFilePath(filesPath, hash) {
  return join(filesPath, hash[0], hash.slice(0, 2), hash);
}

function classifyStoredFile(buffer) {
  const header = buffer.subarray(0, 16).toString('hex');
  const text = buffer.subarray(0, 5000).toString('utf8');
  if (text.includes('[General]') && text.includes('[Metadata]')) return 'osu';
  if (header.startsWith('494433') || header.startsWith('fffb') || header.startsWith('fff3') || header.startsWith('4f676753')) return 'audio';
  if (header.startsWith('89504e47') || header.startsWith('ffd8ff') || header.startsWith('52494646')) return 'image';
  return 'other';
}

function normaliseSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/g, ' ')
    .trim();
}

function meaningfulTokens(...values) {
  return [...new Set(values
    .flatMap((value) => normaliseSearchText(value).split(/\s+/))
    .filter((token) => token.length >= 3 && !['feat', 'with', 'remix', 'short', 'version', 'original'].includes(token)))];
}

function audioMetadataText(buffer) {
  const slice = buffer.subarray(0, Math.min(buffer.length, 220000));
  return `${slice.toString('utf8')} ${slice.toString('utf16le')}`
    .replace(/[^\x20-\x7E\u3040-\u30ff\u3400-\u9fff]+/g, ' ')
    .slice(0, 8000);
}

function metadataSimilarity(parsed, item) {
  const haystack = item.searchText || normaliseSearchText(item.metaText || '');
  if (!haystack) return { score: 0, tagged: false };
  const title = normaliseSearchText(parsed.title);
  const artist = normaliseSearchText(parsed.artist);
  const tokens = meaningfulTokens(parsed.title, parsed.artist, parsed.titleUnicode, parsed.artistUnicode);
  let score = 0;
  if (title && title.length >= 4 && haystack.includes(title)) score += 0.72;
  if (artist && artist.length >= 3 && haystack.includes(artist)) score += 0.38;
  const tokenHits = tokens.filter((token) => haystack.includes(token)).length;
  score += Math.min(0.62, tokenHits * 0.16);
  return {
    score: Math.min(1, score),
    tagged: /tit2|tpe1|talb|artist|title|vorbis|xiph|album/i.test(item.metaText || ''),
  };
}

function resolveLazerRoot(inputPath) {
  const resolved = resolve(inputPath);
  if (basename(resolved).toLowerCase() === 'files' && existsSync(join(dirname(resolved), 'client.realm'))) {
    return dirname(resolved);
  }
  return resolved;
}

async function collectLazerFiles(filesPath) {
  const items = [];
  const filePaths = [];

  async function readHead(filePath, length = 8192) {
    const handle = await open(filePath, 'r');
    try {
      const buffer = Buffer.alloc(length);
      const { bytesRead } = await handle.read(buffer, 0, length, 0);
      return buffer.subarray(0, bytesRead);
    } finally {
      await handle.close();
    }
  }

  async function walk(dir, depth = 0) {
    if (depth > 3) return;
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
        continue;
      }
      if (!entry.isFile() || !/^[a-f0-9]{64}$/i.test(entry.name)) continue;
      filePaths.push(fullPath);
    }
  }

  async function processFile(fullPath) {
    try {
      const [head, info] = await Promise.all([readHead(fullPath), stat(fullPath)]);
      const kind = classifyStoredFile(head);
      if (kind === 'other') return;
      const text = kind === 'osu' ? await readFile(fullPath, 'utf8') : '';
      const metaHead = kind === 'audio' ? await readHead(fullPath, 65536) : null;
      const metaText = metaHead ? audioMetadataText(metaHead) : '';
      items.push({
        hash: basename(fullPath).toLowerCase(),
        path: fullPath,
        kind,
        size: info.size,
        mtime: info.mtimeMs,
        text,
        metaText,
        searchText: metaText ? normaliseSearchText(metaText) : '',
      });
    } catch {
      // Ignore unreadable files. Lazer can keep transient files while running.
    }
  }

  await walk(filesPath);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(48, Math.max(1, filePaths.length)) }, async () => {
    while (nextIndex < filePaths.length) {
      const current = filePaths[nextIndex];
      nextIndex += 1;
      await processFile(current);
    }
  });
  await Promise.all(workers);
  return items;
}

function nearestAudio(osuItem, audioItems, parsed) {
  const candidates = audioItems
    .filter((item) => {
      const distance = Math.abs(item.mtime - osuItem.mtime);
      return item.size > 220000 && distance < 90000;
    })
    .map((item) => {
      const distance = Math.abs(item.mtime - osuItem.mtime);
      const similarity = metadataSimilarity(parsed, item);
      return {
        item,
        distance,
        similarity,
        score: distance / 1000 - similarity.score * 7,
      };
    })
    .sort((a, b) => b.similarity.score - a.similarity.score || a.score - b.score);
  const taggedMatch = candidates.find(({ similarity }) => similarity.score >= 0.42);
  if (taggedMatch) return taggedMatch.item;
  const nearUntagged = candidates.find(({ distance, similarity }) => distance < 140 && !similarity.tagged);
  if (nearUntagged) return nearUntagged.item;
  const veryNear = candidates.find(({ distance, similarity }) => distance < 75 && similarity.score > 0.08);
  return veryNear?.item || null;
}

function nearestBackground(osuItem, imageItems, parsed) {
  const hasDeclaredBackground = Boolean(parsed?.background);
  const tightWindow = hasDeclaredBackground ? 1200 : 900;
  const looseWindow = hasDeclaredBackground ? 2800 : 1800;
  const usable = imageItems
    .map((item) => ({ item, distance: Math.abs(item.mtime - osuItem.mtime) }))
    .filter(({ item, distance }) => item.size > 18000 && distance < looseWindow);

  const chooseNearest = (candidates) => candidates
    .sort((a, b) => {
      const delta = a.distance - b.distance;
      if (Math.abs(delta) > 40) return delta;
      return b.item.size - a.item.size;
    })[0]?.item || null;

  const tightMatch = chooseNearest(usable.filter(({ distance }) => distance < tightWindow));
  if (tightMatch) return tightMatch;

  return hasDeclaredBackground ? null : chooseNearest(usable);
}

async function scanLazerLibrary(lazerPath) {
  const lazerRoot = resolveLazerRoot(lazerPath);
  const filesPath = join(lazerRoot, 'files');
  if (!existsSync(join(lazerRoot, 'client.realm')) || !existsSync(filesPath)) {
    throw new Error('没有找到 osu!lazer 的 client.realm 和 files 目录');
  }

  const items = await collectLazerFiles(filesPath);
  const osuItems = items.filter((item) => item.kind === 'osu');
  const audioItems = items.filter((item) => item.kind === 'audio');
  const imageItems = items.filter((item) => item.kind === 'image');
  const entries = [];

  for (const item of osuItems) {
    if (entries.length >= 1500) break;
    try {
      const parsed = parseOsuFile(item.text, '');
      const audio = nearestAudio(item, audioItems, parsed);
      if (!audio) continue;
      const background = nearestBackground(item, imageItems, parsed);
      entries.push({
        id: createHash('sha1').update(item.hash).digest('hex').slice(0, 12),
        source: 'lazer',
        title: parsed.title,
        artist: parsed.artist,
        creator: parsed.creator,
        version: parsed.version,
        audioUrl: mediaId(audio.path),
        backgroundUrl: background ? mediaId(background.path) : '',
        timingPoints: parsed.timingPoints,
        durationHint: audio.size,
        path: item.path,
      });
    } catch {
      continue;
    }
  }

  return entries;
}

function uniqueExisting(paths, predicate = existsSync) {
  const seen = new Set();
  const result = [];
  for (const candidate of paths.filter(Boolean)) {
    const resolved = resolve(candidate);
    const key = resolved.toLowerCase();
    if (seen.has(key) || !predicate(resolved)) continue;
    seen.add(key);
    result.push(resolved);
  }
  return result;
}

function windowsDriveRoots() {
  const roots = [];
  for (let code = 67; code <= 90; code += 1) {
    const rootPath = `${String.fromCharCode(code)}:\\`;
    if (existsSync(rootPath)) roots.push(rootPath);
  }
  return roots;
}

function likelyOsuPaths() {
  const home = homedir();
  const appData = process.env.APPDATA || join(home, 'AppData', 'Roaming');
  const localAppData = process.env.LOCALAPPDATA || join(home, 'AppData', 'Local');
  const driveRoots = platform() === 'win32' ? windowsDriveRoots() : [];
  const portableSongs = driveRoots.flatMap((drive) => [
    join(drive, 'osu!', 'Songs'),
    join(drive, 'osu', 'Songs'),
    join(drive, 'Games', 'osu!', 'Songs'),
    join(drive, 'Games', 'osu', 'Songs'),
  ]);

  return uniqueExisting([
    join(home, 'AppData', 'Local', 'osu!', 'Songs'),
    join(home, 'AppData', 'Roaming', 'osu!', 'Songs'),
    join(localAppData, 'osu!', 'Songs'),
    join(appData, 'osu!', 'Songs'),
    'C:\\osu!\\Songs',
    ...portableSongs,
    join(home, 'Library', 'Application Support', 'osu!', 'Songs'),
    join(home, '.osu', 'Songs'),
    join(home, 'osu!', 'Songs'),
    join(home, 'Library', 'Application Support', 'CrossOver', 'Bottles', 'osu', 'drive_c', 'users', 'crossover', 'AppData', 'Local', 'osu!', 'Songs'),
    join(home, 'Library', 'Application Support', 'Wine', 'prefixes', 'osu', 'drive_c', 'users', process.env.USER || 'user', 'AppData', 'Local', 'osu!', 'Songs'),
  ]);
}

function likelyLazerPaths() {
  const home = homedir();
  const appData = process.env.APPDATA || join(home, 'AppData', 'Roaming');
  const localAppData = process.env.LOCALAPPDATA || join(home, 'AppData', 'Local');
  const driveRoots = platform() === 'win32' ? windowsDriveRoots() : [];
  const portableRoots = driveRoots.flatMap((drive) => [
    join(drive, 'osu'),
    join(drive, 'osulazer'),
    join(drive, 'osu-lazer'),
    join(drive, 'Games', 'osu'),
    join(drive, 'Games', 'osulazer'),
    join(drive, 'Games', 'osu-lazer'),
  ]);

  return uniqueExisting([
    join(appData, 'osu'),
    join(localAppData, 'osu'),
    join(appData, 'osulazer'),
    join(localAppData, 'osulazer'),
    join(home, 'AppData', 'Roaming', 'osu'),
    join(home, 'AppData', 'Local', 'osu'),
    join(home, 'AppData', 'Roaming', 'osulazer'),
    join(home, 'AppData', 'Local', 'osulazer'),
    join(home, 'Library', 'Application Support', 'osu'),
    join(home, 'Library', 'Application Support', 'osu-lazer'),
    join(home, 'Library', 'Containers', 'sh.ppy.osu', 'Data', 'Library', 'Application Support', 'osu'),
    join(home, '.local', 'share', 'osu'),
    ...portableRoots,
  ], (path) => existsSync(join(path, 'client.realm')) && existsSync(join(path, 'files')));
}

function macPermissionGuidance() {
  if (platform() !== 'darwin') return null;
  const major = Number(release().split('.')[0] || 0);
  const marketingVersion = major >= 25 ? 'macOS 16 或更新版本'
    : major >= 24 ? 'macOS 15 Sequoia'
      : major >= 23 ? 'macOS 14 Sonoma'
        : major >= 22 ? 'macOS 13 Ventura'
          : major >= 21 ? 'macOS 12 Monterey'
            : '当前 macOS';
  return {
    platform: 'darwin',
    release: release(),
    version: marketingVersion,
    message: `检测到 ${marketingVersion}。如果自动检测不到 osu!lazer，请在 Finder 使用“前往文件夹”打开 ~/Library/Application Support/osu，并确认里面有 client.realm 和 files。若数据放在 Documents/Desktop/Downloads 或外置盘，请到 系统设置 > 隐私与安全性 > 文件和文件夹 或 完全磁盘访问权限，允许当前终端/启动器读取该位置。`,
  };
}

async function handleApi(req, res, url) {
  if (url.pathname === '/api/default-paths') {
    return json(res, {
      osuSongs: likelyOsuPaths(),
      lazerRoots: likelyLazerPaths(),
      platform: platform(),
      release: release(),
      guidance: macPermissionGuidance(),
    });
  }

  if (url.pathname === '/api/scan') {
    const folderPath = resolve(url.searchParams.get('path') || '');
    const kind = url.searchParams.get('kind') || 'music';
    if (!folderPath || !existsSync(folderPath)) return json(res, { error: '文件夹不存在' }, 400);
    const info = await stat(folderPath);
    if (!info.isDirectory()) return json(res, { error: '路径不是文件夹' }, 400);
    const tracks = kind === 'osu'
      ? await scanOsuSongs(folderPath)
      : kind === 'lazer'
        ? await scanLazerLibrary(folderPath)
        : await scanMusicFolder(folderPath);
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
