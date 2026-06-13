export function clamp(value, min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY) {
  return Math.min(max, Math.max(min, value));
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export function normaliseKey(value) {
  return String(value || '').trim().toLowerCase().replaceAll('\\', '/').replace(/\s+/g, ' ');
}

export function normaliseHexColour(value, fallback = '#ff48a9') {
  const text = String(value || '').trim();
  return /^#[0-9a-f]{6}$/i.test(text) ? text.toLowerCase() : fallback;
}

export function hexToRgb(value, fallback) {
  const hex = normaliseHexColour(value, fallback).slice(1);
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}
