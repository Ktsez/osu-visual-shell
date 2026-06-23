import { normaliseKey } from '../utils/format.js';

export async function fetchJson(url) {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

export function dedupeTracks(input) {
  const best = new Map();
  const aliases = new Map();
  for (const track of input) {
    const keys = trackIdentityKeys(track);
    const existingKey = keys.map((key) => aliases.get(key)).find(Boolean);
    const canonicalKey = existingKey || keys[0];
    const current = best.get(canonicalKey);
    if (!current || trackDedupeScore(track) > trackDedupeScore(current)) best.set(canonicalKey, track);
    for (const key of keys) aliases.set(key, canonicalKey);
  }
  return [...best.values()].sort((a, b) => `${a.artist} ${a.title}`.localeCompare(`${b.artist} ${b.title}`, 'zh-CN'));
}

function trackIdentityKeys(track) {
  const audioKey = normaliseAudioKey(track.audioUrl || track.path || '');
  const folderKey = normaliseFolderAudioKey(track.audioUrl || track.path || '');
  const titleKey = normaliseKey(`${track.artist || ''}::${track.title || ''}`);
  const looseTitleKey = normaliseTitleKey(`${track.artist || ''}::${track.title || ''}`);
  const keys = [
    audioKey && `audio:${audioKey}`,
    folderKey && `folder-audio:${folderKey}`,
    titleKey && `title:${titleKey}`,
    looseTitleKey && `loose-title:${looseTitleKey}`,
  ].filter(Boolean);
  return [...new Set(keys.length ? keys : [`fallback:${Math.random()}`])];
}

function trackDedupeScore(track) {
  return (track.backgroundUrl ? 120 : 0)
    + (track.timingPoints?.length || 0)
    + (track.version ? 4 : 0)
    + (track.audioUrl ? 2 : 0);
}

function normaliseAudioKey(value) {
  return normaliseKey(value)
    .replace(/^\/media\//, '')
    .replace(/[?#].*$/, '')
    .replace(/%20/g, ' ');
}

function normaliseFolderAudioKey(value) {
  const parts = normaliseAudioKey(value).split('/').filter(Boolean);
  if (parts.length < 2) return normaliseAudioKey(value);
  return parts.slice(-2).join('/');
}

function normaliseTitleKey(value) {
  return normaliseKey(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\([^)]*\)|\[[^\]]*\]/g, '')
    .replace(/\b(tv size|short ver|full ver|mapped by|feat|ft)\b/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, ' ')
    .trim();
}

export function filterTracks(tracks, query) {
  const normalisedQuery = query.trim().toLowerCase();
  return normalisedQuery
    ? tracks.filter((track) => `${track.title} ${track.artist} ${track.version}`.toLowerCase().includes(normalisedQuery))
    : tracks;
}
