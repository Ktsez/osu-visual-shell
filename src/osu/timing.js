export function pickTimingPoint(track, currentMs) {
  const inherited = (track.timingPoints || []).filter((point) => point.uninherited && point.beatLength > 0);
  let picked = inherited[0] || null;
  for (const point of inherited) {
    if (point.offset <= currentMs) picked = point;
    else break;
  }
  return picked;
}

export function pickEffectPoint(track, currentMs) {
  const points = (track.timingPoints || []).filter((point) => Number.isFinite(point.offset));
  let picked = points[0] || null;
  for (const point of points) {
    if (point.offset <= currentMs) picked = point;
    else break;
  }
  return picked;
}

export function beatIndexAtTimeMs(timeMs, timingPoint) {
  if (!timingPoint || timingPoint.beatLength <= 0) return 0;
  return Math.floor((timeMs - timingPoint.offset) / timingPoint.beatLength);
}

export function timeSinceBeatMs(timeMs, timingPoint) {
  if (!timingPoint || timingPoint.beatLength <= 0) return 0;
  const beatIndex = beatIndexAtTimeMs(timeMs, timingPoint);
  return timeMs - (timingPoint.offset + beatIndex * timingPoint.beatLength);
}

export function isKiaiPoint(point) {
  return Boolean(point?.kiai);
}
