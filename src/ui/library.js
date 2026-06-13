import { normaliseKey } from '../utils/format.js';

export async function fetchJson(url) {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

export function dedupeTracks(input) {
  const best = new Map();
  for (const track of input) {
    const audioKey = normaliseKey(track.audioUrl || track.path || '');
    const titleKey = normaliseKey(`${track.artist || ''}::${track.title || ''}`);
    const key = track.source === 'osu' ? `${titleKey}::${audioKey}` : audioKey || titleKey;
    const current = best.get(key);
    const score = (track.timingPoints?.length || 0) + (track.backgroundUrl ? 2 : 0);
    const currentScore = (current?.timingPoints?.length || 0) + (current?.backgroundUrl ? 2 : 0);
    if (!current || score > currentScore) best.set(key, track);
  }
  return [...best.values()].sort((a, b) => `${a.artist} ${a.title}`.localeCompare(`${b.artist} ${b.title}`, 'zh-CN'));
}

export function filterTracks(tracks, query) {
  const normalisedQuery = query.trim().toLowerCase();
  return normalisedQuery
    ? tracks.filter((track) => `${track.title} ${track.artist} ${track.version}`.toLowerCase().includes(normalisedQuery))
    : tracks;
}
