import { extname, join } from 'node:path';

const imageExts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.bmp']);

export function splitOsuLines(text) {
  return text.replace(/^\uFEFF/, '').split(/\r?\n/);
}

export function parseOsuFile(text, baseDir) {
  const result = {
    title: 'Unknown title',
    titleUnicode: '',
    artist: 'Unknown artist',
    artistUnicode: '',
    creator: '',
    version: '',
    audio: '',
    background: '',
    timingPoints: [],
  };
  let section = '';

  for (const rawLine of splitOsuLines(text)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('//')) continue;
    const sectionMatch = line.match(/^\[(.+)]$/);
    if (sectionMatch) {
      section = sectionMatch[1];
      continue;
    }

    if (section === 'General') {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      if (key === 'AudioFilename') result.audio = join(baseDir, value);
    }

    if (section === 'Metadata') {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      if (key === 'Title') result.title = value || result.title;
      if (key === 'TitleUnicode') {
        result.titleUnicode = value;
        result.title = value || result.title;
      }
      if (key === 'Artist') result.artist = value || result.artist;
      if (key === 'ArtistUnicode') {
        result.artistUnicode = value;
        result.artist = value || result.artist;
      }
      if (key === 'Creator') result.creator = value;
      if (key === 'Version') result.version = value;
    }

    if (section === 'Events' && line.includes(',')) {
      const parts = line.split(',').map((part) => part.trim().replace(/^"|"$/g, ''));
      if ((parts[0] === '0' || parts[0] === 'Video') && parts[2]) {
        const candidate = join(baseDir, parts[2]);
        if (imageExts.has(extname(candidate).toLowerCase())) result.background = candidate;
      }
    }

    if (section === 'TimingPoints') {
      const parts = line.split(',');
      const offset = Number(parts[0]);
      const beatLength = Number(parts[1]);
      const meter = Number(parts[2] || 4);
      const effects = Number(parts[7] || 0);
      const uninherited = parts.length < 7 ? true : parts[6] === '1';
      if (Number.isFinite(offset) && Number.isFinite(beatLength)) {
        result.timingPoints.push({
          offset,
          beatLength,
          meter,
          uninherited,
          effects: Number.isFinite(effects) ? effects : 0,
          kiai: Number.isFinite(effects) ? (effects & 1) === 1 : false,
        });
      }
    }
  }

  result.timingPoints.sort((a, b) => a.offset - b.offset);
  return result;
}
